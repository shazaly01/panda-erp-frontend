// src/modules/accounting/services/bankAccount.service.js
import apiClient from '@/services/apiClient'

const resource = '/accounting/bank-accounts'
const mappingResource = '/accounting/account-mappings' // مسار الإعدادات للفلترة

export default {
  // جلب قائمة الحسابات البنكية
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل حساب بنكي معين
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // --- الدالة الجديدة (الفلترة الذكية) ---
  // تجلب الحسابات المسموح بها فقط بناءً على مفتاح التوجيه (default_bank_parent)
  getAllowedAccounts(key) {
    return apiClient.get(`${mappingResource}/allowed-accounts/${key}`)
  },

  // إنشاء حساب بنكي جديد (سواء تلقائي أو يدوي)
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات الحساب البنكي
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف الحساب البنكي
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
