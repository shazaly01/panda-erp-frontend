import apiClient from '@/services/apiClient'

const resource = '/hr/payroll-inputs'

export default {
  // جلب المدخلات (يدعم الفلاتر: ?type=bonus&employee_id=1&date_from=2026-04-01)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل مدخل مالي محدد
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إدخال حركة مالية جديدة (مكافأة أو خصم)
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تعديل الحركة المالية (يُسمح به فقط إذا لم يتم ترحيلها في الرواتب is_processed = false)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // إلغاء/حذف الحركة المالية
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
