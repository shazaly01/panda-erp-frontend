// src/modules/accounting/services/currency.service.js
import apiClient from '@/services/apiClient'

const resource = '/accounting/currencies'

export default {
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
