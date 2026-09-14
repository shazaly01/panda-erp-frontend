// src/modules/purchasing/views/receipts/composables/usePurchaseReceiptFormLogic.js
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePurchaseReceiptStore } from '@/modules/purchasing/stores/purchaseReceiptStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import { useAuthStore } from '@/stores/authStore'
import { useDynamicDetails } from '@/composables/useDynamicDetails'
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
  const activeReceiptId = ref(null)

  // نموذج بيانات رأس سند الاستلام المخزني
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
  // 1. الذكاء التكيفي لحالة السند والشارات التوضيحية
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
  // 2. سكيما تفاصيل البنود اللوجستية (Dynamic Detail Schema)
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
      extractFromItem: (item) => (item.id ? `PRD-${item.id}` : ''),
    },
    {
      key: 'product_name',
      label: 'الصنف التجاري',
      widthClass: 'w-[25%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => item.name || '',
    },
    {
      key: 'product_unit_id',
      label: 'الوحدة',
      slot: 'cell-product_unit_id',
      widthClass: 'w-[12%]',
      type: 'text',
      extractFromItem: (item) => item.units?.[0]?.id || '',
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
      widthClass: 'w-[11%]',
      slot: 'cell-unit_cost',
      extractFromItem: (item) => {
        const defaultUnit = item.units?.[0]
        return parseFloat(defaultUnit?.cost_price || item.cost_price || 0)
      },
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
    const newRow = createEmptyRow()
    newRow.quantity_received = 1
    newRow.quantity_accepted = 1
    newRow.quantity_rejected = 0
    newRow.unit_cost = 0
    newRow.total_cost = 0
    newRow.location_id = null
    newRow.batch_id = null
    newRow.rejection_reason = ''
    newRow.notes = ''
    items.value.push(newRow)
  }

  const handleGlobalItemSelect = (selectedItem) => {
    if (!selectedItem) return
    handleItemSelected(selectedItem)

    // ضبط الكميات والتكلفة الافتراضية تلقائياً للبند المختار حديثاً
    const lastRow = items.value[items.value.length - 1]
    if (lastRow) {
      if (!lastRow.quantity_received) lastRow.quantity_received = 1
      if (!lastRow.quantity_accepted) lastRow.quantity_accepted = lastRow.quantity_received
      if (lastRow.quantity_rejected === undefined) lastRow.quantity_rejected = 0

      const matchedUnit = lastRow.available_units?.find((u) => u.id === lastRow.product_unit_id)
      if (matchedUnit && matchedUnit.cost_price !== undefined) {
        lastRow.unit_cost = parseFloat(matchedUnit.cost_price) || 0
      } else if (selectedItem.cost_price) {
        lastRow.unit_cost = parseFloat(selectedItem.cost_price) || 0
      }
      lastRow.total_cost = parseFloat(
        (
          (parseFloat(lastRow.quantity_accepted) || 0) * (parseFloat(lastRow.unit_cost) || 0)
        ).toFixed(4),
      )
    }
  }

  // مزامنة التكلفة عند تغيير الوحدة
  const syncUnitDetails = (row) => {
    const matchedUnit = row.available_units?.find((u) => u.id === row.product_unit_id)
    if (matchedUnit && matchedUnit.cost_price !== undefined && matchedUnit.cost_price !== null) {
      row.unit_cost = parseFloat(matchedUnit.cost_price) || 0
    }
  }

  // ذكاء مزامنة الكميات (تحديث الكمية المقبولة والمرفوضة فورياً)
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
  }

  // =========================================================
  // 3. الإجماليات التشغيلية والكمية
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
  // 4. مراقبة المستودع لتحديث قائمة الأصناف
  // =========================================================

  watch(
    () => form.value.warehouse_id,
    async (newWarehouseId) => {
      if (!newWarehouseId) {
        productStore.products = []
        return
      }

      await productStore.fetchProducts({ is_active: 1, store_id: newWarehouseId, all: true })
    },
    { immediate: false },
  )

  // =========================================================
  // 5. تحميل البيانات والحفظ
  // =========================================================

  const getValidationError = (path) => {
    return receiptStore.validationErrors?.[path]?.[0] || null
  }

  onMounted(async () => {
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

        items.value = (cur.items || []).map((it) => ({
          id: it.id,
          product_id_display: it.product_id ? `PRD-${it.product_id}` : '',
          product_name: it.product?.name || '',
          product_id: it.product_id,
          product_unit_id: it.product_unit_id,
          purchase_order_item_id: it.purchase_order_item_id || null,
          location_id: it.location_id || null,
          batch_id: it.batch_id || null,
          quantity_received: parseFloat(it.quantity_received) || 1,
          quantity_accepted: parseFloat(it.quantity_accepted) || 1,
          quantity_rejected: parseFloat(it.quantity_rejected) || 0,
          unit_cost: parseFloat(it.unit_cost) || 0,
          total_cost: parseFloat(it.total_cost) || 0,
          rejection_reason: it.rejection_reason || '',
          notes: it.notes || '',
          available_units: it.product?.units || [],
        }))

        if (cur.warehouse_id) {
          await productStore.fetchProducts({ is_active: 1, store_id: cur.warehouse_id, all: true })
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
    }

    isFormLoaded.value = true
  })

  // تجهيز حمولة سند الاستلام والإرسال
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
      toast.error('يجب إضافة صنف واحد على الأقل داخل سند الاستلام.')
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
    }
  }

  const handleCancel = () => {
    router.push('/app/purchasing/receipts')
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
    removeRow,
    triggerAddNewEmptyLine,
    handleGlobalItemSelect,
    receiptStore,
    productStore,
  }
}
