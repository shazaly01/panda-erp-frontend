import apiClient from '@/services/apiClient'

export const internshipService = {
  /**
   * جلب حالة استقبال طلبات التدريب الخارجية الحالية (مفتوح / مغلق)
   */
  getRegistrationStatus() {
    return apiClient.get('/hr/internship-applications/registration-status')
  },

  /**
   * تبديل حالة استقبال طلبات التدريب الخارجية (فتح / قفل)
   */
  toggleRegistrationStatus() {
    return apiClient.post('/hr/internship-applications/toggle-registration-status')
  },

  /**
   * جلب قائمة طلبات التدريب الخارجية المعلقة مع دعم الفلترة والترقيم
   */
  getPendingApplications(params = {}) {
    return apiClient.get('/hr/internship-applications', {
      params: { ...params, status: 'pending' },
    })
  },

  /**
   * جلب قائمة طلبات التدريب الخارجية المرفوضة
   */
  getRejectedApplications(params = {}) {
    return apiClient.get('/hr/internship-applications', {
      params: { ...params, status: 'rejected' },
    })
  },

  /**
   * جلب قائمة المتدربين الحاليين النشطين في المؤسسة
   */
  getActiveInterns(params = {}) {
    return apiClient.get('/hr/internship-applications/active-interns', { params })
  },

  /**
   * جلب قائمة المتدربين المنتهية فترتهم التدريبية مع دعم الفلترة والترقيم
   */
  getCompletedInterns(params = {}) {
    return apiClient.get('/hr/internship-applications/completed-interns', { params })
  },

  /**
   * 🌟 تمديد فترة التدريب وتعديل تواريخ البدء والانتهاء للمتدرب الحالي أو المنتهي
   */
  updateInternshipDates(id, data) {
    return apiClient.put(`/hr/internship-applications/${id}/update-dates`, data)
  },

  /**
   * الرابط العام الخارجي لتقديم طلب تدريب جديد (استقبال FormData لتمرير الصورة الحية)
   */
  publicApply(formData) {
    return apiClient.post('/hr/internship/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * اعتماد وقبول طلب التدريب وتحويله لمتدرب رسمي داخل النظام
   */
  approveApplication(id, data) {
    return apiClient.post(`/hr/internship-applications/${id}/approve`, data)
  },

  /**
   * رفض طلب التدريب المقدم من شاشة لوحة التحكم
   */
  rejectApplication(id) {
    return apiClient.post(`/hr/internship-applications/${id}/reject`)
  },

  /**
   * استدعاء بوابة التحقق والمتابعة الخارجي برقم الهاتف وكود المتابعة
   */
  trackApplication(phone, trackingCode) {
    return apiClient.post('/hr/internship/track', {
      phone,
      tracking_code: trackingCode,
    })
  },

  /**
   * تحديث وتعديل الطلب الخارجي المعلق (استقبال FormData لدعم تعديل الصورة)
   */
  updatePublicApplication(id, formData) {
    return apiClient.post(`/hr/internship/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
