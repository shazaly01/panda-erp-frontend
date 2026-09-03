import apiClient from '@/services/apiClient'

const resource = '/inventory/warehouses'

export default {
  // جلب قائمة المستودعات مع معلمات التصفية والبحث
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل مستودع معين
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء مستودع جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات مستودع قائم
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف مستودع
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
