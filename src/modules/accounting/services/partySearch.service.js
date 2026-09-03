//src\modules\accounting\services\partySearch.service.js
import apiClient from '@/services/apiClient'

export default {
  /**
   * البحث الموحد في الحسابات والأطراف المساعدة
   *
   * @param {string} query نص البحث
   * @param {Array<string>} allowedTypes الأنواع المحددة للبحث (اختياري)
   * @param {number} limitPerType الحد الأقصى لكل نوع
   * @param {AbortSignal|null} signal لإلغاء الطلب المتكرر أثناء الكتابة
   * @returns {Promise<Array>}
   */
  async search(query, allowedTypes = [], limitPerType = 10, signal = null) {
    const params = {
      q: query,
      limit_per_type: limitPerType,
    }

    if (allowedTypes && allowedTypes.length > 0) {
      params.types = allowedTypes.join(',')
    }

    const response = await apiClient.get('/accounting/parties/search', {
      params,
      signal,
    })

    return response.data.data || []
  },

  /**
   * جلب أنواع الأطراف المتاحة في البحث الموحد
   *
   * @returns {Promise<Array>}
   */
  async getTypes() {
    const response = await apiClient.get('/accounting/parties/types')
    return response.data.data || []
  },
}
