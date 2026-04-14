import { defineStore } from 'pinia'
import { ref } from 'vue'
import payrollService from '../services/payroll.service'

export const usePayrollStore = defineStore('hrPayroll', () => {
  // ==========================
  // 1. State (البيانات والحالة)
  // ==========================
  const payslipPreview = ref(null)
  const isPosting = ref(false)
  const loading = ref(false)
  const error = ref(null)
  const processedEmployeeIds = ref([])

  // 🌟 الجديد: بيانات سجل المسيرات (History)
  const batchesHistory = ref([])
  const batchesPagination = ref(null)

  // 🌟 الجديد: بيانات الملخص الإحصائي
  const batchSummary = ref({
    total_basic: 0,
    total_allowances: 0,
    total_deductions: 0,
    total_net: 0,
    employee_count: 0,
  })
  const isSummaryLoading = ref(false)

  // ==========================
  // 2. Actions (الإجراءات والدوال)
  // ==========================

  async function previewPayroll(employeeId, month) {
    loading.value = true
    error.value = null
    payslipPreview.value = null
    try {
      const response = await payrollService.preview({ employee_id: employeeId, month })
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

  // 🌟 الجديد: دالة جلب سجل المسيرات لعرضها في الجدول
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

  // 🌟 الجديد: دالة طلب الملخص المالي من الباك إند
  async function fetchBatchSummary(employeeIds, month) {
    if (!employeeIds || employeeIds.length === 0) {
      // تصفير الملخص إذا قام المستخدم بإلغاء تحديد جميع الموظفين
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
      const response = await payrollService.getSummary({ employee_ids: employeeIds, month })
      batchSummary.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل حساب الملخص'
    } finally {
      isSummaryLoading.value = false
    }
  }

  async function fetchProcessedEmployees(month) {
    try {
      const response = await payrollService.getProcessedEmployees(month)
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
