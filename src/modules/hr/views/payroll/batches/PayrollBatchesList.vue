<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-section p-5 rounded-xl border border-surface-border shadow-sm"
    >
      <div>
        <h1 class="text-2xl font-bold text-text-primary">إدارة مسيرات الرواتب</h1>
        <p class="text-sm text-text-muted mt-1">
          إعداد مسيرات جديدة، واعتماد الرواتب، ومراجعة سجل الترحيلات.
        </p>
      </div>
      <div class="flex p-1 bg-surface-ground rounded-lg border border-surface-border">
        <button
          @click="activeTab = 'new'"
          :class="[
            activeTab === 'new'
              ? 'bg-surface-section shadow text-primary font-bold'
              : 'text-text-muted hover:text-text-primary font-medium',
            'px-5 py-2 rounded-md text-sm transition-all',
          ]"
        >
          إعداد مسير جديد
        </button>
        <button
          @click="activeTab = 'history'"
          :class="[
            activeTab === 'history'
              ? 'bg-surface-section shadow text-primary font-bold'
              : 'text-text-muted hover:text-text-primary font-medium',
            'px-5 py-2 rounded-md text-sm transition-all',
          ]"
        >
          سجل المسيرات
        </button>
      </div>
    </div>

    <div v-show="activeTab === 'new'" class="space-y-6">
      <div
        class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-section p-4 rounded-xl border border-surface-border"
      >
        <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div class="flex items-center gap-2">
            <label class="text-sm font-bold text-text-primary">من تاريخ:</label>
            <input
              type="date"
              v-model="selectedStartDate"
              class="px-3 py-2 bg-surface-ground border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors font-mono text-sm"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-bold text-text-primary">إلى تاريخ:</label>
            <input
              type="date"
              v-model="selectedEndDate"
              class="px-3 py-2 bg-surface-ground border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors font-mono text-sm"
            />
          </div>
        </div>

        <AppButton
          v-if="selectedEmployees.length > 0 && authStore.can('payroll.post')"
          @click="openPostingModal"
          class="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md shadow-emerald-500/20 w-full sm:w-auto"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            اعتماد وترحيل ({{ selectedEmployees.length }}) موظف
          </span>
        </AppButton>
      </div>

      <PayrollSummaryCards />

      <div
        class="flex flex-col md:flex-row gap-4 bg-surface-section p-4 rounded-xl border border-surface-border"
      >
        <div class="flex-1 relative">
          <svg
            class="w-5 h-5 absolute right-3 top-2.5 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="بحث باسم الموظف أو رقمه الوظيفي..."
            class="w-full pl-3 pr-10 py-2 bg-surface-ground border border-surface-border rounded-lg text-text-primary focus:border-primary outline-none"
          />
        </div>
        <div class="w-full md:w-64">
          <select
            v-model="filterDepartment"
            class="w-full px-3 py-2 bg-surface-ground border border-surface-border rounded-lg text-text-primary focus:border-primary outline-none"
          >
            <option value="">جميع الإدارات والأقسام</option>
            <option v-for="dept in availableDepartments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
        </div>
      </div>

      <AppCard class="overflow-hidden">
        <AppTable
          :headers="tableHeaders"
          :items="filteredEmployees"
          :is-loading="employeeStore.loading"
        >
          <template #header-selection>
            <div class="flex items-center justify-center w-full">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :disabled="selectableEmployees.length === 0"
                @change="toggleSelectAll"
                class="w-4 h-4 text-primary bg-surface-ground border-surface-border rounded cursor-pointer disabled:opacity-50"
                title="تحديد الكل"
              />
            </div>
          </template>

          <template #cell-selection="{ item }">
            <div class="flex items-center justify-center">
              <div
                v-if="payrollStore.processedEmployeeIds.includes(item.id)"
                class="text-emerald-500"
                title="تم ترحيل الراتب في هذه الفترة"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <input
                v-else
                type="checkbox"
                :value="item.id"
                v-model="selectedEmployees"
                class="w-4 h-4 text-primary bg-surface-ground border-surface-border rounded cursor-pointer"
              />
            </div>
          </template>

          <template #cell-employee_info="{ item }">
            <div class="flex flex-col gap-1 py-1">
              <span
                class="font-bold text-sm text-text-primary"
                :class="{ 'opacity-50': payrollStore.processedEmployeeIds.includes(item.id) }"
                >{{ item.full_name }}</span
              >
              <span class="text-xs font-mono text-text-muted">{{ item.employee_number }}</span>
            </div>
          </template>

          <template #cell-job_details="{ item }">
            <div
              class="flex flex-col"
              :class="{ 'opacity-50': payrollStore.processedEmployeeIds.includes(item.id) }"
            >
              <span class="text-xs text-text-primary">{{ item.position?.name || '---' }}</span>
              <span class="text-[10px] text-text-muted">{{ item.department?.name || '---' }}</span>
            </div>
          </template>

          <template #cell-actions="{ item }">
            <div class="flex items-center justify-end">
              <AppButton
                size="sm"
                variant="secondary"
                @click="openPreviewModal(item)"
                class="flex items-center gap-1 text-xs"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                معاينة
              </AppButton>
            </div>
          </template>
        </AppTable>
      </AppCard>
    </div>

    <div v-if="activeTab === 'history'">
      <PayrollHistoryTable />
    </div>

    <PayslipPreviewModal
      v-if="isPreviewModalOpen"
      v-model="isPreviewModalOpen"
      :employee="selectedEmployeeForPreview"
      :start-date="selectedStartDate"
      :end-date="selectedEndDate"
    />

    <PayrollPostingModal
      v-if="isPostingModalOpen"
      v-model="isPostingModalOpen"
      :employee-ids="selectedEmployees"
      :start-date="selectedStartDate"
      :end-date="selectedEndDate"
      @posted="onPayrollPosted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import { usePayrollStore } from '@/modules/hr/stores/payrollStore'
