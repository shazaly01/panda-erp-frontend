//src\modules\accounting\stores\costCenterStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import costCenterService from '../services/costCenter.service'

export const useCostCenterStore = defineStore('costCenter', () => {
  // ==========================
  // 1. State (الحالة)
  // ==========================
  const costCenters = ref([])
  const pagination = ref({})
  const currentCostCenter = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions (العمليات)
  // ==========================

  async function fetchCostCenters(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await costCenterService.get(params)
      costCenters.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في تحميل مراكز التكلفة.'
      console.error(err)
      costCenters.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchCostCenter(id) {
    loading.value = true
    error.value = null
    currentCostCenter.value = null
    try {
      const response = await costCenterService.find(id)
      currentCostCenter.value = response.data.data
    } catch (err) {
      error.value = 'فشل في تحميل تفاصيل مركز التكلفة.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createCostCenter(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await costCenterService.create(payload)
      // تحديث القائمة بعد الإضافة
      await fetchCostCenters()
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء مركز التكلفة.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCostCenter(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await costCenterService.update(id, payload)
      // تحديث القائمة بعد التعديل
      await fetchCostCenters()
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث مركز التكلفة.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCostCenter(id) {
    loading.value = true
    error.value = null
    try {
      await costCenterService.delete(id)
      // إزالة المركز من المصفوفة محلياً لتحسين الأداء
      costCenters.value = costCenters.value.filter((c) => c.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'لا يمكن حذف مركز التكلفة لارتباطه بحركات مالية.'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==========================
  // 3. Getters (البيانات المستنتجة الذكية)
  // ==========================

  /**
   * الفروع: هي مراكز تكلفة تحمل علامة is_branch = true
   */
  const branches = computed(() => {
    return costCenters.value.filter((c) => c.is_branch === true || c.is_branch === 1)
  })

  /**
   * مراكز التكلفة النشطة (للاستخدام في Dropdowns)
   */
  const activeCostCenters = computed(() => {
    return costCenters.value.filter((c) => c.is_active !== false && c.is_active !== 0)
  })

  /**
   * 1. القائمة المسطحة: تستخدم للقوائم المنسدلة (مثلاً لاختيار المركز الأب)
   */
  const flatCostCenters = computed(() => {
    return costCenters.value
  })

  /**
   * 2. الشجرة الهرمية: تحويل القائمة المسطحة إلى شجرة (تُستخدم في واجهة العرض)
   */
  const costCenterTree = computed(() => {
    const tree = []
    const lookup = {}

    // تهيئة العناصر وإضافة مصفوفة أطفال فارغة لكل مركز
    costCenters.value.forEach((cc) => {
      lookup[cc.id] = { ...cc, children: [] }
    })

    // بناء الشجرة: ربط كل طفل بالأب الخاص به
    costCenters.value.forEach((cc) => {
      if (cc.parent_id && lookup[cc.parent_id]) {
        lookup[cc.parent_id].children.push(lookup[cc.id])
      } else {
        // إذا لم يكن له أب، فهو مركز رئيسي (في الجذر)
        tree.push(lookup[cc.id])
      }
    })

    return tree
  })

  return {
    // State
    costCenters,
    pagination,
    currentCostCenter,
    loading,
    error,

    // Getters
    branches,
    activeCostCenters,
    flatCostCenters,
    costCenterTree,

    // Actions
    fetchCostCenters,
    fetchCostCenter,
    createCostCenter,
    updateCostCenter,
    deleteCostCenter,
  }
})
