// src/modules/purchasing/views/issues/composables/usePurchaseIssueFormLogic.js
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePurchaseIssueStore } from '@/modules/purchasing/stores/purchaseIssueStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import { useAuthStore } from '@/stores/authStore'
import { useDynamicDetails } from '@/composables/useDynamicDetails'
import { useToast } from 'vue-toastification'

export function usePurchaseIssueFormLogic() {
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const issueStore = usePurchaseIssueStore()
  const productStore = useProductStore()
  const authStore = useAuthStore()

  const isEdit = computed(() => !!route.params.id)
  const isFormLoaded = ref(false)
  const activeIssueId = ref(null)

  // نموذج بيانات رأس إذن الصرف المخزني
  const form = ref({
    issue_number: '',
    requisition_id: null,
    warehouse_id: '',
    department_id: null,
    recipient_id: null,
    issue_date: new Date().toISOString().substring(0, 10),
    status: 'draft',
    total_cost: 0,
    notes: '',
  })

  const items = ref([])

  // =========================================================
  // 1. الذكاء التكيفي لمسار الصرف
  // =========================================================

  const isRequisitionLinked = computed(() => Boolean(form.value.requisition_id))

  const routeBadgeText = computed(() => {
    if (isRequisitionLinked.value) {
      return `صرف مرتبط بطلب احتياج داخلي رقم #${form.value.requisition_id}`
    }
    return 'إذن صرف مخزني مباشر - سيتم خصم الكميات من رصيد المستودع فورياً عند التأكيد'
  })

  const routeBadgeClass = computed(() => {
    if (isRequisitionLinked.value) {
      return 'bg-sky-950/40 text-sky-400 border border-sky-500/30'
    }
    return 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
  })

  // =========================================================
  // 2. سكيما تفاصيل بنود الصرف المخزني
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
      key: 'location_id',
      defaultValue: null,
      extractFromItem: (item) => item.location_id || null,
    },
    {
      key: 'batch_id',
      defaultValue: null,
      extractFromItem: (item) => item.batch_id || null,
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
      label: 'اسم الصنف التجاري',
      widthClass: 'w-[26%]',
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
      key: 'current_stock',
      label: 'الرصيد المتاح',
      widthClass: 'w-[10%]',
      readonly: true,
      type: 'text',
      slot: 'cell-current_stock',
      extractFromItem: (item) => {
        const stock = item.current_stock !== undefined ? item.current_stock : item.stock
        return stock !== undefined ? parseFloat(stock) : 0
      },
    },
    {
      key: 'quantity',
      label: 'الكمية المنصرفة',
      type: 'number',
      defaultValue: 1,
      widthClass: 'w-[11%]',
      slot: 'cell-quantity',
      extractFromItem: (item) => parseFloat(item.quantity ?? 1),
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
        return parseFloat(defaultUnit?.cost_price || item.cost_price || defaultUnit?.price || 0)
      },
    },
    {
      key: 'total_cost',
      label: 'إجمالي التكلفة',
      type: 'calculated',
      readonly: true,
      summary: true,
      widthClass: 'w-[12%]',
      formula: (row) => {
        const qty = parseFloat(row.quantity) || 0
        const cost = parseFloat(row.unit_cost) || 0
        return parseFloat((qty * cost).toFixed(4))
      },
      slot: 'cell-total_cost',
    },
    {
      key: 'notes',
      label: 'ملاحظات البند',
      type: 'text',
      defaultValue: '',
      widthClass: 'w-[8%]',
      slot: 'cell-notes',
      extractFromItem: (item) => item.notes || '',
    },
  ])

  const visibleTableSchema = computed(() => {
    return detailSchema.value.filter((col) => col.label && !col.hidden)
  })

  // إدارة الإدخال ومنع التكرار للصنف بنفس الوحدة
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

  // مزامنة التكلفة ورصيد المخزون عند تغيير الوحدة
  const syncUnitDetails = (row) => {
    const matchedUnit = row.available_units?.find((u) => u.id === row.product_unit_id)
    if (matchedUnit) {
      if (matchedUnit.cost_price !== undefined && matchedUnit.cost_price !== null) {
        row.unit_cost = parseFloat(matchedUnit.cost_price) || 0
      }
    }
  }

  // =========================================================
  // 3. العمليات الحسابية التلقائية
  // =========================================================

  const calculatedTotalCost = computed(() => {
    return items.value.reduce((sum, row) => {
      const qty = parseFloat(row.quantity) || 0
      const cost = parseFloat(row.unit_cost) || 0
      return sum + qty * cost
    }, 0)
  })

  const totalItemsCount = computed(() => {
    return items.value.filter((row) => row.product_id && row.product_unit_id).length
  })

  const totalQuantitySum = computed(() => {
    return items.value.reduce((sum, row) => {
      return sum + (parseFloat(row.quantity) || 0)
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
  // 5. تحميل البيانات عند الفتح
  // =========================================================

  const getValidationError = (path) => {
    return issueStore.validationErrors?.[path]?.[0] || null
  }

  onMounted(async () => {
    if (isEdit.value) {
      activeIssueId.value = route.params.id
      await issueStore.fetchIssue(route.params.id)
      if (issueStore.currentIssue) {
        const cur = issueStore.currentIssue

        form.value = {
          issue_number: cur.issue_number || '',
          requisition_id: cur.requisition_id || null,
          warehouse_id: cur.warehouse_id || '',
          department_id: cur.department_id || null,
          recipient_id: cur.recipient_id || null,
          issue_date: cur.issue_date
            ? cur.issue_date.substring(0, 10)
            : new Date().toISOString().substring(0, 10),
          status: cur.status?.value || cur.status || 'draft',
          total_cost: parseFloat(cur.total_cost) || 0,
          notes: cur.notes || '',
        }

        items.value = (cur.items || []).map((it) => ({
          id: it.id,
          product_id_display: it.product_id ? `PRD-${it.product_id}` : '',
          product_name: it.product?.name || it.product_name || '',
          product_id: it.product_id,
          product_unit_id: it.product_unit_id,
          requisition_item_id: it.requisition_item_id || null,
          location_id: it.location_id || null,
          batch_id: it.batch_id || null,
          current_stock: it.product?.current_stock ?? it.product?.stock ?? 0,
          quantity: parseFloat(it.quantity) || 1,
          unit_cost: parseFloat(it.unit_cost) || 0,
          total_cost: parseFloat(it.total_cost) || 0,
          available_units: it.product?.units || [],
          notes: it.notes || '',
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

  // =========================================================
  // 6. تجهيز حمولة الإرسال والحفظ
  // =========================================================

  const handleSubmit = async (confirmDirectly = false) => {
    if (!form.value.warehouse_id) {
      toast.error('يجب تحديد المستودع المراد الصرف منه أولاً.')
      return
    }

    const dynamicItemsPayload = items.value
      .filter((row) => row.product_id && row.product_unit_id)
      .map((row) => {
        const qty = parseFloat(row.quantity) || 0
        const cost = parseFloat(row.unit_cost) || 0
        const lineTotal = qty * cost

        return {
          id: row.id || undefined,
          requisition_item_id: row.requisition_item_id || null,
          product_id: Number(row.product_id),
          product_unit_id: Number(row.product_unit_id),
          location_id: row.location_id ? Number(row.location_id) : null,
          batch_id: row.batch_id ? Number(row.batch_id) : null,
          quantity: qty,
          unit_cost: cost,
          total_cost: parseFloat(lineTotal.toFixed(4)),
          notes: row.notes || null,
        }
      })

    if (dynamicItemsPayload.length === 0) {
      toast.error('يجب إضافة صنف واحد على الأقل داخل إذن الصرف.')
      return
    }

    const finalPayload = {
      warehouse_id: Number(form.value.warehouse_id),
      requisition_id: form.value.requisition_id ? Number(form.value.requisition_id) : null,
      department_id: form.value.department_id ? Number(form.value.department_id) : null,
      recipient_id: form.value.recipient_id ? Number(form.value.recipient_id) : null,
      issue_date: form.value.issue_date,
      notes: form.value.notes || null,
      items: dynamicItemsPayload,
    }

    try {
      if (isEdit.value) {
        await issueStore.updateIssue(route.params.id, finalPayload)
        activeIssueId.value = route.params.id
        toast.success('تم تحديث مسودة إذن الصرف المخزني بنجاح.')

        if (confirmDirectly) {
          await issueStore.confirmIssue(route.params.id)
          form.value.status = 'confirmed'
          toast.success('تم تأكيد وترحيل إذن الصرف وخصم الكميات من المستودع بنجاح.')
        }
      } else {
        const savedIssue = await issueStore.createIssue(finalPayload)
        const issueData = savedIssue?.data || issueStore.currentIssue || {}
        activeIssueId.value = issueData.id
        form.value.issue_number = issueData.issue_number || ''

        if (confirmDirectly && issueData.id) {
          await issueStore.confirmIssue(issueData.id)
          form.value.status = 'confirmed'
          toast.success('تم إنشاء وتأكيد إذن الصرف وخصم الكميات من المستودع بنجاح.')
        } else {
          toast.success('تم حفظ مسودة إذن الصرف المخزني بنجاح.')
        }
      }

      router.push('/app/purchasing/issues')
    } catch {
      toast.error(issueStore.error || 'فشلت عملية حفظ إذن الصرف المخزني.')
    }
  }

  const handleCancel = () => {
    router.push('/app/purchasing/issues')
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
    calculatedTotalCost,
    totalItemsCount,
    totalQuantitySum,
    getValidationError,
    handleSubmit,
    handleCancel,
    formatNumber,
    unformatNumber,
    syncUnitDetails,
    removeRow,
    triggerAddNewEmptyLine,
    handleGlobalItemSelect,
    issueStore,
    productStore,
  }
}
