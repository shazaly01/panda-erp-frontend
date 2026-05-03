import apiClient from '@/services/apiClient'

const resource = '/hr/internet-vouchers'

export default {
  // جلب قائمة الأكواد (يدعم الفلترة بالحالة والبحث والصفحات)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // رفع ملف الـ CSV للأكواد
  // نستخدم FormData لأننا نرسل ملفاً (File) وليس JSON عادياً
  importCsv(formData) {
    return apiClient.post(`${resource}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // صرف كود يدوياً لموظف
  assignManually(payload) {
    return apiClient.post(`${resource}/assign-manually`, payload)
  },
}
