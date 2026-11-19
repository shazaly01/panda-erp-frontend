<!-- src/modules/hr/views/employees/EmployeeProfile.vue -->
<template>
  <div class="space-y-3 max-w-7xl mx-auto pb-12 text-right font-sans" dir="rtl">
    <!-- مؤشر التحميل -->
    <FullScreenLoader :show="isLoading" message="جاري تحميل ملف الموظف..." />

    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="goBack"
          class="p-1.5 rounded-lg bg-surface-card border border-surface-border text-text-secondary hover:text-primary hover:border-primary/60 transition-colors shadow-2xs cursor-pointer"
          title="العودة لقائمة الموظفين"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <h1 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3.5 bg-primary rounded-full"></span>
          <span>ملف الموظف</span>
        </h1>

        <span
          v-if="employee?.employee_number"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          #{{ employee.employee_number }}
        </span>
      </div>

      <AppButton
        v-if="authStore.can('hr.employees.update') && employee"
        size="sm"
        @click="goToEdit"
        icon="pencil"
      >
        تعديل البيانات
      </AppButton>
    </div>

    <!-- المحتوى الرئيسي -->
    <div v-if="!isLoading && employee" class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      <!-- العمود الجانبي: بطاقة الهوية الوظيفية والاتصال -->
      <div class="lg:col-span-4 space-y-3">
        <!-- بطاقة تعريف الموظف -->
        <div
          class="p-5 bg-surface-header/70 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm text-center transition-colors duration-200"
        >
          <div
            class="w-20 h-20 rounded-2xl bg-primary/15 border-2 border-primary/40 text-primary flex items-center justify-center text-2xl font-black mx-auto mb-3 shadow-xs overflow-hidden"
          >
            <img
              v-if="employee.profile_photo?.url || employee.avatar"
              :src="employee.profile_photo?.url || employee.avatar"
              :alt="employee.full_name"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ getInitials(employee.full_name) }}</span>
          </div>

          <h2 class="text-base sm:text-lg font-black text-text-primary leading-snug">
            {{ employee.full_name }}
          </h2>
          <p class="text-xs text-text-secondary font-mono font-bold mt-0.5">
            #{{ employee.employee_number }}
          </p>

          <div class="mt-3 flex justify-center">
            <AppBadge :variant="getStatusVariant(employee.status)" size="sm" pill>
              {{ employee.status_label || 'على رأس العمل' }}
            </AppBadge>
          </div>

          <div
            class="mt-5 pt-4 border-t border-primary/15 text-right space-y-2.5 bg-surface-card p-3.5 rounded-xl border border-surface-border shadow-2xs"
          >
            <div
              class="flex justify-between items-center text-xs border-b border-surface-border/60 pb-2"
            >
              <span class="text-text-muted font-bold">الإدارة / القسم</span>
              <span class="font-bold text-text-primary">{{
                employee.department?.name || '---'
              }}</span>
            </div>

            <div
              class="flex justify-between items-center text-xs border-b border-surface-border/60 pb-2"
            >
              <span class="text-text-muted font-bold">المسمى الوظيفي</span>
              <span class="font-bold text-text-primary">{{
                employee.position?.name || '---'
              }}</span>
            </div>

            <div
              class="flex justify-between items-center text-xs border-b border-surface-border/60 pb-2"
            >
              <span class="text-text-muted font-bold">المدير المباشر</span>
              <span class="font-bold text-text-primary">{{
                employee.manager?.full_name || '---'
              }}</span>
            </div>

            <div class="flex justify-between items-center text-xs">
              <span class="text-text-muted font-bold">تاريخ الالتحاق</span>
              <span class="font-mono font-bold text-primary">{{
                employee.join_date || '---'
              }}</span>
            </div>
          </div>
        </div>

        <!-- بطاقة معلومات الاتصال -->
        <div
          class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs space-y-3"
        >
          <h3
            class="text-xs font-black text-text-primary border-b border-surface-border/80 pb-2 flex items-center gap-1.5"
          >
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>معلومات الاتصال</span>
          </h3>

          <div class="space-y-2.5">
            <div
              class="flex items-center gap-2.5 p-2 rounded-lg bg-surface-card border border-surface-border text-xs"
            >
              <svg
                class="w-4 h-4 text-primary shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span dir="ltr" class="text-text-primary font-mono truncate">
                {{ employee.email || 'لا يوجد بريد إلكتروني' }}
              </span>
            </div>

            <div
              class="flex items-center gap-2.5 p-2 rounded-lg bg-surface-card border border-surface-border text-xs"
            >
              <svg
                class="w-4 h-4 text-primary shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span dir="ltr" class="text-text-primary font-mono font-bold">
                {{ employee.phone || 'لا يوجد رقم هاتف' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- العمود الرئيسي: التبويبات والمحتوى -->
      <div class="lg:col-span-8 space-y-3">
        <!-- شريط التبويبات -->
        <div
          class="flex bg-surface-section border border-surface-border rounded-xl p-1.5 gap-1.5 overflow-x-auto shrink-0 shadow-2xs"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            @click="activeTab = tab.id"
            class="flex-1 py-2 px-3.5 text-xs font-black rounded-lg transition-all whitespace-nowrap cursor-pointer"
            :class="
              activeTab === tab.id
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-primary hover:bg-surface-card'
            "
          >
            {{ tab.name }}
          </button>
        </div>

        <!-- بطاقة محتوى التبويب النشط -->
        <div
          class="p-5 bg-surface-section rounded-xl border border-surface-border shadow-xs min-h-[380px] transition-colors duration-200"
        >
          <!-- التبويب 1: البيانات الشخصية والوظيفية -->
          <div v-if="activeTab === 'general'" class="space-y-4">
            <h3
              class="text-xs sm:text-sm font-black text-text-primary pb-2 border-b border-surface-border/80 flex items-center gap-1.5"
            >
              <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
              <span>التفاصيل الديموغرافية والوظيفية</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="p-3 rounded-xl bg-surface-card border border-surface-border">
                <p class="text-[11px] font-bold text-text-muted mb-1">رقم الهوية / الإقامة</p>
                <p class="text-sm font-mono font-bold text-text-primary">
                  {{ employee.national_id || '---' }}
                </p>
              </div>

              <div class="p-3 rounded-xl bg-surface-card border border-surface-border">
                <p class="text-[11px] font-bold text-text-muted mb-1">نوع التوظيف</p>
                <p class="text-sm font-bold text-text-primary">
                  {{ getEmploymentType(employee.employment_type) || '---' }}
                </p>
              </div>

              <div class="p-3 rounded-xl bg-surface-card border border-surface-border">
                <p class="text-[11px] font-bold text-text-muted mb-1">الجنس</p>
                <p class="text-sm font-bold text-text-primary">
                  {{
                    employee.gender === 'male'
                      ? 'ذكر'
                      : employee.gender === 'female'
                        ? 'أنثى'
                        : '---'
                  }}
                </p>
              </div>

              <div class="p-3 rounded-xl bg-surface-card border border-surface-border">
                <p class="text-[11px] font-bold text-text-muted mb-1">الحالة الاجتماعية</p>
                <p class="text-sm font-bold text-text-primary">
                  {{ getMaritalStatus(employee.marital_status) || '---' }}
                </p>
              </div>
            </div>
          </div>

          <!-- التبويب 2: الورديات والدوام -->
          <div v-if="activeTab === 'shifts'" class="space-y-4">
            <div
              class="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-surface-border/80"
            >
              <h3 class="text-xs sm:text-sm font-black text-text-primary flex items-center gap-1.5">
                <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
                <span>إعدادات الدوام والورديات</span>
              </h3>
              <AppButton v-if="authStore.can('hr.shifts.create')" @click="openShiftModal" size="sm">
                تعيين وردية جديدة
              </AppButton>
            </div>

            <!-- بطاقة الوردية النشطة -->
            <div
              class="bg-surface-header/60 rounded-xl border border-surface-border border-r-4 border-r-primary p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs"
            >
              <div class="space-y-1">
                <p class="text-[11px] font-bold text-text-secondary">الوردية النشطة حالياً</p>
                <div v-if="employee.current_shift" class="flex items-center gap-2.5 flex-wrap">
                  <span class="font-black text-sm text-text-primary">
                    {{ employee.current_shift.shift_name }}
                  </span>
                  <span
                    class="text-xs font-mono font-bold bg-surface-card text-primary px-2.5 py-0.5 rounded-lg border border-primary/30"
                  >
                    تبدأ من: {{ employee.current_shift.start_date }}
                  </span>
                </div>
                <div v-else class="text-xs text-danger font-bold">
                  لم يتم تعيين وردية نشطة لهذا الموظف!
                </div>
              </div>
            </div>

            <!-- السجل التاريخي للورديات -->
            <div class="space-y-2.5 pt-1">
              <h4 class="text-xs font-black text-text-secondary">السجل التاريخي للورديات</h4>

              <div
                v-if="isLoadingShifts"
                class="text-center py-6 text-xs font-bold text-text-muted"
              >
                جاري تحميل السجل التاريخي...
              </div>

              <div
                v-else-if="employeeShifts.length === 0"
                class="text-center py-8 text-text-muted text-xs font-medium bg-surface-card border border-dashed border-surface-border rounded-xl"
              >
                لا يوجد سجل ورديات سابق.
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="shiftLog in employeeShifts"
                  :key="shiftLog.id"
                  class="flex flex-wrap justify-between items-center gap-2 p-3 border border-surface-border rounded-xl bg-surface-card text-xs shadow-2xs"
                >
                  <div class="flex flex-col gap-0.5">
                    <span class="font-black text-text-primary">{{ shiftLog.shift_name }}</span>
                    <span class="text-[11px] text-text-muted">
                      العطلة الأسبوعية: {{ shiftLog.weekend_days?.join('، ') || 'بدون عطلة' }}
                    </span>
                  </div>

                  <div
                    class="text-left font-mono text-[11px] text-text-secondary flex flex-col gap-0.5"
                  >
                    <span>
                      من: <strong class="text-text-primary">{{ shiftLog.start_date }}</strong>
                    </span>
                    <span>
                      إلى:
                      <strong :class="shiftLog.end_date ? 'text-text-primary' : 'text-success'">
                        {{ shiftLog.end_date || 'مستمرة' }}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- التبويب 3: العقود والرواتب -->
          <div v-if="activeTab === 'contracts'" class="space-y-4">
            <h3
              class="text-xs sm:text-sm font-black text-text-primary pb-2 border-b border-surface-border/80 flex items-center gap-1.5"
            >
              <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
              <span>بيانات العقد الحالي</span>
            </h3>

            <div v-if="employee.current_contract" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="p-3.5 rounded-xl bg-surface-card border border-surface-border">
                <p class="text-[11px] font-bold text-text-muted mb-1">رقم العقد</p>
                <p class="text-sm font-mono font-black text-text-primary">
                  {{ employee.current_contract.contract_number || '---' }}
                </p>
              </div>

              <div class="p-3.5 rounded-xl bg-surface-card border border-surface-border">
                <p class="text-[11px] font-bold text-text-muted mb-1">هيكل الراتب</p>
                <p class="text-sm font-bold text-text-primary">
                  {{ employee.current_contract.salary_structure?.name || '---' }}
                </p>
              </div>

              <div
                class="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-primary shadow-2xs"
              >
                <p class="text-[11px] font-bold text-text-secondary mb-1">الراتب الأساسي</p>
                <p class="text-base font-mono font-black">
                  {{ employee.current_contract.basic_salary }}
                  {{ employee.current_contract.currency || '' }}
                </p>
              </div>

              <div class="p-3.5 rounded-xl bg-surface-card border border-surface-border">
                <p class="text-[11px] font-bold text-text-muted mb-1">تاريخ بداية العقد</p>
                <p class="text-sm font-mono font-bold text-text-primary">
                  {{ employee.current_contract.start_date || '---' }}
                </p>
              </div>
            </div>

            <div
              v-else
              class="text-center py-12 text-text-muted text-xs font-medium bg-surface-card border border-dashed border-surface-border rounded-xl"
            >
              لا يوجد عقد نشط ومُعتمد لهذا الموظف.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- نافذة تعيين الوردية -->
    <AssignEmployeeShiftModal
      v-if="isShiftModalOpen"
      v-model="isShiftModalOpen"
      :employee-id="employeeId"
      @saved="onShiftAssigned"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/authStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import { useShiftStore } from '@/modules/hr/stores/shiftStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'
import AssignEmployeeShiftModal from './components/AssignEmployeeShiftModal.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const authStore = useAuthStore()
const employeeStore = useEmployeeStore()
const shiftStore = useShiftStore()

const employeeId = computed(() => route.params.id)
const { singleEmployee: employee, loading: isLoading } = storeToRefs(employeeStore)
const { employeeShifts, loading: isLoadingShifts } = storeToRefs(shiftStore)

const activeTab = ref('general')
const tabs = [
  { id: 'general', name: 'البيانات الشخصية والوظيفية' },
  { id: 'shifts', name: 'الورديات والدوام' },
  { id: 'contracts', name: 'العقود والرواتب' },
]

const loadEmployeeData = async () => {
  try {
    await employeeStore.fetchEmployeeById(employeeId.value)
  } catch {
    toast.error('فشل جلب بيانات الموظف.')
    goBack()
  }
}

const loadEmployeeShifts = async () => {
  try {
    await shiftStore.fetchEmployeeShifts(employeeId.value)
  } catch {
    console.error('فشل جلب سجل الورديات')
  }
}

onMounted(() => {
  loadEmployeeData()
  loadEmployeeShifts()
})

const isShiftModalOpen = ref(false)

const openShiftModal = () => {
  isShiftModalOpen.value = true
}

const onShiftAssigned = async () => {
  await loadEmployeeData()
  await loadEmployeeShifts()
}

const goBack = () => router.push({ name: 'EmployeesList' })
const goToEdit = () => router.push({ name: 'employees.edit', params: { id: employeeId.value } })

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

const getStatusVariant = (status) => {
  const map = {
    active: 'success',
    in_service: 'success',
    probation: 'info',
    training: 'info',
    on_leave: 'warning',
    leave: 'warning',
    resigned: 'secondary',
    terminated: 'danger',
    dismissed: 'danger',
  }
  return map[status] || 'secondary'
}

const getEmploymentType = (type) => {
  const types = { full_time: 'دوام كامل', part_time: 'دوام جزئي', contract: 'عقد', intern: 'تدريب' }
  return types[type] || type
}

const getMaritalStatus = (status) => {
  const statuses = {
    single: 'أعزب/عزباء',
    married: 'متزوج/ة',
    divorced: 'مطلق/ة',
    widowed: 'أرمل/ة',
  }
  return statuses[status] || status
}
</script>