import PayrollSummaryCards from './PayrollSummaryCards.vue'
import PayrollHistoryTable from './PayrollHistoryTable.vue'
import PayslipPreviewModal from './PayslipPreviewModal.vue'
import PayrollPostingModal from './PayrollPostingModal.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const authStore = useAuthStore()
const employeeStore = useEmployeeStore()
const payrollStore = usePayrollStore()

const activeTab = ref('new')

// 🚀 تهيئة التواريخ الافتراضية (من بداية الشهر الحالي إلى نهايته لضمان تجربة مستخدم سلسة)
const currentDate = new Date()
const y = currentDate.getFullYear()
const m = String(currentDate.getMonth() + 1).padStart(2, '0')
const firstDayOfMonth = `${y}-${m}-01`
const lastDayOfMonth = new Date(y, currentDate.getMonth() + 1, 0).toISOString().split('T')[0]

const selectedStartDate = ref(firstDayOfMonth)
const selectedEndDate = ref(lastDayOfMonth)

const selectedEmployees = ref([])

// متغيرات الفلترة
const searchQuery = ref('')
const filterDepartment = ref('')

// جلب الإدارات المتاحة للفلتر تلقائياً
const availableDepartments = computed(() => {
  const deps = new Map()
  employeeStore.employees.forEach((emp) => {
    if (emp.department) deps.set(emp.department.id, emp.department.name)
  })
  return Array.from(deps, ([id, name]) => ({ id, name }))
})

// فلترة الموظفين حسب البحث والإدارة
const filteredEmployees = computed(() => {
  return employeeStore.employees.filter((emp) => {
    const matchesSearch =
      emp.full_name.includes(searchQuery.value) ||
      (emp.employee_number && emp.employee_number.toString().includes(searchQuery.value))
    const matchesDept = filterDepartment.value
      ? emp.department?.id === filterDepartment.value
      : true
    return matchesSearch && matchesDept
  })
})

// استخراج الموظفين الذين يمكن تحديدهم (لم يتم ترحيلهم للفترة المحددة)
const selectableEmployees = computed(() => {
  return filteredEmployees.value.filter(
    (emp) => !payrollStore.processedEmployeeIds.includes(emp.id),
  )
})

const tableHeaders = computed(() => [
  { key: 'selection', label: '', class: 'w-12 text-center' },
  { key: 'employee_info', label: 'الموظف / الرقم', class: 'min-w-[200px]' },
  { key: 'job_details', label: 'الوظيفة / الإدارة', class: 'min-w-[150px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])

onMounted(async () => {
  if (employeeStore.employees.length === 0) {
    await employeeStore.fetchEmployees({ per_page: 500, is_active: 1 })
  }
  // جلب قائمة المرحلين للفترة الافتراضية عند فتح الشاشة
  await payrollStore.fetchProcessedEmployees(selectedStartDate.value, selectedEndDate.value)
})

// 🚀 تحديث الأقفال إذا قام المستخدم بتغيير التواريخ
watch([selectedStartDate, selectedEndDate], async ([newStart, newEnd]) => {
  selectedEmployees.value = []
  if (newStart && newEnd) {
    await payrollStore.fetchProcessedEmployees(newStart, newEnd)
  }
})

// 🚀 تحديث ملخص المسير المالي بناءً على الموظفين والتواريخ
watch(
  [selectedEmployees, selectedStartDate, selectedEndDate],
  async ([newEmployees, newStart, newEnd]) => {
    if (newEmployees.length > 0 && newStart && newEnd) {
      await payrollStore.fetchBatchSummary(newEmployees, newStart, newEnd)
    } else {
      // تفريغ الملخص إذا تم إلغاء تحديد الجميع
      payrollStore.fetchBatchSummary([], null, null)
    }
  },
  { deep: true },
)

// تحديد الكل الذكي
const isAllSelected = computed(() => {
  return (
    selectableEmployees.value.length > 0 &&
    selectedEmployees.value.length === selectableEmployees.value.length
  )
})

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedEmployees.value = selectableEmployees.value.map((emp) => emp.id)
  } else {
    selectedEmployees.value = []
  }
}

const isPreviewModalOpen = ref(false)
const selectedEmployeeForPreview = ref(null)
const openPreviewModal = (employee) => {
  selectedEmployeeForPreview.value = employee
  isPreviewModalOpen.value = true
}

const isPostingModalOpen = ref(false)
const openPostingModal = () => {
  if (selectedEmployees.value.length === 0) return
  isPostingModalOpen.value = true
}

const onPayrollPosted = async () => {
  selectedEmployees.value = []
  // تحديث الأقفال فوراً بعد الترحيل ليظهر الصح الأخضر
  await payrollStore.fetchProcessedEmployees(selectedStartDate.value, selectedEndDate.value)
  activeTab.value = 'history'
  payrollStore.fetchBatchesHistory()
}
</script>
