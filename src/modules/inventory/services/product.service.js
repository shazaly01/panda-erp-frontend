import apiClient from '@/services/apiClient'

const resource = '/inventory/products'

export default {
  // جلب كافة الأصناف مع دعم معلمات البحث والتصفية (مثل Category ID، Keyword، Status)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل صنف معين
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء صنف جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات صنف قائم
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف صنف
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
