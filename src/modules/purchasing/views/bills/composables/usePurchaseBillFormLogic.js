// src/modules/purchasing/views/bills/composables/usePurchaseBillFormLogic.js
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePurchaseBillStore } from '@/modules/purchasing/stores/purchaseBillStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'

export function usePurchaseBillFormLogic() {
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const billStore = usePurchaseBillStore()
  const productStore = useProductStore()
  const authStore = useAuthStore()

  const isEdit = computed(() => !!route.params.id)
  const isFormLoaded = ref(false)
  const activeBillId = ref(null)

  // =========================================================
  // 0. إدارة الإفصاح التدريجي للأعمدة (Progressive Disclosure)
  // =========================================================
  const showLineDiscount = ref(false)
  const showLineTax = ref(false)

  const toggleLineDiscount = () => {
    showLineDiscount.value = !showLineDiscount.value
  }

  const toggleLineTax = () => {
    showLineTax.value = !showLineTax.value
  }

  // =========================================================
  // 1. نموذج بيانات رأس فاتورة المشتريات
  // =========================================================
  const form = ref({
    bill_number: '',
    supplier_bill_number: '',
    supplier_id: '',
    warehouse_id: '',
    purchase_order_id: null,
    receipt_id: null,
    currency_id: 1,
    exchange_rate: 1.0,
    bill_date: new Date().toISOString().substring(0, 10),
    due_date: new Date().toISOString().substring(0, 10),
    status: 'draft',
    discount_type: 'fixed',
    discount_value: 0,
    shipping_cost: 0,
    notes: '',
    paid_amount: 0,
    remaining_amount: 0,
  })

  const items = ref([])

  // =========================================================
  // 2. الذكاء التكيفي للمسارات والارتباطات
  // =========================================================
  const isReceiptLinked = computed(() => Boolean(form.value.receipt_id))
  const isDirectInventoryPurchase = computed(() => !isReceiptLinked.value)

  const routeBadgeText = computed(() => {
    if (isReceiptLinked.value) {
      return `مرتبط بسند استلام رقم #${form.value.receipt_id} (المخزون تم إثباته مسبقاً)`
    }
    return 'شراء مباشر - سيتم قيد المخزون فوراً وتحديث الأرصدة عند الترحيل'
  })

  const routeBadgeClass = computed(() => {
    if (isReceiptLinked.value) {
      return 'bg-sky-950/40 text-sky-400 border border-sky-500/30'
    }
    return 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
  })

  // =========================================================
  // 3. سكيما تفاصيل البنود
  // =========================================================
  const detailSchema = computed(() => [
    {
      key: 'product_id',
      extractFromItem: (item) => item.product_id || item.id,
    },
    {
      key: 'available_units',
      defaultValue: [],
      extractFromItem: (item) => item.available_units || item.units || [],
    },
    {
      key: 'purchase_order_item_id',
      defaultValue: null,
      extractFromItem: (item) => item.purchase_order_item_id || null,
    },
    {
      key: 'receipt_item_id',
      defaultValue: null,
      extractFromItem: (item) => item.receipt_item_id || null,
    },
    {
      key: 'product_id_display',
      label: 'كود الصنف',
      widthClass: 'w-[9%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) =>
        item.product_id ? `PRD-${item.product_id}` : item.id ? `PRD-${item.id}` : '',
    },
    {
      key: 'product_name',
      label: 'الصنف التجاري',
      widthClass: 'w-[25%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => item.product_name || item.name || '',
    },
    {
      key: 'product_unit_id',
      label: 'الوحدة',
      slot: 'cell-product_unit_id',
      widthClass: 'w-[12%]',
      type: 'text',
      extractFromItem: (item) => item.product_unit_id || item.units?.[0]?.id || '',
    },
    {
      key: 'current_quantity',
      label: 'الكمية الحالية',
      type: 'number',
      readonly: true,
      defaultValue: 0,
      widthClass: 'w-[9%]',
      slot: 'cell-current_quantity',
      extractFromItem: (item) => parseFloat(item.current_quantity ?? 0),
    },
    {
      key: 'quantity',
      label: 'الكمية المفوترة',
      type: 'number',
      defaultValue: 1,
      widthClass: 'w-[12%]',
      slot: 'cell-quantity',
      extractFromItem: (item) => parseFloat(item.quantity ?? 1),
    },
    {
      key: 'unit_price',
      label: 'سعر الوحدة',
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-[12%]',
      slot: 'cell-unit_price',
      extractFromItem: (item) => parseFloat(item.unit_price ?? 0),
    },
    {
      key: 'discount_percentage',
      label: 'خصم %',
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-[8%]',
      hidden: !showLineDiscount.value,
      slot: 'cell-discount_percentage',
      extractFromItem: (item) => parseFloat(item.discount_percentage ?? 0),
    },
    {
      key: 'tax_rate',
      label: 'ضريبة %',
      type: 'number',
      defaultValue: 15,
      widthClass: 'w-[8%]',
      hidden: !showLineTax.value,
      slot: 'cell-tax_rate',
      extractFromItem: (item) => parseFloat(item.tax_rate ?? 15),
    },
    {
      key: 'subtotal',
      label: 'قبل الضريبة',
      type: 'calculated',
      readonly: true,
      hidden: !showLineTax.value && !showLineDiscount.value,
      widthClass: 'w-[10%]',
      formula: (row) => row.subtotal,
      slot: 'cell-subtotal',
    },
    {
      key: 'total',
      label: 'الإجمالي الصافي',
      type: 'calculated',
      readonly: true,
      summary: true,
      widthClass: 'w-[12%]',
      formula: (row) => row.total,
      slot: 'cell-total',
    },
  ])

  const visibleTableSchema = computed(() => {
    return detailSchema.value.filter((col) => col.label && !col.hidden)
  })

  // =========================================================
  // 4. إدارة سطور البنود وإدخال الأصناف
  // =========================================================
  const recalculateLine = (row) => {
    const qty = parseFloat(row.quantity) || 0
    const price = parseFloat(row.unit_price) || 0
    const discountPercent = parseFloat(row.discount_percentage) || 0
    const taxRate = parseFloat(row.tax_rate) || 0

    const gross = qty * price
    const discountAmount = gross * (discountPercent / 100)
    const lineSubtotal = gross - discountAmount
    const taxAmount = lineSubtotal * (taxRate / 100)

    row.subtotal = parseFloat(lineSubtotal.toFixed(4))
    row.total = parseFloat((lineSubtotal + taxAmount).toFixed(4))
  }

  const createEmptyRow = () => {
    return {
      id: undefined,
      product_id_display: '',
      product_name: '',
      product_id: null,
      product_unit_id: null,
      unit_name: '',
      purchase_order_item_id: null,
      receipt_item_id: null,
      current_quantity: 0,
      quantity: 1,
      unit_price: 0,
      discount_percentage: 0,
      tax_rate: 15,
      subtotal: 0,
      total: 0,
      notes: '',
      available_units: [],
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

  // اختيار صنف مع منع تكرار نفس الصنف في أكثر من سطر واستخراج الرصيد المتاح
  const selectProductForRow = (row, selectedProduct, currentRowIndex = null) => {
    if (!selectedProduct) return false

    const existingIndex = items.value.findIndex(
      (it, idx) =>
        it.product_id === selectedProduct.id &&
        (currentRowIndex !== null ? idx !== currentRowIndex : it !== row),
    )

    if (existingIndex !== -1) {
      toast.warning(
        `الصنف "${selectedProduct.name}" مضاف مسبقاً في السطر رقم (${existingIndex + 1}).`,
      )
      return false
    }

    const matchedUnit = selectedProduct.unit || selectedProduct.units?.[0] || null
    const resolvedPrice =
      matchedUnit?.cost_price !== undefined && matchedUnit?.cost_price !== null
        ? parseFloat(matchedUnit.cost_price)
        : parseFloat(selectedProduct.cost_price || selectedProduct.price || 0)

    // استخراج رصيد الصنف الحالي المتوفر بدقة
    const rawStock =
      selectedProduct.available_quantity !== undefined &&
      selectedProduct.available_quantity !== null
        ? selectedProduct.available_quantity
        : selectedProduct.current_stock !== undefined && selectedProduct.current_stock !== null
          ? selectedProduct.current_stock
          : selectedProduct.stock !== undefined && selectedProduct.stock !== null
            ? selectedProduct.stock
            : selectedProduct.quantity !== undefined && selectedProduct.quantity !== null
              ? selectedProduct.quantity
              : selectedProduct.current_quantity !== undefined &&
                  selectedProduct.current_quantity !== null
                ? selectedProduct.current_quantity
                : 0

    const resolvedStock = parseFloat(rawStock) || 0

    row.product_id = selectedProduct.id
    row.product_id_display = `PRD-${selectedProduct.id}`
    row.product_name = selectedProduct.name || ''
    row.product_unit_id = matchedUnit?.id || null
    row.unit_name = matchedUnit?.unit_name || matchedUnit?.name || ''
    row.available_units = selectedProduct.units || selectedProduct.available_units || []
    row.current_quantity = resolvedStock
    row.unit_price = resolvedPrice

    if (!row.quantity || row.quantity <= 0) {
      row.quantity = 1
    }
    if (row.tax_rate === undefined || row.tax_rate === null) {
      row.tax_rate = 15
    }
    if (row.discount_percentage === undefined || row.discount_percentage === null) {
      row.discount_percentage = 0
    }

    recalculateLine(row)
    return true
  }

  const handleGlobalItemSelect = (selectedItem) => {
    if (!selectedItem) return
    let targetRow = items.value[items.value.length - 1]
    if (!targetRow || targetRow.product_id) {
      targetRow = createEmptyRow()
      items.value.push(targetRow)
    }
    const targetIndex = items.value.indexOf(targetRow)
    selectProductForRow(targetRow, selectedItem, targetIndex)
  }

  const syncUnitDetails = (row) => {
    const matchedUnit = row.available_units?.find((u) => u.id === row.product_unit_id)
    if (matchedUnit) {
      row.unit_name = matchedUnit.unit_name || matchedUnit.name || ''
      if (matchedUnit.cost_price !== undefined && matchedUnit.cost_price !== null) {
        row.unit_price = parseFloat(matchedUnit.cost_price) || 0
      } else if (matchedUnit.price !== undefined && matchedUnit.price !== null) {
        row.unit_price = parseFloat(matchedUnit.price) || 0
      }
    }
    recalculateLine(row)
  }

  const incrementQuantity = (row) => {
    const current = parseFloat(row.quantity) || 0
    row.quantity = current + 1
    recalculateLine(row)
  }

  const decrementQuantity = (row) => {
    const current = parseFloat(row.quantity) || 0
    if (current > 1) {
      row.quantity = current - 1
      recalculateLine(row)
    }
  }

  // =========================================================
  // 5. الحسابات المالية التلقائية (4 خانات عشرية)
  // =========================================================
  const calculatedSubtotal = computed(() => {
    return items.value.reduce((sum, row) => {
      const qty = parseFloat(row.quantity) || 0
      const price = parseFloat(row.unit_price) || 0
      const discountPercent = parseFloat(row.discount_percentage) || 0
      const gross = qty * price
      const discountAmount = gross * (discountPercent / 100)
      return sum + (gross - discountAmount)
    }, 0)
  })

  const calculatedDiscountAmount = computed(() => {
    const subtotal = calculatedSubtotal.value
    const val = parseFloat(form.value.discount_value) || 0
    if (form.value.discount_type === 'percentage') {
      return (subtotal * val) / 100
    }
    return val
  })

  const calculatedTaxAmount = computed(() => {
    return items.value.reduce((sum, row) => {
      const qty = parseFloat(row.quantity) || 0
      const price = parseFloat(row.unit_price) || 0
      const discountPercent = parseFloat(row.discount_percentage) || 0
      const taxRate = parseFloat(row.tax_rate) || 0

      const gross = qty * price
      const discountAmount = gross * (discountPercent / 100)
      const lineSubtotal = gross - discountAmount
      return sum + lineSubtotal * (taxRate / 100)
    }, 0)
  })

  const calculatedShippingCost = computed(() => {
    return parseFloat(form.value.shipping_cost) || 0
  })

  const calculatedTotalAmount = computed(() => {
    const subtotalAfterDiscount = Math.max(
      0,
      calculatedSubtotal.value - calculatedDiscountAmount.value,
    )
    const total = subtotalAfterDiscount + calculatedTaxAmount.value + calculatedShippingCost.value
    return Math.max(0, total)
  })

  const calculatedRemainingAmount = computed(() => {
    const paid = parseFloat(form.value.paid_amount) || 0
    return Math.max(0, calculatedTotalAmount.value - paid)
  })

  const totalItemsCount = computed(() => {
    return items.value.filter((row) => row.product_id && row.product_unit_id).length
  })

  const getValidationError = (path) => {
    return billStore.validationErrors?.[path]?.[0] || null
  }

  // =========================================================
  // 6. إدارة نافذة سند الصرف الموحد (Voucher Settlement Logic)
  // =========================================================
  const isVoucherModalOpen = ref(false)
  const voucherPrefillData = ref(null)

  const openVoucherModal = () => {
    const remaining = parseFloat(calculatedRemainingAmount.value.toFixed(4))
    if (remaining <= 0) {
      toast.info('هذه الفاتورة مسددة بالكامل ولا يوجد متبقي للسداد.')
      return
    }

    const billId =
      activeBillId.value || (isEdit.value ? route.params.id : billStore.currentBill?.id)
    if (!billId) {
      toast.error('لا يمكن تسجيل سداد قبل حفظ وترحيل الفاتورة أولاً.')
      return
    }

    const currentBill = billStore.currentBill || {}
    const supplier = currentBill.supplier || {}

    const supplierAccountId =
      supplier.account_id || supplier.payable_account_id || supplier.account?.id || null

    if (!supplierAccountId) {
      toast.error('المورد غير مرتبط بحساب مراقبة مالي في شجرة الحسابات. يرجى مراجعة بيانات المورد.')
      return
    }

    const effectiveSupplierId = form.value.supplier_id || supplier.id || null

    voucherPrefillData.value = {
      payee_name: supplier.name || '',
      description: `سداد فاتورة مشتريات رقم: ${form.value.bill_number || billId}`,
      amount: remaining,
      currency_id: form.value.currency_id || currentBill.currency_id || '',
      reference_label: `فاتورة: ${form.value.bill_number || billId}`,
      details: [
        {
          account_id: supplierAccountId,
          account_code: supplier.account?.code || '',
          account_name: supplier.account?.name || supplier.name || '',
          amount: remaining,
          description: `دفعة سداد على فاتورة رقم: ${form.value.bill_number || billId}`,
          party_type: 'App\\Modules\\Core\\Models\\Partner',
          party_id: effectiveSupplierId ? Number(effectiveSupplierId) : null,
          reference_type: 'App\\Modules\\Purchasing\\Models\\PurchaseBill',
          reference_id: Number(billId),
          reference_label: `فاتورة #${form.value.bill_number || billId}`,
        },
      ],
    }

    isVoucherModalOpen.value = true
  }

  const closeVoucherModal = () => {
    isVoucherModalOpen.value = false
    voucherPrefillData.value = null
  }

  const handleVoucherSaved = async () => {
    closeVoucherModal()
    const billId =
      activeBillId.value || (isEdit.value ? route.params.id : billStore.currentBill?.id)

    if (billId) {
      await billStore.fetchBill(billId)
      if (billStore.currentBill) {
        const cur = billStore.currentBill
        form.value.paid_amount = parseFloat(cur.paid_amount) || 0
        form.value.remaining_amount = parseFloat(cur.remaining_amount) || 0
        form.value.status = cur.status?.value || cur.status || form.value.status
      }
    }

    toast.success('تم تسجيل سند الصرف وتحديث مبالغ الفاتورة بنجاح.')
  }

  // =========================================================
  // 7. مراقبة المستودع لتحديث قائمة الأصناف والأرصدة
  // =========================================================
  watch(
    () => form.value.warehouse_id,
    async (newWarehouseId) => {
      if (!newWarehouseId) {
        productStore.products = []
        return
      }

      await productStore.fetchProducts({ is_active: 1, store_id: newWarehouseId, all: true })

      items.value.forEach((row) => {
        const matched = productStore.products?.find((p) => p.id === row.product_id)
        if (matched) {
          row.available_units = matched.units || row.available_units || []
          const rawStock =
            matched.available_quantity !== undefined && matched.available_quantity !== null
              ? matched.available_quantity
              : matched.current_stock !== undefined && matched.current_stock !== null
                ? matched.current_stock
                : matched.stock !== undefined && matched.stock !== null
                  ? matched.stock
                  : 0
          row.current_quantity = parseFloat(rawStock) || 0
        }
      })
    },
    { immediate: false },
  )

  // =========================================================
  // 8. تحميل البيانات والحفظ
  // =========================================================
  onMounted(async () => {
    isFormLoaded.value = false
    try {
      if (isEdit.value) {
        activeBillId.value = route.params.id
        await billStore.fetchBill(route.params.id)
        if (billStore.currentBill) {
          const cur = billStore.currentBill

          form.value = {
            bill_number: cur.bill_number || '',
            supplier_bill_number: cur.supplier_bill_number || '',
            supplier_id: cur.supplier_id || '',
            warehouse_id: cur.warehouse_id || '',
            purchase_order_id: cur.purchase_order_id || null,
            receipt_id: cur.receipt_id || null,
            currency_id: cur.currency_id || 1,
            exchange_rate: parseFloat(cur.exchange_rate) || 1.0,
            bill_date: cur.bill_date
              ? cur.bill_date.substring(0, 10)
              : new Date().toISOString().substring(0, 10),
            due_date: cur.due_date
              ? cur.due_date.substring(0, 10)
              : new Date().toISOString().substring(0, 10),
            status: cur.status?.value || cur.status || 'draft',
            discount_type: cur.discount_type || 'fixed',
            discount_value: parseFloat(cur.discount_value) || 0,
            shipping_cost: parseFloat(cur.shipping_cost) || 0,
            notes: cur.notes || '',
            paid_amount: parseFloat(cur.paid_amount) || 0,
            remaining_amount: parseFloat(cur.remaining_amount) || 0,
          }

          items.value = (cur.items || []).map((it) => {
            const qty = parseFloat(it.quantity) || 1
            const price = parseFloat(it.unit_price) || 0
            const discount = parseFloat(it.discount_percentage) || 0
            const tax = parseFloat(it.tax_rate) !== undefined ? parseFloat(it.tax_rate) : 15
            const gross = qty * price
            const discAmount = gross * (discount / 100)
            const lineSub = gross - discAmount
            const lineTotal = lineSub + lineSub * (tax / 100)

            const stockVal = parseFloat(
              it.current_quantity ||
                it.product?.available_quantity ||
                it.product?.current_stock ||
                it.product?.stock ||
                0,
            )

            return {
              id: it.id,
              product_id_display: it.product_id ? `PRD-${it.product_id}` : '',
              product_name: it.product?.name || it.product_name || '',
              product_id: it.product_id,
              product_unit_id: it.product_unit_id,
              unit_name: it.product_unit?.unit?.name || it.unit_name || '',
              purchase_order_item_id: it.purchase_order_item_id || null,
              receipt_item_id: it.receipt_item_id || null,
              current_quantity: stockVal,
              quantity: qty,
              unit_price: price,
              discount_percentage: discount,
              tax_rate: tax,
              subtotal: parseFloat(it.subtotal) || parseFloat(lineSub.toFixed(4)),
              total: parseFloat(it.total) || parseFloat(lineTotal.toFixed(4)),
              available_units: it.product?.units || [],
              notes: it.notes || '',
            }
          })

          // فحص ذكي: إذا كانت الفاتورة تحتوي على خصم بنود أو ضريبة مخصصة، نظهر الأعمدة تلقائياً
          const hasAnyLineDiscount = items.value.some((row) => row.discount_percentage > 0)
          if (hasAnyLineDiscount) {
            showLineDiscount.value = true
          }

          const hasAnyCustomLineTax = items.value.some(
            (row) => row.tax_rate !== undefined && row.tax_rate !== 15,
          )
          if (hasAnyCustomLineTax) {
            showLineTax.value = true
          }

          if (cur.warehouse_id) {
            await productStore.fetchProducts({
              is_active: 1,
              store_id: cur.warehouse_id,
              all: true,
            })

            items.value.forEach((row) => {
              const matchedStoreItem = productStore.products?.find((p) => p.id === row.product_id)
              if (matchedStoreItem) {
                row.available_units = matchedStoreItem.units || []
                if (row.current_quantity === 0) {
                  row.current_quantity = parseFloat(
                    matchedStoreItem.available_quantity ||
                      matchedStoreItem.current_stock ||
                      matchedStoreItem.stock ||
                      0,
                  )
                }
              }
            })
          }
        }
      } else {
        if (authStore.user) {
          form.value.warehouse_id = authStore.user.warehouse_id || authStore.user.store_id || ''
        }
        if (form.value.warehouse_id) {
          await productStore.fetchProducts({
            is_active: 1,
            store_id: form.value.warehouse_id,
            all: true,
          })
        }
        items.value = [createEmptyRow()]
      }
    } catch (err) {
      console.error('فشل في تحميل بيانات فاتورة المشتريات:', err)
      toast.error('حدث خطأ أثناء تحميل بيانات فاتورة المشتريات.')
    } finally {
      isFormLoaded.value = true
    }
  })

  // تجهيز حمولة الفاتورة والإرسال
  const handleSubmit = async (postDirectly = false) => {
    if (!form.value.supplier_id) {
      toast.error('يجب اختيار المورد أولاً.')
      return
    }

    if (isDirectInventoryPurchase.value && !form.value.warehouse_id) {
      toast.error('المستودع إلزامي في حالة الشراء المباشر لإدخال البضاعة للمخزن.')
      return
    }

    const dynamicItemsPayload = items.value
      .filter((row) => row.product_id && row.product_unit_id)
      .map((row) => {
        const qty = parseFloat(row.quantity) || 0
        const price = parseFloat(row.unit_price) || 0
        const discount = parseFloat(row.discount_percentage) || 0
        const tax = parseFloat(row.tax_rate) || 0

        const gross = qty * price
        const lineDiscount = gross * (discount / 100)
        const lineSubtotal = gross - lineDiscount
        const lineTax = lineSubtotal * (tax / 100)
        const lineTotal = lineSubtotal + lineTax

        const payloadItem = {
          purchase_order_item_id: row.purchase_order_item_id || null,
          receipt_item_id: row.receipt_item_id || null,
          product_id: Number(row.product_id),
          product_unit_id: Number(row.product_unit_id),
          account_id: row.account_id || null,
          quantity: qty,
          unit_price: price,
          discount_percentage: discount,
          tax_rate: tax,
          subtotal: parseFloat(lineSubtotal.toFixed(4)),
          tax_amount: parseFloat(lineTax.toFixed(4)),
          total: parseFloat(lineTotal.toFixed(4)),
          notes: row.notes || null,
        }

        if (isEdit.value && row.id) {
          payloadItem.id = row.id
        }

        return payloadItem
      })

    if (dynamicItemsPayload.length === 0) {
      toast.error('يجب إضافة صنف واحد على الأقل داخل الفاتورة مع تحديد الوحدة والكمية.')
      return
    }

    const finalPayload = {
      supplier_id: Number(form.value.supplier_id),
      warehouse_id: form.value.warehouse_id ? Number(form.value.warehouse_id) : null,
      purchase_order_id: form.value.purchase_order_id ? Number(form.value.purchase_order_id) : null,
      receipt_id: form.value.receipt_id ? Number(form.value.receipt_id) : null,
      currency_id: Number(form.value.currency_id),
      exchange_rate: parseFloat(form.value.exchange_rate) || 1.0,
      bill_date: form.value.bill_date,
      due_date: form.value.due_date,
      supplier_bill_number: form.value.supplier_bill_number || null,
      discount_type: form.value.discount_type || 'fixed',
      discount_value: parseFloat(form.value.discount_value) || 0,
      shipping_cost: parseFloat(form.value.shipping_cost) || 0,
      notes: form.value.notes || null,
      post_now: !isEdit.value && Boolean(postDirectly),
      items: dynamicItemsPayload,
    }

    try {
      if (isEdit.value) {
        await billStore.updateBill(route.params.id, finalPayload)
        activeBillId.value = route.params.id
        toast.success('تم تحديث مسودة فاتورة المشتريات بنجاح.')

        if (postDirectly) {
          const postedBill = await billStore.postBill(route.params.id)
          form.value.status = 'posted'
          const billData = postedBill?.data || postedBill
          if (billData) {
            form.value.paid_amount = parseFloat(billData.paid_amount) || 0
            form.value.remaining_amount = parseFloat(billData.remaining_amount) || 0
          }
          toast.success('تم ترحيل الفاتورة وتوليد القيد وإثبات حركة المخزون بنجاح.')
          openVoucherModal()
          return
        }
      } else {
        const savedBill = await billStore.createBill(finalPayload)
        const billData = savedBill?.data || billStore.currentBill || {}
        activeBillId.value = billData.id
        form.value.bill_number = billData.bill_number || ''

        if (postDirectly) {
          form.value.status = 'posted'
          form.value.paid_amount = parseFloat(billData.paid_amount) || 0
          form.value.remaining_amount = parseFloat(billData.remaining_amount) || 0
          toast.success('تم حفظ وترحيل الفاتورة وتوليد القيد وإثبات حركة المخزون بنجاح.')
          openVoucherModal()
          return
        }

        toast.success('تم إنشاء فاتورة المشتريات بنجاح.')
      }

      router.push('/app/purchasing/bills')
    } catch {
      toast.error(billStore.error || 'فشلت عملية حفظ فاتورة المشتريات.')
    }
  }

  const handleCancel = () => {
    router.push('/app/purchasing/bills')
  }

  // =========================================================
  // 9. دوال التنسيق
  // =========================================================
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return ''
    const num = Number(value)
    if (isNaN(num)) return ''
    const options = {
      style: 'decimal',
      maximumFractionDigits: 4,
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

  return {
    isFormLoaded,
    isEdit,
    form,
    items,
    detailSchema,
    visibleTableSchema,
    // إدارة الإفصاح التدريجي
    showLineDiscount,
    showLineTax,
    toggleLineDiscount,
    toggleLineTax,
    isReceiptLinked,
    isDirectInventoryPurchase,
    routeBadgeText,
    routeBadgeClass,
    calculatedSubtotal,
    calculatedDiscountAmount,
    calculatedTaxAmount,
    calculatedShippingCost,
    calculatedTotalAmount,
    calculatedRemainingAmount,
    totalItemsCount,
    // إدارة نافذة سند الصرف
    isVoucherModalOpen,
    voucherPrefillData,
    openVoucherModal,
    closeVoucherModal,
    handleVoucherSaved,
    // توافق عكسي
    isPaymentModalOpen: isVoucherModalOpen,
    openPaymentModal: openVoucherModal,
    closePaymentModal: closeVoucherModal,
    getValidationError,
    handleSubmit,
    handleCancel,
    formatNumber,
    unformatNumber,
    syncUnitDetails,
    recalculateLine,
    incrementQuantity,
    decrementQuantity,
    createEmptyRow,
    removeRow,
    triggerAddNewEmptyLine,
    selectProductForRow,
    handleGlobalItemSelect,
    billStore,
    productStore,
  }
}
