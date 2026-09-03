//src\modules\inventory\services\adjustment.service.js
import apiClient from '@/services/apiClient'

const resource = '/inventory/adjustments'

export default {
  // جلب قائمة طلبات التسوية / الأرصدة الافتتاحية مع الفلترة والترقيم
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل مستند تسوية معين مع العلاقات
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء مستند تسوية / رصيد افتتاحي جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث مستند تسوية قبل الاعتماد
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // اعتماد مستند التسوية وتطبيق الأثر المخزني والمالي
  approve(id) {
    return apiClient.post(`${resource}/${id}/approve`)
  },

  // حذف مستند تسوية (للمسودات فقط)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
