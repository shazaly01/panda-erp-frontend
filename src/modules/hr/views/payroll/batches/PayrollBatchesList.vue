<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-section p-5 rounded-xl border border-surface-border"
    >
      <div>
        <h1 class="text-2xl font-bold text-text-primary">مسيرات الرواتب</h1>
        <p class="text-sm text-text-muted mt-1">
          إعداد، معاينة، واعتماد رواتب الموظفين للشهر المحدد.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-4">
        <div class="flex items-center gap-2">
          <label for="payroll-month" class="text-sm font-medium text-text-primary"
            >شهر الاستحقاق:</label
          >
          <input
            id="payroll-month"
            type="month"
            v-model="selectedMonth"
            class="px-3 py-2 bg-surface-ground border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <AppButton
          v-if="selectedEmployees.length > 0 && authStore.can('payroll.post')"
          @click="openPostingModal"
          class="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md shadow-emerald-500/20"
        >
          <span class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            اعتماد وترحيل المحددين ({{ selectedEmployees.length }})
          </span>
        </AppButton>
      </div>
    </div>

    <AppCard class="overflow-hidden">
      <AppTable
        :headers="tableHeaders"
        :items="employeeStore.employees"
        :is-loading="employeeStore.loading"
      >
        <template #header-selection>
          <div class="flex items-center justify-center w-full">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
              class="w-4 h-4 text-primary bg-surface-ground border-surface-border rounded focus:ring-primary focus:ring-2 cursor-pointer"
              title="تحديد الكل"
            />
          </div>
        </template>

        <template #cell-selection="{ item }">
          <div class="flex items-center justify-center">
            <input
              type="checkbox"
              :value="item.id"
              v-model="selectedEmployees"
              class="w-4 h-4 text-primary bg-surface-ground border-surface-border rounded focus:ring-primary focus:ring-2 cursor-pointer"
            />
          </div>
        </template>

        <template #cell-employee_info="{ item }">
          <div class="flex flex-col gap-1 py-1">
            <span class="font-bold text-sm text-text-primary">{{ item.full_name }}</span>
            <span class="text-xs font-mono text-text-muted">{{ item.employee_number }}</span>
          </div>
        </template>

        <template #cell-job_details="{ item }">
          <div class="flex flex-col">
            <span class="text-xs text-text-primary">{{ item.position?.name || '---' }}</span>
            <span class="text-[10px] text-text-muted">{{ item.department?.name || '---' }}</span>
          </div>
        </template>

        <template #cell-actions="{ item }">
          <div class="flex items-center justify-end space-x-1 space-x-reverse">
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
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              معاينة الراتب
            </AppButton>
          </div>
        </template>
      </AppTable>
    </AppCard>

    <PayslipPreviewModal
      v-if="isPreviewModalOpen"
      v-model="isPreviewModalOpen"
      :employee="selectedEmployeeForPreview"
      :month="selectedMonth"
    />

    <PayrollPostingModal
      v-if="isPostingModalOpen"
      v-model="isPostingModalOpen"
      :employee-ids="selectedEmployees"
      :month="selectedMonth"
      @posted="onPayrollPosted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'

// استيراد المكونات من نفس المجلد مباشرة
import PayslipPreviewModal from './PayslipPreviewModal.vue'
import PayrollPostingModal from './PayrollPostingModal.vue'

import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const authStore = useAuthStore()
const employeeStore = useEmployeeStore()

// تحديد الشهر الافتراضي
const currentDate = new Date()
const defaultMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
const selectedMonth = ref(defaultMonth)

// الموظفين المحددين للاعتماد
const selectedEmployees = ref([])

const tableHeaders = computed(() => [
  { key: 'selection', label: '', class: 'w-12 text-center' },
  { key: 'employee_info', label: 'الموظف / الرقم', class: 'min-w-[200px]' },
  { key: 'job_details', label: 'الوظيفة / الإدارة', class: 'min-w-[150px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[150px]' },
])

onMounted(() => {
  if (employeeStore.employees.length === 0) {
    employeeStore.fetchEmployees({ per_page: 500, is_active: 1 })
  }
})

// -- منطق التحديد الشامل (Select All) --
const isAllSelected = computed(() => {
  return (
    employeeStore.employees.length > 0 &&
    selectedEmployees.value.length === employeeStore.employees.length
  )
})

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedEmployees.value = employeeStore.employees.map((emp) => emp.id)
  } else {
    selectedEmployees.value = []
  }
}

// -- منطق نافذة المعاينة --
const isPreviewModalOpen = ref(false)
const selectedEmployeeForPreview = ref(null)

const openPreviewModal = (employee) => {
  selectedEmployeeForPreview.value = employee
  isPreviewModalOpen.value = true
}

// -- منطق نافذة الاعتماد --
const isPostingModalOpen = ref(false)

const openPostingModal = () => {
  if (selectedEmployees.value.length === 0) return
  isPostingModalOpen.value = true
}

const onPayrollPosted = () => {
  selectedEmployees.value = [] // تفريغ التحديد بعد الاعتماد بنجاح
}
</script>
