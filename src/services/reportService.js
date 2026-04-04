// src/services/reportService.js
import apiClient from './apiClient'

export default {
  /**
   * جلب إحصائيات لوحة التحكم
   */
  getDashboardStats() {
    return apiClient.get('/dashboard')
  },

  /**
   * جلب التقرير العام (ملخص كل الشركات)
   */
  getCompaniesSummary() {
    return apiClient.get('/reports/companies-summary')
  },

  /**
   * جلب كشف حساب تفصيلي لشركة محددة
   * @param {String|Number} companyId - المعرف (DECIMAL 18)
   */
  getCompanyStatement(companyId) {
    return apiClient.get(`/reports/company-statement/${companyId}`)
  },

  // +++ [أضف هذه الدالة الجديدة هنا] +++
  /**
   * جلب كشف حساب تفصيلي لجهة مالكة محددة
   * @param {String|Number} ownerId
   */
  getOwnerStatement(ownerId) {
    return apiClient.get(`/reports/owner-statement/${ownerId}`)
  },
  // ++++++++++++++++++++++++++++++++++
}
