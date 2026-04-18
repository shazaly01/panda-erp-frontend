import apiClient from '@/services/apiClient'

const resource = '/hr/pay-groups'

export default {
  // جلب قائمة المجموعات
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل مجموعة محددة
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء مجموعة جديدة
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث المجموعة
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف المجموعة
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
