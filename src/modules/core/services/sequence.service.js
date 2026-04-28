import apiClient from '@/services/apiClient'

const resource = '/core/sequences'

export default {
  // جلب كل إعدادات الترقيم
  get() {
    return apiClient.get(resource)
  },

  // تحديث إعداد ترقيم معين
  // data تحتوي على: format, reset_frequency, next_value
  update(id, data) {
    return apiClient.put(`${resource}/${id}`, data)
  },
}
