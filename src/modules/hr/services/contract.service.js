import apiClient from '@/services/apiClient'

const resource = '/hr/contracts'

export default {
  // جلب قائمة العقود (تدعم الفلاتر مثل: ?status=active&employee_id=5)
  get(params = {}) {
    return apiClient.get(resource, { params })
  },

  // جلب تفاصيل عقد محدد (سيعيد تفاصيل العقد مع الهيكل المربوط به والموظف)
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء عقد جديد (ربط الموظف بهيكل الرواتب وتحديد الراتب الأساسي وتواريخ العقد)
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // حذف العقد (غالباً يُسمح به فقط إذا كان العقد مسودة Draft ولم يتم تفعيله أو استخدامه في رواتب)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
