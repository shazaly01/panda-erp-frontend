import apiClient from '@/services/apiClient'

const resource = '/hr/payroll'

export default {
  /**
   * معاينة مسير الراتب لموظف محدد في شهر محدد
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

  // 🌟 الجديد: جلب سجل المسيرات السابقة المعتمدة
  getBatches(params) {
    return apiClient.get(`${resource}/batches`, { params })
  },

  // 🌟 الجديد: جلب ملخص المسير (للإحصائيات العلوية)
  getSummary(payload) {
    return apiClient.post(`${resource}/summary`, payload)
  },

  // جلب الموظفين الذين تم ترحيل رواتبهم لشهر محدد
  getProcessedEmployees(month) {
    return apiClient.get(`${resource}/processed-employees`, { params: { month } })
  },

  // 🌟 الجديد: طلب تحميل ملف البنك
  exportBankFile(batchId) {
    // نستخدم responseType: 'blob' لكي يفهم Axios أننا نستقبل ملفاً وليس بيانات JSON
    return apiClient.get(`${resource}/batches/${batchId}/export-bank`, { responseType: 'blob' })
  },
}
