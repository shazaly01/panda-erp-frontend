//src\services\companyService.js
import apiClient from './apiClient'

const resource = '/companies'

export default {
  // تحديث دالة get لاستقبال بارامتر البحث
  get(page = 1, search = '') {
    return apiClient.get(resource, {
      params: {
        page: page,
        search: search, // سيرسل الرابط كـ /companies?page=1&search=كلمة_البحث
      },
    })
  },

  find(id) {
    // نمرر المعرف (الذي قد يكون DECIMAL 18 رقم) كما هو
    return apiClient.get(`${resource}/${id}`)
  },

  create(payload) {
    return apiClient.post(resource, payload)
  },

  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
