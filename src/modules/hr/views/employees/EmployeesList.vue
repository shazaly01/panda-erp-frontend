<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">شؤون الموظفين</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة سجلات الموظفين، بياناتهم الشخصية، ومراكزهم الوظيفية.
        </p>
      </div>
      <AppButton v-if="authStore.can('employee.create')" @click="goToCreate" icon="plus">
        تسجيل موظف جديد
      </AppButton>
    </div>

    <EmployeesFilter
      v-model:searchQuery="filters.search"
      v-model:departmentId="filters.department_id"
      v-model:positionId="filters.position_id"
      v-model:status="filters.status"
      :departments="departmentStore.flatDepartments"
      :positions="positionStore.flatPositions"
      @update:searchQuery="onFilterChange"
      @update:departmentId="onFilterChange"
      @update:positionId="onFilterChange"
      @update:status="onFilterChange"
    />

    <EmployeesTable
      :employees="employees"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="goToEdit"
      @delete="openDeleteDialog"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف سجل الموظف"
      :message="`هل أنت متأكد من رغبتك في حذف سجل الموظف (${employeeToDelete?.full_name})؟ لا يمكن التراجع عن هذا الإجراء.`"
      confirm-text="حذف نهائي"
      confirm-variant="danger"
      @confirmed="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import { useAuthStore } from '@/stores/authStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import { useDepartmentStore } from '@/modules/hr/stores/departmentStore'
import { usePositionStore } from '@/modules/hr/stores/positionStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import EmployeesFilter from './components/EmployeesFilter.vue'
import EmployeesTable from './components/EmployeesTable.vue'

// -- تهيئة --
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()
const positionStore = usePositionStore()

const { employees, pagination, loading } = storeToRefs(employeeStore)

// -- الفلاتر --
const filters = reactive({
  search: '',
  department_id: '',
  position_id: '',
  status: '',
})

let searchTimeout = null

const onFilterChange = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات --
const handlePageChange = async (page = 1) => {
  try {
    await employeeStore.fetchEmployees({ page, ...filters })
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب بيانات الموظفين.')
  }
}

onMounted(async () => {
  // جلب البيانات الأولية للجدول
  handlePageChange(1)

  // جلب بيانات الإدارات والمسميات لتعبئة القوائم المنسدلة في الفلتر (إذا لم تكن مجلوبة مسبقاً)
  if (departmentStore.flatDepartments.length === 0) await departmentStore.fetchDepartments()
  if (positionStore.flatPositions.length === 0) await positionStore.fetchPositions()
})

// -- التوجيه (Navigation) للـ Page --
const goToCreate = () => {
  router.push({ name: 'employees.create' })
}

const goToEdit = (employee) => {
  router.push({ name: 'employees.edit', params: { id: employee.id } })
}

// -- إدارة الحذف --
const isDeleteDialogOpen = ref(false)
const employeeToDelete = ref(null)

const openDeleteDialog = (employee) => {
  employeeToDelete.value = employee
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!employeeToDelete.value) return

  try {
    await employeeStore.deleteEmployee(employeeToDelete.value.id)
    toast.success('تم حذف سجل الموظف بنجاح.')

    const targetPage =
      employees.value.length === 0 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(employeeStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    employeeToDelete.value = null
  }
}
</script>
