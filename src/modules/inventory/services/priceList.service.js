import apiClient from '@/services/apiClient'

const resource = '/inventory/price-lists'

export default {
  // جلب كافة قوائم الأسعار مع دعم معاملات التصفية والبحث
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل قائمة أسعار معينة
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء قائمة أسعار جديدة
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث قائمة أسعار قائمة
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف قائمة أسعار
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
