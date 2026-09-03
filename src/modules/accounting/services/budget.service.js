import apiClient from '@/services/apiClient'

const resource = '/accounting/budgets'

export default {
  // جلب قائمة الموازنات مع الترقيم والفلاتر
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل موازنة معينة مع بنودها
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء موازنة جديدة
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تعديل بيانات وبنود الموازنة
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف موازنة مسودة
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  // اعتماد الموازنة
  approve(id) {
    return apiClient.post(`${resource}/${id}/approve`)
  },

  // تفعيل الموازنة المعتمدة
  activate(id) {
    return apiClient.post(`${resource}/${id}/activate`)
  },

  // إغلاق الموازنة
  close(id) {
    return apiClient.post(`${resource}/${id}/close`)
  },

  // جلب تقرير مقارنة الفعلي بالمخطط والانحراف
  getVarianceReport(id, params = {}) {
    return apiClient.get(`${resource}/${id}/variance-report`, { params })
  },
}
