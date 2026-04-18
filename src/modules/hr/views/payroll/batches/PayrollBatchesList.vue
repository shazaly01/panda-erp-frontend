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
        class="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-section p-4 rounded-xl border border-surface-border"
      >
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          <div class="w-full sm:w-auto min-w-[200px]">
            <label class="block text-xs font-bold text-text-muted mb-1">مجموعة الدفع</label>
            <select
              v-model="selectedPayGroupId"
              class="w-full px-3 py-2 bg-surface-ground border border-surface-border rounded-lg text-text-primary focus:border-primary outline-none text-sm"
            >
              <option value="">-- اختر المجموعة --</option>
              <option v-for="group in payGroupStore.groups" :key="group.id" :value="group.id">
                {{ group.name }} ({{ formatFrequency(group.frequency) }})
              </option>
            </select>
          </div>

          <div class="w-full sm:w-auto min-w-[200px]" v-if="selectedPayGroupId">
            <label class="block text-xs font-bold text-text-muted mb-1">الفترة المالية</label>
            <select
              v-model="selectedPayPeriodId"
              class="w-full px-3 py-2 bg-surface-ground border border-surface-border rounded-lg text-text-primary focus:border-primary outline-none text-sm"
              :disabled="payPeriodStore.loading"
            >
              <option value="">-- اختر الفترة --</option>
              <option v-for="period in payPeriodStore.periods" :key="period.id" :value="period.id">
                {{ period.name }} ({{ period.start_date }} إلى {{ period.end_date }})
              </option>
            </select>
            <span
              v-if="payPeriodStore.periods.length === 0 && !payPeriodStore.loading"
              class="text-xs text-rose-500 block mt-1"
              >لا توجد فترات مفتوحة لهذه المجموعة.</span
            >
          </div>

          <div class="w-full sm:w-auto min-w-[200px]" v-if="selectedPayPeriodId">
            <label class="block text-xs font-bold text-text-muted mb-1"
              >نوع المسير (Run Type)</label
            >
            <select
              v-model="selectedRunType"
              class="w-full px-3 py-2 bg-surface-ground border border-surface-border rounded-lg text-text-primary focus:border-primary outline-none text-sm"
            >
              <option value="regular">راتب اعتيادي (شامل)</option>
              <option value="overtime_only">مسير إضافي فقط (Overtime)</option>
            </select>
          </div>
        </div>

        <AppButton
          v-if="selectedEmployees.length > 0 && authStore.can('payroll.post') && isReadyToProcess"
          @click="openPostingModal"
          class="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md shadow-emerald-500/20 w-full sm:w-auto mt-4 md:mt-0"
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

      <template v-if="isReadyToProcess">
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
                >
                  {{ item.full_name }}
                </span>
                <span class="text-xs font-mono text-text-muted">{{ item.employee_number }}</span>
              </div>
            </template>

            <template #cell-job_details="{ item }">
              <div
                class="flex flex-col"
                :class="{ 'opacity-50': payrollStore.processedEmployeeIds.includes(item.id) }"
              >
                <span class="text-xs text-text-primary">{{ item.position?.name || '---' }}</span>
                <span class="text-[10px] text-text-muted">{{
                  item.department?.name || '---'
                }}</span>
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
      </template>

      <div
        v-else
        class="bg-surface-ground border border-surface-border p-12 rounded-xl text-center flex flex-col items-center justify-center"
      >
        <svg
          class="w-16 h-16 text-text-muted/50 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 class="text-lg font-bold text-text-primary mb-2">لبدء مسير الرواتب</h3>
        <p class="text-text-muted max-w-md mx-auto">
          الرجاء اختيار مجموعة الدفع ثم تحديد الفترة المالية ونوع المسير لعرض الموظفين المستحقين
          والبدء في الإجراءات.
        </p>
      </div>
    </div>

    <div v-if="activeTab === 'history'">
      <PayrollHistoryTable />
    </div>

    <PayslipPreviewModal
      v-if="isPreviewModalOpen && selectedPeriodObject"
      v-model="isPreviewModalOpen"
      :employee="selectedEmployeeForPreview"
      :pay-period="selectedPeriodObject"
      :run-type="selectedRunType"
    />

    <PayrollPostingModal
      v-if="isPostingModalOpen && selectedPeriodObject"
      v-model="isPostingModalOpen"
      :employee-ids="selectedEmployees"
      :pay-period="selectedPeriodObject"
      :run-type="selectedRunType"
      @posted="onPayrollPosted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import { usePayrollStore } from '@/modules/hr/stores/payrollStore'
// 🚀 استيراد المتاجر الجديدة
import { usePayGroupStore } from '@/modules/hr/stores/payGroupStore'
import { usePayPeriodStore } from '@/modules/hr/stores/payPeriodStore'

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
const payGroupStore = usePayGroupStore()
const payPeriodStore = usePayPeriodStore()

