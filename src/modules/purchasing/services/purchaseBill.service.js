//src\modules\purchasing\services\purchaseBill.service.js
import apiClient from '@/services/apiClient'

const resource = '/purchasing/bills'

export default {
  // جلب قائمة فواتير الشراء مع الفلترة والترقيم
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل فاتورة شراء محددة مع العلاقات
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء فاتورة شراء جديدة
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث فاتورة شراء (في حالة المسودة)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // ترحيل الفاتورة وتوليد القيد وتحريك المخزن (للشراء المباشر)
  post(id) {
    return apiClient.post(`${resource}/${id}/post`)
  },

  // إلغاء الفاتورة وعكس القيود والحركات المخزنية
  cancel(id) {
    return apiClient.post(`${resource}/${id}/cancel`)
  },

  // حذف فاتورة شراء (للمسودات فقط)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
