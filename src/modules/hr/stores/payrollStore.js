import { defineStore } from 'pinia'
import { ref } from 'vue'
import payrollService from '../services/payroll.service'

export const usePayrollStore = defineStore('hrPayroll', () => {
  // ==========================
  // 1. State
  // ==========================
  const payslipPreview = ref(null) // لتخزين بيانات قسيمة الراتب بعد المعاينة
  const isPosting = ref(false) // حالة خاصة لزر الترحيل لتعطيله أثناء العملية

  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  /**
   * طلب معاينة قسيمة الراتب
   * سيتم استدعاء هذه الدالة عندما يختار المستخدم موظفاً وشهراً للطباعة أو المراجعة
   */
  async function previewPayroll(employeeId, month) {
    loading.value = true
    error.value = null
    payslipPreview.value = null
    try {
      const response = await payrollService.preview({ employee_id: employeeId, month })
      // تخزين بيانات القسيمة المرتجعة من الخادم (يحتوي على خطوط الراتب والمجاميع)
      payslipPreview.value = response.data.data
      return payslipPreview.value
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل حساب ومعاينة الراتب'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * اعتماد وترحيل الرواتب المحددة (يُنشئ القيود المحاسبية ويغلق الحركات)
   */
  async function postPayrollBatch(payload) {
    isPosting.value = true
    error.value = null
    try {
      const response = await payrollService.postBatch(payload)
      return response.data // يمكن استخدامه لإظهار رسالة نجاح في الواجهة
    } catch (err) {
      error.value = err.response?.data?.message || 'فشلت عملية اعتماد وترحيل الرواتب'
      throw err
    } finally {
      isPosting.value = false
    }
  }

  /**
   * دالة مساعدة لمسح المعاينة الحالية من الشاشة
   */
  function clearPreview() {
    payslipPreview.value = null
    error.value = null
  }

  return {
    payslipPreview,
    isPosting,
    loading,
    error,

    previewPayroll,
    postPayrollBatch,
    clearPreview,
  }
})
