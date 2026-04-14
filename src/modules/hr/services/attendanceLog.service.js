import apiClient from '@/services/apiClient'

const resource = '/hr/attendance-logs'

export default {
  // جلب سجلات الحضور (يدعم فلترة دقيقة مثل: ?employee_id=3&date=2026-04-05)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل سجل يوم محدد
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إضافة سجل حضور يدوي (يقوم الباك-إند بحساب التأخيرات بناءً عليه)
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تعديل سجل الحضور (مثل تعديل وقت الدخول في حال نسي الموظف البصمة)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف السجل
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  // 🌟 الجديد: دالة تسجيل الحضور والانصراف السريع عبر الباركود
  scanBarcode(employeeNumber) {
    return apiClient.post(`${resource}/scan`, { employee_number: employeeNumber })
  },
}
