import apiClient from '@/services/apiClient'

const resource = '/hr/payroll'

export default {
  /**
   * التهيئة التلقائية لشاشة مسيرات الرواتب (جلب مجموعة الدفع وفترة الشهر الحالي والمسير القائم إن وجد)
   * @param {Object} params - { pay_group_id?, pay_period_id?, run_type?, batch_id? }
   */
  initialize(params = {}) {
    return apiClient.get(`${resource}/initialize`, { params })
  },

  /**
   * جلب الموظفين المؤهلين لمسير الرواتب لفترة مالية ونوع مسير محدد
   * @param {Object} params - { pay_period_id, run_type, batch_id? }
   */
  getEligibleEmployees(params) {
    return apiClient.get(`${resource}/eligible-employees`, { params })
  },

  /**
   * معاينة مسير الراتب لموظف محدد في فترة محددة مع كامل تفاصيل الشفافية
   * @param {Object} payload - { employee_id, pay_period_id, run_type, batch_id? }
   */
  preview(payload) {
    return apiClient.post(`${resource}/preview`, payload)
  },

  /**
   * اعتماد مسير الرواتب أو تحديث مسير قائم وترحيله للمحاسبة
   * @param {Object} payload - { batch_id?, employee_ids, pay_period_id, run_type, description, disbursed_amount?, disbursement_percentage? }
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
   * جلب سجل المسيرات السابقة
   */
  getBatches(params) {
    return apiClient.get(`${resource}/batches`, { params })
  },

  /**
   * جلب ملخص المسير (للإحصائيات العلوية وتفاصيل استحقاق كل موظف)
   * @param {Object} payload - { batch_id?, employee_ids, pay_period_id, run_type }
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
   * تحميل ملف البنك للتحويلات بصيغة CSV وفق المبالغ المصروفة فعلياً
   */
  exportBankFile(batchId) {
    return apiClient.get(`${resource}/batches/${batchId}/export-bank`, { responseType: 'blob' })
  },
}
