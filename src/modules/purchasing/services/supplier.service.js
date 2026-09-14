import apiClient from '@/services/apiClient'

const resource = '/core/partners'

export default {
  // جلب قائمة الموردين السريعة المخصصة للقوائم المنسدلة
  getSelector() {
    return apiClient.get(`${resource}/selector`, {
      params: { role: 'supplier' },
    })
  },

  // جلب قائمة الموردين مع الفلترة والترقيم لشاشات العرض والبحث
  get(params = {}) {
    return apiClient.get(resource, {
      params: { ...params, role: 'supplier' },
    })
  },

  // جلب تفاصيل مورد محدد مع الحسابات والعلاقات
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء مورد جديد مع ضمان تثبيت دور المورد تلقائياً
  create(payload) {
    return apiClient.post(resource, {
      ...payload,
      is_supplier: true,
    })
  },

  // تحديث بيانات مورد موجود
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف مورد (يخضع لحماية القيود والسندات في الموديل)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
