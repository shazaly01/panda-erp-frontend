// src/modules/sales/services/salesDashboard.service.js
import apiClient from '@/services/apiClient'

const resource = '/sales/dashboard'

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
   * جلب البيانات التحليلية والإحصائية الشاملة للوحة تحكم المبيعات ونقاط البيع
   * @param {Object} params - { date_from, date_to, branch_id, warehouse_id, channel }
   * @param {AbortSignal} [signal] - إشارة إلغاء الطلب عند تتابع تغييرات الفلاتر
   */
  getDashboardData(params = {}, signal = undefined) {
    return apiClient.get(resource, {
      params: sanitizeParams(params),
      signal,
    })
  },
}
