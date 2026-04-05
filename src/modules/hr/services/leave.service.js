import apiClient from '@/services/apiClient'

const resource = '/hr/leave-requests'

export default {
  // جلب قائمة الإجازات (تدعم الفلاتر مثل: ?status=pending&employee_id=2)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل طلب إجازة محدد
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // تقديم طلب إجازة جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تعديل طلب الإجازة (مسموح فقط إذا كان الطلب معلقاً)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // إلغاء طلب الإجازة
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  // ==========================================
  // مسارات العمليات المخصصة (Custom Actions)
  // ==========================================

  // اعتماد طلب الإجازة (هذا الإجراء سيقوم بخصم رصيد الإجازات للموظف في الـ Backend)
  approve(id) {
    return apiClient.post(`${resource}/${id}/approve`)
  },
}
