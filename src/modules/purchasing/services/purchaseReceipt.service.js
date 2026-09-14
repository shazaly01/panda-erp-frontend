// src/modules/purchasing/services/purchaseReceipt.service.js
import apiClient from '@/services/apiClient'

const resource = '/purchasing/receipts'

export default {
  // جلب قائمة سندات الاستلام مع الفلترة والترقيم
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل سند استلام محدد مع البنود والعلاقات
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء مسودة سند استلام مخزني جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث سند استلام مخزني (في حالة المسودة)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // تأكيد الاستلام المخزني وتوليد الحركات وترحيل الأثر للمستودع
  receive(id) {
    return apiClient.post(`${resource}/${id}/receive`)
  },

  // إلغاء سند الاستلام وعكس الحركات المخزنية
  cancel(id) {
    return apiClient.post(`${resource}/${id}/cancel`)
  },

  // حذف سند استلام مخزني (للمسودات فقط)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
