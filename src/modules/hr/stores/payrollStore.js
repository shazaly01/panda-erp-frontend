import { defineStore } from 'pinia'
import { ref } from 'vue'
import payrollService from '../services/payroll.service'

export const usePayrollStore = defineStore('hrPayroll', () => {
  const payslipPreview = ref(null)
  const isPosting = ref(false)
  const loading = ref(false)
  const error = ref(null)
  const processedEmployeeIds = ref([])

  const batchesHistory = ref([])
  const batchesPagination = ref(null)

  const batchSummary = ref({
    total_basic: 0,
    total_allowances: 0,
    total_deductions: 0,
    total_net: 0,
    employee_count: 0,
  })
  const isSummaryLoading = ref(false)

  // 🚀 التعديل: استقبال payPeriodId و runType
  async function previewPayroll(employeeId, payPeriodId, runType) {
    loading.value = true
    error.value = null
    payslipPreview.value = null
    try {
      const response = await payrollService.preview({
        employee_id: employeeId,
        pay_period_id: payPeriodId,
        run_type: runType,
      })
      payslipPreview.value = response.data.data
      return payslipPreview.value
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل حساب ومعاينة الراتب'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function postPayrollBatch(payload) {
    isPosting.value = true
    error.value = null
    try {
      // payload يحتوي الآن على pay_period_id و run_type
      const response = await payrollService.postBatch(payload)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشلت عملية اعتماد وترحيل الرواتب'
      throw err
    } finally {
      isPosting.value = false
    }
  }

  function clearPreview() {
    payslipPreview.value = null
    error.value = null
  }

  async function fetchBatchesHistory(page = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await payrollService.getBatches({ page })
      batchesHistory.value = response.data.data
      batchesPagination.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل جلب سجل المسيرات'
    } finally {
      loading.value = false
    }
  }

  // 🚀 التعديل: استقبال payPeriodId و runType
  async function fetchBatchSummary(employeeIds, payPeriodId, runType) {
    if (!employeeIds || employeeIds.length === 0 || !payPeriodId || !runType) {
      batchSummary.value = {
        total_basic: 0,
        total_allowances: 0,
        total_deductions: 0,
        total_net: 0,
        employee_count: 0,
      }
      return
    }

    isSummaryLoading.value = true
    error.value = null
    try {
      const response = await payrollService.getSummary({
        employee_ids: employeeIds,
        pay_period_id: payPeriodId,
        run_type: runType,
      })
      batchSummary.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل حساب الملخص'
    } finally {
      isSummaryLoading.value = false
    }
  }

  // 🚀 التعديل: جلب المرحلين بناءً على الفترة ونوع المسير
  async function fetchProcessedEmployees(payPeriodId, runType) {
    if (!payPeriodId || !runType) return

    try {
      const response = await payrollService.getProcessedEmployees({
        pay_period_id: payPeriodId,
        run_type: runType,
      })
      processedEmployeeIds.value = response.data.data
    } catch (err) {
      console.error('فشل جلب قائمة الموظفين المرحلين', err)
      processedEmployeeIds.value = []
    }
  }

  return {
    payslipPreview,
    isPosting,
    loading,
    error,
    batchesHistory,
    batchesPagination,
    batchSummary,
    isSummaryLoading,
    processedEmployeeIds,
    fetchProcessedEmployees,
    previewPayroll,
    postPayrollBatch,
    clearPreview,
    fetchBatchesHistory,
    fetchBatchSummary,
  }
})
