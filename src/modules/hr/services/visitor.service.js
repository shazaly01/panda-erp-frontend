import apiClient from '@/services/apiClient'

export const visitorService = {
  /**
   * جلب قائمة الزوار مع دعم الفلترة والبحث المتقدم
   */
  getAll(params = {}) {
    return apiClient.get('/hr/visitors', { params })
  },

  /**
   * جلب تفاصيل زائر معين بواسطة المعرّف
   */
  getById(id) {
    return apiClient.get(`/hr/visitors/${id}`)
  },

  /**
   * تسجيل زائر جديد من لوحة الاستقبال الداخلي
   */
  create(data) {
    return apiClient.post('/hr/visitors', data)
  },

  /**
   * تعديل بيانات سجل زائر
   */
  update(id, data) {
    return apiClient.put(`/hr/visitors/${id}`, data)
  },

  /**
   * حذف سجل زائر (الحذف المرن)
   */
  delete(id) {
    return apiClient.delete(`/hr/visitors/${id}`)
  },

  /**
   * تسجيل دخول أو خروج الزائر عند البوابة (عبر المعرف أو التوكن)
   */
  gateCheckIn(identifier) {
    return apiClient.post('/hr/visitors/gate/check-in', identifier)
  },

  gateCheckOut(identifier) {
    return apiClient.post('/hr/visitors/gate/check-out', identifier)
  },

  /**
   * البحث المقيد والآمن عن الموظفين المستضيفين (Autocomplete)
   */
  searchHosts(search) {
    return apiClient.get('/hr/visitors/search-hosts', { params: { search } })
  },

  /**
   * الرابط الخارجي المفتوح للتسجيل الذاتي للزوار من الهاتف
   */
  publicRegister(data) {
    return apiClient.post('/hr/visitors/public-register', data)
  },
}
