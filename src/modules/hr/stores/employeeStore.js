import { defineStore } from 'pinia'
import { ref } from 'vue'
import employeeService from '../services/employee.service'

export const useEmployeeStore = defineStore('hrEmployee', () => {
  // ==========================
  // 1. State
  // ==========================
  const employees = ref([]) // مصفوفة الموظفين
  const singleEmployee = ref(null) // بيانات موظف محدد (لعرض التفاصيل أو التعديل)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  }) // لتخزين بيانات الترقيم القادمة من لارافيل

  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  /**
   * جلب قائمة الموظفين (مع دعم الفلاتر والترقيم)
   * @param {Object} filters - مثال: { page: 1, search: 'محمد', department_id: 2 }
   */
  async function fetchEmployees(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await employeeService.get(filters)
      // نفترض أن لارافيل يعيد البيانات بداخل "data" والترقيم بداخل "meta"
      const incomingData = response.data?.data || response.data || []
      employees.value = Array.isArray(incomingData) ? incomingData : []
      if (response.data.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة الموظفين'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب بيانات موظف واحد لعرضها في نموذج التعديل أو صفحة التفاصيل
   */
  async function fetchEmployeeById(id) {
    loading.value = true
    error.value = null
    singleEmployee.value = null
    try {
      const response = await employeeService.find(id)
      singleEmployee.value = response.data.data
      return singleEmployee.value
    } catch (err) {
      error.value = 'فشل جلب بيانات الموظف'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createEmployee(payload) {
    loading.value = true
    error.value = null
    try {
      await employeeService.create(payload)
      // لا نستدعي fetchEmployees هنا مباشرة، لأننا قد نكون في صفحة مختلفة.
      // الواجهة (Component) هي من ستقرر متى تعيد التوجيه لصفحة القائمة.
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إضافة الموظف'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEmployee(id, payload) {
    loading.value = true
    error.value = null
    try {
      await employeeService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث بيانات الموظف'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteEmployee(id) {
    loading.value = true
    error.value = null
    try {
      await employeeService.delete(id)
      // تحديث المصفوفة محلياً لتجنب طلب API جديد إذا كنا في نفس الصفحة
      employees.value = employees.value.filter((emp) => emp.id !== id)
      pagination.value.total -= 1
    } catch (err) {
      error.value = err.response?.data?.message || 'لا يمكن حذف الموظف لوجود حركات مرتبطة به'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    employees,
    singleEmployee,
    pagination,
    loading,
    error,

    // Actions
    fetchEmployees,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  }
})
