//src\modules\hr\services\attendanceLog.service.js
import apiClient from '@/services/apiClient'

const resource = '/hr/attendance-logs'

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

  scanBarcode(employeeNumber) {
    return apiClient.post(`${resource}/scan`, { employee_number: employeeNumber })
  },

  getSummaryReport(params = {}) {
    return apiClient.get('/hr/reports/attendance-summary', { params })
  },

  getEmployeeDetailedReport(params = {}) {
    return apiClient.get('/hr/reports/employee-detailed-attendance', { params })
  },

  // 🌟 دالة الجلب المخصصة للرابط الخارجي العام
  getPublicEmployeeDetailedReport(params = {}) {
    return apiClient.get('/hr/public/employee-detailed-attendance', { params })
  },
}
