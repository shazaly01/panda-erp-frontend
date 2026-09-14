import apiClient from '@/services/apiClient'

const resource = '/core/partners'

export default {
  // جلب قائمة العملاء السريعة المخصصة للقوائم المنسدلة
  getSelector() {
    return apiClient.get(`${resource}/selector`, {
      params: { role: 'customer' },
    })
  },

  // جلب قائمة العملاء مع الفلترة والترقيم لشاشات العرض والبحث
  get(params = {}) {
    return apiClient.get(resource, {
      params: { ...params, role: 'customer' },
    })
  },

  // جلب تفاصيل عميل محدد مع الحسابات والعلاقات
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء عميل جديد مع تثبيت دور العميل تلقائياً
  create(payload) {
    return apiClient.post(resource, {
      ...payload,
      is_customer: true,
    })
  },

  // تحديث بيانات عميل موجود
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف عميل (يخضع لحماية القيود والسندات في الموديل)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
