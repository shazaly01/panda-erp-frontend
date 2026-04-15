//src\modules\hr\services\department.service.js
import apiClient from '@/services/apiClient'

const resource = '/hr/contracts'

export default {
  // جلب قائمة العقود
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل عقد محدد
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء عقد جديد (يدعم FormData لرفع المرفقات)
  create(payload) {
    return apiClient.post(resource, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // تحديث العقد
  // ملاحظة لارفيل: عند إرسال ملفات (FormData) مع التعديل، يجب إرسالها كـ POST مع إضافة حقل _method='PUT'
  update(id, payload) {
    return apiClient.post(`${resource}/${id}`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // إنهاء العقد (إيقاف نشاطه)
  terminate(id) {
    return apiClient.post(`${resource}/${id}/terminate`)
  },

  // حذف العقد نهائياً (أرشفة)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