const activeTab = ref('new')

// 🚀 الحالات الجديدة للمعمارية
const selectedPayGroupId = ref('')
const selectedPayPeriodId = ref('')
const selectedRunType = ref('regular')

const selectedEmployees = ref([])
const searchQuery = ref('')
const filterDepartment = ref('')

// دالة مساعدة لترجمة دورة المجموعة
const formatFrequency = (freq) => {
  const map = { monthly: 'شهري', weekly: 'أسبوعي', bi_weekly: 'نصف شهري', daily: 'يومي' }
  return map[freq] || freq
}

// 🚀 جلب كائن الفترة المحدد كاملاً (لتمريره للنوافذ المنبثقة)
const selectedPeriodObject = computed(() => {
  return payPeriodStore.periods.find((p) => p.id === selectedPayPeriodId.value) || null
})

// 🚀 التحقق من اكتمال الإعدادات لظهور القائمة
const isReadyToProcess = computed(() => {
  return selectedPayGroupId.value && selectedPayPeriodId.value && selectedRunType.value
})

// 🚀 فلترة الموظفين ذكياً: نجلب فقط الموظفين التابعين لمجموعة الدفع المحددة
const filteredEmployees = computed(() => {
  return employeeStore.employees.filter((emp) => {
    // التحقق 1: هل الموظف ينتمي للمجموعة المختارة؟ (يجب أن يكون العقد مرتبطاً بالمجموعة)
    // نفترض هنا أن الباك إند يرسل بيانات العقد النشط مع الموظف أو أنك ستجلبهم مفلترين من الباك إند.
    // مؤقتاً، سنتحقق إذا كان هناك ربط في البيانات المتاحة.
    const empPayGroupId = emp.current_contract?.pay_group_id || emp.pay_group_id
    const matchesGroup =
      !selectedPayGroupId.value || String(empPayGroupId) === String(selectedPayGroupId.value)

    // التحقق 2: البحث والإدارة
    const matchesSearch =
      emp.full_name.includes(searchQuery.value) ||
      (emp.employee_number && emp.employee_number.toString().includes(searchQuery.value))
    const matchesDept = filterDepartment.value
      ? emp.department?.id === filterDepartment.value
      : true

    return matchesGroup && matchesSearch && matchesDept
  })
})

const availableDepartments = computed(() => {
  const deps = new Map()
  filteredEmployees.value.forEach((emp) => {
    if (emp.department) deps.set(emp.department.id, emp.department.name)
  })
  return Array.from(deps, ([id, name]) => ({ id, name }))
})

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
  // جلب البيانات الأساسية
  if (employeeStore.employees.length === 0) {
    await employeeStore.fetchEmployees({ per_page: 500, is_active: 1 }) // يفضل تعديل الـ API ليجلب العقد الحالي معه
  }
  // جلب مجموعات الدفع
  await payGroupStore.fetchPayGroups({ is_active: 1 })
})

// 🚀 مراقب 1: عند تغيير المجموعة -> نجلب فتراتها المفتوحة ونُفرّغ الفترات السابقة
watch(selectedPayGroupId, async (newGroupId) => {
  selectedPayPeriodId.value = ''
  selectedEmployees.value = []
  if (newGroupId) {
    await payPeriodStore.fetchOpenPeriods(newGroupId)
  } else {
    payPeriodStore.periods = []
  }
})

// 🚀 مراقب 2: عند اكتمال الإعدادات -> نجلب الأقفال (من صُرف له) لتحديث الصح الأخضر
watch([selectedPayPeriodId, selectedRunType], async ([newPeriodId, newRunType]) => {
  selectedEmployees.value = []
  if (newPeriodId && newRunType) {
    await payrollStore.fetchProcessedEmployees(newPeriodId, newRunType)
  }
})

// 🚀 مراقب 3: تحديث الملخص عند تحديد الموظفين
watch(
  [selectedEmployees, selectedPayPeriodId, selectedRunType],
  async ([newEmployees, newPeriod, newRunType]) => {
    if (newEmployees.length > 0 && newPeriod && newRunType) {
      await payrollStore.fetchBatchSummary(newEmployees, newPeriod, newRunType)
    } else {
      payrollStore.fetchBatchSummary([], null, null)
    }
  },
  { deep: true },
)

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
  // تحديث الأقفال
  await payrollStore.fetchProcessedEmployees(selectedPayPeriodId.value, selectedRunType.value)
  // إذا تم إغلاق الفترة (لأنها Regular)، قد نحتاج لتحديث قائمة الفترات
  if (selectedRunType.value === 'regular') {
    await payPeriodStore.fetchOpenPeriods(selectedPayGroupId.value)
    selectedPayPeriodId.value = '' // إجبار المستخدم على اختيار فترة جديدة
  }

  activeTab.value = 'history'
  payrollStore.fetchBatchesHistory()
}
</script>
