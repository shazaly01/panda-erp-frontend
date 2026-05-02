import apiClient from '@/services/apiClient'

const resource = '/hr/working-schedules'

export default {
  // جلب قائمة قوالب الجدولة
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل قالب محدد (مع الورديات المرتبطة بأيامه)
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء قالب جديد (مع تفاصيل الأيام Lines)
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث القالب
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف القالب نهائياً (إذا لم يكن مرتبطاً بعقود موظفين)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
