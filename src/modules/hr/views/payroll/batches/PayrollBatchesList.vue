<template>
  <div class="space-y-4 max-w-7xl mx-auto pb-16">
    <!-- رأس الصفحة المدمج مع تبديل التبويبات -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-section px-5 py-3.5 rounded-2xl border border-surface-border shadow-sm"
    >
      <div class="flex items-center gap-3">
        <span class="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </span>
        <div>
          <h1 class="text-lg font-bold text-text-primary">إدارة مسيرات الرواتب</h1>
          <p class="text-xs text-text-muted">
            مراجعة مسير الشهر الحالي، توزيع المبلغ المستلم للصرف، والاعتماد المباشر.
          </p>
        </div>
      </div>

      <div class="flex p-1 bg-surface-ground rounded-xl border border-surface-border shrink-0">
        <button
          @click="activeTab = 'new'"
          :class="[
            activeTab === 'new'
              ? 'bg-surface-section shadow text-primary font-bold'
              : 'text-text-muted hover:text-text-primary font-medium',
            'px-4 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5',
          ]"
        >
          مسير الشهر الحالي
        </button>
        <button
          @click="activeTab = 'history'"
          :class="[
            activeTab === 'history'
              ? 'bg-surface-section shadow text-primary font-bold'
              : 'text-text-muted hover:text-text-primary font-medium',
            'px-4 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5',
          ]"
        >
          سجل المسيرات
        </button>
      </div>
    </div>

    <!-- تبويب 1: مسير الشهر الحالي -->
    <div v-show="activeTab === 'new'" class="space-y-4">
      <!-- شريط معايير الدورة المدمج -->
      <div class="bg-surface-section p-4 rounded-2xl border border-surface-border shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <!-- 1. مجموعة الدفع -->
          <div class="md:col-span-4">
            <label class="block text-[11px] font-bold text-text-muted mb-1">مجموعة الدفع</label>
            <select
              v-model="selectedPayGroupId"
              @change="onGroupChanged"
              :disabled="payrollStore.isInitializing"
              class="w-full px-3 py-2 bg-surface-ground border border-surface-border rounded-xl text-text-primary focus:border-primary outline-none text-sm transition-all disabled:opacity-50"
            >
              <option value="">-- اختر مجموعة الدفع --</option>
              <option v-for="group in availableGroups" :key="group.id" :value="group.id">
                {{ group.name }} ({{ formatFrequency(group.frequency) }})
              </option>
            </select>
          </div>

          <!-- 2. الفترة المالية -->
          <div class="md:col-span-4">
            <div class="flex items-center justify-between mb-1">
              <label class="text-[11px] font-bold text-text-muted">الفترة المالية</label>
              <span v-if="selectedPeriodObject" class="text-[11px] font-mono text-text-muted">
                {{ formatDateOnly(selectedPeriodObject.start_date) }} —
                {{ formatDateOnly(selectedPeriodObject.end_date) }}
              </span>
            </div>
            <select
              v-model="selectedPayPeriodId"
              @change="onPeriodOrTypeChanged"
              :disabled="!selectedPayGroupId || payrollStore.isInitializing"
              class="w-full px-3 py-2 bg-surface-ground border border-surface-border rounded-xl text-text-primary focus:border-primary outline-none text-sm transition-all disabled:opacity-50"
            >
              <option value="">-- اختر الفترة المالية --</option>
              <option v-for="period in availablePeriods" :key="period.id" :value="period.id">
                {{ period.name }} {{ period.status === 'closed' ? '(معتمدة)' : '' }}
              </option>
            </select>
          </div>

          <!-- 3. نوع المسير وحالته -->
          <div class="md:col-span-4">
            <div class="flex items-center justify-between mb-1">
              <label class="text-[11px] font-bold text-text-muted">نوع المسير</label>
              <span
                v-if="payrollStore.activeBatch && payrollStore.activeBatch.can_edit"
                class="text-[11px] font-bold text-primary"
              >
                مُرحّل وقابل للتعديل ({{ payrollStore.activeBatch.number }})
              </span>
              <span
                v-else-if="payrollStore.isCurrentBatchLocked"
                class="text-[11px] font-bold text-amber-500"
              >
                مقفل زمنياً
              </span>
              <span v-else-if="isReadyToProcess" class="text-[11px] font-bold text-emerald-500">
                جاهز للاعتماد
              </span>
            </div>
            <select
              v-model="selectedRunType"
              @change="onPeriodOrTypeChanged"
              :disabled="!selectedPayPeriodId || payrollStore.isInitializing"
              class="w-full px-3 py-2 bg-surface-ground border border-surface-border rounded-xl text-text-primary focus:border-primary outline-none text-sm transition-all disabled:opacity-50"
            >
              <option value="regular">مسير اعتيادي (شامل)</option>
              <option value="overtime_only">مسير عمل إضافي فقط</option>
            </select>
          </div>
        </div>
      </div>

      <!-- حالة التحميل الأولي التلقائي -->
      <div
        v-if="payrollStore.isInitializing"
        class="bg-surface-section border border-surface-border p-12 rounded-2xl text-center flex flex-col items-center justify-center shadow-sm"
      >
        <div class="animate-spin rounded-full h-9 w-9 border-b-2 border-primary mb-3"></div>
        <h3 class="text-sm font-bold text-text-primary">جاري تجهيز مسير الشهر الحالي...</h3>
      </div>

      <!-- محتوى المسير الجاهز -->
      <template v-else-if="isReadyToProcess">
        <!-- بطاقات الملخص المالي وإدخال المبلغ المستلم -->
        <PayrollSummaryCards />

        <!-- شريط التصفية والبحث والإجراءات السريعة -->
        <div
          class="sticky top-3 z-20 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-surface-section/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-surface-border shadow-md"
        >
          <div class="flex flex-1 flex-col sm:flex-row items-center gap-2.5">
            <div class="flex-1 w-full relative">
              <svg
                class="w-4 h-4 absolute right-3 top-2.5 text-text-muted"
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
                class="w-full pl-3 pr-9 py-1.5 bg-surface-ground border border-surface-border rounded-xl text-text-primary focus:border-primary outline-none text-sm"
              />
            </div>

            <div class="w-full sm:w-48">
              <select
                v-model="filterDepartment"
                class="w-full px-3 py-1.5 bg-surface-ground border border-surface-border rounded-xl text-text-primary focus:border-primary outline-none text-sm"
              >
                <option value="">كافة الإدارات</option>
                <option v-for="dept in availableDepartments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>

            <label
              v-if="processedCount > 0"
              class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-ground border border-surface-border text-xs text-text-muted hover:text-text-primary cursor-pointer select-none shrink-0"
            >
              <input
                type="checkbox"
                v-model="hideProcessed"
                class="w-3.5 h-3.5 text-primary bg-surface-section border-surface-border rounded cursor-pointer"
              />
              <span>إخفاء المرحلين ({{ processedCount }})</span>
            </label>
          </div>

          <!-- أزرار التحديد والاعتماد / الحفظ -->
          <div class="flex items-center gap-2.5 shrink-0 justify-end">
            <AppButton
              v-if="!payrollStore.isCurrentBatchLocked"
              size="sm"
              variant="secondary"
              @click="selectAllSelectable"
              :disabled="selectableEmployees.length === 0"
              class="text-xs"
            >
              تحديد الكل ({{ selectableEmployees.length }})
            </AppButton>

            <AppButton
              v-if="
                selectedEmployees.length > 0 &&
                !payrollStore.isCurrentBatchLocked &&
                authStore.can('hr.payroll.post')
              "
              @click="openPostingModal"
              :class="
                payrollStore.editingBatchId
                  ? 'bg-primary hover:bg-primary/90 shadow-primary/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              "
              class="text-white border-none shadow-lg text-xs font-bold px-4 py-2"
            >
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {{
                  payrollStore.editingBatchId
                    ? `حفظ وتحديث المسير (${selectedEmployees.length})`
                    : `اعتماد مسير (${selectedEmployees.length}) موظف`
                }}
              </span>
            </AppButton>
          </div>
        </div>

        <!-- جدول الموظفين المرتب أبجدياً مع تحديث الصرف والمتبقي لحظياً -->
        <AppCard class="overflow-hidden border border-surface-border rounded-2xl">
          <AppTable
            :headers="tableHeaders"
            :items="filteredEmployees"
            :is-loading="payrollStore.isEligibleLoading"
          >
            <!-- رأس التحديد -->
            <template #header-selection>
              <div class="flex items-center justify-center w-full">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :disabled="selectableEmployees.length === 0 || payrollStore.isCurrentBatchLocked"
                  @change="toggleSelectAll"
                  class="w-4 h-4 text-primary bg-surface-ground border-surface-border rounded cursor-pointer disabled:opacity-40"
                  title="تحديد الكل"
                />
              </div>
            </template>

            <!-- خلية التحديد والحالة -->
            <template #cell-selection="{ item }">
              <div class="flex items-center justify-center">
                <span
                  v-if="item.is_processed"
                  class="p-1 bg-emerald-500/10 text-emerald-600 rounded-full"
                  title="تم اعتماد راتب هذا الموظف في مسير آخر لهذه الدورة"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <input
                  v-else
                  type="checkbox"
                  :value="item.id"
                  v-model="selectedEmployees"
                  :disabled="payrollStore.isCurrentBatchLocked"
                  class="w-4 h-4 text-primary bg-surface-ground border-surface-border rounded cursor-pointer disabled:opacity-50"
                />
              </div>
            </template>

            <!-- خلية الموظف -->
            <template #cell-employee_info="{ item }">
              <div class="flex items-center gap-2.5 py-0.5">
                <div
                  class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0"
                >
                  {{ item.full_name?.charAt(0) || 'م' }}
                </div>
                <div class="flex flex-col">
                  <span
                    class="font-bold text-sm text-text-primary"
                    :class="{
                      'text-text-muted line-through': item.is_processed,
                    }"
                  >
                    {{ item.full_name }}
                  </span>
                  <span class="text-xs font-mono text-text-muted">#{{ item.employee_number }}</span>
                </div>
              </div>
            </template>

            <!-- خلية بيانات الوظيفة -->
            <template #cell-job_details="{ item }">
              <div class="flex flex-col">
                <span class="text-xs font-medium text-text-primary">{{
                  item.position?.name || '---'
                }}</span>
                <span class="text-[11px] text-text-muted">{{
                  item.department?.name || '---'
                }}</span>
              </div>
            </template>

            <!-- خلية صافي الاستحقاق (100%) -->
            <template #cell-net_salary="{ item }">
              <span
                v-if="employeeDisbursementMap[item.id]"
                class="font-mono font-bold text-sm text-text-primary"
              >
                {{ formatCurrency(employeeDisbursementMap[item.id].net_salary) }}
              </span>
              <span v-else class="text-xs text-text-muted">---</span>
            </template>

            <!-- خلية المقرر صرفه حالياً (تتحدث لحظياً أثناء الإدخال) -->
            <template #cell-paid_amount="{ item }">
              <span
                v-if="employeeDisbursementMap[item.id]"
                class="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400"
              >
                {{ formatCurrency(employeeDisbursementMap[item.id].paid_amount) }}
              </span>
              <span v-else class="text-xs text-text-muted">---</span>
            </template>

            <!-- خلية المتبقي (مديونية للموظف - تتحدث لحظياً أثناء الإدخال) -->
            <template #cell-remaining_amount="{ item }">
              <template v-if="employeeDisbursementMap[item.id]">
                <span
                  v-if="employeeDisbursementMap[item.id].remaining_amount > 0"
                  class="font-mono font-bold text-xs px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                >
                  {{ formatCurrency(employeeDisbursementMap[item.id].remaining_amount) }}
                </span>
                <span v-else class="font-mono text-xs text-text-muted">0.00</span>
              </template>
              <span v-else class="text-xs text-text-muted">---</span>
            </template>

            <!-- خلية الحالة -->
            <template #cell-status="{ item }">
              <span
                v-if="item.is_processed"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
              >
                مُرحّل بمسير آخر
              </span>
              <span
                v-else-if="isEmployeeInActiveBatch(item.id)"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                مدرج في المسير
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
              >
                جاهز للمسير
              </span>
            </template>

            <!-- خلية الإجراءات -->
            <template #cell-actions="{ item }">
              <div class="flex items-center justify-end">
                <AppButton
                  size="sm"
                  variant="secondary"
                  @click="openPreviewModal(item)"
                  class="flex items-center gap-1.5 text-xs text-primary hover:bg-primary/10 border-primary/20"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  القسيمة
                </AppButton>
              </div>
            </template>
          </AppTable>
        </AppCard>
      </template>

      <!-- حالة عدم وجود مجموعات دفع نشطة -->
      <div
        v-else
        class="bg-surface-section border border-surface-border p-12 rounded-2xl text-center flex flex-col items-center justify-center shadow-sm"
      >
        <h3 class="text-base font-bold text-text-primary mb-1">لا توجد دورة رواتب متاحة حالياً</h3>
        <p class="text-xs text-text-muted max-w-md mx-auto">
          يرجى التأكد من وجود مجموعة دفع نشطة وفترة مالية معرفة في إعدادات الرواتب.
        </p>
      </div>
    </div>

    <!-- تبويب 2: سجل المسيرات السابقة -->
    <div v-if="activeTab === 'history'">
      <PayrollHistoryTable @edit-batch="onEditBatchFromHistory" />
    </div>

    <!-- النافذة المنبثقة لمعاينة قسيمة الراتب الشفافة -->
    <PayslipPreviewModal
      v-if="isPreviewModalOpen && selectedPeriodObject"
      v-model="isPreviewModalOpen"
      :employee="selectedEmployeeForPreview"
      :pay-period="selectedPeriodObject"
      :run-type="selectedRunType"
    />

    <!-- النافذة المنبثقة للاعتماد النهائي أو التحديث المباشر -->
    <PayrollPostingModal
      v-if="isPostingModalOpen && selectedPeriodObject"
      v-model="isPostingModalOpen"
      :employee-ids="orderedSelectedEmployeeIds"
      :pay-period="selectedPeriodObject"
      :run-type="selectedRunType"
      @posted="onPayrollPosted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePayrollStore } from '@/modules/hr/stores/payrollStore'

