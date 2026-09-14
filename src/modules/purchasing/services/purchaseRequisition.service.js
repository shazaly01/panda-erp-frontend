// src/modules/purchasing/services/purchaseRequisition.service.js
import apiClient from '@/services/apiClient'

const resource = '/purchasing/requisitions'

export default {
  // جلب قائمة طلبات الشراء مع الفلترة والترقيم
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل طلب شراء محدد مع البنود
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء طلب شراء جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات وبنود طلب الشراء
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // تقديم الطلب للاعتماد
  submit(id) {
    return apiClient.post(`${resource}/${id}/submit`)
  },

  // اعتماد طلب الشراء
  approve(id) {
    return apiClient.post(`${resource}/${id}/approve`)
  },

  // رفض طلب الشراء مع تمرير سبب الرفض
  reject(id, payload) {
    return apiClient.post(`${resource}/${id}/reject`, payload)
  },

  // حذف طلب الشراء
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  // قراءة الأرصدة اللحظية للمستودع واقتراحات الفرز
  getTriageOverview(id, warehouseId) {
    return apiClient.get(`${resource}/${id}/triage-overview`, {
      params: { warehouse_id: warehouseId },
    })
  },

  // تنفيذ الفرز والتوزيع وتوليد مسودة إذن الصرف المخزني
  executeTriage(id, payload) {
    return apiClient.post(`${resource}/${id}/triage`, payload)
  },
}
