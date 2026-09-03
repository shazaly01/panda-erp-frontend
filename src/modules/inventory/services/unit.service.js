import apiClient from '@/services/apiClient'

const resource = '/inventory/units'

export default {
  // جلب كافة وحدات القياس مع دعم المعاملات والتصفية
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل وحدة قياس محددة
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء وحدة قياس جديدة
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات وحدة قياس قائمة
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف وحدة قياس
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
