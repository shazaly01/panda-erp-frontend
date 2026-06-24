//src\modules\hr\stores\visitorStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { visitorService } from '../services/visitor.service'

export const useVisitorStore = defineStore('hrVisitor', () => {
  // ==========================
  // 1. State
  // ==========================
  const visitors = ref([])
  const singleVisitor = ref(null)
  const availableHosts = ref([])
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

  /**
   * جلب الزوار مع الفلاتر (زوار اليوم / الفلترة العامة)
   */
  async function fetchVisitors(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await visitorService.getAll(filters)
      visitors.value = response.data.data
      if (response.data.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة سجلات الزوار'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب تفاصيل زائر محدد
   */
  async function fetchVisitorById(id) {
    loading.value = true
    error.value = null
    singleVisitor.value = null
    try {
      const response = await visitorService.getById(id)
      singleVisitor.value = response.data.data
      return singleVisitor.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل بيانات الزائر'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * إضافة زائر جديد داخلياً (من الاستقبال)
   */
  async function createVisitor(payload) {
    loading.value = true
    error.value = null
    try {
      await visitorService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تسجيل بيانات الزائر'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * تحديث بيانات زائر
   */
  async function updateVisitor(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await visitorService.update(id, payload)
      const index = visitors.value.findIndex((v) => v.id === id)
      if (index !== -1) {
        visitors.value[index] = response.data.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث بيانات الزائر'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * حذف سجل زائر
   */
  async function deleteVisitor(id) {
    loading.value = true
    error.value = null
    try {
      await visitorService.delete(id)
      visitors.value = visitors.value.filter((v) => v.id !== id)
      pagination.value.total -= 1
    } catch (err) {
      error.value = err.response?.data?.message || 'لا يمكن حذف سجل هذا الزائر'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * حركات تسجيل الدخول والخروج من البوابة (Reactive UI Update)
   */
  async function checkInGate(identifier) {
    loading.value = true
    error.value = null
    try {
      const response = await visitorService.checkIn(identifier)
      const index = visitors.value.findIndex((v) => v.id === response.data.data.id)
      if (index !== -1) {
        visitors.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تسجيل دخول الزائر عند البوابة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function checkOutGate(identifier) {
    loading.value = true
    error.value = null
    try {
      const response = await visitorService.checkOut(identifier)
      const index = visitors.value.findIndex((v) => v.id === response.data.data.id)
      if (index !== -1) {
        visitors.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تسجيل خروج الزائر من البوابة'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * البحث الآمن المقيد عن الموظف المستضيف (Autocomplete)
   */
  async function searchHosts(query) {
    if (!query || query.length < 3) {
      availableHosts.value = []
      return
    }
    try {
      const response = await visitorService.searchHosts(query)
      availableHosts.value = response.data
    } catch (err) {
      console.error('Host search failed:', err)
    }
  }

  /**
   * التسجيل الذاتي الخارجي للزائر
   */
  async function publicSelfRegister(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await visitorService.publicRegister(payload)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إرسال طلب تسجيل الزيارة'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    visitors,
    singleVisitor,
    availableHosts,
    pagination,
    loading,
    error,

    fetchVisitors,
    fetchVisitorById,
    createVisitor,
    updateVisitor,
    deleteVisitor,
    checkInGate,
    checkOutGate,
    searchHosts,
    publicSelfRegister,
  }
})
