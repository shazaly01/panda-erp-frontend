import apiClient from '@/services/apiClient'

const resource = '/inventory/transfers'

export default {
  // جلب قائمة أوامر التحويل مع الفلترة والترقيم
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل أمر تحويل محدد مع العلاقات والبنود
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء أمر تحويل مخزني جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات أمر تحويل قائم (للمسودات)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // اعتماد وإكمال أمر التحويل وتطبيق الأثر المخزني والمالي
  complete(id) {
    return apiClient.post(`${resource}/${id}/complete`)
  },

  // إلغاء أمر التحويل
  cancel(id) {
    return apiClient.post(`${resource}/${id}/cancel`)
  },

  // حذف مسودة أمر التحويل
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
