<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-16">
    <!-- رأس الصفحة مع تبديل التبويبات -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-section p-5 rounded-2xl border border-surface-border shadow-sm"
    >
      <div>
        <h1 class="text-2xl font-bold text-text-primary flex items-center gap-2">
          <span class="p-2 bg-primary/10 text-primary rounded-xl">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </span>
          مركز إدارة مسيرات الرواتب
        </h1>
        <p class="text-sm text-text-muted mt-1">
          إعداد مسيرات جديدة، معاينة الاستحقاقات والخصومات، والترحيل المالي المباشر للحسابات.
        </p>
      </div>

      <div class="flex p-1 bg-surface-ground rounded-xl border border-surface-border">
        <button
          @click="activeTab = 'new'"
          :class="[
            activeTab === 'new'
              ? 'bg-surface-section shadow text-primary font-bold'
              : 'text-text-muted hover:text-text-primary font-medium',
            'px-5 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2',
          ]"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          إعداد مسير جديد
        </button>
        <button
          @click="activeTab = 'history'"
          :class="[
            activeTab === 'history'
              ? 'bg-surface-section shadow text-primary font-bold'
              : 'text-text-muted hover:text-text-primary font-medium',
            'px-5 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2',
          ]"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          سجل المسيرات المعتمدة
        </button>
      </div>
    </div>

    <!-- تبويب 1: إعداد مسير جديد -->
    <div v-show="activeTab === 'new'" class="space-y-6">
      <!-- شريط خطوات التحكم والتحديد (Control Toolbar) -->
      <div
        class="bg-surface-section p-5 rounded-2xl border border-surface-border shadow-sm space-y-4"
      >
        <div class="border-b border-surface-border pb-3 flex items-center justify-between">
          <span
            class="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2"
          >
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            معايير دورة الرواتب المستهدفة
          </span>
          <span
            v-if="selectedPeriodObject"
            class="text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold"
          >
            الفترة: {{ selectedPeriodObject.start_date }} إلى {{ selectedPeriodObject.end_date }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- الخطوة 1: مجموعة الدفع -->
          <div>
            <label
              class="block text-xs font-bold text-text-primary mb-1.5 flex items-center gap-1.5"
            >
              <span
                class="w-5 h-5 rounded-full bg-surface-ground border border-surface-border flex items-center justify-center text-[10px] font-bold"
                >1</span
              >
              مجموعة الدفع *
            </label>
            <select
              v-model="selectedPayGroupId"
              class="w-full px-3.5 py-2.5 bg-surface-ground border border-surface-border rounded-xl text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
            >
              <option value="">-- اختر مجموعة الدفع --</option>
              <option v-for="group in payGroupStore.groups" :key="group.id" :value="group.id">
                {{ group.name }} (دورية: {{ formatFrequency(group.frequency) }})
              </option>
            </select>
          </div>

          <!-- الخطوة 2: الفترة المالية -->
          <div>
            <label
              class="block text-xs font-bold text-text-primary mb-1.5 flex items-center gap-1.5"
            >
              <span
                class="w-5 h-5 rounded-full bg-surface-ground border border-surface-border flex items-center justify-center text-[10px] font-bold"
                >2</span
              >
              الفترة المالية المفتوحة *
            </label>
            <select
              v-model="selectedPayPeriodId"
              class="w-full px-3.5 py-2.5 bg-surface-ground border border-surface-border rounded-xl text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all disabled:opacity-50"
              :disabled="!selectedPayGroupId || payPeriodStore.loading"
            >
              <option value="">
                {{ !selectedPayGroupId ? 'اختر مجموعة الدفع أولاً' : '-- اختر الفترة المالية --' }}
              </option>
              <option v-for="period in payPeriodStore.periods" :key="period.id" :value="period.id">
                {{ period.name }}
              </option>
            </select>
            <span
              v-if="
                selectedPayGroupId && payPeriodStore.periods.length === 0 && !payPeriodStore.loading
              "
              class="text-xs text-rose-500 block mt-1"
            >
              لا توجد فترات مالية مفتوحة لهذه المجموعة.
            </span>
          </div>

          <!-- الخطوة 3: نوع المسير -->
          <div>
            <label
              class="block text-xs font-bold text-text-primary mb-1.5 flex items-center gap-1.5"
            >
              <span
                class="w-5 h-5 rounded-full bg-surface-ground border border-surface-border flex items-center justify-center text-[10px] font-bold"
                >3</span
              >
              نوع المسير التشغيلي *
            </label>
            <select
              v-model="selectedRunType"
              class="w-full px-3.5 py-2.5 bg-surface-ground border border-surface-border rounded-xl text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all disabled:opacity-50"
              :disabled="!selectedPayPeriodId"
            >
              <option value="regular">مسير اعتيادي (شامل للأساسي والبدلات والخصومات)</option>
              <option value="overtime_only">مسير عمل إضافي فقط (طوارئ الحرب والراحات)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- حالة الشاشة عند اكتمال الاختيارات وبدء التجهيز -->
      <template v-if="isReadyToProcess">
        <!-- بطاقات الملخص المالي اللحظي -->
        <PayrollSummaryCards />

        <!-- شريط التصفية والبحث والإجراءات السريعة (Sticky Bar) -->
        <div
          class="sticky top-4 z-20 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-surface-section/95 backdrop-blur-md p-4 rounded-2xl border border-surface-border shadow-md transition-all"
        >
          <div class="flex flex-1 flex-col sm:flex-row items-center gap-3">
            <div class="flex-1 w-full relative">
              <svg
                class="w-4 h-4 absolute right-3.5 top-3 text-text-muted"
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
                class="w-full pl-3.5 pr-10 py-2 bg-surface-ground border border-surface-border rounded-xl text-text-primary focus:border-primary outline-none text-sm"
              />
            </div>

            <div class="w-full sm:w-52">
              <select
                v-model="filterDepartment"
                class="w-full px-3 py-2 bg-surface-ground border border-surface-border rounded-xl text-text-primary focus:border-primary outline-none text-sm"
              >
                <option value="">كافة الإدارات</option>
                <option v-for="dept in availableDepartments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>

            <!-- إحصائيات سريعة وخيار إخفاء المرحلين -->
            <div class="flex items-center gap-2 self-start sm:self-center shrink-0">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold"
                title="عدد الموظفين الجاهزين للمسير"
              >
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                جاهز: {{ readyCount }}
              </span>

              <label
                v-if="processedCount > 0"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-ground border border-surface-border text-xs text-text-muted hover:text-text-primary cursor-pointer select-none transition-colors"
                title="إخفاء الموظفين الذين تم ترحيلهم بالفعل لهذه الدورة"
              >
                <input
                  type="checkbox"
                  v-model="hideProcessed"
                  class="w-3.5 h-3.5 text-primary bg-surface-section border-surface-border rounded cursor-pointer"
                />
                <span>إخفاء المرحلين ({{ processedCount }})</span>
              </label>
            </div>
          </div>

          <!-- أزرار الإجراء السريع والاعتماد -->
          <div class="flex items-center gap-3 shrink-0 justify-end">
            <AppButton
              size="sm"
              variant="secondary"
              @click="selectAllSelectable"
              :disabled="selectableEmployees.length === 0"
              class="text-xs"
            >
              تحديد الكل ({{ selectableEmployees.length }})
            </AppButton>

            <AppButton
              v-if="selectedEmployees.length > 0 && authStore.can('hr.payroll.post')"
              @click="openPostingModal"
              class="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-600/20 text-sm font-bold px-5"
            >
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                اعتماد مسير ({{ selectedEmployees.length }}) موظف
              </span>
            </AppButton>
          </div>
        </div>

        <!-- جدول الموظفين وحالة الاستحقاق -->
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
                  :disabled="selectableEmployees.length === 0"
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
                  title="تم اعتماد راتب هذا الموظف مسبقاً في هذه الدورة"
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
                  class="w-4 h-4 text-primary bg-surface-ground border-surface-border rounded cursor-pointer"
                />
              </div>
            </template>

            <!-- خلية الموظف -->
            <template #cell-employee_info="{ item }">
              <div class="flex items-center gap-3 py-1">
                <div
                  class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0"
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

            <!-- خلية الحالة -->
            <template #cell-status="{ item }">
              <span
                v-if="item.is_processed"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                تم الترحيل مسبقاً
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
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
                  معاينة القسيمة
                </AppButton>
              </div>
            </template>
          </AppTable>
        </AppCard>
      </template>

      <!-- شاشة الإرشاد قبل اختيار المعايير -->
      <div
        v-else
        class="bg-surface-section border border-surface-border p-14 rounded-2xl text-center flex flex-col items-center justify-center shadow-sm"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4"
        >
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-text-primary mb-1">ابدأ بتحديد معايير المسير</h3>
        <p class="text-sm text-text-muted max-w-md mx-auto leading-relaxed">
          يرجى اختيار مجموعة الدفع ثم تحديد الفترة المالية ونوع المسير من الشريط العلوي لاستعراض
          قائمة الموظفين المستحقين والبدء في المعاينة والاعتماد.
        </p>
      </div>
    </div>

    <!-- تبويب 2: سجل المسيرات السابقة -->
    <div v-if="activeTab === 'history'">
      <PayrollHistoryTable />
    </div>

    <!-- النافذة المنبثقة لمعاينة قسيمة الراتب -->
    <PayslipPreviewModal
      v-if="isPreviewModalOpen && selectedPeriodObject"
      v-model="isPreviewModalOpen"
      :employee="selectedEmployeeForPreview"
      :pay-period="selectedPeriodObject"
      :run-type="selectedRunType"
    />

    <!-- النافذة المنبثقة للاعتماد النهائي والترحيل المحاسبي -->
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
import { usePayrollStore } from '@/modules/hr/stores/payrollStore'
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
const payrollStore = usePayrollStore()
const payGroupStore = usePayGroupStore()
const payPeriodStore = usePayPeriodStore()

const activeTab = ref('new')

// حالات معايير المسير
const selectedPayGroupId = ref('')
const selectedPayPeriodId = ref('')
const selectedRunType = ref('regular')

// حالات التحديد والفلترة
const selectedEmployees = ref([])
const searchQuery = ref('')
const filterDepartment = ref('')
const hideProcessed = ref(false)

// دالة مساعدة لترجمة دورية الدفع
const formatFrequency = (freq) => {
  const map = {
    monthly: 'شهري',
    weekly: 'أسبوعي',
    bi_weekly: 'نصف شهري',
    daily: 'يومي',
  }
  return map[freq] || freq
}

// كائن الفترة المحدد كاملاً
const selectedPeriodObject = computed(() => {
  return payPeriodStore.periods.find((p) => p.id === selectedPayPeriodId.value) || null
})

// فحص اكتمال متطلبات بدء المعالجة
const isReadyToProcess = computed(() => {
  return Boolean(selectedPayGroupId.value && selectedPayPeriodId.value && selectedRunType.value)
})

// قائمة الموظفين المؤهلين القادمة مباشرة ومحسوبة بدقة من الخادم
const groupEmployees = computed(() => {
  return payrollStore.eligibleEmployees
})

// أعداد سريعة للإحصائيات بناءً على خاصية is_processed المباشرة
const processedCount = computed(() => {
  return groupEmployees.value.filter((emp) => emp.is_processed).length
})

const readyCount = computed(() => {
  return groupEmployees.value.filter((emp) => !emp.is_processed).length
})

// فلترة الموظفين حسب البحث، الإدارة، وخيار إخفاء المرحلين
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

// قائمة الإدارات المتاحة للموظفين المعروضين
const availableDepartments = computed(() => {
  const deps = new Map()
  filteredEmployees.value.forEach((emp) => {
    if (emp.department) {
      deps.set(emp.department.id, emp.department.name)
    }
  })
  return Array.from(deps, ([id, name]) => ({ id, name }))
})

// الموظفون المؤهلون للاختيار (الذين لم يتم ترحيل رواتبهم بعد)
const selectableEmployees = computed(() => {
  return filteredEmployees.value.filter((emp) => !emp.is_processed)
})

// أعمدة الجدول
const tableHeaders = computed(() => [
  { key: 'selection', label: '', class: 'w-12 text-center' },
  { key: 'employee_info', label: 'الموظف / الرقم الوظيفي', class: 'min-w-[220px]' },
  { key: 'job_details', label: 'الوظيفة والإدارة', class: 'min-w-[170px]' },
  { key: 'status', label: 'حالة الصرف', class: 'min-w-[140px]' },
  { key: 'actions', label: 'الإجراءات', class: 'text-left min-w-[120px]' },
])

onMounted(async () => {
  await payGroupStore.fetchPayGroups({ is_active: 1 })
})

// مراقب 1: تغيير مجموعة الدفع يفرغ الفترات السابقة ويجلب الفترات المفتوحة للمجموعة الجديدة
watch(selectedPayGroupId, async (newGroupId) => {
  selectedPayPeriodId.value = ''
  selectedEmployees.value = []
  payrollStore.eligibleEmployees = []
  if (newGroupId) {
    await payPeriodStore.fetchOpenPeriods(newGroupId)
  } else {
    payPeriodStore.periods = []
  }
})

// مراقب 2: جلب الموظفين المؤهلين بدقة من الخادم والتحديد التلقائي لغير المرحلين
watch([selectedPayPeriodId, selectedRunType], async ([newPeriodId, newRunType]) => {
  selectedEmployees.value = []
  if (newPeriodId && newRunType) {
    await payrollStore.fetchEligibleEmployees(newPeriodId, newRunType)
    // التحديد التلقائي لكافة المؤهلين الجاهزين (غير المرحلين) فور اكتمال الجلب
    selectedEmployees.value = selectableEmployees.value.map((emp) => emp.id)
  } else {
    payrollStore.eligibleEmployees = []
  }
})

// مراقب 3: تحديث ملخص الحساب المالي عند تغيير اختيار الموظفين
watch(
  [selectedEmployees, selectedPayPeriodId, selectedRunType],
  async ([newEmployees, newPeriodId, newRunType]) => {
    if (newEmployees.length > 0 && newPeriodId && newRunType) {
      await payrollStore.fetchBatchSummary(newEmployees, newPeriodId, newRunType)
    } else {
      payrollStore.fetchBatchSummary([], null, null)
    }
  },
  { deep: true },
)

// فحص اختيار الكل للموظفين المؤهلين
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

const selectAllSelectable = () => {
  selectedEmployees.value = selectableEmployees.value.map((emp) => emp.id)
}

// التحكم بنافذة المعاينة
const isPreviewModalOpen = ref(false)
const selectedEmployeeForPreview = ref(null)

const openPreviewModal = (employee) => {
  selectedEmployeeForPreview.value = employee
  isPreviewModalOpen.value = true
}

// التحكم بنافذة الاعتماد النهائي
const isPostingModalOpen = ref(false)

const openPostingModal = () => {
  if (selectedEmployees.value.length === 0) return
  isPostingModalOpen.value = true
}

// عند اكتمال الترحيل بنجاح
const onPayrollPosted = async () => {
  selectedEmployees.value = []

  // تحديث فوري لحالة الموظفين من الخادم (ستتغير حالة الموظفين المرحلين تلقائياً إلى is_processed = true)
  if (selectedPayPeriodId.value && selectedRunType.value) {
    await payrollStore.fetchEligibleEmployees(selectedPayPeriodId.value, selectedRunType.value)
  }

  if (selectedRunType.value === 'regular') {
    await payPeriodStore.fetchOpenPeriods(selectedPayGroupId.value)
    selectedPayPeriodId.value = ''
  }

  activeTab.value = 'history'
  payrollStore.fetchBatchesHistory()
}
</script>
