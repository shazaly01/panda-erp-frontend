import apiClient from '@/services/apiClient'

const resource = '/hr/payroll'

export default {
  /**
   * معاينة مسير الراتب لموظف محدد في شهر محدد
   * @param {Object} payload - { employee_id: 1, month: '2026-04' }
   */
  preview(payload) {
    return apiClient.post(`${resource}/preview`, payload)
  },

  /**
   * اعتماد مسير الرواتب وترحيله للمحاسبة
   * @param {Object} payload - { employee_ids: [1, 2, 3], date: '2026-04-30', description: 'رواتب شهر أبريل' }
   */
  postBatch(payload) {
    return apiClient.post(`${resource}/post-batch`, payload)
  },
}