import PayrollSummaryCards from './PayrollSummaryCards.vue'
import PayrollHistoryTable from './PayrollHistoryTable.vue'
import PayslipPreviewModal from './PayslipPreviewModal.vue'
import PayrollPostingModal from './PayrollPostingModal.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const authStore = useAuthStore()
const payrollStore = usePayrollStore()

const activeTab = ref('new')

// قوائم المجموعات والفترات القادمة من التهيئة التلقائية
const availableGroups = ref([])
const availablePeriods = ref([])

// حالات معايير المسير
const selectedPayGroupId = ref('')
const selectedPayPeriodId = ref('')
const selectedRunType = ref('regular')

// حالات التحديد والفلترة
const selectedEmployees = ref([])
const searchQuery = ref('')
const filterDepartment = ref('')
const hideProcessed = ref(false)

const formatFrequency = (freq) => {
  const map = {
    monthly: 'شهري',
    weekly: 'أسبوعي',
    bi_weekly: 'نصف شهري',
    daily: 'يومي',
  }
  return map[freq] || freq
}

const formatDateOnly = (val) => {
  if (!val) return ''
  return String(val).slice(0, 10)
}

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const selectedPeriodObject = computed(() => {
  return availablePeriods.value.find((p) => p.id === selectedPayPeriodId.value) || null
})

