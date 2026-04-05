import apiClient from '@/services/apiClient'

const resource = '/hr/loans'

export default {
  // جلب قائمة السلف (مع دعم الفلاتر مثل: ?status=pending&employee_id=5)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل سلفة محددة (مع جدول الأقساط الخاص بها)
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // تقديم طلب سلفة جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تعديل طلب سلفة (مسموح فقط والطلب معلق)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // إلغاء/حذف طلب سلفة معلق
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  // ==========================================
  // مسارات العمليات المخصصة (Custom Actions)
  // ==========================================

  // اعتماد السلفة (توليد الأقساط آلياً)
  approve(id) {
    return apiClient.post(`${resource}/${id}/approve`)
  },

  // تأكيد الصرف المحاسبي (ربط السلفة برقم سند الصرف)
  markAsPaid(id, voucherId) {
    return apiClient.post(`${resource}/${id}/mark-as-paid`, { voucher_id: voucherId })
  },
}
