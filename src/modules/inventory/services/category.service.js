//src\modules\inventory\services\category.service.js
import apiClient from '@/services/apiClient'

const resource = '/inventory/categories'

export default {
  // جلب كافة التصنيفات (مع دعم التصفية والشجرة)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل تصنيف معين
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء تصنيف جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات تصنيف قائم
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف تصنيف
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