const isReadyToProcess = computed(() => {
  return Boolean(selectedPayGroupId.value && selectedPayPeriodId.value && selectedRunType.value)
})

// ترتيب الموظفين أبجدياً بالاسم
const groupEmployees = computed(() => {
  return [...payrollStore.eligibleEmployees].sort((a, b) =>
    (a.full_name || '').localeCompare(b.full_name || '', 'ar'),
  )
})

const processedCount = computed(() => {
  return groupEmployees.value.filter((emp) => emp.is_processed).length
})

const filteredEmployees = computed(() => {
  return groupEmployees.value.filter((emp) => {
    const search = searchQuery.value.trim().toLowerCase()
    const matchesSearch =
      !search ||
      emp.full_name?.toLowerCase().includes(search) ||
      (emp.employee_number && String(emp.employee_number).includes(search))

    const matchesDept = filterDepartment.value
      ? emp.department?.id === filterDepartment.value
      : true

    const matchesHide = hideProcessed.value ? !emp.is_processed : true

    return matchesSearch && matchesDept && matchesHide
  })
})

const availableDepartments = computed(() => {
  const deps = new Map()
  groupEmployees.value.forEach((emp) => {
    if (emp.department) {
      deps.set(emp.department.id, emp.department.name)
    }
  })
  return Array.from(deps, ([id, name]) => ({ id, name }))
})

