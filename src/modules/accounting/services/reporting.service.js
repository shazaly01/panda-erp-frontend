// src/modules/accounting/services/reporting.service.js
import apiClient from '@/services/apiClient'

const resource = '/accounting/reports'

export default {
  /**
   * 1. كشف حساب تفصيلي (Account Statement / Ledger)
   * @param {Object} params - { from_date, to_date, target_type, target_id, cost_center_id, include_drafts }
   */
  getAccountStatement(params) {
    return apiClient.get(`${resource}/account-statement`, { params })
  },

  /**
   * 2. ميزان المراجعة (Trial Balance)
   * يعتمد على تاريخ التوقف (as_of_date) لأنه تقرير أرصدة تراكمية
   * @param {Object} params - { as_of_date, include_drafts }
   */
  getTrialBalance(params) {
    return apiClient.get(`${resource}/trial-balance`, { params })
  },

  /**
   * 3. قائمة الدخل - الأرباح والخسائر (Income Statement)
   * تعتمد على فترة محددة لأنها تقيس نشاط الشركة خلال هذه الفترة
   * @param {Object} params - { from_date, to_date, include_drafts }
   */
  getIncomeStatement(params) {
    return apiClient.get(`${resource}/income-statement`, { params })
  },

  /**
   * 4. الميزانية العمومية - المركز المالي (Balance Sheet)
   * تعتمد على تاريخ التوقف (as_of_date) لأنها تمثل لقطة للمركز المالي في لحظة معينة
   * @param {Object} params - { as_of_date, include_drafts }
   */
  getBalanceSheet(params) {
    return apiClient.get(`${resource}/balance-sheet`, { params })
  },
}
