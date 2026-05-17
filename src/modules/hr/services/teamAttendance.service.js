// src/modules/hr/services/teamAttendance.service.js
import apiClient from '@/services/apiClient'

const resource = '/hr/team-attendance'

export default {
  /**
   * جلب مصفوفة حضور الفريق ليوم معين
   * @param {Object} params - المعاملات (مثل: { date: '2026-05-14' })
   * @returns {Promise}
   */
  getTeamMatrix(params = {}) {
    return apiClient.get(resource, { params })
  },

  /**
   * اعتماد أو تعديل حضور موظف يدوياً بواسطة المشرف (Override)
   * @param {Object} payload - البيانات المرسلة
   * @param {number} payload.employee_id - رقم الموظف التابع للمشرف
   * @param {string} payload.date - تاريخ اليوم المعدل (YYYY-MM-DD)
   * @param {string|null} payload.check_in - وقت الحضور (HH:mm)
   * @param {string|null} payload.check_out - وقت الانصراف (HH:mm)
   * @param {string} payload.reason - سبب التعديل اليدوي
   * @returns {Promise}
   */
  overrideAttendance(payload) {
    return apiClient.post(`${resource}/override`, payload)
  },
}
