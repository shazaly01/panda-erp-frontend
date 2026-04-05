import apiClient from '@/services/apiClient'

const resource = '/hr/salary-structures'

export default {
  // جلب هياكل الرواتب (مع دعم الفلاتر: ?search=مهندسين)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل هيكل محدد (والذي سيعيد عادةً مصفوفة القواعد rules المربوطة به)
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء هيكل جديد (مثال للـ payload: يحتوي على اسم الهيكل ومصفوفة بمعرفات القواعد rule_ids)
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تعديل الهيكل (مثل إضافة أو إزالة قاعدة راتب منه)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف هيكل الرواتب
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
