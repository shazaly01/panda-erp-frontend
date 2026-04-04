//src\modules\accounting\services\account.service.js
import apiClient from '@/services/apiClient'

const resource = '/accounting/accounts'

export default {
  // جلب الحسابات (يمكن تمرير parameters مثل: type, parent_id)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  getTypes() {
    return apiClient.get('/accounting/accounts/types')
  },
  // جلب تفاصيل حساب معين
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  create(payload) {
    return apiClient.post(resource, payload)
  },

  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  // دالة مساعدة لجلب "أنواع الحسابات" (إذا كان لديك Endpoint لها)
  // أو يمكن تعريفها كثوابت في الفرونت إند
  getTypes() {
    return apiClient.get(`${resource}/types`) // اختياري
  },
  suggestCode(parentId) {
    // نرسل الـ parent_id كـ Query Parameter
    return apiClient.get('/accounting/accounts/suggest-code', {
      params: { parent_id: parentId },
    })
  },
}
