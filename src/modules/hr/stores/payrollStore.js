// src/modules/hr/stores/payrollStore.js
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

  // بيانات سجل المسيرات (History)
  const batchesHistory = ref([])
  const batchesPagination = ref(null)

  // بيانات الملخص الإحصائي
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

  // 🚀 تم التعديل: استقبال startDate و endDate
  async function previewPayroll(employeeId, startDate, endDate) {
    loading.value = true
    error.value = null
    payslipPreview.value = null
    try {
      const response = await payrollService.preview({
        employee_id: employeeId,
        start_date: startDate,
        end_date: endDate,
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
      // payload القادم من الشاشة يجب أن يحتوي الآن على start_date و end_date
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

  // 🚀 تم التعديل: استقبال startDate و endDate بدلاً من month
  async function fetchBatchSummary(employeeIds, startDate, endDate) {
    if (!employeeIds || employeeIds.length === 0 || !startDate || !endDate) {
      // تصفير الملخص إذا قام المستخدم بإلغاء التحديد أو لم يحدد التواريخ
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
        start_date: startDate,
        end_date: endDate,
      })
      batchSummary.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل حساب الملخص'
    } finally {
      isSummaryLoading.value = false
    }
  }

  // 🚀 تم التعديل: لمنع الموظفين من الصرف المزدوج في نفس الفترة
  async function fetchProcessedEmployees(startDate, endDate) {
    if (!startDate || !endDate) return

    try {
      const response = await payrollService.getProcessedEmployees({
        start_date: startDate,
        end_date: endDate,
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
