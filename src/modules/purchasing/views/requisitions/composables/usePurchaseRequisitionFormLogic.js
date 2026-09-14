// src/modules/purchasing/views/requisitions/composables/usePurchaseRequisitionFormLogic.js
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePurchaseRequisitionStore } from '@/modules/purchasing/stores/purchaseRequisitionStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import { useAuthStore } from '@/stores/authStore'
import apiClient from '@/services/apiClient'
import { useToast } from 'vue-toastification'

export function usePurchaseRequisitionFormLogic() {
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const requisitionStore = usePurchaseRequisitionStore()
  const productStore = useProductStore()
  const authStore = useAuthStore()

  const isEdit = computed(() => !!route.params.id)
  const isFormLoaded = ref(false)
  const departmentsList = ref([])

  // =========================================================
  // 1. نموذج بيانات رأس طلب الشراء
  // =========================================================
  const form = ref({
    requisition_number: '',
    department_id: '',
    request_date: new Date().toISOString().substring(0, 10),
    required_date: new Date().toISOString().substring(0, 10),
    priority: 'medium',
    status: 'draft',
    notes: '',
  })

  // بنود طلب الشراء
  const items = ref([])

  // =========================================================
  // 2. إدارة سطور البنود الديناميكية
  // =========================================================
  const createEmptyRow = (isCustom = false) => {
    return {
      id: undefined,
      is_custom: isCustom,
      product_id: null,
      item_name: '',
      product_unit_id: null,
      unit_name: '',
      quantity_requested: 1,
      estimated_unit_cost: 0,
      specifications: '',
      notes: '',
      available_units: [],
    }
  }

  // إضافة سطر حر يدوي
  const triggerAddNewEmptyLine = () => {
    items.value.push(createEmptyRow(true))
  }

  // حذف سطر
  const removeRow = (index) => {
    items.value.splice(index, 1)
  }

  // إضافة صنف من البحث السريع الذكي للمنتجات المخزنية
  const handleGlobalItemSelect = (selectedProduct) => {
    if (!selectedProduct) return

    const existingIndex = items.value.findIndex(
      (row) => !row.is_custom && row.product_id === selectedProduct.id,
    )

    if (existingIndex > -1) {
      items.value[existingIndex].quantity_requested =
        (parseFloat(items.value[existingIndex].quantity_requested) || 0) + 1
      toast.info(`تم زيادة كمية الصنف (${selectedProduct.name}) إلى البند الحالي.`)
      return
    }

    const defaultUnit = selectedProduct.units?.[0] || null
    const defaultCost = defaultUnit
      ? parseFloat(defaultUnit.cost_price || defaultUnit.price || 0)
      : parseFloat(selectedProduct.cost_price || 0)

    items.value.push({
      id: undefined,
      is_custom: false,
      product_id: selectedProduct.id,
      item_name: selectedProduct.name || '',
      product_unit_id: defaultUnit?.id || null,
      unit_name: defaultUnit?.name || defaultUnit?.unit_name || '',
      quantity_requested: 1,
      estimated_unit_cost: defaultCost,
      specifications: selectedProduct.description || '',
      notes: '',
      available_units: selectedProduct.units || [],
    })
  }

  // مزامنة التكلفة عند تغيير وحدة القياس للمنتجات المسجلة
  const syncUnitDetails = (row) => {
    if (row.is_custom) return
    const matchedUnit = row.available_units?.find((u) => u.id === row.product_unit_id)
    if (matchedUnit) {
      row.unit_name = matchedUnit.unit_name || matchedUnit.name || ''
      if (matchedUnit.cost_price !== undefined && matchedUnit.cost_price !== null) {
        row.estimated_unit_cost = parseFloat(matchedUnit.cost_price) || 0
      }
    }
  }

  // =========================================================
  // 3. الحسابات والإجماليات
  // =========================================================
  const calculatedEstimatedTotal = computed(() => {
    return items.value.reduce((sum, row) => {
      const qty = parseFloat(row.quantity_requested) || 0
      const cost = parseFloat(row.estimated_unit_cost) || 0
      return sum + qty * cost
    }, 0)
  })

  const totalItemsCount = computed(() => {
    return items.value.filter(
      (row) =>
        (row.product_id || (row.item_name && row.item_name.trim())) && row.quantity_requested > 0,
    ).length
  })

  const getValidationError = (path) => {
    return requisitionStore.validationErrors?.[path]?.[0] || null
  }

  // =========================================================
  // 4. دوال التنسيق
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

  // =========================================================
  // 5. تحميل البيانات المرجعية وبيانات الطلب في التعديل
  // =========================================================
  const loadDepartments = async () => {
    try {
      const response = await apiClient.get('/hr/departments')
      departmentsList.value = response.data.data || response.data || []
    } catch (err) {
      console.error('فشل في جلب قائمة الأقسام:', err)
    }
  }

  onMounted(async () => {
    await Promise.all([loadDepartments(), productStore.fetchProducts({ is_active: 1, all: true })])

    if (isEdit.value) {
      await requisitionStore.fetchRequisition(route.params.id)
      if (requisitionStore.currentRequisition) {
        const cur = requisitionStore.currentRequisition

        form.value = {
          requisition_number: cur.requisition_number || '',
          department_id: cur.department_id || '',
          request_date: cur.request_date
            ? cur.request_date.substring(0, 10)
            : new Date().toISOString().substring(0, 10),
          required_date: cur.required_date
            ? cur.required_date.substring(0, 10)
            : new Date().toISOString().substring(0, 10),
          priority: cur.priority?.value || cur.priority || 'medium',
          status: cur.status?.value || cur.status || 'draft',
          notes: cur.notes || '',
        }

        items.value = (cur.items || []).map((it) => {
          const isCustom = !it.product_id
          return {
            id: it.id,
            is_custom: isCustom,
            product_id: it.product_id || null,
            item_name: it.resolved_item_name || it.item_name || it.product?.name || '',
            product_unit_id: it.product_unit_id || null,
            unit_name: it.resolved_unit_name || it.unit_name || it.product_unit?.unit?.name || '',
            quantity_requested: parseFloat(it.quantity_requested) || 1,
            estimated_unit_cost: parseFloat(it.estimated_unit_cost) || 0,
            specifications: it.specifications || '',
            notes: it.notes || '',
            available_units: it.product?.units || [],
          }
        })
      }
    } else {
      if (authStore.user?.department_id) {
        form.value.department_id = authStore.user.department_id
      }
      // إضافة سطر افتراضي أولي
      items.value.push(createEmptyRow(false))
    }

    isFormLoaded.value = true
  })

  // =========================================================
  // 6. الحفظ والتقديم
  // =========================================================
  const handleSubmit = async (submitDirectly = false) => {
    // تصفية وتجهيز بنود الطلب
    const sanitizedItems = items.value
      .filter((row) => {
        const hasIdentity = row.product_id || (row.item_name && row.item_name.trim())
        const qty = parseFloat(row.quantity_requested) || 0
        return hasIdentity && qty > 0
      })
      .map((row) => ({
        id: row.id || undefined,
        product_id: row.is_custom ? null : row.product_id || null,
        item_name: row.is_custom || !row.product_id ? row.item_name : null,
        product_unit_id: row.is_custom ? null : row.product_unit_id || null,
        unit_name: row.is_custom || !row.product_unit_id ? row.unit_name : null,
        quantity_requested: parseFloat(row.quantity_requested),
        estimated_unit_cost: parseFloat(row.estimated_unit_cost) || 0,
        specifications: row.specifications || null,
        notes: row.notes || null,
      }))

    if (sanitizedItems.length === 0) {
      toast.error('يجب إضافة بند واحد على الأقل مع تحديد اسمه والكمية المطلوبة.')
      return
    }

    const payload = {
      department_id: form.value.department_id || null,
      request_date: form.value.request_date || null,
      required_date: form.value.required_date || null,
      priority: form.value.priority,
      notes: form.value.notes || null,
      items: sanitizedItems,
    }

    try {
      let savedRequisitionId = route.params.id

      if (isEdit.value) {
        await requisitionStore.updateRequisition(route.params.id, payload)
        toast.success('تم تحديث مسودة طلب الشراء بنجاح.')
      } else {
        const res = await requisitionStore.createRequisition(payload)
        const resData = res?.data || requisitionStore.currentRequisition
        savedRequisitionId = resData?.id
        toast.success('تم إنشاء طلب الشراء بنجاح.')
      }

      if (submitDirectly && savedRequisitionId) {
        await requisitionStore.submitRequisition(savedRequisitionId)
        toast.success('تم تقديم طلب الشراء للاعتماد بنجاح.')
      }

      router.push('/app/purchasing/requisitions')
    } catch {
      toast.error(requisitionStore.error || 'فشلت عملية حفظ طلب الشراء.')
    }
  }

  const handleCancel = () => {
    router.push('/app/purchasing/requisitions')
  }

  return {
    isFormLoaded,
    isEdit,
    form,
    items,
    departmentsList,
    calculatedEstimatedTotal,
    totalItemsCount,
    getValidationError,
    formatNumber,
    unformatNumber,
    createEmptyRow,
    triggerAddNewEmptyLine,
    removeRow,
    handleGlobalItemSelect,
    syncUnitDetails,
    handleSubmit,
    handleCancel,
    requisitionStore,
    productStore,
  }
}
