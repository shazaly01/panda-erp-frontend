import apiClient from '@/services/apiClient'

const resource = '/hr/payroll'

export default {
  /**
   * جلب الموظفين المؤهلين لمسير الرواتب لفترة مالية ونوع مسير محدد
   * @param {Object} params - { pay_period_id, run_type }
   */
  getEligibleEmployees(params) {
    return apiClient.get(`${resource}/eligible-employees`, { params })
  },

  /**
   * معاينة مسير الراتب لموظف محدد في فترة محددة
   */
  preview(payload) {
    return apiClient.post(`${resource}/preview`, payload)
  },

  /**
   * اعتماد مسير الرواتب وترحيله للمحاسبة
   */
  postBatch(payload) {
    return apiClient.post(`${resource}/post-batch`, payload)
  },

  /**
   * إلغاء والتراجع عن مسير الرواتب المعتمد وعكس القيد المحاسبي
   */
  rollbackBatch(batchId, payload) {
    return apiClient.post(`${resource}/batches/${batchId}/rollback`, payload)
  },

  /**
   * جلب سجل المسيرات السابقة المعتمدة
   */
  getBatches(params) {
    return apiClient.get(`${resource}/batches`, { params })
  },

  /**
   * جلب ملخص المسير (للإحصائيات العلوية)
   */
  getSummary(payload) {
    return apiClient.post(`${resource}/summary`, payload)
  },

  /**
   * جلب الموظفين الذين تم ترحيل رواتبهم لفترة ونوع مسير محدد
   */
  getProcessedEmployees(params) {
    return apiClient.get(`${resource}/processed-employees`, { params })
  },

  /**
   * تحميل ملف البنك للتحويلات بصيغة CSV
   */
  exportBankFile(batchId) {
    return apiClient.get(`${resource}/batches/${batchId}/export-bank`, { responseType: 'blob' })
  },
}
