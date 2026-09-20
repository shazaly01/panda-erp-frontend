// src/modules/purchasing/views/receipts/composables/usePurchaseReceiptFormLogic.js
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePurchaseReceiptStore } from '@/modules/purchasing/stores/purchaseReceiptStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'

export function usePurchaseReceiptFormLogic() {
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const receiptStore = usePurchaseReceiptStore()
  const productStore = useProductStore()
  const authStore = useAuthStore()

  const isEdit = computed(() => Boolean(route.params.id))
  const isFormLoaded = ref(false)
  const isSubmitting = ref(false)
  const activeReceiptId = ref(null)

  // =========================================================
  // 1. نموذج بيانات رأس سند الاستلام المخزني
  // =========================================================
  const form = ref({
    receipt_number: '',
    supplier_id: '',
    warehouse_id: '',
    purchase_order_id: null,
    receipt_date: new Date().toISOString().substring(0, 10),
    supplier_delivery_note: '',
    waybill_number: '',
    status: 'draft',
    notes: '',
  })

  const items = ref([])

  // =========================================================
  // 2. الذكاء التكيفي لحالة السند والشارات التوضيحية
  // =========================================================
  const isOrderLinked = computed(() => Boolean(form.value.purchase_order_id))

  const routeBadgeText = computed(() => {
    if (isOrderLinked.value) {
      return `مرتبط بأمر شراء رقم #${form.value.purchase_order_id} (مطابقة تلقائية للكميات)`
    }
    return 'استلام مباشر حر - سيتم إثبات الكميات الواردة في رصيد المخزن مباشرة'
  })

  const routeBadgeClass = computed(() => {
    if (isOrderLinked.value) {
      return 'bg-sky-950/40 text-sky-400 border border-sky-500/30'
    }
    return 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
  })

  // =========================================================
  // 3. سكيما تفاصيل البنود اللوجستية (مع عمود الكمية الحالية)
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
      key: 'product_id_display',
      label: 'كود الصنف',
      widthClass: 'w-[10%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => (item.product_id ? `PRD-${item.product_id}` : ''),
    },
    {
      key: 'product_name',
      label: 'الصنف التجاري',
      widthClass: 'w-[22%]',
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
      widthClass: 'w-[10%]',
      slot: 'cell-current_quantity',
      extractFromItem: (item) => parseFloat(item.current_quantity ?? 0),
    },
    {
      key: 'quantity_received',
      label: 'الكمية المستلمة',
      type: 'number',
      defaultValue: 1,
      widthClass: 'w-[11%]',
      slot: 'cell-quantity_received',
      extractFromItem: (item) => parseFloat(item.quantity_received ?? 1),
    },
    {
      key: 'quantity_accepted',
      label: 'الكمية المقبولة',
      type: 'number',
      defaultValue: 1,
      widthClass: 'w-[11%]',
      slot: 'cell-quantity_accepted',
      extractFromItem: (item) => parseFloat(item.quantity_accepted ?? item.quantity_received ?? 1),
    },
    {
      key: 'quantity_rejected',
      label: 'المرفوض',
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-[9%]',
      slot: 'cell-quantity_rejected',
      extractFromItem: (item) => parseFloat(item.quantity_rejected ?? 0),
    },
    {
      key: 'unit_cost',
      label: 'تكلفة الوحدة',
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-[10%]',
      slot: 'cell-unit_cost',
      extractFromItem: (item) => parseFloat(item.unit_cost ?? 0),
    },
    {
      key: 'total_cost',
      label: 'إجمالي التكلفة',
      type: 'calculated',
      readonly: true,
      summary: true,
      widthClass: 'w-[11%]',
      formula: (row) => {
        const acceptedQty = parseFloat(row.quantity_accepted) || 0
        const cost = parseFloat(row.unit_cost) || 0
        return parseFloat((acceptedQty * cost).toFixed(4))
      },
      slot: 'cell-total_cost',
    },
  ])

  const visibleTableSchema = computed(() => {
    return detailSchema.value.filter((col) => col.label && !col.hidden)
  })

  // =========================================================
  // 4. إدارة سطور البنود وإدخال الأصناف
  // =========================================================
  const createEmptyRow = () => {
    return {
      id: undefined,
      product_id_display: '',
      product_name: '',
      product_id: null,
      product_unit_id: null,
      unit_name: '',
      purchase_order_item_id: null,
      location_id: null,
      batch_id: null,
      current_quantity: 0,
      quantity_received: 1,
      quantity_accepted: 1,
      quantity_rejected: 0,
      unit_cost: 0,
      total_cost: 0,
      rejection_reason: '',
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

  // اختيار صنف مع استخراج رصيده المتوفر بدقة
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
    const resolvedCost =
      matchedUnit?.cost_price !== undefined && matchedUnit?.cost_price !== null
        ? parseFloat(matchedUnit.cost_price)
        : parseFloat(selectedProduct.cost_price || 0)

    // استخراج رصيد الصنف المتوفر بدقة مع دعم كافة أسماء الحقول المرتجعة
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
    row.unit_cost = resolvedCost

    if (!row.quantity_received || row.quantity_received <= 0) {
      row.quantity_received = 1
    }
    row.quantity_accepted = row.quantity_received
    row.quantity_rejected = 0
    row.total_cost = parseFloat((row.quantity_accepted * row.unit_cost).toFixed(4))

    return true
  }

  // دعم الاختيار العام المباشر
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

  // مزامنة التكلفة عند تغيير الوحدة
  const syncUnitDetails = (row) => {
    const matchedUnit = row.available_units?.find((u) => u.id === row.product_unit_id)
    if (matchedUnit) {
      row.unit_name = matchedUnit.unit_name || matchedUnit.name || ''
      if (matchedUnit.cost_price !== undefined && matchedUnit.cost_price !== null) {
        row.unit_cost = parseFloat(matchedUnit.cost_price) || 0
      }
    }
    row.total_cost = parseFloat(
      ((parseFloat(row.quantity_accepted) || 0) * (parseFloat(row.unit_cost) || 0)).toFixed(4),
    )
  }

  // ذكاء مزامنة الكميات (تحديث المقبول والمرفوض فورياً وإعادة حساب الإجمالي)
  const handleQuantityReceivedChange = (row, val) => {
    const received = Math.max(0, parseFloat(val) || 0)
    row.quantity_received = received
    const rejected = parseFloat(row.quantity_rejected) || 0

    if (rejected > received) {
      row.quantity_rejected = 0
      row.quantity_accepted = received
    } else {
      row.quantity_accepted = Math.max(0, received - rejected)
    }
    row.total_cost = parseFloat(
      ((parseFloat(row.quantity_accepted) || 0) * (parseFloat(row.unit_cost) || 0)).toFixed(4),
    )
  }

  const handleQuantityAcceptedChange = (row, val) => {
    const accepted = Math.max(0, parseFloat(val) || 0)
    const received = parseFloat(row.quantity_received) || 0

    if (accepted > received) {
      row.quantity_received = accepted
      row.quantity_accepted = accepted
      row.quantity_rejected = 0
    } else {
      row.quantity_accepted = accepted
      row.quantity_rejected = Math.max(0, received - accepted)
    }
    row.total_cost = parseFloat(
      ((parseFloat(row.quantity_accepted) || 0) * (parseFloat(row.unit_cost) || 0)).toFixed(4),
    )
  }

  const handleQuantityRejectedChange = (row, val) => {
    const rejected = Math.max(0, parseFloat(val) || 0)
    const received = parseFloat(row.quantity_received) || 0

    if (rejected > received) {
      row.quantity_received = rejected
      row.quantity_rejected = rejected
      row.quantity_accepted = 0
    } else {
      row.quantity_rejected = rejected
      row.quantity_accepted = Math.max(0, received - rejected)
    }
    row.total_cost = parseFloat(
      ((parseFloat(row.quantity_accepted) || 0) * (parseFloat(row.unit_cost) || 0)).toFixed(4),
    )
  }

  // زيادة ونقصان الكميات بسرعة
  const incrementQuantity = (row, key = 'quantity_received') => {
    const current = parseFloat(row[key]) || 0
    const nextVal = current + 1
    if (key === 'quantity_received') {
      handleQuantityReceivedChange(row, nextVal)
    } else if (key === 'quantity_accepted') {
      handleQuantityAcceptedChange(row, nextVal)
    } else if (key === 'quantity_rejected') {
      handleQuantityRejectedChange(row, nextVal)
    } else {
      row[key] = nextVal
    }
  }

  const decrementQuantity = (row, key = 'quantity_received') => {
    const current = parseFloat(row[key]) || 0
    if (current > 1 || (key === 'quantity_rejected' && current > 0)) {
      const nextVal = current - 1
      if (key === 'quantity_received') {
        handleQuantityReceivedChange(row, nextVal)
      } else if (key === 'quantity_accepted') {
        handleQuantityAcceptedChange(row, nextVal)
      } else if (key === 'quantity_rejected') {
        handleQuantityRejectedChange(row, nextVal)
      } else {
        row[key] = nextVal
      }
    }
  }

  // =========================================================
  // 5. الإجماليات التشغيلية والكمية
  // =========================================================
  const totalItemsCount = computed(() => {
    return items.value.filter((row) => row.product_id && row.product_unit_id).length
  })

  const totalReceivedQuantity = computed(() => {
    return items.value.reduce((sum, row) => sum + (parseFloat(row.quantity_received) || 0), 0)
  })

  const totalAcceptedQuantity = computed(() => {
    return items.value.reduce((sum, row) => sum + (parseFloat(row.quantity_accepted) || 0), 0)
  })

  const totalRejectedQuantity = computed(() => {
    return items.value.reduce((sum, row) => sum + (parseFloat(row.quantity_rejected) || 0), 0)
  })

  const totalEstimatedCost = computed(() => {
    return items.value.reduce((sum, row) => {
      const acceptedQty = parseFloat(row.quantity_accepted) || 0
      const cost = parseFloat(row.unit_cost) || 0
      return sum + acceptedQty * cost
    }, 0)
  })

  // =========================================================
  // 6. مراقبة المستودع لتحديث قائمة الأصناف والأرصدة
  // =========================================================
  watch(
    () => form.value.warehouse_id,
    async (newWarehouseId) => {
      if (!newWarehouseId) {
        productStore.products = []
        return
      }
      await productStore.fetchProducts({ is_active: 1, store_id: newWarehouseId, all: true })

      const activeProductIds = items.value.map((row) => row.product_id).filter(Boolean)
      if (activeProductIds.length > 0 && typeof productStore.refreshItemsStock === 'function') {
        try {
          const stockMap = await productStore.refreshItemsStock({
            store_id: newWarehouseId,
            item_ids: activeProductIds,
          })
          items.value.forEach((row) => {
            if (row.product_id && stockMap[row.product_id] !== undefined) {
              row.current_quantity = parseFloat(stockMap[row.product_id]) || 0
            }
          })
        } catch (err) {
          console.error('فشل في مزامنة الرصيد مع المستودع الجديد:', err)
        }
      }
    },
    { immediate: false },
  )

  const getValidationError = (path) => {
    return receiptStore.validationErrors?.[path]?.[0] || null
  }

  // =========================================================
  // 7. تحميل البيانات المرجعية وبيانات التعديل
  // =========================================================
  onMounted(async () => {
    isFormLoaded.value = false
    try {
      if (isEdit.value) {
        activeReceiptId.value = route.params.id
        await receiptStore.fetchReceipt(route.params.id)

        if (receiptStore.currentReceipt) {
          const cur = receiptStore.currentReceipt

          form.value = {
            receipt_number: cur.receipt_number || '',
            supplier_id: cur.supplier_id || '',
            warehouse_id: cur.warehouse_id || '',
            purchase_order_id: cur.purchase_order_id || null,
            receipt_date: cur.receipt_date
              ? cur.receipt_date.substring(0, 10)
              : new Date().toISOString().substring(0, 10),
            supplier_delivery_note: cur.supplier_delivery_note || '',
            waybill_number: cur.waybill_number || '',
            status: cur.status?.value || cur.status || 'draft',
            notes: cur.notes || '',
          }

          items.value = (cur.items || []).map((it) => {
            const cost = parseFloat(it.unit_cost) || 0
            const acceptedQty = parseFloat(it.quantity_accepted) || 0
            return {
              id: it.id,
              product_id_display: it.product_id ? `PRD-${it.product_id}` : '',
              product_name: it.product?.name || it.product_name || '',
              product_id: it.product_id,
              product_unit_id: it.product_unit_id,
              unit_name: it.product_unit?.unit?.name || it.unit_name || '',
              purchase_order_item_id: it.purchase_order_item_id || null,
              location_id: it.location_id || null,
              batch_id: it.batch_id || null,
              current_quantity: parseFloat(
                it.current_quantity ||
                  it.product?.available_quantity ||
                  it.product?.current_stock ||
                  0,
              ),
              quantity_received: parseFloat(it.quantity_received) || 1,
              quantity_accepted: acceptedQty,
              quantity_rejected: parseFloat(it.quantity_rejected) || 0,
              unit_cost: cost,
              total_cost: parseFloat(it.total_cost) || parseFloat((acceptedQty * cost).toFixed(4)),
              rejection_reason: it.rejection_reason || '',
              notes: it.notes || '',
              available_units: it.product?.units || [],
            }
          })

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
      console.error('فشل في تحميل بيانات سند الاستلام:', err)
      toast.error('حدث خطأ أثناء تحميل بيانات السند.')
    } finally {
      isFormLoaded.value = true
    }
  })

  // =========================================================
  // 8. الحفظ والترحيل
  // =========================================================
  const handleSubmit = async (receiveDirectly = false) => {
    if (!form.value.supplier_id) {
      toast.error('يجب اختيار المورد أولاً.')
      return
    }

    if (!form.value.warehouse_id) {
      toast.error('المستودع المستلم إلزامي لتحديد وجهة تخزين البضاعة.')
      return
    }

    const dynamicItemsPayload = items.value
      .filter((row) => row.product_id && row.product_unit_id)
      .map((row) => {
        const qtyReceived = parseFloat(row.quantity_received) || 0
        const qtyAccepted = parseFloat(row.quantity_accepted) || 0
        const qtyRejected = parseFloat(row.quantity_rejected) || 0
        const cost = parseFloat(row.unit_cost) || 0

        return {
          id: row.id || undefined,
          purchase_order_item_id: row.purchase_order_item_id || null,
          product_id: Number(row.product_id),
          product_unit_id: Number(row.product_unit_id),
          location_id: row.location_id ? Number(row.location_id) : null,
          batch_id: row.batch_id ? Number(row.batch_id) : null,
          quantity_received: qtyReceived,
          quantity_accepted: qtyAccepted,
          quantity_rejected: qtyRejected,
          unit_cost: cost,
          rejection_reason: qtyRejected > 0 ? row.rejection_reason || null : null,
          notes: row.notes || null,
        }
      })

    if (dynamicItemsPayload.length === 0) {
      toast.error('يجب إضافة صنف واحد على الأقل داخل سند الاستلام مع تحديد الوحدة والكمية.')
      return
    }

    const finalPayload = {
      supplier_id: Number(form.value.supplier_id),
      warehouse_id: Number(form.value.warehouse_id),
      purchase_order_id: form.value.purchase_order_id ? Number(form.value.purchase_order_id) : null,
      receipt_date: form.value.receipt_date,
      supplier_delivery_note: form.value.supplier_delivery_note || null,
      waybill_number: form.value.waybill_number || null,
      notes: form.value.notes || null,
      items: dynamicItemsPayload,
    }

    isSubmitting.value = true

    try {
      if (isEdit.value) {
        await receiptStore.updateReceipt(route.params.id, finalPayload)
        toast.success('تم تحديث مسودة سند الاستلام بنجاح.')

        if (receiveDirectly) {
          await receiptStore.receiveReceipt(route.params.id)
          toast.success('تم تأكيد استلام البضاعة وإثبات حركة المخزون بنجاح.')
        }
      } else {
        const savedReceipt = await receiptStore.createReceipt(finalPayload)
        const receiptData = savedReceipt?.data || receiptStore.currentReceipt || {}
        const createdId = receiptData.id

        if (receiveDirectly && createdId) {
          await receiptStore.receiveReceipt(createdId)
          toast.success('تم إنشاء سند الاستلام وإثبات حركة المخزون فوراً بنجاح.')
        } else {
          toast.success('تم حفظ مسودة سند الاستلام بنجاح.')
        }
      }

      router.push('/app/purchasing/receipts')
    } catch {
      toast.error(receiptStore.error || 'فشلت عملية حفظ سند الاستلام المخزني.')
    } finally {
      isSubmitting.value = false
    }
  }

  const handleCancel = () => {
    router.push('/app/purchasing/receipts')
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
    isSubmitting,
    isEdit,
    form,
    items,
    detailSchema,
    visibleTableSchema,
    isOrderLinked,
    routeBadgeText,
    routeBadgeClass,
    totalItemsCount,
    totalReceivedQuantity,
    totalAcceptedQuantity,
    totalRejectedQuantity,
    totalEstimatedCost,
    getValidationError,
    handleSubmit,
    handleCancel,
    formatNumber,
    unformatNumber,
    syncUnitDetails,
    handleQuantityReceivedChange,
    handleQuantityAcceptedChange,
    handleQuantityRejectedChange,
    incrementQuantity,
    decrementQuantity,
    createEmptyRow,
    removeRow,
    triggerAddNewEmptyLine,
    selectProductForRow,
    handleGlobalItemSelect,
    receiptStore,
    productStore,
    authStore,
  }
}
