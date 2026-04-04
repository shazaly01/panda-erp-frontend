// src/modules/accounting/services/box.service.js
import apiClient from '@/services/apiClient'

const resource = '/accounting/boxes'
const mappingResource = '/accounting/account-mappings' // مسار الإعدادات الجديد

export default {
  // جلب قائمة الخزائن
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل خزينة معينة
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // --- الدالة الجديدة (الفلترة الذكية) ---
  // تجلب الحسابات المسموح بها فقط بناءً على مفتاح التوجيه (مثلاً: default_box_parent)
  getAllowedAccounts(key) {
    return apiClient.get(`${mappingResource}/allowed-accounts/${key}`)
  },

  // إنشاء خزينة جديدة
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات الخزينة
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف الخزينة
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
