import { defineStore } from 'pinia'
import { ref } from 'vue'
import shiftService from '../services/shift.service'

export const useShiftStore = defineStore('hrShift', () => {
  // ==========================
  // 1. State (الحالة)
  // ==========================

  // خاص بالورديات الأساسية
  const shifts = ref([])
  const singleShift = ref(null)

  // خاص بسجل الورديات لموظف معين
  const employeeShifts = ref([])

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

  // --- أ. إدارة الورديات الأساسية ---

  async function fetchShifts(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await shiftService.get(filters)
      shifts.value = response.data.data
      if (response.data.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة الورديات'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchShiftById(id) {
    loading.value = true
    error.value = null
    singleShift.value = null
    try {
      const response = await shiftService.find(id)
      singleShift.value = response.data.data
      return singleShift.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل الوردية'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createShift(payload) {
    loading.value = true
    error.value = null
    try {
      await shiftService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إضافة الوردية'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateShift(id, payload) {
    loading.value = true
    error.value = null
    try {
      await shiftService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث الوردية'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteShift(id) {
    loading.value = true
    error.value = null
    try {
      await shiftService.delete(id)
      shifts.value = shifts.value.filter((shift) => shift.id !== id)
      pagination.value.total -= 1
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لا يمكن حذف هذه الوردية لاحتمالية ارتباطها بموظفين'
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- ب. إدارة تعيينات الموظفين ---

  async function assignEmployeeToShift(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await shiftService.assignEmployee(payload)
      // إذا كنا نعرض سجل هذا الموظف حالياً، نقوم بتحديث القائمة فوراً
      if (
        employeeShifts.value.length > 0 &&
        employeeShifts.value[0].employee_id === payload.employee_id
      ) {
        // يمكننا إعادة جلب السجل بالكامل لضمان ترتيب التواريخ وإغلاق الوردية السابقة
        await fetchEmployeeShifts(payload.employee_id)
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تعيين الموظف على الوردية'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEmployeeShifts(employeeId) {
    loading.value = true
    error.value = null
    employeeShifts.value = [] // تصفير السجل السابق
    try {
      const response = await shiftService.getEmployeeShifts(employeeId)
      employeeShifts.value = response.data.data
      return employeeShifts.value
    } catch (err) {
      error.value = 'فشل جلب سجل ورديات الموظف'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    shifts,
    singleShift,
    employeeShifts,
    pagination,
    loading,
    error,

    // Actions (Shifts)
    fetchShifts,
    fetchShiftById,
    createShift,
    updateShift,
    deleteShift,

    // Actions (Assignments)
    assignEmployeeToShift,
    fetchEmployeeShifts,
  }
})