const selectableEmployees = computed(() => {
  return filteredEmployees.value.filter((emp) => !emp.is_processed)
})

// معرفات الموظفين المحددين مرتبة أبجدياً لمطابقة ترتيب العرض والتقريب مع الخلفية
const orderedSelectedEmployeeIds = computed(() => {
  const selectedSet = new Set(selectedEmployees.value.map((id) => Number(id)))
  return groupEmployees.value.filter((emp) => selectedSet.has(Number(emp.id))).map((emp) => emp.id)
})

// خريطة توزيع الصرف والمتبقي لكل موظف محدد (تتحدث لحظياً أثناء كتابة المبلغ)
const employeeDisbursementMap = computed(() => {
  return payrollStore.computeEmployeesDisbursement(orderedSelectedEmployeeIds.value)
})

// فحص هل الموظف كان مدرجاً أصلاً في المسير القائم الجاري تعديله
const activeBatchEmployeeSet = computed(() => {
  const ids = payrollStore.activeBatch?.payslips
    ? Object.keys(payrollStore.activeBatch.payslips).map((id) => Number(id))
    : []
  return new Set(ids)
})

const isEmployeeInActiveBatch = (empId) => {
  return activeBatchEmployeeSet.value.has(Number(empId))
}

const tableHeaders = computed(() => [
  { key: 'selection', label: '', class: 'w-11 text-center' },
  { key: 'employee_info', label: 'الموظف', class: 'min-w-[190px]' },
  { key: 'job_details', label: 'الوظيفة والإدارة', class: 'min-w-[150px]' },
  { key: 'net_salary', label: 'صافي المستحق', class: 'text-left min-w-[120px]' },
  { key: 'paid_amount', label: 'المقرر صرفه', class: 'text-left min-w-[120px]' },
  { key: 'remaining_amount', label: 'المتبقي (مديونية)', class: 'text-left min-w-[120px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[125px]' },
  { key: 'actions', label: 'الإجراءات', class: 'text-left min-w-[105px]' },
])

