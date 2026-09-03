import apiClient from '@/services/apiClient'

const resource = '/inventory/warehouse-locations'

export default {
  // جلب قائمة مواقع/رفوف المستودعات مع دعم التصفية (مثلاً فلترة حسب warehouse_id)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل موقع/رف معين
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء موقع/رف جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات موقع/رف قائم
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف موقع/رف
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
