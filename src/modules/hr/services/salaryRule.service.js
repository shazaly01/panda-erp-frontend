import apiClient from '@/services/apiClient'

const resource = '/hr/salary-rules'

export default {
  // جلب قواعد الرواتب (مع الفلاتر: ?type=allowance أو ?search=بدل)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل قاعدة محددة
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء قاعدة راتب جديدة (مثال: بدل اتصال)
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تعديل القاعدة
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف القاعدة
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