// دالة موحدة لتطبيق استجابة التهيئة التلقائية على حالة الشاشة
const applyInitializationData = (data) => {
  availableGroups.value = data.groups || []
  availablePeriods.value = data.periods || []
  selectedPayGroupId.value = data.selected_group_id || ''
  selectedPayPeriodId.value = data.selected_period?.id || ''
  selectedRunType.value = data.run_type || 'regular'
  selectedEmployees.value = Array.isArray(data.selected_employee_ids)
    ? [...data.selected_employee_ids]
    : []
}

// التحميل التلقائي لمسير الشهر الحالي فور فتح الصفحة
onMounted(async () => {
  const data = await payrollStore.initializePayroll()
  applyInitializationData(data)
})

// عند تغيير مجموعة الدفع يدوياً
const onGroupChanged = async () => {
  filterDepartment.value = ''
  const params = selectedPayGroupId.value
    ? { pay_group_id: selectedPayGroupId.value, run_type: selectedRunType.value }
    : {}
  const data = await payrollStore.initializePayroll(params)
  applyInitializationData(data)
}

// عند تغيير الفترة المالية أو نوع المسير يدوياً
const onPeriodOrTypeChanged = async () => {
  if (!selectedPayGroupId.value || !selectedPayPeriodId.value) return
  const data = await payrollStore.initializePayroll({
    pay_group_id: selectedPayGroupId.value,
    pay_period_id: selectedPayPeriodId.value,
    run_type: selectedRunType.value,
  })
  applyInitializationData(data)
}

// تحديث ملخص الحساب المالي وتوزيع الصرف عند تغيير اختيار الموظفين
watch(
  [selectedEmployees, selectedPayPeriodId, selectedRunType],
  async ([newEmployees, newPeriodId, newRunType]) => {
    if (newEmployees.length > 0 && newPeriodId && newRunType) {
      await payrollStore.fetchBatchSummary(
        newEmployees,
        newPeriodId,
        newRunType,
        payrollStore.editingBatchId,
      )
    } else {
      await payrollStore.fetchBatchSummary([], null, null)
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
  if (payrollStore.isCurrentBatchLocked) return
  if (event.target.checked) {
    selectedEmployees.value = selectableEmployees.value.map((emp) => emp.id)
  } else {
    selectedEmployees.value = []
  }
}

const selectAllSelectable = () => {
  if (payrollStore.isCurrentBatchLocked) return
  selectedEmployees.value = selectableEmployees.value.map((emp) => emp.id)
}

// التحكم بنافذة المعاينة
const isPreviewModalOpen = ref(false)
const selectedEmployeeForPreview = ref(null)

const openPreviewModal = (employee) => {
  selectedEmployeeForPreview.value = employee
  isPreviewModalOpen.value = true
}

// التحكم بنافذة الاعتماد أو التحديث المباشر
const isPostingModalOpen = ref(false)

const openPostingModal = () => {
  if (selectedEmployees.value.length === 0 || payrollStore.isCurrentBatchLocked) return
  isPostingModalOpen.value = true
}

// بعد الاعتماد أو التحديث: إعادة تحميل حالة المسير المحدث وسجل المسيرات
const onPayrollPosted = async () => {
  const data = await payrollStore.initializePayroll({
    pay_group_id: selectedPayGroupId.value,
    pay_period_id: selectedPayPeriodId.value,
    run_type: selectedRunType.value,
  })
  applyInitializationData(data)
  payrollStore.fetchBatchesHistory()
}

// عند طلب تعديل مسير من جدول السجل
const onEditBatchFromHistory = async (batch) => {
  activeTab.value = 'new'
  const data = await payrollStore.initializePayroll({ batch_id: batch.id })
  applyInitializationData(data)
}
</script>
