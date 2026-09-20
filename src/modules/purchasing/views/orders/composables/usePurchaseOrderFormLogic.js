// src/modules/purchasing/views/orders/composables/usePurchaseOrderFormLogic.js
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePurchaseOrderStore } from '@/modules/purchasing/stores/purchaseOrderStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import { useToast } from 'vue-toastification'

export function usePurchaseOrderFormLogic() {
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const orderStore = usePurchaseOrderStore()
  const productStore = useProductStore()

  const isEdit = computed(() => !!route.params.id)
  const isFormLoaded = ref(false)
  const isSubmitting = ref(false)
  const activeOrderId = ref(null)

  // =========================================================
  // 1. نموذج بيانات رأس أمر الشراء
  // =========================================================
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
  // 2. الذكاء التكيفي للمسارات والارتباطات
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
  // 3. سكيما تفاصيل البنود (مع عمود الكمية الحالية)
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
      extractFromItem: (item) => (item.product_id ? `PRD-${item.product_id}` : ''),
    },
    {
      key: 'product_name',
      label: 'الصنف التجاري',
      widthClass: 'w-[20%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => item.product_name || item.name || '',
    },
    {
      key: 'product_unit_id',
      label: 'الوحدة',
      slot: 'cell-product_unit_id',
      widthClass: 'w-[11%]',
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
      widthClass: 'w-[10%]',
      slot: 'cell-unit_price',
      extractFromItem: (item) => parseFloat(item.unit_price ?? 0),
    },
    {
      key: 'discount_percentage',
      label: 'خصم %',
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-[8%]',
      slot: 'cell-discount_percentage',
      extractFromItem: (item) => parseFloat(item.discount_percentage ?? 0),
    },
    {
      key: 'tax_rate',
      label: 'ضريبة %',
      type: 'number',
      defaultValue: 15,
      widthClass: 'w-[8%]',
      slot: 'cell-tax_rate',
      extractFromItem: (item) => parseFloat(item.tax_rate ?? 15),
    },
    {
      key: 'subtotal',
      label: 'قبل الضريبة',
      type: 'calculated',
      readonly: true,
      widthClass: 'w-[9%]',
      formula: (row) => row.subtotal,
      slot: 'cell-subtotal',
    },
    {
      key: 'total',
      label: 'الإجمالي الصافي',
      type: 'calculated',
      readonly: true,
      summary: true,
      widthClass: 'w-[10%]',
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
      requisition_item_id: null,
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

  const totalItemsCount = computed(() => {
    return items.value.filter((row) => row.product_id && row.product_unit_id).length
  })

  const getValidationError = (path) => {
    return orderStore.validationErrors?.[path]?.[0] || null
  }

  // =========================================================
  // 6. تحميل البيانات والحفظ
  // =========================================================
  onMounted(async () => {
    isFormLoaded.value = false
    try {
      const startupRequests = [productStore.fetchProducts({ is_active: 1, all: true })]
      if (isEdit.value) {
        startupRequests.push(orderStore.fetchOrder(route.params.id))
      }

      await Promise.all(startupRequests)

      if (isEdit.value && orderStore.currentOrder) {
        const cur = orderStore.currentOrder
        activeOrderId.value = cur.id

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
            requisition_item_id: it.requisition_item_id || null,
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

        // مزامنة الأرصدة والوحدات مع قائمة الأصناف المحملة
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
      } else if (!isEdit.value) {
        items.value = [createEmptyRow()]
      }
    } catch (err) {
      console.error('فشل في تحميل بيانات أمر الشراء:', err)
      toast.error('حدث خطأ أثناء تحميل بيانات أمر الشراء.')
    } finally {
      isFormLoaded.value = true
    }
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
          product_id: Number(row.product_id),
          product_unit_id: Number(row.product_unit_id),
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
      toast.error('يجب إضافة صنف واحد على الأقل داخل أمر الشراء مع تحديد الوحدة والكمية.')
      return
    }

    const finalPayload = {
      supplier_id: Number(form.value.supplier_id),
      requisition_id: form.value.requisition_id ? Number(form.value.requisition_id) : null,
      currency_id: Number(form.value.currency_id),
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

    isSubmitting.value = true

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
    } finally {
      isSubmitting.value = false
    }
  }

  const handleCancel = () => {
    router.push('/app/purchasing/orders')
  }

  // =========================================================
  // 7. دوال التنسيق
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
    isSubmitting,
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
    recalculateLine,
    incrementQuantity,
    decrementQuantity,
    createEmptyRow,
    removeRow,
    triggerAddNewEmptyLine,
    selectProductForRow,
    handleGlobalItemSelect,
    orderStore,
    productStore,
  }
}
