// src/modules/purchasing/services/purchaseOrder.service.js
import apiClient from '@/services/apiClient'

const resource = '/purchasing/orders'

export default {
  // جلب قائمة أوامر الشراء مع الفلترة والترقيم
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل أمر شراء محدد مع العلاقات والبنود
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء أمر شراء جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات أمر الشراء (في حالة المسودة)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // اعتماد وتأكيد أمر الشراء
  confirm(id) {
    return apiClient.post(`${resource}/${id}/confirm`)
  },

  // إلغاء أمر الشراء
  cancel(id) {
    return apiClient.post(`${resource}/${id}/cancel`)
  },

  // حذف أمر الشراء (للمسودات فقط)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
