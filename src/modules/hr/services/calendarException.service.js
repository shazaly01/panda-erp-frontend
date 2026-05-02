import apiClient from '@/services/apiClient'

const resource = '/hr/calendar-exceptions'

export default {
  // جلب قائمة العطلات والطوارئ
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل حالة محددة
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء عطلة أو حالة طوارئ جديدة
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات الحالة
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف الحالة (مما قد يؤدي لإعادة حساب رواتب الأيام المتأثرة لاحقاً)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
