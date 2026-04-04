import { defineStore } from 'pinia'
import { ref } from 'vue'
import reportService from '@/services/reportService'

export const useReportStore = defineStore('report', () => {
  // --- State ---
  const dashboardStats = ref(null)
  const companyStatement = ref(null)
  const ownerStatement = ref(null)
  const companiesSummary = ref([]) // [جديد] حالة التقرير العام
  const grandSummary = ref(null) // [جديد] حالة الإجماليات النهائية
  const loading = ref(false)
  const error = ref(null)

  // --- Actions ---

  // [جديد] أكشن جلب التقرير العام
  async function fetchCompaniesSummary() {
    loading.value = true
    error.value = null
    try {
      const response = await reportService.getCompaniesSummary()
      // تخزين البيانات الرئيسية (قائمة الشركات)
      companiesSummary.value = response.data.data
      // تخزين ملخص الإجماليات (Grand Summary)
      grandSummary.value = response.data.grand_summary
    } catch (err) {
      error.value = 'Failed to fetch companies summary report.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchDashboardStats() {
    loading.value = true
    error.value = null
    try {
      const response = await reportService.getDashboardStats()
      dashboardStats.value = response.data.data
    } catch (err) {
      error.value = 'Failed to fetch dashboard stats.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchCompanyStatement(companyId) {
    loading.value = true
    error.value = null
    companyStatement.value = null
    try {
      const response = await reportService.getCompanyStatement(companyId)
      companyStatement.value = response.data.data
    } catch (err) {
      error.value = 'Failed to fetch company statement.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // +++ [أضف هذه الدالة كاملة] +++
  async function fetchOwnerStatement(ownerId) {
    loading.value = true
    error.value = null
    ownerStatement.value = null // تصفير البيانات القديمة

    try {
      // استدعاء الدالة التي أضفناها للتو في reportService
      const response = await reportService.getOwnerStatement(ownerId)
      ownerStatement.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب كشف حساب الجهة المالكة.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // --- Return public API ---
  return {
    dashboardStats,
    companyStatement,

    // +++ [أضف هذين السطرين] +++
    ownerStatement, // المتغير
    fetchOwnerStatement, // الدالة
    // ++++++++++++++++++++++++++

    companiesSummary,
    grandSummary,
    loading,
    error,
    fetchDashboardStats,
    fetchCompanyStatement,
    fetchCompaniesSummary,
  }
})
