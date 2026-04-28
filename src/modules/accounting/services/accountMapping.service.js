import apiClient from '@/services/apiClient'

const resource = '/accounting/account-mappings'

export default {
  // جلب كل التوجيهات
  get() {
    return apiClient.get(resource)
  },

  // تحديث توجيه معين
  // عادة نرسل الـ ID الخاص بسطر التوجيه والحساب الجديد المختار
  update(id, accountId) {
    return apiClient.put(`${resource}/${id}`, {
      account_id: accountId,
    })
  },

  // 🌟 إضافة جديدة: جلب الحسابات المرشحة للربط
  getCandidates() {
    return apiClient.get(`${resource}/candidates`)
  },
}
