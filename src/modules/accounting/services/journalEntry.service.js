//src\modules\accounting\services\journalEntry.service.js
import apiClient from '@/services/apiClient'

const resource = '/accounting/journal-entries'

export default {
  // جلب القيود مع البحث والصفحات
  get(page = 1, search = '', filters = {}) {
    return apiClient.get(resource, {
      params: {
        page,
        search,
        ...filters, // (تاريخ من، تاريخ إلى، الحالة)
      },
    })
  },

  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  create(payload) {
    // --- معالجة الـ DECIMAL ---
    // نضمن أن party_id يرسل كنص (String) لتجنب تشوه الأرقام الكبيرة
    if (payload.details && Array.isArray(payload.details)) {
      payload.details = payload.details.map((row) => ({
        ...row,
        party_id: row.party_id ? String(row.party_id) : null,
      }))
    }
    return apiClient.post(resource, payload)
  },

  update(id, payload) {
    // نفس المعالجة عند التحديث
    if (payload.details && Array.isArray(payload.details)) {
      payload.details = payload.details.map((row) => ({
        ...row,
        party_id: row.party_id ? String(row.party_id) : null,
      }))
    }
    return apiClient.put(`${resource}/${id}`, payload)
  },

  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  // --- عمليات خاصة ---

  // ترحيل القيد
  postEntry(id) {
    return apiClient.post(`${resource}/${id}/post`)
  },
}
