import apiClient from '@/services/apiClient'

const resource = '/sales/invoices'

export default {
  // جلب قائمة فواتير المبيعات مع الفلترة والترقيم
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل فاتورة مبيعات محددة مع بنودها ودفعاتها والوحدات المتاحة
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // جلب بيانات الفاتورة العامة عبر UUID (للعرض والطباعة والمشاركة عبر واتساب)
  findPublic(uuid) {
    return apiClient.get(`${resource}/public/${uuid}`)
  },

  // إنشاء فاتورة مبيعات قياسية (تقبل auto_post: true للترحيل المباشر إن لزم)
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // نقطة بيع الكاشير السريعة: حفظ وتأكيد وترحيل الفاتورة ودفعاتها في خطوة واحدة
  posCheckout(payload) {
    return apiClient.post(`${resource}/pos`, payload)
  },

  // تحديث بيانات فاتورة مبيعات (يدعم الفواتير المسودة والمرحلة مع تحديث البنود والدفعات)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف فاتورة مبيعات (يعكس الحركات المخزنية والقيود المحاسبية تلقائياً)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  // تأكيد واعتماد فاتورة مسودة
  confirm(id) {
    return apiClient.post(`${resource}/${id}/confirm`)
  },

  // ترحيل الفاتورة مخزنياً ومحاسبياً
  post(id) {
    return apiClient.post(`${resource}/${id}/post`)
  },

  // إلغاء الفاتورة وعكس أثرها المخزني والمحاسبي
  cancel(id) {
    return apiClient.post(`${resource}/${id}/cancel`)
  },
}
