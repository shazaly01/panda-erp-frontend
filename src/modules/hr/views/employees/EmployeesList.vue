<!-- src/modules/hr/views/employees/EmployeesList.vue -->
<template>
  <div class="space-y-3 max-w-7xl mx-auto pb-12 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3.5 bg-primary rounded-full"></span>
          <span>شؤون الموظفين</span>
        </h1>
        <span
          v-if="pagination?.total !== undefined"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ pagination.total }}
        </span>
      </div>

      <AppButton
        v-if="authStore.can('hr.employees.create')"
        size="sm"
        @click="goToCreate"
        icon="plus"
      >
        تسجيل موظف جديد
      </AppButton>
    </div>

    <!-- شريط البحث والفلاتر -->
    <EmployeesFilter
      v-model:searchQuery="filters.search"
      v-model:departmentId="filters.department_id"
      v-model:positionId="filters.position_id"
      v-model:status="filters.status"
      v-model:contractFilter="filters.contractFilter"
      :departments="departmentStore.flatDepartments"
      :positions="positionStore.flatPositions"
      @update:searchQuery="onFilterChange"
      @update:departmentId="onFilterChange"
      @update:positionId="onFilterChange"
      @update:status="onFilterChange"
      @update:contractFilter="onFilterChange"
      @manage-shift="openShiftModal"
    />

    <!-- جدول بيانات الموظفين -->
    <EmployeesTable
      :employees="employees"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @print-card="openCardModal"
      @edit="goToEdit"
      @delete="openDeleteDialog"
      @view-statement="openStatementModal"
      @manage-shift="openShiftModal"
      @manage-documents="openDocumentsModal"
    />

    <!-- نافذة تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف سجل الموظف"
      :message="`هل أنت متأكد من رغبتك في حذف سجل الموظف (${employeeToDelete?.full_name})؟ لا يمكن التراجع عن هذا الإجراء.`"
      confirm-text="حذف نهائي"
      confirm-variant="danger"
      @confirmed="confirmDelete"
    />

    <!-- نافذة كشف الحساب المالي -->
    <EmployeeStatementModal
      v-model="isStatementModalOpen"
      :employee-id="selectedEmployeeIdForStatement"
    />

    <!-- نافذة معاينة وطباعة بطاقة الهوية -->
    <div
      v-if="isCardModalOpen"
      class="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-[60] p-2 sm:p-4 hide-on-print"
      dir="rtl"
      @click.self="isCardModalOpen = false"
    >
      <div
        class="bg-surface-section border border-surface-border rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
      >
        <!-- شريط التحكم العلوي للنافذة -->
        <div
          class="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800 shrink-0"
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <h3 class="text-xs sm:text-sm font-black tracking-wide text-slate-100">
              بطاقة الهوية الوظيفية — {{ selectedEmployeeForCard?.full_name }}
            </h3>
          </div>

          <div class="flex items-center gap-2">
            <AppButton size="sm" @click="printIdentityCard">
              <span class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                <span>طباعة البطاقة</span>
              </span>
            </AppButton>

            <button
              type="button"
              @click="isCardModalOpen = false"
              class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="إغلاق المعاينة"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- محتوى بطاقة الهوية -->
        <div class="p-3 sm:p-5 overflow-y-auto bg-surface-ground flex-1">
          <EmployeeIdentityCard :employee="selectedEmployeeForCard" />
        </div>
      </div>
    </div>

    <!-- نافذة إدارة الوردية -->
    <EmployeeShiftModal
      v-model="isShiftModalOpen"
      :employee="selectedEmployeeForShift"
      @updated="handlePageChange(pagination.current_page)"
    />

    <!-- نافذة الأرشيف الإلكتروني والوثائق -->
    <DocumentsManagerModal
      v-model="isDocumentsModalOpen"
      :owner="selectedEmployeeForDocuments"
      target-type="employee"
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
import EmployeeStatementModal from './components/EmployeeStatementModal.vue'
import EmployeeShiftModal from './components/EmployeeShiftModal.vue'
import EmployeeIdentityCard from './components/EmployeeIdentityCard.vue'

import DocumentsManagerModal from '@/modules/core/views/documents/DocumentsManagerModal.vue'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()
const positionStore = usePositionStore()

const { employees, pagination, loading } = storeToRefs(employeeStore)

const filters = reactive({
  search: '',
  department_id: '',
  position_id: '',
  status: '',
  contractFilter: '',
})

let searchTimeout = null

const onFilterChange = () => {
  employeeStore.loading = true
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = async (page = 1) => {
  try {
    const params = {
      page,
      search: filters.search || undefined,
      department_id: filters.department_id || undefined,
      position_id: filters.position_id || undefined,
      status: filters.status || undefined,
      without_contract: filters.contractFilter === 'without_contract' ? 1 : undefined,
      without_active_contract: filters.contractFilter === 'without_active_contract' ? 1 : undefined,
    }
    await employeeStore.fetchEmployees(params)
  } catch {
    toast.error('حدث خطأ أثناء جلب بيانات الموظفين.')
  }
}

onMounted(async () => {
  handlePageChange(1)

  if (departmentStore.flatDepartments.length === 0) await departmentStore.fetchDepartments()
  if (positionStore.flatPositions.length === 0) await positionStore.fetchPositions()
})

const goToCreate = () => {
  router.push({ name: 'employees.create' })
}

const goToEdit = (employee) => {
  router.push({ name: 'employees.edit', params: { id: employee.id } })
}

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
  } catch {
    toast.error(employeeStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    employeeToDelete.value = null
  }
}

const isStatementModalOpen = ref(false)
const selectedEmployeeIdForStatement = ref(null)
const isCardModalOpen = ref(false)
const selectedEmployeeForCard = ref(null)

const openCardModal = (employee) => {
  selectedEmployeeForCard.value = employee
  isCardModalOpen.value = true
}

const printIdentityCard = () => {
  window.print()
}

const openStatementModal = (employee) => {
  selectedEmployeeIdForStatement.value = employee.id
  isStatementModalOpen.value = true
}

const isShiftModalOpen = ref(false)
const selectedEmployeeForShift = ref(null)

const openShiftModal = (employee) => {
  selectedEmployeeForShift.value = employee
  isShiftModalOpen.value = true
}

const isDocumentsModalOpen = ref(false)
const selectedEmployeeForDocuments = ref(null)

const openDocumentsModal = (employee) => {
  selectedEmployeeForDocuments.value = {
    id: employee.id,
    name: employee.full_name,
    employee_number: employee.employee_number,
  }
  isDocumentsModalOpen.value = true
}
</script>
