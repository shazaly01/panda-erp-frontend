// src/modules/accounting/services/reporting.service.js
import apiClient from '@/services/apiClient'

const resource = '/accounting/reports'

export default {
  /**
   * كشف حساب (محدث ليدعم الترجمة الذكية للكيانات)
   * @param {Object} params - { from_date, to_date, target_type, target_id, cost_center_id }
   */
  getAccountStatement(params) {
    return apiClient.get(`${resource}/account-statement`, { params })
  },

  // ميزان مراجعة (يُترك كما هو للمستقبل)
  getTrialBalance(params) {
    // params: { start_date, end_date }
    return apiClient.get(`${resource}/trial-balance`, { params })
  },

  // مستقبلاً: قائمة الدخل والميزانية العمومية
  getBalanceSheet(params) {
    return apiClient.get(`${resource}/balance-sheet`, { params })
  },
}
