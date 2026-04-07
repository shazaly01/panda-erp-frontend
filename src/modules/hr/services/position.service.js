// src/modules/hr/services/position.service.js
import apiClient from '@/services/apiClient'

const resource = '/hr/positions'

export default {
  // جلب المسميات الوظيفية (مع دعم الفلاتر مثل: ?search=Manager)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  create(payload) {
    return apiClient.post(resource, payload)
  },

  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
