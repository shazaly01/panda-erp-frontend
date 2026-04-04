//src\modules\accounting\services\fiscalYear.service.js
import apiClient from '@/services/apiClient'

const resource = '/accounting/fiscal-years'

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

  // التحقق من حالة السنة لتاريخ معين (مفيد قبل السماح بإنشاء قيد)
  checkStatus(date) {
    return apiClient.get(`${resource}/check-status`, { params: { date } })
  },
}
