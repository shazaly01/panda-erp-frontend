import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import fiscalYearService from '../services/fiscalYear.service'

export const useFiscalYearStore = defineStore('accountingFiscalYear', () => {
  // ==========================
  // 1. State
  // ==========================
  const fiscalYears = ref([])
  const pagination = ref({}) // أضفناها لتتوافق مع المكون الخاص بالجدول
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  async function fetchFiscalYears(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await fiscalYearService.get(params)
      fiscalYears.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل تحميل السنوات المالية'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createFiscalYear(payload) {
    loading.value = true
    error.value = null
    try {
      await fiscalYearService.create(payload)
      await fetchFiscalYears()
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل فتح السنة المالية'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateFiscalYear(id, payload) {
    loading.value = true
    try {
      await fiscalYearService.update(id, payload)
      await fetchFiscalYears()
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث السنة المالية'
      throw err
    } finally {
      loading.value = false
    }
  }

  // أضفنا دالة الحذف لتعمل مع زر الحذف في الجدول
  async function deleteFiscalYear(id) {
    loading.value = true
    try {
      await fiscalYearService.delete(id)
      fiscalYears.value = fiscalYears.value.filter((y) => y.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'لا يمكن حذف السنة المالية لارتباطها بحركات.'
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- دالة هامة جداً ---
  // التحقق من حالة تاريخ معين (هل هو في سنة مفتوحة؟)
  // تستخدم هذه الدالة داخل JournalEntryForm عند تغيير حقل "التاريخ"
  async function checkDateStatus(date) {
    if (!date) return false

    try {
      const response = await fiscalYearService.checkStatus(date)
      // نفرض أن الباك إند يعيد { status: 'open' } أو { allowed: true }
      return response.data.status === 'open'
    } catch (err) {
      console.error('Error checking date status', err)
      return false // نفترض أنه مغلق في حال الخطأ للأمان
    }
  }

  // ==========================
  // 3. Getters
  // ==========================

  // السنوات المفتوحة فقط (لتعبئة القوائم المنسدلة إذا لزم الأمر)
  const openYears = computed(() => {
    return fiscalYears.value.filter((y) => y.status === 'open')
  })

  return {
    fiscalYears,
    pagination,
    loading,
    error,
    openYears,
    fetchFiscalYears,
    createFiscalYear,
    updateFiscalYear,
    deleteFiscalYear,
    checkDateStatus,
  }
})
