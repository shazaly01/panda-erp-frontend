import { defineStore } from 'pinia'
import { ref } from 'vue'
import salaryStructureService from '../services/salaryStructure.service'

export const useSalaryStructureStore = defineStore('hrSalaryStructure', () => {
  // ==========================
  // 1. State
  // ==========================
  const structures = ref([]) // مصفوفة فارغة افتراضياً
  const singleStructure = ref(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  async function fetchStructures(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await salaryStructureService.get(filters)

      /** * 🛡️ شبكة الأمان:
       * نتحقق من وجود البيانات في response.data.data (للـ Paginated Resource)
       * أو في response.data مباشرة، وإذا فشل كلاهما نضع مصفوفة فارغة []
       */
      const incomingData = response.data?.data || response.data || []
      structures.value = Array.isArray(incomingData) ? incomingData : []

      if (response.data?.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة هياكل الرواتب'
      structures.value = [] // لضمان عدم بقاء الجدول في حالة error مع undefined
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchStructureById(id) {
    loading.value = true
    error.value = null
    singleStructure.value = null
    try {
      const response = await salaryStructureService.find(id)
      // حماية مماثلة هنا
      singleStructure.value = response.data?.data || response.data
      return singleStructure.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل هيكل الرواتب'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createStructure(payload) {
    loading.value = true
    error.value = null
    try {
      await salaryStructureService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إضافة هيكل الرواتب'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateStructure(id, payload) {
    loading.value = true
    error.value = null
    try {
      await salaryStructureService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث هيكل الرواتب'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteStructure(id) {
    loading.value = true
    error.value = null
    try {
      await salaryStructureService.delete(id)
      // تأكد من أن structures قيمة صالحة قبل الفلترة
      if (Array.isArray(structures.value)) {
        structures.value = structures.value.filter((struct) => struct.id !== id)
      }
      if (pagination.value.total > 0) {
        pagination.value.total -= 1
      }
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لا يمكن حذف هذا الهيكل لارتباطه بعقود موظفين حالية'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    structures,
    singleStructure,
    pagination,
    loading,
    error,

    fetchStructures,
    fetchStructureById,
    createStructure,
    updateStructure,
    deleteStructure,
  }
})
