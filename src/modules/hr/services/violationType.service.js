// src/modules/hr/services/violationType.service.js
import apiClient from '@/services/apiClient'

const resource = '/hr/violation-types'

export default {
  // جلب قائمة لوائح المخالفات وسلالم التدرج العقابي
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل لائحة محددة مع درجات سلمها العقابي
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء لائحة مخالفة جديدة مع درجات التدرج
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات اللائحة ومزامنة درجات سلمها العقابي
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف لائحة مخالفة (في حال عدم ارتباطها بجزاءات مسجلة)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
