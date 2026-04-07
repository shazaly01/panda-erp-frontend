import apiClient from '@/services/apiClient'

const resource = '/hr/shifts'

export default {
  // ==========================================
  // 1. إدارة الورديات الأساسية (Shifts)
  // ==========================================

  // جلب قائمة الورديات (مع دعم الفلترة والبحث)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل إعدادات وردية محددة
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إضافة وردية جديدة
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تعديل إعدادات الوردية (الأوقات، فترة السماح، الخ)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف الوردية (يُسمح فقط إذا لم يكن هناك موظفون مرتبطون بها)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  // ==========================================
  // 2. إدارة تعيينات الموظفين على الورديات
  // ==========================================

  // تعيين موظف على وردية (مع تحديد تاريخ البدء وأيام العطلة الأسبوعية)
  assignEmployee(payload) {
    return apiClient.post(`${resource}/assign`, payload)
  },

  // جلب سجل الورديات الخاص بموظف محدد (التاريخ الزمني لوردياته)
  getEmployeeShifts(employeeId) {
    // لاحظ أن المسار هنا يختلف حسب ما عرفناه في ملف api.php
    return apiClient.get(`/hr/employees/${employeeId}/shifts`)
  },
}
