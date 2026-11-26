// src/modules/hr/services/disciplinaryAction.service.js
import apiClient from '@/services/apiClient'

const resource = '/hr/disciplinary-actions'

export default {
  // جلب سجل المخالفات والجزاءات التأديبية مع التصفية
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // معاينة الدرجة العقابية المتوقعة والأثر المالي وتاريخ التقادم قبل الحفظ
  previewEscalation(payload) {
    return apiClient.post(`${resource}/preview-escalation`, payload)
  },

  // جلب تفاصيل جزاء تأديبي محدد
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // تسجيل مخالفة جديدة على موظف وتطبيق سلم التدرج العقابي
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // اعتماد الجزاء التأديبي وتفعيل أثره المالي والتشغيلي
  approve(id) {
    return apiClient.post(`${resource}/${id}/approve`)
  },

  // إلغاء الجزاء التأديبي والتراجع عن الاستقطاع المالي غير المرحّل
  cancel(id, payload) {
    return apiClient.post(`${resource}/${id}/cancel`, payload)
  },

  // حذف سجل مخالفة (للسجلات المعلقة أو الملغاة فقط)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
