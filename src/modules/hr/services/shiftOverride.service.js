import apiClient from '@/services/apiClient'

const resource = '/hr/shift-overrides'

export default {
  // جلب قائمة التجاوزات الفردية
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل تجاوز محدد
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إضافة تجاوز (أو إعفاء) لموظف في يوم معين
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث التجاوز
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // إلغاء التجاوز (بحيث يعود الموظف لورديته الافتراضية في ذلك اليوم)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
