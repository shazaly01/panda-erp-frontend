import { defineStore } from 'pinia'
import { ref } from 'vue'
import internetVoucherService from '../services/internetVoucher.service'

export const useInternetVoucherStore = defineStore('hrInternetVoucher', () => {
  // ==========================
  // 1. State (الحالة)
  // ==========================
  const vouchers = ref([])
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions (الإجراءات)
  // ==========================

  // جلب الأكواد لعرضها في الجدول
  async function fetchVouchers(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await internetVoucherService.get(filters)
      vouchers.value = response.data.data

      if (response.data.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل بيانات الأكواد من السيرفر.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // استيراد ملف الإكسيل/CSV
  async function importVouchers(formData) {
    loading.value = true
    error.value = null
    try {
      const response = await internetVoucherService.importCsv(formData)
      return response.data // نرجع البيانات لكي نعرض رسالة النجاح في الشاشة
    } catch (err) {
      error.value = err.response?.data?.message || 'حدث خطأ أثناء رفع الملف.'
      throw err // نرمي الخطأ لكي تلتقطه الشاشة وتظهره للمستخدم
    } finally {
      loading.value = false
    }
  }

  // الصرف اليدوي لكود الإنترنت
  async function assignManually(employeeId) {
    loading.value = true
    error.value = null
    try {
      const response = await internetVoucherService.assignManually({ employee_id: employeeId })
      return response.data // نرجع الكود المصروف لعرضه
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل عملية الصرف اليدوي.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    vouchers,
    pagination,
    loading,
    error,

    // Actions
    fetchVouchers,
    importVouchers,
    assignManually,
  }
})
