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
  const isSubmitting = ref(false)
  const departmentsList = ref([])

  // دالة مساعدة لضبط تاريخ الاحتياج الافتراضي بعد 4 أيام من تاريخ اليوم
  const getDefaultRequiredDate = () => {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 4)
    return targetDate.toISOString().substring(0, 10)
  }

  // =========================================================
  // 1. نموذج بيانات رأس طلب الشراء
  // =========================================================
  const form = ref({
    requisition_number: '',
    department_id: '',
    request_date: new Date().toISOString().substring(0, 10),
    required_date: getDefaultRequiredDate(),
    priority: 'medium',
    status: 'draft',
    notes: '',
  })

  // بنود طلب الشراء
  const items = ref([])

  // =========================================================
  // 2. إدارة سطور البنود
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

  // إضافة سطر جديد جاهز للإدخال
  const triggerAddNewEmptyLine = () => {
    items.value.push(createEmptyRow(false))
  }

  // حذف سطر
  const removeRow = (index) => {
    if (items.value.length === 1) {
      items.value[0] = createEmptyRow(false)
      return
    }
    items.value.splice(index, 1)
  }

  // اختيار صنف من قائمة الإكمال التلقائي مع منع التكرار تماماً
  const selectProductForRow = (row, selectedProduct, currentRowIndex = null) => {
    if (!selectedProduct) return false

    // فحص ما إذا كان الصنف مضافاً مسبقاً في أي سطر آخر داخل الطلب
    const existingIndex = items.value.findIndex(
      (it, idx) =>
        it.product_id === selectedProduct.id &&
        (currentRowIndex !== null ? idx !== currentRowIndex : it !== row),
    )

    if (existingIndex !== -1) {
      toast.warning(
        `الصنف "${selectedProduct.name}" مضاف مسبقاً في السطر رقم (${existingIndex + 1}).`,
      )
      // تفريغ الحقل لإلغاء الازدواجية وإتاحة الاختيار مجدداً
      row.item_name = ''
      row.product_id = null
      row.product_unit_id = null
      row.unit_name = ''
      row.available_units = []
      row.estimated_unit_cost = 0
      return false
    }

    const matchedUnit = selectedProduct.unit || selectedProduct.units?.[0] || null
    const resolvedPrice =
      selectedProduct.price !== undefined
        ? parseFloat(selectedProduct.price)
        : parseFloat(
            matchedUnit?.cost_price || matchedUnit?.price || selectedProduct.cost_price || 0,
          )

    row.is_custom = false
    row.product_id = selectedProduct.id
    row.item_name = selectedProduct.name || ''
    row.product_unit_id = matchedUnit?.id || null
    row.unit_name = matchedUnit?.name || matchedUnit?.unit_name || ''
    row.estimated_unit_cost = resolvedPrice
    row.available_units = selectedProduct.available_units || selectedProduct.units || []

    if (selectedProduct.scanned_quantity) {
      row.quantity_requested = parseFloat(selectedProduct.scanned_quantity)
    }

    if (!row.specifications && selectedProduct.description) {
      row.specifications = selectedProduct.description
    }

    return true
  }

  // فك ارتباط الصنف المخزني عند تعديل الاسم يدوياً ليصبح بنداً مخصصاً
  const handleItemNameInput = (row) => {
    if (row.product_id) {
      row.product_id = null
      row.is_custom = true
      row.available_units = []
      row.product_unit_id = null
    }
  }

  // مزامنة التكلفة والاسم عند تغيير وحدة القياس للأصناف المسجلة
  const syncUnitDetails = (row) => {
    if (row.is_custom) return
    const matchedUnit = row.available_units?.find((u) => u.id === row.product_unit_id)
    if (matchedUnit) {
      row.unit_name = matchedUnit.unit_name || matchedUnit.name || ''
      if (matchedUnit.cost_price !== undefined && matchedUnit.cost_price !== null) {
        row.estimated_unit_cost = parseFloat(matchedUnit.cost_price) || 0
      } else if (matchedUnit.price !== undefined && matchedUnit.price !== null) {
        row.estimated_unit_cost = parseFloat(matchedUnit.price) || 0
      }
    }
  }

  // زيادة ونقصان الكمية بسرعة
  const incrementQuantity = (row) => {
    const current = parseFloat(row.quantity_requested) || 0
    row.quantity_requested = current + 1
  }

  const decrementQuantity = (row) => {
    const current = parseFloat(row.quantity_requested) || 0
    if (current > 1) {
      row.quantity_requested = current - 1
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
        (row.product_id || (row.item_name && row.item_name.trim())) &&
        parseFloat(row.quantity_requested) > 0,
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
  // 5. تحميل البيانات المرجعية وبيانات التعديل بالتوازي التام
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
    isFormLoaded.value = false
    try {
      const startupRequests = [loadDepartments()]
      if (isEdit.value) {
        startupRequests.push(requisitionStore.fetchRequisition(route.params.id))
      }

      await Promise.all(startupRequests)

      if (isEdit.value && requisitionStore.currentRequisition) {
        const cur = requisitionStore.currentRequisition

        form.value = {
          requisition_number: cur.requisition_number || '',
          department_id: cur.department_id || '',
          request_date: cur.request_date
            ? cur.request_date.substring(0, 10)
            : new Date().toISOString().substring(0, 10),
          required_date: cur.required_date
            ? cur.required_date.substring(0, 10)
            : getDefaultRequiredDate(),
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
      } else if (!isEdit.value) {
        if (authStore.user?.department_id) {
          form.value.department_id = authStore.user.department_id
        }
        items.value = [createEmptyRow(false)]
      }
    } finally {
      isFormLoaded.value = true
    }
  })

  // =========================================================
  // 6. الحفظ والإرسال
  // =========================================================
  const handleSubmit = async (submitDirectly = false) => {
    const sanitizedItems = items.value
      .filter((row) => {
        const hasName = row.item_name && row.item_name.trim().length > 0
        const hasProduct = !!row.product_id
        const qty = parseFloat(row.quantity_requested) || 0
        return (hasName || hasProduct) && qty > 0
      })
      .map((row) => ({
        id: row.id || undefined,
        product_id: row.is_custom ? null : row.product_id || null,
        item_name: row.is_custom || !row.product_id ? row.item_name.trim() : null,
        product_unit_id: row.is_custom ? null : row.product_unit_id || null,
        unit_name:
          row.is_custom || !row.product_unit_id
            ? row.unit_name
              ? row.unit_name.trim()
              : 'حبة'
            : null,
        quantity_requested: parseFloat(row.quantity_requested),
        estimated_unit_cost: parseFloat(row.estimated_unit_cost) || 0,
        specifications: row.specifications ? row.specifications.trim() : null,
        notes: row.notes ? row.notes.trim() : null,
      }))

    if (sanitizedItems.length === 0) {
      toast.error('يرجى كتابة بيان صنف واحد على الأقل وتحديد الكمية المطلوبة.')
      return
    }

    const payload = {
      department_id: form.value.department_id || null,
      request_date: form.value.request_date || null,
      required_date: form.value.required_date || null,
      priority: form.value.priority,
      notes: form.value.notes ? form.value.notes.trim() : null,
      items: sanitizedItems,
    }

    isSubmitting.value = true

    try {
      let savedRequisitionId = route.params.id

      if (isEdit.value) {
        await requisitionStore.updateRequisition(route.params.id, payload)
        toast.success('تم تحديث مسودة طلب الاحتياج بنجاح.')
      } else {
        const res = await requisitionStore.createRequisition(payload)
        const resData = res?.data || requisitionStore.currentRequisition
        savedRequisitionId = resData?.id
        toast.success('تم حفظ طلب الاحتياج بنجاح.')
      }

      if (submitDirectly && savedRequisitionId) {
        await requisitionStore.submitRequisition(savedRequisitionId)
        toast.success('تم إرسال الطلب للاعتماد بنجاح.')
      }

      router.push('/app/purchasing/requisitions')
    } catch {
      toast.error(requisitionStore.error || 'فشلت عملية حفظ طلب الاحتياج.')
    } finally {
      isSubmitting.value = false
    }
  }

  const handleCancel = () => {
    router.push('/app/purchasing/requisitions')
  }

  return {
    isFormLoaded,
    isSubmitting,
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
    selectProductForRow,
    handleItemNameInput,
    syncUnitDetails,
    incrementQuantity,
    decrementQuantity,
    handleSubmit,
    handleCancel,
    requisitionStore,
    productStore,
    authStore,
  }
}
