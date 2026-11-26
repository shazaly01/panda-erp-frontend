import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import payrollService from '../services/payroll.service'

const roundMoney = (val) => Math.round((Number(val || 0) + Number.EPSILON) * 100) / 100

export const usePayrollStore = defineStore('hrPayroll', () => {
  const payslipPreview = ref(null)
  const isInitializing = ref(false)
  const isPosting = ref(false)
  const isRollingBack = ref(false)
  const loading = ref(false)
  const error = ref(null)

  // المسير القائم للشهر الحالي أو المسير الجاري تعديله (إن وجد)
  const activeBatch = ref(null)

  // المبلغ المستلم للصرف (يقسم على الموظفين المحددين حسب نسبة راتب كل موظف)
  const disbursedAmount = ref(0)
  const hasCustomDisbursedAmount = ref(false)

  // قائمة الموظفين المؤهلين للفترة المحددة مع حالة is_processed
  const eligibleEmployees = ref([])
  const isEligibleLoading = ref(false)

  // معرفات الموظفين المرحلين في مسيرات أخرى
  const processedEmployeeIds = ref([])

  const batchesHistory = ref([])
  const batchesPagination = ref(null)

  const batchSummary = ref({
    total_basic: 0,
    total_allowances: 0,
    total_deductions: 0,
    total_net: 0,
    employee_count: 0,
    items: {},
  })
  const isSummaryLoading = ref(false)

  // معرف المسير القابل للتعديل حالياً (null في حالة إعداد مسير جديد)
  const editingBatchId = computed(() => {
    return activeBatch.value && activeBatch.value.can_edit ? activeBatch.value.id : null
  })

  // هل المسير المعروض حالياً مقفل زمنياً لوجود شهر أحدث معتمد؟
  const isCurrentBatchLocked = computed(() => {
    return Boolean(activeBatch.value && !activeBatch.value.can_edit)
  })

  // نسبة الصرف المحسوبة تلقائياً من المبلغ المستلم إلى إجمالي صافي الموظفين المحددين
  const disbursementPercentage = computed(() => {
    const net = roundMoney(batchSummary.value.total_net)
    const disbursed = roundMoney(disbursedAmount.value)
    if (net <= 0) return 100
    return roundMoney(Math.min(100, Math.max(0, (disbursed / net) * 100)))
  })

  // مزامنة المبلغ المصروف مع إجمالي صافي الموظفين المحددين
  function syncDisbursementWithTotal(totalNet) {
    const net = roundMoney(totalNet)
    if (net <= 0) {
      disbursedAmount.value = 0
      return
    }

    if (hasCustomDisbursedAmount.value) {
      disbursedAmount.value = roundMoney(Math.max(0, Math.min(net, disbursedAmount.value)))
    } else {
      disbursedAmount.value = net
    }
  }

  // إدخال المبلغ المستلم للصرف من الشركة ليوزع تلقائياً على الموظفين المحددين حسب وزن راتب كل موظف
  function setDisbursedAmount(amount) {
    const parsed = Number(amount)
    const net = roundMoney(batchSummary.value.total_net)
    const safeAmount = Number.isFinite(parsed) ? Math.max(0, parsed) : 0
    const clampedAmount = net > 0 ? roundMoney(Math.min(net, safeAmount)) : roundMoney(safeAmount)

    hasCustomDisbursedAmount.value = net > 0 ? clampedAmount < net : true
    disbursedAmount.value = clampedAmount
  }

  // إعادة ضبط المبلغ ليغطي كامل صافي الرواتب (100%)
  function resetDisbursedToFull() {
    hasCustomDisbursedAmount.value = false
    disbursedAmount.value = roundMoney(batchSummary.value.total_net)
  }

  // تقسيم المبلغ المستلم بعدالة على الموظفين المحددين حسب نسبة صافي راتب كل موظف
  function computeEmployeesDisbursement(selectedIds) {
    const map = {}
    const items = batchSummary.value.items || {}
    const totalNet = roundMoney(batchSummary.value.total_net)
    const effectiveDisbursed = roundMoney(disbursedAmount.value)

    if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
      return map
    }

    let lastPositiveId = null
    for (const empId of selectedIds) {
      const net = roundMoney(items[empId]?.net_salary ?? 0)
      if (net > 0) {
        lastPositiveId = empId
      }
    }

    let distributedSum = 0
    const ratio = totalNet > 0 ? effectiveDisbursed / totalNet : 0

    for (const empId of selectedIds) {
      const item = items[empId]
      if (!item) continue

      const netSalary = roundMoney(item.net_salary)
      let paidAmount = 0

      if (netSalary <= 0 || effectiveDisbursed <= 0) {
        paidAmount = 0
      } else if (effectiveDisbursed >= totalNet) {
        paidAmount = netSalary
      } else if (empId === lastPositiveId) {
        paidAmount = roundMoney(
          Math.max(0, Math.min(netSalary, effectiveDisbursed - distributedSum)),
        )
      } else {
        paidAmount = roundMoney(minAmount(netSalary, netSalary * ratio))
        distributedSum = roundMoney(distributedSum + paidAmount)
      }

      const remainingAmount = roundMoney(Math.max(0, netSalary - paidAmount))

      map[empId] = {
        basic_salary: roundMoney(item.basic_salary),
        total_allowances: roundMoney(item.total_allowances),
        total_deductions: roundMoney(item.total_deductions),
        net_salary: netSalary,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
      }
    }

    return map
  }

  function minAmount(a, b) {
    return a < b ? a : b
  }

  /**
   * التهيئة التلقائية الذكية للشهر الحالي أو تحميل مسير محدد للتعديل
   */
  async function initializePayroll(params = {}) {
    isInitializing.value = true
    error.value = null
    try {
      const response = await payrollService.initialize(params)
      const data = response.data?.data || {}

      activeBatch.value = data.active_batch || null
      eligibleEmployees.value = data.employees || []
      processedEmployeeIds.value = (data.employees || [])
        .filter((emp) => emp.is_processed)
        .map((emp) => emp.id)

      if (activeBatch.value) {
        const savedAmount = roundMoney(activeBatch.value.disbursed_amount ?? 0)
        const savedPct = roundMoney(activeBatch.value.disbursement_percentage ?? 100)
        disbursedAmount.value = savedAmount
        hasCustomDisbursedAmount.value = savedPct < 100
      } else {
        hasCustomDisbursedAmount.value = false
        disbursedAmount.value = 0
      }

      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحميل بيانات مسير الرواتب'
      throw err
    } finally {
      isInitializing.value = false
    }
  }

  /**
   * جلب الموظفين المؤهلين لمسير الرواتب لفترة مالية محددة ونوع مسير
   */
  async function fetchEligibleEmployees(payPeriodId, runType, batchId = null) {
    if (!payPeriodId || !runType) {
      eligibleEmployees.value = []
      processedEmployeeIds.value = []
      return []
    }

    isEligibleLoading.value = true
    error.value = null
    try {
      const params = {
        pay_period_id: payPeriodId,
        run_type: runType,
      }
      if (batchId) {
        params.batch_id = batchId
      }

      const response = await payrollService.getEligibleEmployees(params)
      const employees = response.data.data || []
      eligibleEmployees.value = employees

      processedEmployeeIds.value = employees.filter((emp) => emp.is_processed).map((emp) => emp.id)

      return employees
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل جلب قائمة الموظفين المؤهلين'
      eligibleEmployees.value = []
      processedEmployeeIds.value = []
      throw err
    } finally {
      isEligibleLoading.value = false
    }
  }

  async function previewPayroll(employeeId, payPeriodId, runType, batchId = null) {
    loading.value = true
    error.value = null
    payslipPreview.value = null
    try {
      const payload = {
        employee_id: employeeId,
        pay_period_id: payPeriodId,
        run_type: runType,
      }
      if (batchId) {
        payload.batch_id = batchId
      }

      const response = await payrollService.preview(payload)
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

  async function rollbackPayrollBatch(batchId, reason) {
    isRollingBack.value = true
    error.value = null
    try {
      const response = await payrollService.rollbackBatch(batchId, { reason })
      batchesHistory.value = batchesHistory.value.filter((b) => b.id !== batchId)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشلت عملية التراجع عن المسير'
      throw err
    } finally {
      isRollingBack.value = false
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

  async function fetchBatchSummary(employeeIds, payPeriodId, runType, batchId = null) {
    if (!employeeIds || employeeIds.length === 0 || !payPeriodId || !runType) {
      batchSummary.value = {
        total_basic: 0,
        total_allowances: 0,
        total_deductions: 0,
        total_net: 0,
        employee_count: 0,
        items: {},
      }
      syncDisbursementWithTotal(0)
      return
    }

    isSummaryLoading.value = true
    error.value = null
    try {
      const payload = {
        employee_ids: employeeIds,
        pay_period_id: payPeriodId,
        run_type: runType,
      }
      if (batchId) {
        payload.batch_id = batchId
      }

      const response = await payrollService.getSummary(payload)
      batchSummary.value = {
        total_basic: 0,
        total_allowances: 0,
        total_deductions: 0,
        total_net: 0,
        employee_count: 0,
        items: {},
        ...(response.data.data || {}),
      }

      syncDisbursementWithTotal(batchSummary.value.total_net)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل حساب الملخص'
    } finally {
      isSummaryLoading.value = false
    }
  }

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
    isInitializing,
    isPosting,
    isRollingBack,
    loading,
    error,
    activeBatch,
    editingBatchId,
    isCurrentBatchLocked,
    disbursementPercentage,
    disbursedAmount,
    hasCustomDisbursedAmount,
    eligibleEmployees,
    isEligibleLoading,
    processedEmployeeIds,
    batchesHistory,
    batchesPagination,
    batchSummary,
    isSummaryLoading,
    setDisbursedAmount,
    resetDisbursedToFull,
    computeEmployeesDisbursement,
    initializePayroll,
    fetchEligibleEmployees,
    fetchProcessedEmployees,
    previewPayroll,
    postPayrollBatch,
    rollbackPayrollBatch,
    clearPreview,
    fetchBatchesHistory,
    fetchBatchSummary,
  }
})
