import { defineStore } from 'pinia'
import { ref } from 'vue'
import { internshipService } from '../services/internship.service'

export const useInternshipStore = defineStore('hrInternship', () => {
  // ==========================
  // 1. State
  // ==========================
  const pendingApplications = ref([])
  const activeInterns = ref([])
  const rejectedApplications = ref([])

  // 🌟 لتخزين بيانات الطلب الحالي الذي يتابعه المتدرب الخارجي
  const currentTrackedApplication = ref(null)

  const applicationsPagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const internsPagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const rejectedPagination = ref({
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
   * جلب طلبات التدريب الخارجية المعلقة
   */
  async function fetchPendingApplications(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.getPendingApplications(filters)
      pendingApplications.value = response.data.data
      if (response.data.meta) {
        applicationsPagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة طلبات التدريب المعلقة'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب طلبات التدريب الخارجية المرفوضة
   */
  async function fetchRejectedApplications(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.getRejectedApplications(filters)
      rejectedApplications.value = response.data.data
      if (response.data.meta) {
        rejectedPagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة طلبات التدريب المرفوضة'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب قائمة المتدربين النشطين المعتمدين داخل المؤسسة
   */
  async function fetchActiveInterns(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.getActiveInterns(filters)
      activeInterns.value = response.data.data
      if (response.data.meta) {
        internsPagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة المتدربين النشطين'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * التقديم الذاتي الخارجي للمتدربين (الرابط العام عبر الكاميرا)
   */
  async function submitPublicApplication(formData) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.publicApply(formData)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إرسال طلب التدريب، يرجى المحاولة مرة أخرى'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * اعتماد وقبول طلب التدريب وتحويله الفوري لمتدرب رسمي
   */
  async function approveIntern(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.approveApplication(id, payload)
      // تحديث المصفوفة محلياً بحذف الطلب المقبول لسرعة الاستجابة التفاعلية
      pendingApplications.value = pendingApplications.value.filter((app) => app.id !== id)
      applicationsPagination.value.total -= 1
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل اعتماد طلب التدريب'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * رفض طلب التدريب ونقله تلقائياً لقائمة المرفوضين محلياً
   */
  async function rejectIntern(id) {
    loading.value = true
    error.value = null
    try {
      await internshipService.rejectApplication(id)
      // البحث عن الطلب المرفوض لنقله محلياً قبل حذفه من المعلقين
      const rejectedItem = pendingApplications.value.find((app) => app.id === id)
      if (rejectedItem) {
        rejectedItem.status = 'rejected'
        rejectedApplications.value.unshift(rejectedItem)
        rejectedPagination.value.total += 1
      }

      pendingApplications.value = pendingApplications.value.filter((app) => app.id !== id)
      applicationsPagination.value.total -= 1
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل رفض طلب التدريب'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 🌟 تتبع و جلب بيانات الطلب الشخصي للمتدرب برقم الهاتف والكود
   */
  async function trackApplication(phone, trackingCode) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.trackApplication(phone, trackingCode)
      currentTrackedApplication.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لم نتمكن من العثور على طلب متوافق مع هذه البيانات'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 🌟 تحديث بيانات الطلب المعلق وإعادة حفظ المخرجات في الـ State
   */
  async function updatePublicApplication(id, formData) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.updatePublicApplication(id, formData)
      currentTrackedApplication.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث بيانات طلب التدريب'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    pendingApplications,
    activeInterns,
    rejectedApplications,
    currentTrackedApplication,
    applicationsPagination,
    internsPagination,
    rejectedPagination,
    loading,
    error,

    fetchPendingApplications,
    fetchActiveInterns,
    fetchRejectedApplications,
    submitPublicApplication,
    approveIntern,
    rejectIntern,
    trackApplication,
    updatePublicApplication,
  }
})
