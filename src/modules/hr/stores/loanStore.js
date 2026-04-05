import { defineStore } from 'pinia'
import { ref } from 'vue'
import loanService from '../services/loan.service'

export const useLoanStore = defineStore('hrLoan', () => {
  // ==========================
  // 1. State
  // ==========================
  const loans = ref([])
  const singleLoan = ref(null) // يستخدم في شاشة التفاصيل لعرض السلفة وأقساطها
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  async function fetchLoans(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await loanService.get(filters)
      loans.value = response.data.data
      if (response.data.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة السلف'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchLoanById(id) {
    loading.value = true
    error.value = null
    singleLoan.value = null
    try {
      const response = await loanService.find(id)
      singleLoan.value = response.data.data
      return singleLoan.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل السلفة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createLoan(payload) {
    loading.value = true
    error.value = null
    try {
      await loanService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تقديم طلب السلفة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateLoan(id, payload) {
    loading.value = true
    error.value = null
    try {
      await loanService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث طلب السلفة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteLoan(id) {
    loading.value = true
    error.value = null
    try {
      await loanService.delete(id)
      loans.value = loans.value.filter((loan) => loan.id !== id)
      pagination.value.total -= 1
    } catch (err) {
      error.value = err.response?.data?.message || 'لا يمكن إلغاء السلفة'
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- العمليات الإدارية والمحاسبية ---

  async function approveLoan(id) {
    loading.value = true
    error.value = null
    try {
      const response = await loanService.approve(id)
      // تحديث حالة السلفة محلياً في المصفوفة ليتغير الزر/الحالة في الجدول فوراً
      const index = loans.value.findIndex((l) => l.id === id)
      if (index !== -1) {
        loans.value[index] = response.data.data
      }
      // إذا كنا في صفحة التفاصيل، نحدثها أيضاً لتظهر الأقساط الجديدة
      if (singleLoan.value && singleLoan.value.id === id) {
        singleLoan.value = response.data.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل اعتماد السلفة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function markLoanAsPaid(id, voucherId) {
    loading.value = true
    error.value = null
    try {
      const response = await loanService.markAsPaid(id, voucherId)
      // تحديث الحالة محلياً لتصبح "مصروفة"
      const index = loans.value.findIndex((l) => l.id === id)
      if (index !== -1) {
        loans.value[index] = response.data.data
      }
      if (singleLoan.value && singleLoan.value.id === id) {
        singleLoan.value = response.data.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تأكيد صرف السلفة'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loans,
    singleLoan,
    pagination,
    loading,
    error,

    fetchLoans,
    fetchLoanById,
    createLoan,
    updateLoan,
    deleteLoan,
    approveLoan,
    markLoanAsPaid,
  }
})
