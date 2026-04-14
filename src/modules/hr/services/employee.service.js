import apiClient from '@/services/apiClient'

const resource = '/hr/employees'

export default {
  // جلب الموظفين (يدعم تمرير الفلاتر مثل: ?department_id=1&search=ahmed&page=2)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل موظف محدد (مع علاقاته مثل القسم والوظيفة)
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إضافة موظف جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تعديل بيانات موظف
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف موظف
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  // جلب كشف الحساب المالي للموظف (Sub-Ledger Statement)
  getFinancialStatement(id) {
    return apiClient.get(`/hr/employees/${id}/financial-statement`)
  },
}
