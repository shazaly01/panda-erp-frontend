// src/services/leavePassService.js
import apiClient from '@/services/apiClient'

export const leavePassService = {
  /**
   * جلب قائمة الأذونات مع دعم الفلترة والبحث
   */
  getAll(params = {}) {
    return apiClient.get('/hr/leave-passes', { params })
  },

  /**
   * إصدار إذن خروج مؤقت جديد (موافق عليه فورياً من المشرف)
   */
  create(data) {
    return apiClient.post('/hr/leave-passes', data)
  },

  /**
   * جلب تفاصيل إذن معين بواسطة المعرّف
   */
  getById(id) {
    return apiClient.get(`/hr/leave-passes/${id}`)
  },

  /**
   * تعديل بيانات إذن معلق
   */
  update(id, data) {
    return apiClient.put(`/hr/leave-passes/${id}`, data)
  },

  /**
   * إلغاء أو حذف إذن
   */
  delete(id) {
    return apiClient.delete(`/hr/leave-passes/${id}`)
  },

  /**
   * مسار احتياطي للقبول والرفض الإداري للخدمة الذاتية
   */
  approve(id, status) {
    return apiClient.post(`/hr/leave-passes/${id}/approve`, { status })
  },

  /**
   * الحركة الفعالة البصرية للحرس لتغيير الحالة يدوياً من الشاشة
   */
  gateCheck(id, action) {
    return apiClient.post(`/hr/leave-passes/${id}/gate-check`, { action })
  },

  /**
   * المسح الذكي الفوري لرمز الـ QR Code الخاص بحارس البوابة
   */
  scanGateCode(passCode) {
    return apiClient.post('/hr/leave-passes/scan-gate-code', { pass_code: passCode })
  },

  /**
   * لوحة حصر الطوارئ والسلامة الصناعية الحية (Muster Evacuation List)
   */
  getEmergencyMuster() {
    return apiClient.get('/hr/leave-passes/emergency-muster')
  },
}
