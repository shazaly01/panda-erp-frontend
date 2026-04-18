import apiClient from '@/services/apiClient'

const resource = '/hr/pay-periods'

export default {
  // جلب قائمة الفترات (يمكن تمرير pay_group_id كفلتر هنا)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب الفترات المفتوحة فقط لمجموعة معينة
  getOpenPeriods(payGroupId) {
    return apiClient.get(resource, {
      params: {
        pay_group_id: payGroupId,
        status: 'open', // جلب الفترات المتاحة للصرف فقط
      },
    })
  },

  // جلب تفاصيل فترة مالية محددة
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء فترة مالية جديدة
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث الفترة المالية (مثل تعديل التواريخ أو إغلاقها يدوياً)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف الفترة المالية
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  generate(payload) {
    // payload يحتوي على: pay_group_id و year
    return apiClient.post(`${resource}/generate`, payload)
  },
}
