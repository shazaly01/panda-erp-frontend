<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          class="p-2 rounded-lg bg-surface-section border border-surface-border hover:bg-surface-border transition-colors"
          title="العودة للقائمة"
        >
          <svg class="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-text-primary">ملف الموظف</h1>
          <p class="text-sm text-text-muted mt-1">عرض شامل لبيانات الموظف، وحركاته، ووردياته.</p>
        </div>
      </div>

      <AppButton
        v-if="authStore.can('hr.employees.update') && employee"
        @click="goToEdit"
        variant="secondary"
        icon="pencil"
      >
        تعديل البيانات
      </AppButton>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="employee" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-4 space-y-6">
        <AppCard class="p-6 text-center">
          <div
            class="w-24 h-24 rounded-full bg-primary-50 text-primary flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-4 border-white shadow-sm"
          >
            {{ getInitials(employee.full_name) }}
          </div>
          <h2 class="text-xl font-bold text-text-primary">{{ employee.full_name }}</h2>
          <p class="text-sm text-text-secondary font-mono mt-1">{{ employee.employee_number }}</p>

          <div
            class="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
            :class="
              employee.status === 'active'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            "
          >
            {{
              employee.status_label || (employee.status === 'active' ? 'على رأس العمل' : 'غير نشط')
            }}
          </div>

          <div class="mt-6 pt-6 border-t border-surface-border text-start space-y-4">
            <div>
              <p class="text-xs text-text-muted mb-1">الإدارة / القسم</p>
              <p class="text-sm font-medium text-text-primary">
                {{ employee.department?.name || '---' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-text-muted mb-1">المسمى الوظيفي</p>
              <p class="text-sm font-medium text-text-primary">
                {{ employee.position?.name || '---' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-text-muted mb-1">المدير المباشر</p>
              <p class="text-sm font-medium text-text-primary">
                {{ employee.manager?.full_name || '---' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-text-muted mb-1">تاريخ الالتحاق</p>
              <p class="text-sm font-medium text-text-primary font-mono">
                {{ employee.join_date || '---' }}
              </p>
            </div>
          </div>
        </AppCard>

        <AppCard class="p-5">
          <h3 class="text-sm font-bold text-text-primary border-b border-surface-border pb-2 mb-3">
            معلومات الاتصال
          </h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3 text-sm">
              <svg
                class="w-5 h-5 text-text-muted shrink-0"
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
              <span class="text-text-primary truncate">{{ employee.email || 'لا يوجد بريد' }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <svg
                class="w-5 h-5 text-text-muted shrink-0"
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
              <span class="text-text-primary font-mono">{{
                employee.phone || 'لا يوجد هاتف'
              }}</span>
            </div>
          </div>
        </AppCard>
      </div>

      <div class="lg:col-span-8 space-y-4">
        <div
          class="flex bg-surface-section border border-surface-border rounded-xl p-1 overflow-x-auto shrink-0"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            :class="
              activeTab === tab.id
                ? 'bg-primary-50 text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-ground'
            "
          >
            {{ tab.name }}
          </button>
        </div>

        <AppCard class="p-6 min-h-[400px]">
          <div v-if="activeTab === 'general'" class="space-y-6">
            <h3
              class="text-lg font-bold text-text-primary mb-4 border-b border-surface-border pb-2"
            >
              التفاصيل الديموغرافية والوظيفية
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <InfoItem label="رقم الهوية / الإقامة" :value="employee.national_id" font="mono" />
              <InfoItem label="نوع التوظيف" :value="getEmploymentType(employee.employment_type)" />
              <InfoItem
                label="الجنس"
                :value="
                  employee.gender === 'male' ? 'ذكر' : employee.gender === 'female' ? 'أنثى' : '---'
                "
              />
              <InfoItem
                label="الحالة الاجتماعية"
                :value="getMaritalStatus(employee.marital_status)"
              />
            </div>
          </div>

          <div v-if="activeTab === 'shifts'" class="space-y-6">
            <div class="flex justify-between items-center border-b border-surface-border pb-3">
              <h3 class="text-lg font-bold text-text-primary">إعدادات الدوام والورديات</h3>
              <AppButton v-if="authStore.can('hr.shifts.create')" @click="openShiftModal" size="sm">
                تعيين وردية جديدة
              </AppButton>
            </div>

            <div
              class="bg-surface-ground rounded-lg border border-surface-border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <p class="text-xs text-text-muted mb-1">الوردية النشطة حالياً</p>
                <div v-if="employee.current_shift" class="flex items-center gap-3">
                  <span class="font-bold text-text-primary">{{
                    employee.current_shift.shift_name
                  }}</span>
                  <span
                    class="text-sm font-mono bg-white px-2 py-0.5 rounded border border-surface-border"
                  >
                    تبدأ من: {{ employee.current_shift.start_date }}
                  </span>
                </div>
                <div v-else class="text-sm text-rose-600 font-bold">
                  لم يتم تعيين وردية لهذا الموظف!
                </div>
              </div>
            </div>

            <div class="mt-6">
              <h4 class="text-sm font-bold text-text-secondary mb-3">السجل التاريخي للورديات</h4>
              <div v-if="isLoadingShifts" class="text-center py-4 text-text-muted">
                جاري تحميل السجل...
              </div>
              <div
                v-else-if="employeeShifts.length === 0"
                class="text-center py-4 text-text-muted text-sm border border-dashed rounded-lg"
              >
                لا يوجد سجل ورديات سابق.
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="shiftLog in employeeShifts"
                  :key="shiftLog.id"
                  class="flex justify-between items-center p-3 border border-surface-border rounded-lg bg-surface-section text-sm"
                >
                  <div class="flex flex-col">
                    <span class="font-bold text-text-primary">{{ shiftLog.shift_name }}</span>
                    <span class="text-xs text-text-muted mt-1"
                      >العطلة: {{ shiftLog.weekend_days?.join('، ') || 'بدون عطلة' }}</span
                    >
                  </div>
                  <div class="text-left font-mono text-xs text-text-secondary flex flex-col gap-1">
                    <span
                      >من:
                      <strong class="text-text-primary">{{ shiftLog.start_date }}</strong></span
                    >
                    <span
                      >إلى:
                      <strong class="text-text-primary">{{
                        shiftLog.end_date || 'مستمرة'
                      }}</strong></span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'contracts'" class="space-y-6">
            <h3
              class="text-lg font-bold text-text-primary mb-4 border-b border-surface-border pb-2"
            >
              بيانات العقد الحالي
            </h3>
            <div v-if="employee.current_contract" class="grid grid-cols-1 md:grid-cols-2 gap-y-6">
              <InfoItem
                label="رقم العقد"
                :value="employee.current_contract.contract_number"
                font="mono"
              />
              <InfoItem
                label="هيكل الراتب"
                :value="employee.current_contract.salary_structure?.name"
              />
              <InfoItem
                label="الراتب الأساسي"
                :value="
                  employee.current_contract.basic_salary + ' ' + employee.current_contract.currency
                "
                font="bold"
              />
              <InfoItem
                label="تاريخ بداية العقد"
                :value="employee.current_contract.start_date"
                font="mono"
              />
            </div>
            <div v-else class="text-center py-10 text-text-muted border border-dashed rounded-lg">
              لا يوجد عقد نشط ومُعتمد لهذا الموظف.
            </div>
          </div>
        </AppCard>
      </div>
    </div>

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
import { useShiftStore } from '@/modules/hr/stores/shiftStore' // استدعاء متجر الورديات

import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AssignEmployeeShiftModal from './components/AssignEmployeeShiftModal.vue'

// -- مكون داخلي بسيط لعرض الحقول --
const InfoItem = {
  props: ['label', 'value', 'font'],
  template: `
    <div>
      <p class="text-xs text-text-muted mb-1">{{ label }}</p>
      <p class="text-sm text-text-primary" :class="font === 'mono' ? 'font-mono' : (font === 'bold' ? 'font-bold text-primary' : 'font-medium')">
        {{ value || '---' }}
      </p>
    </div>
  `,
}

const route = useRoute()
const router = useRouter()
const toast = useToast()

const authStore = useAuthStore()
const employeeStore = useEmployeeStore()
const shiftStore = useShiftStore()

const employeeId = computed(() => route.params.id)
const { singleEmployee: employee, loading: isLoading } = storeToRefs(employeeStore)
const { employeeShifts, loading: isLoadingShifts } = storeToRefs(shiftStore)

// -- نظام التبويبات --
const activeTab = ref('general')
const tabs = [
  { id: 'general', name: 'البيانات الشخصية والوظيفية' },
  { id: 'shifts', name: 'الورديات والدوام' },
  { id: 'contracts', name: 'العقود والرواتب' },
]

// -- تحميل البيانات --
const loadEmployeeData = async () => {
  try {
    await employeeStore.fetchEmployeeById(employeeId.value)
  } catch (error) {
    toast.error('فشل جلب بيانات الموظف.')
    goBack()
  }
}

const loadEmployeeShifts = async () => {
  try {
    await shiftStore.fetchEmployeeShifts(employeeId.value)
  } catch (error) {
    console.error('فشل جلب سجل الورديات')
  }
}

onMounted(() => {
  loadEmployeeData()
  loadEmployeeShifts() // جلب السجل التاريخي للورديات ليعرض في تبويب الورديات
})

// -- نافذة تعيين الوردية --
const isShiftModalOpen = ref(false)

const openShiftModal = () => {
  isShiftModalOpen.value = true
}

const onShiftAssigned = async () => {
  // عند نجاح التعيين، نعيد تحميل بيانات الموظف (لتحديث current_shift) وسجل الورديات
  await loadEmployeeData()
  await loadEmployeeShifts()
}

// -- دوال مساعدة --
const goBack = () => router.push({ name: 'EmployeesList' })
const goToEdit = () => router.push({ name: 'employees.edit', params: { id: employeeId.value } })

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
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
