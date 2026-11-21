// src/modules/purchasing/services/purchasingDashboard.service.js
import apiClient from '@/services/apiClient'

const resource = '/purchasing/dashboard'

/**
 * تنظيف كائن الفلاتر من القيم الفارغة قبل إرسالها كـ Query Parameters
 * @param {Record<string, any>} params
 * @returns {Record<string, any>}
 */
function sanitizeParams(params = {}) {
  const cleaned = {}

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value
    }
  })

  return cleaned
}

export default {
  /**
   * جلب البيانات التحليلية والإحصائية الشاملة للوحة تحكم المشتريات وسلسلة الإمداد
   * @param {Object} params - { date_from, date_to, warehouse_id, department_id, supplier_id }
   * @param {AbortSignal} [signal] - إشارة إلغاء الطلب عند تتابع تغييرات الفلاتر
   */
  getDashboardData(params = {}, signal = undefined) {
    return apiClient.get(resource, {
      params: sanitizeParams(params),
      signal,
    })
  },
}
