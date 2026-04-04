// src/modules/accounting/services/voucher.service.js
import apiClient from '@/services/apiClient'

const resource = '/accounting/vouchers'

export default {
  // جلب السندات (مع الفلاتر والصفحات)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل سند معين
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء سند جديد (مسودة)
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث سند (طالما هو مسودة)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف سند
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  // ترحيل السند (توليد قيد يومية)
  postVoucher(id) {
    return apiClient.post(`${resource}/${id}/post`)
  },

  // اعتماد السند (حسب مسارات الباك إند لديك)
  approveVoucher(id) {
    return apiClient.post(`${resource}/${id}/approve`)
  },
}
