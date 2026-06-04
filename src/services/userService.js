// src/services/userService.js
import apiClient from './apiClient'

const resource = '/users'

export default {
  /**
   * جلب المستخدمين مع دعم الترقيم والبحث والفلترة ديناميكياً
   */
  get(page = 1, filters = {}) {
    return apiClient.get(resource, {
      params: {
        page,
        ...filters,
      },
    })
  },

  find(id) {
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

  approve(id, payload) {
    return apiClient.put(`${resource}/${id}/approve`, payload)
  },

  /**
   * [إضافة مستحدثة] تعليق أو إعادة تنشيط الحساب تلقائياً بالسيرفر
   * @param {Number} id - معرف المستخدم
   */
  toggleStatus(id) {
    return apiClient.put(`${resource}/${id}/toggle-status`)
  },
}
