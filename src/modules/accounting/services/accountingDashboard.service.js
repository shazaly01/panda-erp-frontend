// src/modules/accounting/services/accountingDashboard.service.js
import apiClient from '@/services/apiClient'

const resource = '/accounting/dashboard'

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
   * جلب البيانات التحليلية والإحصائية الشاملة للوحة تحكم المحاسبة
   * @param {Object} params - { fiscal_year_id, branch_id, date_from, date_to }
   * @param {AbortSignal} [signal] - إشارة إلغاء الطلب عند تتابع التغييرات
   */
  getDashboardData(params = {}, signal = undefined) {
    return apiClient.get(resource, {
      params: sanitizeParams(params),
      signal,
    })
  },
}
