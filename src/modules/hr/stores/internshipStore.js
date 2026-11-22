import { defineStore } from 'pinia'
import { ref } from 'vue'
import { internshipService } from '../services/internship.service'

export const useInternshipStore = defineStore('hrInternship', () => {
  // ==========================
  // 1. State
  // ==========================
  const pendingApplications = ref([])
  const interviewApplications = ref([])
  const activeInterns = ref([])
  const rejectedApplications = ref([])
  const completedInterns = ref([])

  // حالة استقبال الطلبات الخارجية (مفتوح / مغلق) للتدريب والتوظيف
  const isRegistrationOpen = ref(true)
  const isJobRegistrationOpen = ref(true)

  // لتخزين بيانات الطلب الحالي الذي يتابعه المتقدم الخارجي
  const currentTrackedApplication = ref(null)

  const applicationsPagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const interviewPagination = ref({
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

  const completedPagination = ref({
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
   * جلب حالة استقبال الطلبات للبوابة العامة الخارجية (تدريب وتوظيف)
   */
  async function fetchPublicRegistrationStatus() {
    try {
      const response = await internshipService.getPublicRegistrationStatus()
      isRegistrationOpen.value = response.data.internship_open ?? response.data.is_open ?? true
      isJobRegistrationOpen.value = response.data.job_open ?? true
      return response.data
    } catch (err) {
      console.error('فشل جلب حالة البوابة العامة:', err)
    }
  }

  /**
   * 🌟 جلب حالة استقبال طلبات التدريب والتوظيف الخارجية من لوحة الإدارة (مفتوح / مغلق)
   */
  async function fetchRegistrationStatus() {
    try {
      const response = await internshipService.getRegistrationStatus()
      isRegistrationOpen.value = response.data.internship_open ?? response.data.is_open
      isJobRegistrationOpen.value = response.data.job_open ?? true
      return response.data
    } catch (err) {
      console.error('فشل جلب حالة استقبال الطلبات:', err)
    }
  }

  /**
   * 🌟 تبديل حالة استقبال الطلبات الخارجية (فتح <-> قفل) للتدريب أو التوظيف
   */
  async function toggleRegistrationStatus(type = 'internship') {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.toggleRegistrationStatus(type)
      isRegistrationOpen.value = response.data.internship_open ?? response.data.is_open
      isJobRegistrationOpen.value = response.data.job_open ?? isJobRegistrationOpen.value
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تغيير حالة استقبال الطلبات'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب طلبات التدريب والتوظيف المعلقة
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
      error.value = 'فشل تحميل قائمة الطلبات المعلقة'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب الطلبات المحولة لمرحلة المعاينة
   */
  async function fetchInterviewApplications(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.getInterviewApplications(filters)
      interviewApplications.value = response.data.data
      if (response.data.meta) {
        interviewPagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة طلبات المعاينة'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب الطلبات المرفوضة
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
      error.value = 'فشل تحميل قائمة الطلبات المرفوضة'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب قائمة المتدربين والمرشحين النشطين تحت التدريب داخل المؤسسة
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
   * جلب قائمة المتدربين الذين انتهت فترتهم التدريبية ولم يتم تثبيتهم بعد
   */
  async function fetchCompletedInterns(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.getCompletedInterns(filters)
      completedInterns.value = response.data.data
      if (response.data.meta) {
        completedPagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة المتدربين المنتهية فترتهم'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 🌟 تمديد وتحديث تواريخ فترات التدريب للمتدرب الحالي أو المنتهي
   */
  async function updateInternshipDates(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.updateInternshipDates(id, payload)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث وتمديد فترة التدريب.'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * التقديم الذاتي الخارجي (الرابط العام) للتدريب أو التوظيف
   */
  async function submitPublicApplication(formData) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.publicApply(formData)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إرسال الطلب، يرجى المحاولة مرة أخرى'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * إدخال طلب تدريب أو توظيف يدوياً من لوحة الإدارة (لوكال)
   */
  async function submitManualApplication(formData) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.storeManualApplication(formData)
      const created = response.data.data
      pendingApplications.value.unshift(created)
      applicationsPagination.value.total += 1
      return created
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل حفظ الطلب اليدوي، يرجى مراجعة البيانات'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * جدولة معاينة ونقل الطلب إلى قائمة المعاينات
   */
  async function scheduleInterview(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.scheduleInterview(id, payload)
      const updated = response.data.data

      const existedInPending = pendingApplications.value.some((app) => app.id === id)
      if (existedInPending) {
        pendingApplications.value = pendingApplications.value.filter((app) => app.id !== id)
        applicationsPagination.value.total = Math.max(0, applicationsPagination.value.total - 1)
        interviewApplications.value.unshift(updated)
        interviewPagination.value.total += 1
      } else {
        const idx = interviewApplications.value.findIndex((app) => app.id === id)
        if (idx !== -1) {
          interviewApplications.value[idx] = updated
        }
      }

      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل جدولة المعاينة'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * اعتماد وقبول الطلب لدخول فترة التدريب وتحويله الفوري لمتدرب رسمي
   */
  async function approveIntern(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.approveApplication(id, payload)

      if (pendingApplications.value.some((app) => app.id === id)) {
        pendingApplications.value = pendingApplications.value.filter((app) => app.id !== id)
        applicationsPagination.value.total = Math.max(0, applicationsPagination.value.total - 1)
      }

      if (interviewApplications.value.some((app) => app.id === id)) {
        interviewApplications.value = interviewApplications.value.filter((app) => app.id !== id)
        interviewPagination.value.total = Math.max(0, interviewPagination.value.total - 1)
      }

      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل اعتماد الطلب'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * رفض الطلب ونقله تلقائياً لقائمة المرفوضين محلياً
   */
  async function rejectIntern(id) {
    loading.value = true
    error.value = null
    try {
      await internshipService.rejectApplication(id)

      const rejectedFromPending = pendingApplications.value.find((app) => app.id === id)
      const rejectedFromInterview = interviewApplications.value.find((app) => app.id === id)
      const rejectedItem = rejectedFromPending || rejectedFromInterview

      if (rejectedItem) {
        rejectedItem.status = 'rejected'
        rejectedApplications.value.unshift(rejectedItem)
        rejectedPagination.value.total += 1
      }

      if (rejectedFromPending) {
        pendingApplications.value = pendingApplications.value.filter((app) => app.id !== id)
        applicationsPagination.value.total = Math.max(0, applicationsPagination.value.total - 1)
      }

      if (rejectedFromInterview) {
        interviewApplications.value = interviewApplications.value.filter((app) => app.id !== id)
        interviewPagination.value.total = Math.max(0, interviewPagination.value.total - 1)
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل رفض الطلب'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * تتبع وجلب بيانات الطلب الشخصي برقم الهاتف والكود
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
   * تحديث بيانات الطلب المعلق وإعادة حفظ المخرجات في الـ State
   */
  async function updatePublicApplication(id, formData) {
    loading.value = true
    error.value = null
    try {
      const response = await internshipService.updatePublicApplication(id, formData)
      currentTrackedApplication.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث بيانات الطلب'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    pendingApplications,
    interviewApplications,
    activeInterns,
    rejectedApplications,
    completedInterns,
    isRegistrationOpen,
    isJobRegistrationOpen,
    currentTrackedApplication,
    applicationsPagination,
    interviewPagination,
    internsPagination,
    rejectedPagination,
    completedPagination,
    loading,
    error,

    fetchPublicRegistrationStatus,
    fetchRegistrationStatus,
    toggleRegistrationStatus,
    fetchPendingApplications,
    fetchInterviewApplications,
    fetchActiveInterns,
    fetchRejectedApplications,
    fetchCompletedInterns,
    updateInternshipDates,
    submitPublicApplication,
    submitManualApplication,
    scheduleInterview,
    approveIntern,
    rejectIntern,
    trackApplication,
    updatePublicApplication,
  }
})
