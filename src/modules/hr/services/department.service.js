import apiClient from '@/services/apiClient'

const resource = '/hr/departments'

export default {
  // جلب الإدارات (مع دعم الفلاتر مثل: ?search=IT أو جلب الشجرة كاملة)
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
