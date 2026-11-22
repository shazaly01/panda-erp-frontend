import apiClient from '@/services/apiClient'

export const internshipService = {
  /**
   * جلب حالة استقبال الطلبات للبوابة العامة الخارجية (تدريب وتوظيف)
   */
  getPublicRegistrationStatus() {
    return apiClient.get('/hr/internship/registration-status')
  },

  /**
   * جلب حالة استقبال طلبات التدريب والتوظيف الخارجية الحالية من لوحة الإدارة (مفتوح / مغلق)
   */
  getRegistrationStatus() {
    return apiClient.get('/hr/internship-applications/registration-status')
  },

  /**
   * تبديل حالة استقبال الطلبات الخارجية (فتح / قفل) للتدريب أو التوظيف
   */
  toggleRegistrationStatus(type = 'internship') {
    return apiClient.post('/hr/internship-applications/toggle-registration-status', { type })
  },

  /**
   * جلب قائمة طلبات التدريب والتوظيف المعلقة مع دعم الفلترة والترقيم
   */
  getPendingApplications(params = {}) {
    return apiClient.get('/hr/internship-applications', {
      params: { ...params, status: 'pending' },
    })
  },

  /**
   * جلب قائمة الطلبات المحولة لمرحلة المعاينة مع دعم الفلترة والترقيم
   */
  getInterviewApplications(params = {}) {
    return apiClient.get('/hr/internship-applications', {
      params: { ...params, status: 'interview' },
    })
  },

  /**
   * جلب قائمة الطلبات المرفوضة
   */
  getRejectedApplications(params = {}) {
    return apiClient.get('/hr/internship-applications', {
      params: { ...params, status: 'rejected' },
    })
  },

  /**
   * جلب قائمة المتدربين والمرشحين النشطين تحت التدريب في المؤسسة
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
   * الرابط العام الخارجي لتقديم طلب تدريب أو توظيف جديد (استقبال FormData لتمرير الصورة والسيرة الذاتية)
   */
  publicApply(formData) {
    return apiClient.post('/hr/internship/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * إدخال طلب تدريب أو توظيف يدوياً من لوحة الإدارة (لوكال)
   */
  storeManualApplication(formData) {
    return apiClient.post('/hr/internship-applications/manual', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * جدولة معاينة ونقل الطلب إلى مرحلة المعاينة
   */
  scheduleInterview(id, data) {
    return apiClient.post(`/hr/internship-applications/${id}/interview`, data)
  },

  /**
   * اعتماد وقبول طلب التدريب أو التوظيف وتحويله لمتدرب رسمي داخل النظام
   */
  approveApplication(id, data) {
    return apiClient.post(`/hr/internship-applications/${id}/approve`, data)
  },

  /**
   * رفض الطلب المقدم من شاشة لوحة التحكم
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
   * تحديث وتعديل الطلب الخارجي المعلق (استقبال FormData لدعم تعديل الصورة أو السيرة الذاتية)
   */
  updatePublicApplication(id, formData) {
    return apiClient.post(`/hr/internship/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
