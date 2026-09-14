import apiClient from '@/services/apiClient'

const resource = '/purchasing/issues'

export default {
  // جلب قائمة أذونات الصرف مع الفلترة والترقيم
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل إذن صرف محدد مع العلاقات
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء إذن صرف مخزني جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث إذن صرف (في حالة المسودة)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // تأكيد الصرف والترحيل والخصم اللحظي من المخزن
  confirm(id) {
    return apiClient.post(`${resource}/${id}/confirm`)
  },

  // إلغاء إذن الصرف وعكس الأثر المخزني
  cancel(id) {
    return apiClient.post(`${resource}/${id}/cancel`)
  },

  // حذف إذن صرف (للمسودات فقط)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
