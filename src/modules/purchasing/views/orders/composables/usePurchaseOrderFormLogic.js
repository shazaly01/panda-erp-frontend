// src/modules/purchasing/views/orders/composables/usePurchaseOrderFormLogic.js
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePurchaseOrderStore } from '@/modules/purchasing/stores/purchaseOrderStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import { useDynamicDetails } from '@/composables/useDynamicDetails'
import { useToast } from 'vue-toastification'

export function usePurchaseOrderFormLogic() {
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const orderStore = usePurchaseOrderStore()
  const productStore = useProductStore()

  const isEdit = computed(() => !!route.params.id)
  const isFormLoaded = ref(false)
  const activeOrderId = ref(null)

  // نموذج بيانات رأس أمر الشراء
  const form = ref({
    order_number: '',
    supplier_id: '',
    requisition_id: null,
    currency_id: 1,
    exchange_rate: 1.0,
    order_date: new Date().toISOString().substring(0, 10),
    expected_delivery_date: '',
    payment_terms: '',
    status: 'draft',
    discount_type: 'fixed',
    discount_value: 0,
    shipping_cost: 0,
    notes: '',
    terms_and_conditions: '',
  })

  const items = ref([])

  // =========================================================
  // 1. الذكاء التكيفي للمسارات والارتباطات
  // =========================================================
  const isRequisitionLinked = computed(() => Boolean(form.value.requisition_id))

  const routeBadgeText = computed(() => {
    if (isRequisitionLinked.value) {
      return `مرتبط بطلب شراء واحتياج داخلي رقم #${form.value.requisition_id}`
    }
    return 'أمر شراء مباشر - إصدار مباشر للمورد'
  })

  const routeBadgeClass = computed(() => {
    if (isRequisitionLinked.value) {
      return 'bg-sky-950/40 text-sky-400 border border-sky-500/30'
    }
    return 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
  })

  // =========================================================
  // 2. سكيما تفاصيل البنود (Dynamic Detail Schema)
  // =========================================================
  const detailSchema = computed(() => [
    {
      key: 'product_id',
      extractFromItem: (item) => item.id,
    },
    {
      key: 'available_units',
      defaultValue: [],
      extractFromItem: (item) => item.units || [],
    },
    {
      key: 'requisition_item_id',
      defaultValue: null,
      extractFromItem: (item) => item.requisition_item_id || null,
    },
    {
      key: 'product_id_display',
      label: 'كود الصنف',
      widthClass: 'w-[9%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => (item.id ? `PRD-${item.id}` : ''),
    },
    {
      key: 'product_name',
      label: 'الصنف التجاري',
      widthClass: 'w-[22%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => item.name || '',
    },
    {
      key: 'product_unit_id',
      label: 'الوحدة',
      slot: 'cell-product_unit_id',
      widthClass: 'w-[11%]',
      type: 'text',
      extractFromItem: (item) => item.units?.[0]?.id || '',
    },
    {
      key: 'quantity',
      label: 'الكمية المطلوبة',
      type: 'number',
      defaultValue: 1,
      widthClass: 'w-[10%]',
      slot: 'cell-quantity',
      extractFromItem: (item) => parseFloat(item.quantity ?? 1),
    },
    {
      key: 'unit_price',
      label: 'سعر الوحدة',
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-[11%]',
      slot: 'cell-unit_price',
      extractFromItem: (item) => {
        const defaultUnit = item.units?.[0]
        return parseFloat(defaultUnit?.cost_price || item.cost_price || defaultUnit?.price || 0)
      },
    },
    {
      key: 'discount_percentage',
      label: 'خصم %',
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-[9%]',
      slot: 'cell-discount_percentage',
      extractFromItem: () => 0,
    },
    {
      key: 'tax_rate',
      label: 'ضريبة %',
      type: 'number',
      defaultValue: 15,
      widthClass: 'w-[9%]',
      slot: 'cell-tax_rate',
      extractFromItem: (item) => parseFloat(item.tax_rate ?? 15),
    },
    {
      key: 'subtotal',
      label: 'قبل الضريبة',
      type: 'calculated',
      readonly: true,
      widthClass: 'w-[9%]',
      formula: (row) => {
        const qty = parseFloat(row.quantity) || 0
        const price = parseFloat(row.unit_price) || 0
        const discountPercent = parseFloat(row.discount_percentage) || 0
        const gross = qty * price
        const discountAmount = gross * (discountPercent / 100)
        return parseFloat((gross - discountAmount).toFixed(4))
      },
      slot: 'cell-subtotal',
    },
    {
      key: 'total',
      label: 'الإجمالي الصافي',
      type: 'calculated',
      readonly: true,
      summary: true,
      widthClass: 'w-[10%]',
      formula: (row) => {
        const qty = parseFloat(row.quantity) || 0
        const price = parseFloat(row.unit_price) || 0
        const discountPercent = parseFloat(row.discount_percentage) || 0
        const taxRate = parseFloat(row.tax_rate) || 0

        const gross = qty * price
        const discountAmount = gross * (discountPercent / 100)
        const lineSubtotal = gross - discountAmount
        const taxAmount = lineSubtotal * (taxRate / 100)

        return parseFloat((lineSubtotal + taxAmount).toFixed(4))
      },
      slot: 'cell-total',
    },
  ])

  const visibleTableSchema = computed(() => {
    return detailSchema.value.filter((col) => col.label && !col.hidden)
  })

  // إدارة الإدخال التفاعلي ومنع تكرار الصنف بنفس الوحدة
  const { createEmptyRow, handleItemSelected, removeRow } = useDynamicDetails(
    items,
    detailSchema.value,
    {
      uniqueKeys: ['product_id', 'product_unit_id'],
      mergeQtyKey: null,
    },
  )

  const triggerAddNewEmptyLine = () => {
    items.value.push(createEmptyRow())
  }

  const handleGlobalItemSelect = (selectedItem) => {
    if (!selectedItem) return
    handleItemSelected(selectedItem)
  }

  // مزامنة السعر الافتراضي عند تغيير الوحدة
  const syncUnitDetails = (row) => {
    const matchedUnit = row.available_units?.find((u) => u.id === row.product_unit_id)
    if (matchedUnit) {
      if (matchedUnit.cost_price !== undefined && matchedUnit.cost_price !== null) {
        row.unit_price = parseFloat(matchedUnit.cost_price) || 0
      }
    }
  }

  // =========================================================
  // 3. الحسابات المالية التلقائية (4 خانات عشرية)
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

  const totalItemsCount = computed(() => {
    return items.value.filter((row) => row.product_id && row.product_unit_id).length
  })

  const getValidationError = (path) => {
    return orderStore.validationErrors?.[path]?.[0] || null
  }

  // =========================================================
  // 4. تحميل البيانات والحفظ
  // =========================================================
  onMounted(async () => {
    await productStore.fetchProducts({ is_active: 1, all: true })

    if (isEdit.value) {
      activeOrderId.value = route.params.id
      await orderStore.fetchOrder(route.params.id)
      if (orderStore.currentOrder) {
        const cur = orderStore.currentOrder

        form.value = {
          order_number: cur.order_number || '',
          supplier_id: cur.supplier_id || '',
          requisition_id: cur.requisition_id || null,
          currency_id: cur.currency_id || 1,
          exchange_rate: parseFloat(cur.exchange_rate) || 1.0,
          order_date: cur.order_date
            ? cur.order_date.substring(0, 10)
            : new Date().toISOString().substring(0, 10),
          expected_delivery_date: cur.expected_delivery_date
            ? cur.expected_delivery_date.substring(0, 10)
            : '',
          payment_terms: cur.payment_terms || '',
          status: cur.status?.value || cur.status || 'draft',
          discount_type: cur.discount_type || 'fixed',
          discount_value: parseFloat(cur.discount_value) || 0,
          shipping_cost: parseFloat(cur.shipping_cost) || 0,
          notes: cur.notes || '',
          terms_and_conditions: cur.terms_and_conditions || '',
        }

        items.value = (cur.items || []).map((it) => ({
          id: it.id,
          product_id_display: it.product_id ? `PRD-${it.product_id}` : '',
          product_name: it.product?.name || '',
          product_id: it.product_id,
          product_unit_id: it.product_unit_id,
          requisition_item_id: it.requisition_item_id || null,
          quantity: parseFloat(it.quantity) || 1,
          unit_price: parseFloat(it.unit_price) || 0,
          discount_percentage: parseFloat(it.discount_percentage) || 0,
          tax_rate: parseFloat(it.tax_rate) || 0,
          subtotal: parseFloat(it.subtotal) || 0,
          total: parseFloat(it.total) || 0,
          available_units: it.product?.units || [],
          notes: it.notes || '',
        }))
      }
    }

    isFormLoaded.value = true
  })

  // تجهيز حمولة أمر الشراء وإرسال الطلب
  const handleSubmit = async (confirmDirectly = false) => {
    if (!form.value.supplier_id) {
      toast.error('يجب اختيار المورد أولاً.')
      return
    }

    const dynamicItemsPayload = items.value
      .filter((row) => row.product_id && row.product_unit_id)
      .map((row) => {
        const payloadItem = {
          requisition_item_id: row.requisition_item_id || null,
          product_id: row.product_id,
          product_unit_id: row.product_unit_id,
          quantity: parseFloat(row.quantity) || 0,
          unit_price: parseFloat(row.unit_price) || 0,
          discount_percentage: parseFloat(row.discount_percentage) || 0,
          tax_rate: parseFloat(row.tax_rate) || 0,
          notes: row.notes || null,
        }

        if (isEdit.value && row.id) {
          payloadItem.id = row.id
        }

        return payloadItem
      })

    if (dynamicItemsPayload.length === 0) {
      toast.error('يجب إضافة صنف واحد على الأقل داخل أمر الشراء.')
      return
    }

    const finalPayload = {
      supplier_id: form.value.supplier_id,
      requisition_id: form.value.requisition_id || null,
      currency_id: form.value.currency_id,
      exchange_rate: parseFloat(form.value.exchange_rate) || 1.0,
      order_date: form.value.order_date,
      expected_delivery_date: form.value.expected_delivery_date || null,
      payment_terms: form.value.payment_terms || null,
      discount_type: form.value.discount_type || 'fixed',
      discount_value: parseFloat(form.value.discount_value) || 0,
      shipping_cost: parseFloat(form.value.shipping_cost) || 0,
      notes: form.value.notes || null,
      terms_and_conditions: form.value.terms_and_conditions || null,
      items: dynamicItemsPayload,
    }

    try {
      let savedOrderId = null

      if (isEdit.value) {
        await orderStore.updateOrder(route.params.id, finalPayload)
        savedOrderId = route.params.id
        activeOrderId.value = savedOrderId
        toast.success('تم تحديث مسودة أمر الشراء بنجاح.')
      } else {
        const res = await orderStore.createOrder(finalPayload)
        const orderData = res?.data || orderStore.currentOrder || {}
        savedOrderId = orderData.id
        activeOrderId.value = savedOrderId
        form.value.order_number = orderData.order_number || ''
        toast.success('تم إنشاء أمر الشراء بنجاح.')
      }

      if (confirmDirectly && savedOrderId) {
        await orderStore.confirmOrder(savedOrderId)
        form.value.status = 'confirmed'
        toast.success('تم اعتماد وتأكيد أمر الشراء بنجاح.')
      }

      router.push('/app/purchasing/orders')
    } catch {
      toast.error(orderStore.error || 'فشلت عملية حفظ أمر الشراء.')
    }
  }

  const handleCancel = () => {
    router.push('/app/purchasing/orders')
  }

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
    isRequisitionLinked,
    routeBadgeText,
    routeBadgeClass,
    calculatedSubtotal,
    calculatedDiscountAmount,
    calculatedTaxAmount,
    calculatedShippingCost,
    calculatedTotalAmount,
    totalItemsCount,
    getValidationError,
    handleSubmit,
    handleCancel,
    formatNumber,
    unformatNumber,
    syncUnitDetails,
    removeRow,
    triggerAddNewEmptyLine,
    handleGlobalItemSelect,
    orderStore,
    productStore,
  }
}
