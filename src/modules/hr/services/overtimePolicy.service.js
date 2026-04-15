// src/modules/hr/services/overtimePolicy.service.js
import apiClient from '@/services/apiClient'

const resource = '/hr/overtime-policies'

export default {
  // جلب قائمة سياسات العمل الإضافي
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل سياسة محددة
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء سياسة جديدة
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث سياسة (نستخدم PUT بما أنه لا يوجد رفع ملفات هنا)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف السياسة نهائياً
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
