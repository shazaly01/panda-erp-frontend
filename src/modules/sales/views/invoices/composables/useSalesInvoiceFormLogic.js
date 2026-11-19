// src/modules/sales/views/invoices/composables/useSalesInvoiceFormLogic.js
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSalesInvoiceStore } from '@/modules/sales/stores/salesInvoiceStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import { useCustomerStore } from '@/modules/sales/stores/customerStore'
import { useBoxStore } from '@/modules/accounting/stores/boxStore'
import { useBankAccountStore } from '@/modules/accounting/stores/bankAccountStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'

export function useSalesInvoiceFormLogic() {
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const invoiceStore = useSalesInvoiceStore()
  const productStore = useProductStore()
  const customerStore = useCustomerStore()
  const boxStore = useBoxStore()
  const bankAccountStore = useBankAccountStore()
  const authStore = useAuthStore()

  // مفاتيح التخزين في ذاكرة المتصفح
  const STORAGE_KEY_AUTO_PREVIEW = 'erp_pos_auto_preview'
  const BROADCAST_CHANNEL_NAME = 'erp_pos_sales_channel'

  // خيار المعاينة التلقائية بعد الترحيل
  const autoPreviewAfterSave = ref(
    localStorage.getItem(STORAGE_KEY_AUTO_PREVIEW) !== null
      ? localStorage.getItem(STORAGE_KEY_AUTO_PREVIEW) === 'true'
      : true,
  )

  watch(autoPreviewAfterSave, (newVal) => {
    localStorage.setItem(STORAGE_KEY_AUTO_PREVIEW, String(newVal))
  })

  // حالات نافذة المعاينة المنبثقة
  const isPreviewModalOpen = ref(false)
  const previewSaleData = ref(null)
  const lastSavedSale = ref(null)

  // تمييز وضع الكاشير السريع (POS) ووضع التعديل
  const isPos = computed(
    () =>
      route.path.endsWith('/pos') ||
      route.path === '/pos' ||
      Boolean(route.meta?.isPos) ||
      route.query.mode === 'pos',
  )
  const isEdit = computed(() => !isPos.value && Boolean(route.params.id))

  // بوابة التحكم لحالة استعداد البيانات
  const isFormLoaded = ref(false)
  const isSubmitting = ref(false)
  const isFullscreen = ref(false)

  // قناة البث الحية لمزامنة التحديثات مع شاشة القائمة في الخلفية
  const posChannel =
    typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel(BROADCAST_CHANNEL_NAME)
      : null

  // =========================================================
  // 1. نموذج بيانات رأس الفاتورة (متوافق مع StoreSalesInvoiceRequest)
  // =========================================================
  const form = ref({
    invoice_number: '',
    status: 'draft',
    posting_status: 'unposted',
    payment_status: 'unpaid',
    partner_id: '',
    customer_name_text: null,
    warehouse_id: '',
    branch_id: null,
    cost_center_id: null,
    currency_id: null,
    exchange_rate: 1,
    shift_id: null,
    channel: isPos.value ? 'pos' : 'standard',
    order_type: 'standard',
    table_label: null,
    invoice_date: new Date().toISOString().substring(0, 10),
    due_date: null,
    discount_type: 'fixed',
    discount_value: 0,
    service_charge: 0,
    delivery_fee: 0,
    // حقول إدارة السداد في الواجهة (تُحوّل إلى مصفوفة payments عند الإرسال)
    payment_mode: 'bank', // 'bank' | 'cash' | 'credit' | 'split'
    box_id: '',
    bank_account_id: '',
    cash_amount: 0,
    bank_amount: 0,
    notes: '',
    terms_conditions: '',
  })

  const items = ref([])

  // =========================================================
  // 2. دوال المساعدة الحسابية والعملات
  // =========================================================
  const roundCurrency = (value) => {
    const amount = Number(value)
    return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0
  }

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return ''
    const num = Number(value)
    if (isNaN(num)) return ''
    const options = {
      style: 'decimal',
      maximumFractionDigits: 2,
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    }
    return new Intl.NumberFormat('en-US', options).format(num)
  }

  const unformatNumber = (text) => {
    if (!text) return 0
    const cleaned = text.toString().replace(/[^0-9.-]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  // الإجمالي الفرعي قبل خصم الفاتورة والضريبة
  const headerSubtotal = computed(() => {
    return items.value.reduce((sum, row) => sum + (parseFloat(row.total_amount) || 0), 0)
  })

  // قيمة الخصم المحسوبة على مستوى الفاتورة
  const headerDiscountAmount = computed(() => {
    const sub = headerSubtotal.value
    const val = parseFloat(form.value.discount_value) || 0
    if (val <= 0) return 0
    if (form.value.discount_type === 'percentage') {
      return roundCurrency(sub * (val / 100))
    }
    return Math.min(sub, roundCurrency(val))
  })

  // إجمالي الضريبة المضافة من البنود
  const headerVatAmount = computed(() => {
    return items.value.reduce((sum, row) => sum + (parseFloat(row.tax_amount) || 0), 0)
  })

  // الإجمالي النهائي الصافي للفاتورة
  const headerGrandTotal = computed(() => {
    const sub = headerSubtotal.value
    const disc = headerDiscountAmount.value
    const vat = headerVatAmount.value
    const service = parseFloat(form.value.service_charge) || 0
    const delivery = parseFloat(form.value.delivery_fee) || 0
    return roundCurrency(Math.max(0, sub - disc + vat + service + delivery))
  })

  // =========================================================
  // 3. إدارة السداد التلقائي والمقسّم (Box & Bank Account)
  // =========================================================
  const resolveDefaultBoxId = () => {
    if (authStore.user?.box_id) return authStore.user.box_id
    if (authStore.user?.treasury_id) return authStore.user.treasury_id
    return boxStore.boxes?.[0]?.id || ''
  }

  const resolveDefaultBankAccountId = () => {
    if (authStore.user?.bank_account_id) return authStore.user.bank_account_id
    if (authStore.user?.bank_id) return authStore.user.bank_id
    return bankAccountStore.bankAccounts?.[0]?.id || ''
  }

  watch(
    () => form.value.payment_mode,
    (mode) => {
      if (mode === 'cash') {
        form.value.bank_account_id = ''
        if (!form.value.box_id) {
          form.value.box_id = resolveDefaultBoxId()
        }
      } else if (mode === 'bank') {
        form.value.box_id = ''
        if (!form.value.bank_account_id) {
          form.value.bank_account_id = resolveDefaultBankAccountId()
        }
      } else if (mode === 'credit') {
        form.value.box_id = ''
        form.value.bank_account_id = ''
      }
    },
  )

  watch(
    () => form.value.cash_amount,
    (amount) => {
      if (Number(amount) > 0) {
        if (!form.value.box_id) {
          form.value.box_id = resolveDefaultBoxId()
        }
      } else {
        form.value.box_id = ''
      }
    },
  )

  watch(
    () => form.value.bank_amount,
    (amount) => {
      if (Number(amount) > 0) {
        if (!form.value.bank_account_id) {
          form.value.bank_account_id = resolveDefaultBankAccountId()
        }
      } else {
        form.value.bank_account_id = ''
      }
    },
  )

  watch(headerGrandTotal, (newTotal) => {
    const total = roundCurrency(newTotal)
    if (form.value.payment_mode === 'bank') {
      form.value.cash_amount = 0
      form.value.bank_amount = total
    } else if (form.value.payment_mode === 'cash') {
      form.value.cash_amount = total
      form.value.bank_amount = 0
    } else if (form.value.payment_mode === 'credit') {
      form.value.cash_amount = 0
      form.value.bank_amount = 0
    }
  })

  // =========================================================
  // 4. إدارة سطور الأصناف في الفاتورة
  // =========================================================
  const createEmptyRow = () => {
    return {
      id: undefined,
      product_id_display: '',
      product_name: '',
      product_id: null,
      unit_id: '',
      unit_name: '',
      quantity: 1,
      unit_price: 0,
      discount_type: 'fixed',
      discount_value: 0,
      discount_amount: 0,
      tax_rate: 0,
      tax_amount: 0,
      subtotal: 0,
      total_amount: 0,
      available_units: [],
      base_stock: 0,
      is_price_overridden: false,
      _flashing: false,
      notes: '',
    }
  }

  const triggerAddNewEmptyLine = () => {
    items.value.push(createEmptyRow())
  }

  const removeRow = (index) => {
    if (items.value.length === 1) {
      items.value[0] = createEmptyRow()
      return
    }
    items.value.splice(index, 1)
  }

  const getValidationError = (path) => {
    return invoiceStore.validationErrors?.[path]?.[0] || null
  }

  // تحديد العميل الافتراضي (عام / مباشر)
  const resolveDefaultPartner = () => {
    const list =
      customerStore.selectorCustomers?.length > 0
        ? customerStore.selectorCustomers
        : customerStore.customers || []

    const defaultCust = list.find((c) => {
      const name = (c.name || '').trim()
      return name.includes('عميل عام') || name.includes('عميل مباشر') || name.includes('نقدي')
    })
    return defaultCust ? defaultCust.id : list[0]?.id || ''
  }

  // =========================================================
  // 5. التصفير الذكي للفاتورة التالية في وضع الكاشير (POS)
  // =========================================================
  const resetFormForNextSale = async () => {
    items.value = []

    const keptWarehouseId =
      form.value.warehouse_id || authStore.user?.warehouse_id || authStore.user?.store_id || ''

    form.value = {
      invoice_number: '',
      status: 'draft',
      posting_status: 'unposted',
      payment_status: 'unpaid',
      partner_id: resolveDefaultPartner(),
      customer_name_text: null,
      warehouse_id: keptWarehouseId,
      branch_id: authStore.user?.branch_id || null,
      cost_center_id: null,
      currency_id: null,
      exchange_rate: 1,
      shift_id: null,
      channel: 'pos',
      order_type: 'standard',
      table_label: null,
      invoice_date: new Date().toISOString().substring(0, 10),
      due_date: null,
      discount_type: 'fixed',
      discount_value: 0,
      service_charge: 0,
      delivery_fee: 0,
      payment_mode: 'bank',
      box_id: '',
      bank_account_id: resolveDefaultBankAccountId(),
      cash_amount: 0,
      bank_amount: 0,
      notes: '',
      terms_conditions: '',
    }

    if (keptWarehouseId) {
      await productStore.fetchProducts({
        is_active: 1,
        warehouse_id: keptWarehouseId,
        store_id: keptWarehouseId,
        per_page: 1000,
      })
    }

    triggerAddNewEmptyLine()

    await nextTick()
    window.dispatchEvent(new CustomEvent('pos:focus-barcode'))
  }

  // =========================================================
  // 6. وضع ملء الشاشة والمعاينة والخروج الآمن
  // =========================================================
  const checkFullscreen = () => {
    isFullscreen.value = Boolean(
      document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement,
    )
  }

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen.value) {
        const root = document.documentElement
        if (root.requestFullscreen) await root.requestFullscreen()
        else if (root.webkitRequestFullscreen) await root.webkitRequestFullscreen()
      } else {
        if (document.exitFullscreen) await document.exitFullscreen()
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen()
      }
    } catch (err) {
      console.warn('تعذر تبديل وضع ملء الشاشة:', err)
    }
  }

  const exitPosTerminal = async () => {
    if (isFullscreen.value) {
      try {
        if (document.exitFullscreen) await document.exitFullscreen()
      } catch (e) {
        console.warn(e)
      }
    }

    if (window.opener) {
      window.close()
    } else {
      router.push('/app/sales/invoices')
    }
  }

  const getSelectedPartnerObject = () => {
    const id = Number(form.value.partner_id)
    if (!id) return null
    return (
      customerStore.selectorCustomers?.find((c) => c.id === id) ||
      customerStore.customers?.find((c) => c.id === id) ||
      null
    )
  }

  const openDraftPreview = () => {
    const validItems = items.value.filter((row) => row.product_id && row.unit_id)
    if (validItems.length === 0) {
      toast.warning('يرجى إضافة صنف واحد على الأقل لمعاينة الفاتورة.')
      return
    }

    const currentPartner = getSelectedPartnerObject()

    previewSaleData.value = {
      ...form.value,
      id: isEdit.value ? route.params.id : null,
      invoice_number: isEdit.value
        ? form.value.invoice_number || `#${route.params.id}`
        : 'مسودة جديدة (قيد الإدخال)',
      partner: currentPartner,
      customer_name: currentPartner?.name || 'عميل عام / مباشر',
      customer_phone: currentPartner?.phone || '',
      subtotal: headerSubtotal.value,
      discount_amount: headerDiscountAmount.value,
      vat_amount: headerVatAmount.value,
      total_amount: headerGrandTotal.value,
      items: validItems.map((row) => {
        const matchedUnit = row.available_units?.find(
          (u) => u.id === row.unit_id || u.unit_id === row.unit_id,
        )
        return {
          product_id: row.product_id,
          product_name: row.product_name,
          unit_id: row.unit_id,
          unit_name: matchedUnit?.unit_name || matchedUnit?.unit?.name || row.unit_name || '',
          quantity: parseFloat(row.quantity) || 0,
          unit_price: parseFloat(row.unit_price) || 0,
          total_amount: parseFloat(row.total_amount) || 0,
        }
      }),
    }

    isPreviewModalOpen.value = true
  }

  const openLastSavedPreview = () => {
    if (lastSavedSale.value) {
      previewSaleData.value = lastSavedSale.value
      isPreviewModalOpen.value = true
    } else {
      toast.info('لا توجد فاتورة مرحلة سابقة في هذه الجلسة لمعاينتها.')
    }
  }

  // =========================================================
  // 7. تحليل الدفعات المخزنة عند فتح فاتورة للتعديل
  // =========================================================
  const resolveExistingPayments = (invoice) => {
    const total = roundCurrency(invoice.total_amount)
    let cashAmount = roundCurrency(invoice.cash_amount || 0)
    let bankAmount = roundCurrency(invoice.bank_amount || 0)
    let boxId = ''
    let bankAccountId = ''

    if (Array.isArray(invoice.payments) && invoice.payments.length > 0) {
      cashAmount = 0
      bankAmount = 0
      for (const p of invoice.payments) {
        if (p.payment_method === 'cash') {
          cashAmount += roundCurrency(p.amount)
          if (p.box_id) boxId = p.box_id
        } else if (['card', 'bank_transfer'].includes(p.payment_method)) {
          bankAmount += roundCurrency(p.amount)
          if (p.bank_account_id) bankAccountId = p.bank_account_id
        }
      }
    }

    cashAmount = roundCurrency(cashAmount)
    bankAmount = roundCurrency(bankAmount)

    let paymentMode = 'credit'
    if (total === 0 && cashAmount === 0 && bankAmount === 0) {
      paymentMode = 'bank'
    } else if (cashAmount === total && bankAmount === 0 && cashAmount > 0) {
      paymentMode = 'cash'
    } else if (bankAmount === total && cashAmount === 0 && bankAmount > 0) {
      paymentMode = 'bank'
    } else if (cashAmount === 0 && bankAmount === 0) {
      paymentMode = 'credit'
    } else {
      paymentMode = 'split'
    }

    return {
      cashAmount,
      bankAmount,
      paymentMode,
      boxId: boxId || resolveDefaultBoxId(),
      bankAccountId: bankAccountId || resolveDefaultBankAccountId(),
    }
  }

  // =========================================================
  // 8. تحميل البيانات الأولية عند فتح الشاشة
  // =========================================================
  onMounted(async () => {
    document.addEventListener('fullscreenchange', checkFullscreen)
    document.addEventListener('webkitfullscreenchange', checkFullscreen)

    isFormLoaded.value = false
    try {
      await Promise.all([
        customerStore
          .fetchCustomersSelector()
          .catch(() => customerStore.fetchCustomers(1, { per_page: 500 })),
        boxStore.boxes.length === 0 ? boxStore.fetchBoxes({ per_page: 200 }) : Promise.resolve(),
        bankAccountStore.bankAccounts.length === 0
          ? bankAccountStore.fetchBankAccounts({ per_page: 200 })
          : Promise.resolve(),
      ])

      if (isEdit.value) {
        const cur = await invoiceStore.fetchInvoice(route.params.id)
        if (cur) {
          const existingPay = resolveExistingPayments(cur)

          form.value = {
            invoice_number: cur.invoice_number || '',
            status: cur.status || 'draft',
            posting_status: cur.posting_status || 'unposted',
            payment_status: cur.payment_status || 'unpaid',
            partner_id: cur.partner_id || '',
            customer_name_text: cur.customer_name_text || null,
            warehouse_id: cur.warehouse_id || '',
            branch_id: cur.branch_id || null,
            cost_center_id: cur.cost_center?.id || null,
            currency_id: cur.currency?.id || null,
            exchange_rate: cur.currency?.exchange_rate || 1,
            shift_id: cur.shift?.id || null,
            channel: cur.channel || 'standard',
            order_type: cur.order_type || 'standard',
            table_label: cur.table_label || null,
            invoice_date: cur.invoice_date
              ? cur.invoice_date.substring(0, 10)
              : new Date().toISOString().substring(0, 10),
            due_date: cur.due_date || null,
            discount_type: cur.discount_type || 'fixed',
            discount_value: parseFloat(cur.discount_value) || 0,
            service_charge: parseFloat(cur.service_charge) || 0,
            delivery_fee: parseFloat(cur.delivery_fee) || 0,
            payment_mode: existingPay.paymentMode,
            box_id: existingPay.boxId,
            bank_account_id: existingPay.bankAccountId,
            cash_amount: existingPay.cashAmount,
            bank_amount: existingPay.bankAmount,
            notes: cur.notes || '',
            terms_conditions: cur.terms_conditions || '',
          }

          items.value = (cur.items || []).map((it) => {
            const matchedUnit = (it.available_units || []).find(
              (u) => u.id === it.unit_id || u.unit_id === it.unit_id,
            )
            return {
              id: it.id,
              product_id_display: it.product_id ? `PRD-${it.product_id}` : '',
              product_name: it.product_name || '',
              product_id: it.product_id,
              unit_id: matchedUnit ? matchedUnit.id : it.unit_id || '',
              unit_name: it.unit_name || '',
              quantity: parseFloat(it.quantity) || 1,
              unit_price: parseFloat(it.unit_price) || 0,
              discount_type: it.discount_type || 'fixed',
              discount_value: parseFloat(it.discount_value) || 0,
              discount_amount: parseFloat(it.discount_amount) || 0,
              tax_rate: parseFloat(it.tax_rate) || 0,
              tax_amount: parseFloat(it.tax_amount) || 0,
              subtotal: parseFloat(it.subtotal) || 0,
              total_amount: parseFloat(it.total_amount) || 0,
              available_units: it.available_units || [],
              base_stock: parseFloat(it.current_stock) || 0,
              is_price_overridden: true,
              _flashing: false,
              notes: it.notes || '',
            }
          })

          if (cur.warehouse_id) {
            await productStore.fetchProducts({
              is_active: 1,
              warehouse_id: cur.warehouse_id,
              store_id: cur.warehouse_id,
              per_page: 1000,
            })

            items.value.forEach((row) => {
              const matchedProd = productStore.products?.find((p) => p.id === row.product_id)
              if (matchedProd && Array.isArray(matchedProd.units) && matchedProd.units.length > 0) {
                row.available_units = matchedProd.units
              }
            })
          }
        }
      } else {
        form.value.warehouse_id = authStore.user?.warehouse_id || authStore.user?.store_id || ''
        form.value.branch_id = authStore.user?.branch_id || null
        form.value.channel = isPos.value ? 'pos' : 'standard'
        form.value.payment_mode = 'bank'
        form.value.bank_account_id = resolveDefaultBankAccountId()
        form.value.box_id = ''
        form.value.cash_amount = 0
        form.value.bank_amount = 0
        form.value.partner_id = resolveDefaultPartner()

        if (items.value.length === 0) {
          triggerAddNewEmptyLine()
        }
      }
    } finally {
      isFormLoaded.value = true
    }
  })

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', checkFullscreen)
    document.removeEventListener('webkitfullscreenchange', checkFullscreen)
    if (posChannel) {
      posChannel.close()
    }
  })

  // =========================================================
  // 9. بناء مصفوفة الدفعات (payments) والإرسال للـ Backend
  // =========================================================
  const buildPaymentsPayload = () => {
    const payments = []
    const cashVal = roundCurrency(form.value.cash_amount)
    const bankVal = roundCurrency(form.value.bank_amount)

    if (cashVal > 0) {
      payments.push({
        payment_method: 'cash',
        amount: cashVal,
        box_id: form.value.box_id ? Number(form.value.box_id) : null,
      })
    }

    if (bankVal > 0) {
      payments.push({
        payment_method: 'card',
        amount: bankVal,
        bank_account_id: form.value.bank_account_id ? Number(form.value.bank_account_id) : null,
      })
    }

    return payments
  }

  /**
   * حفظ الفاتورة (كشير POS فوري أو فاتورة قياسية مسودة / مرحلة)
   * @param {boolean} autoPostStandard - في الفاتورة القياسية: true للترحيل المباشر، false للحفظ كمسودة
   */
  const handleSubmit = async (autoPostStandard = true) => {
    if (!form.value.warehouse_id) {
      toast.error('يرجى تحديد المستودع أولاً.')
      return
    }

    if (!form.value.partner_id) {
      toast.error('يرجى تحديد العميل أولاً.')
      return
    }

    // 1. فحص السعر الأدنى المسموح به لكل صنف قبل الإرسال
    for (let i = 0; i < items.value.length; i++) {
      const row = items.value[i]
      if (!row.product_id) continue

      const matchedUnit = row.available_units?.find(
        (u) => u.id === row.unit_id || u.unit_id === row.unit_id,
      )
      const minPrice =
        matchedUnit && matchedUnit.min_allowed_price !== undefined
          ? Number(matchedUnit.min_allowed_price) || 0
          : 0

      const currentUnitPrice = parseFloat(row.unit_price) || 0
      if (minPrice > 0 && currentUnitPrice < minPrice) {
        const itemName = row.product_name || `الصنف في السطر (${i + 1})`
        const unitName = matchedUnit?.unit_name || matchedUnit?.unit?.name || 'الوحدة المختارة'
        toast.error(
          `لا يمكن حفظ الفاتورة: سعر الصنف [${itemName}] لوحدة [${unitName}] (${formatNumber(currentUnitPrice)}) أقل من السعر الأدنى المسموح به (${formatNumber(minPrice)}).`,
        )
        return
      }
    }

    // 2. تجهيز البنود الصالحة
    const validRows = items.value.filter((row) => row.product_id && Number(row.quantity) > 0)
    if (validRows.length === 0) {
      toast.warning('يرجى إضافة صنف واحد على الأقل لإصدار الفاتورة.')
      return
    }

    const itemsPayload = validRows.map((row) => {
      const matchedUnit = row.available_units?.find(
        (u) => u.id === row.unit_id || u.unit_id === row.unit_id,
      )
      const resolvedUnitId = matchedUnit?.unit_id || row.unit_id || null

      return {
        id: row.id || undefined,
        product_id: Number(row.product_id),
        unit_id: resolvedUnitId ? Number(resolvedUnitId) : null,
        quantity: parseFloat(row.quantity) || 0,
        unit_price: parseFloat(row.unit_price) || 0,
        discount_type: row.discount_type || 'fixed',
        discount_value: parseFloat(row.discount_value) || 0,
        tax_rate: parseFloat(row.tax_rate) || 0,
        notes: row.notes || null,
      }
    })

    // 3. تجهيز الدفعات والتحقق من تحديد الصندوق / الحساب البنكي
    const paymentsPayload = buildPaymentsPayload()
    const totalPaid = roundCurrency(
      paymentsPayload.reduce((acc, p) => acc + (Number(p.amount) || 0), 0),
    )

    if (totalPaid > headerGrandTotal.value) {
      toast.error('مجموع الدفعات المسددة لا يجوز أن يتجاوز إجمالي الفاتورة.')
      return
    }

    for (const p of paymentsPayload) {
      if (p.payment_method === 'cash' && !p.box_id) {
        toast.error('يجب تحديد الصندوق النقدي عند وجود مبلغ مسدد نقداً.')
        return
      }
      if (['card', 'bank_transfer'].includes(p.payment_method) && !p.bank_account_id) {
        toast.error('يجب تحديد الحساب البنكي عند وجود مبلغ مسدد بنكياً.')
        return
      }
    }

    const finalPayload = {
      invoice_date: form.value.invoice_date,
      due_date: form.value.due_date || null,
      partner_id: Number(form.value.partner_id),
      customer_name_text: form.value.customer_name_text || null,
      branch_id: form.value.branch_id ? Number(form.value.branch_id) : null,
      warehouse_id: Number(form.value.warehouse_id),
      cost_center_id: form.value.cost_center_id ? Number(form.value.cost_center_id) : null,
      currency_id: form.value.currency_id ? Number(form.value.currency_id) : null,
      exchange_rate: Number(form.value.exchange_rate) || 1,
      shift_id: form.value.shift_id ? Number(form.value.shift_id) : null,
      channel: isPos.value ? 'pos' : form.value.channel || 'standard',
      order_type: form.value.order_type || 'standard',
      table_label: form.value.table_label || null,
      discount_type: form.value.discount_type || 'fixed',
      discount_value: parseFloat(form.value.discount_value) || 0,
      service_charge: parseFloat(form.value.service_charge) || 0,
      delivery_fee: parseFloat(form.value.delivery_fee) || 0,
      notes: form.value.notes || null,
      terms_conditions: form.value.terms_conditions || null,
      items: itemsPayload,
      payments: paymentsPayload,
    }

    if (!isEdit.value && !isPos.value) {
      finalPayload.auto_post = Boolean(autoPostStandard)
    }

    // لقطة البنود للمعاينة بعد التصفير
    const previewSnapshotItems = validRows.map((row) => {
      const matchedUnit = row.available_units?.find(
        (u) => u.id === row.unit_id || u.unit_id === row.unit_id,
      )
      return {
        product_id: row.product_id,
        product_name: row.product_name,
        unit_id: row.unit_id,
        unit_name: matchedUnit?.unit_name || matchedUnit?.unit?.name || row.unit_name || '',
        quantity: parseFloat(row.quantity) || 0,
        unit_price: parseFloat(row.unit_price) || 0,
        total_amount: parseFloat(row.total_amount) || 0,
      }
    })

    const currentPartner = getSelectedPartnerObject()

    isSubmitting.value = true
    try {
      if (isEdit.value) {
        await invoiceStore.updateInvoice(route.params.id, finalPayload)
        toast.success('تم تحديث ومزامنة فاتورة المبيعات بنجاح.')
        router.push('/app/sales/invoices')
      } else {
        const response = isPos.value
          ? await invoiceStore.posCheckout(finalPayload)
          : await invoiceStore.createInvoice(finalPayload)

        const savedObj = response?.data || response

        const completedSavedSale = {
          ...savedObj,
          partner: savedObj?.partner || currentPartner,
          customer_name: savedObj?.partner?.name || currentPartner?.name || 'عميل عام / مباشر',
          customer_phone: savedObj?.partner?.phone || currentPartner?.phone || '',
          subtotal: savedObj?.subtotal ?? headerSubtotal.value,
          discount_amount: savedObj?.discount_amount ?? headerDiscountAmount.value,
          vat_amount: savedObj?.vat_amount ?? headerVatAmount.value,
          total_amount: savedObj?.total_amount ?? headerGrandTotal.value,
          items:
            Array.isArray(savedObj?.items) && savedObj.items.length > 0
              ? savedObj.items
              : previewSnapshotItems,
        }

        lastSavedSale.value = completedSavedSale

        toast.success(
          isPos.value
            ? 'تم ترحيل فاتورة الكاشير بنجاح، والشاشة جاهزة للفاتورة التالية.'
            : autoPostStandard
              ? 'تم إصدار وترحيل فاتورة المبيعات بنجاح.'
              : 'تم حفظ مسودة فاتورة المبيعات بنجاح.',
        )

        if (posChannel) {
          posChannel.postMessage({
            type: 'SALE_SAVED',
            saleId: savedObj?.id,
            timestamp: Date.now(),
          })
        }

        if (autoPreviewAfterSave.value && (isPos.value || autoPostStandard)) {
          previewSaleData.value = completedSavedSale
          isPreviewModalOpen.value = true
        }

        if (isPos.value) {
          await resetFormForNextSale()
        } else {
          router.push('/app/sales/invoices')
        }
      }
    } catch {
      toast.error(invoiceStore.error || 'فشلت عملية حفظ الفاتورة، يرجى مراجعة البيانات.')
    } finally {
      isSubmitting.value = false
    }
  }

  const handleCancel = () => {
    if (isPos.value) {
      exitPosTerminal()
    } else {
      router.push('/app/sales/invoices')
    }
  }

  return {
    isFormLoaded,
    isSubmitting,
    isEdit,
    isPos,
    isFullscreen,
    toggleFullscreen,
    exitPosTerminal,
    resetFormForNextSale,
    autoPreviewAfterSave,
    isPreviewModalOpen,
    previewSaleData,
    lastSavedSale,
    openDraftPreview,
    openLastSavedPreview,
    form,
    items,
    headerSubtotal,
    headerDiscountAmount,
    headerVatAmount,
    headerGrandTotal,
    getValidationError,
    handleSubmit,
    handleCancel,
    formatNumber,
    unformatNumber,
    removeRow,
    triggerAddNewEmptyLine,
    invoiceStore,
    productStore,
    customerStore,
    boxStore,
    bankAccountStore,
  }
}
