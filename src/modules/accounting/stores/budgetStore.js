import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import budgetService from '../services/budget.service'

export const useBudgetStore = defineStore('accountingBudget', () => {
  // ==========================
  // 1. State
  // ==========================
  const budgets = ref([])
  const currentBudget = ref(null)
  const varianceReport = ref(null)
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
  })
  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  async function fetchBudgets(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await budgetService.get(params)
      budgets.value = response.data.data
      if (response.data.meta) {
        pagination.value = {
          currentPage: response.data.meta.current_page,
          lastPage: response.data.meta.last_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
        }
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة الموازنات التقديرية'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchBudget(id) {
    loading.value = true
    error.value = null
    try {
      const response = await budgetService.find(id)
      currentBudget.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = 'فشل تحميل تفاصيل الموازنة'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createBudget(payload) {
    actionLoading.value = true
    error.value = null
    try {
      const response = await budgetService.create(payload)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء الموازنة التقديرية'
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  async function updateBudget(id, payload) {
    actionLoading.value = true
    error.value = null
    try {
      const response = await budgetService.update(id, payload)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث الموازنة التقديرية'
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  async function deleteBudget(id) {
    actionLoading.value = true
    error.value = null
    try {
      await budgetService.delete(id)
      budgets.value = budgets.value.filter((b) => b.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'لا يمكن حذف الموازنة'
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  async function approveBudget(id) {
    actionLoading.value = true
    error.value = null
    try {
      const response = await budgetService.approve(id)
      await fetchBudget(id)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل اعتماد الموازنة'
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  async function activateBudget(id) {
    actionLoading.value = true
    error.value = null
    try {
      const response = await budgetService.activate(id)
      await fetchBudget(id)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تفعيل الموازنة'
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  async function closeBudget(id) {
    actionLoading.value = true
    error.value = null
    try {
      const response = await budgetService.close(id)
      await fetchBudget(id)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إغلاق الموازنة'
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  async function fetchVarianceReport(id, params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await budgetService.getVarianceReport(id, params)
      varianceReport.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = 'فشل تحميل تقرير انحرافات الموازنة'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==========================
  // 3. Getters
  // ==========================

  const draftBudgets = computed(() => {
    return budgets.value.filter((b) => b.status?.value === 'draft')
  })

  const activeBudgets = computed(() => {
    return budgets.value.filter((b) => b.status?.value === 'active')
  })

  return {
    budgets,
    currentBudget,
    varianceReport,
    pagination,
    loading,
    actionLoading,
    error,
    draftBudgets,
    activeBudgets,

    fetchBudgets,
    fetchBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    approveBudget,
    activateBudget,
    closeBudget,
    fetchVarianceReport,
  }
})
