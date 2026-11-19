<!-- src/modules/hr/views/employees/EmployeeFormPage.vue -->
<template>
  <div class="space-y-3 max-w-5xl mx-auto pb-24 text-right font-sans" dir="rtl">
    <!-- مؤشر التحميل لكامل الشاشة -->
    <FullScreenLoader :show="isLoadingData" message="جاري تحميل بيانات الموظف..." />

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
          <span>{{ isEditMode ? 'تعديل بيانات الموظف' : 'تسجيل موظف جديد' }}</span>
        </h1>

        <span
          v-if="isEditMode && form.employee_number"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          #{{ form.employee_number }}
        </span>
      </div>

      <span v-if="isEditMode && form.full_name" class="text-xs font-bold text-text-secondary">
        الملف الوظيفي: <strong class="text-text-primary">{{ form.full_name }}</strong>
      </span>
    </div>

    <!-- محتوى النموذج -->
    <div v-if="!isLoadingData" class="space-y-3">
      <!-- 1. بطاقة البيانات الشخصية -->
      <div
        class="p-4 bg-surface-header/70 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm space-y-3 transition-colors duration-200"
      >
        <div class="flex items-center justify-between pb-1.5 border-b border-primary/15">
          <span class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>البيانات الشخصية ومعلومات الاتصال</span>
          </span>
          <span class="text-[10px] font-bold text-text-muted">الحقول المميزة بـ * إلزامية</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div class="lg:col-span-2">
            <AppInput
              id="full_name"
              label="الاسم الرباعي *"
              v-model="form.full_name"
              placeholder="مثال: أحمد محمد علي حسن"
              required
            />
          </div>

          <div>
            <AppInput
              id="national_id"
              label="رقم الهوية / الإقامة"
              v-model="form.national_id"
              class="font-mono text-left"
              dir="ltr"
              placeholder="أدخل رقم الهوية..."
            />
          </div>

          <div>
            <AppDropdown
              id="gender"
              label="الجنس"
              v-model="form.gender"
              :options="genderOptions"
              placeholder="-- اختر الجنس --"
            />
          </div>

          <div>
            <AppDropdown
              id="marital_status"
              label="الحالة الاجتماعية"
              v-model="form.marital_status"
              :options="maritalStatusOptions"
              placeholder="-- اختر الحالة الاجتماعية --"
            />
          </div>

          <div>
            <AppInput
              id="phone"
              label="رقم الهاتف"
              v-model="form.phone"
              class="font-mono text-left"
              dir="ltr"
              placeholder="+249..."
            />
          </div>

          <div class="lg:col-span-3">
            <AppInput
              id="email"
              type="email"
              label="البريد الإلكتروني الشخصي"
              v-model="form.email"
              class="font-mono text-left"
              dir="ltr"
              placeholder="example@domain.com"
            />
          </div>
        </div>
      </div>

      <!-- 2. بطاقة البيانات الوظيفية والتنظيمية -->
      <div
        class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs space-y-3 transition-colors duration-200"
      >
        <div class="flex items-center justify-between pb-1.5 border-b border-surface-border/80">
          <span class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>البيانات الوظيفية والتنظيمية</span>
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <AppInput
              id="employee_number"
              label="الرقم الوظيفي النظامي"
              v-model="form.employee_number"
              class="font-mono text-left font-bold"
              dir="ltr"
              placeholder="يُولّد تلقائياً عند الحفظ"
              disabled
            />
          </div>

          <div>
            <AppInput
              id="barcode"
              label="رقم الباركود (اختياري)"
              v-model="form.barcode"
              class="font-mono text-left font-bold text-primary"
              dir="ltr"
              placeholder="أدخل رقم البطاقة هنا..."
            />
          </div>

          <div>
            <AppInput
              id="join_date"
              type="date"
              label="تاريخ الالتحاق *"
              v-model="form.join_date"
              required
            />
          </div>

          <div>
            <AppDropdown
              id="employment_type"
              label="نوع التوظيف *"
              v-model="form.employment_type"
              :options="employmentTypeOptions"
              required
            />
          </div>

          <div>
            <AppDropdown
              id="status"
              label="حالة الموظف *"
              v-model="form.status"
              :options="statusOptions"
              required
            />
          </div>

          <div>
            <AppDropdown
              id="department_id"
              label="الإدارة / القسم"
              v-model="form.department_id"
              :options="departmentStore.flatDepartments"
              option-label="dropdownName"
              option-value="id"
              placeholder="-- اختر الإدارة --"
            />
          </div>

          <div>
            <AppDropdown
              id="position_id"
              label="المسمى الوظيفي"
              v-model="form.position_id"
              :options="positionStore.flatPositions"
              option-label="name"
              option-value="id"
              placeholder="-- اختر الوظيفة --"
            />
          </div>

          <div>
            <AppDropdown
              id="manager_id"
              label="المدير المباشر"
              v-model="form.manager_id"
              :options="availableManagers"
              option-label="full_name"
              option-value="id"
              placeholder="-- يتبع لمدير أعلى --"
            />
          </div>

          <div>
            <AppDropdown
              id="user_id"
              label="حساب النظام المرتبط (User)"
              v-model="form.user_id"
              :options="userStore.users"
              option-label="full_name"
              option-value="id"
              placeholder="-- اختر حساب الدخول --"
              :loading="userStore.loading"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- شريط الإجراءات السفلي الثابت -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex flex-wrap justify-between items-center gap-2 px-4 sm:px-6"
    >
      <div class="text-xs text-text-secondary font-medium">
        <span>يتم إنشاء الرقم الوظيفي والحساب الفرعي للموظف تلقائياً عند الاعتماد.</span>
      </div>

      <div class="flex items-center gap-2">
        <AppButton type="button" variant="secondary" size="sm" @click="goBack" :disabled="isSaving">
          إلغاء وتراجع
        </AppButton>
        <AppButton type="button" size="sm" @click="submit" :disabled="isSaving">
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'اعتماد وتسجيل الموظف' }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import { useDepartmentStore } from '@/modules/hr/stores/departmentStore'
import { usePositionStore } from '@/modules/hr/stores/positionStore'
import { useUserStore } from '@/stores/userStore'

import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()
const positionStore = usePositionStore()
const userStore = useUserStore()

const isEditMode = computed(() => route.name === 'employees.edit')
const employeeId = computed(() => route.params.id)

const isLoadingData = ref(false)
const isSaving = ref(false)

const genderOptions = [
  { id: 'male', name: 'ذكر' },
  { id: 'female', name: 'أنثى' },
]

const maritalStatusOptions = [
  { id: 'single', name: 'أعزب/عزباء' },
  { id: 'married', name: 'متزوج/ة' },
  { id: 'divorced', name: 'مطلق/ة' },
  { id: 'widowed', name: 'أرمل/ة' },
]

const employmentTypeOptions = [
  { id: 'full_time', name: 'دوام كامل' },
  { id: 'part_time', name: 'دوام جزئي' },
  { id: 'contract', name: 'تعاقد (مشروع)' },
  { id: 'intern', name: 'تدريب' },
]

const statusOptions = [
  { id: 'in_service', name: 'في الخدمة' },
  { id: 'leave', name: 'إجازة' },
  { id: 'dismissed', name: 'مفصول' },
  { id: 'end_of_service', name: 'انتهاء خدمة' },
  { id: 'temporarily_dismissed', name: 'مفصول مؤقتا' },
  { id: 'training', name: 'تحت التدريب' },
  { id: 'temporary_transfer', name: 'تحويل لفتره موقته' },
  { id: 'monthly_temporary_transfer', name: 'تحويل لفتره موقته شهري' },
]

const availableManagers = computed(() => {
  const allEmployees = employeeStore.allEmployees || []
  if (!isEditMode.value) return allEmployees
  return allEmployees.filter((emp) => emp.id !== Number(employeeId.value))
})

const defaultForm = () => ({
  full_name: '',
  national_id: '',
  email: '',
  phone: '',
  employee_number: '',
  barcode: '',
  join_date: new Date().toISOString().split('T')[0],
  gender: null,
  marital_status: null,
  employment_type: 'full_time',
  status: 'in_service',
  department_id: null,
  position_id: null,
  manager_id: null,
  user_id: null,
})

const form = ref(defaultForm())

onMounted(async () => {
  isLoadingData.value = true

  try {
    if (departmentStore.flatDepartments.length === 0) await departmentStore.fetchDepartments()
    if (positionStore.flatPositions.length === 0) await positionStore.fetchPositions()

    await Promise.all([employeeStore.fetchAllEmployees(), userStore.fetchUsers()])

    if (isEditMode.value) {
      const employeeData = await employeeStore.fetchEmployeeById(employeeId.value)

      form.value = {
        full_name: employeeData.full_name,
        national_id: employeeData.national_id || '',
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        employee_number: employeeData.employee_number,
        barcode: employeeData.barcode || '',
        join_date: employeeData.join_date,
        gender: employeeData.gender || null,
        marital_status: employeeData.marital_status || null,
        employment_type: employeeData.employment_type || 'full_time',
        status: employeeData.status || 'in_service',
        department_id: employeeData.department?.id || null,
        position_id: employeeData.position?.id || null,
        manager_id: employeeData.manager?.id || null,
        user_id: employeeData.user_id || null,
      }
    }
  } catch {
    toast.error('حدث خطأ أثناء تحميل البيانات. العودة للقائمة.')
    goBack()
  } finally {
    isLoadingData.value = false
  }
})

const goBack = () => {
  router.push({ name: 'EmployeesList' })
}

const submit = async () => {
  if (!form.value.full_name.trim()) return toast.error('الاسم الرباعي مطلوب.')
  if (!form.value.join_date) return toast.error('تاريخ الالتحاق مطلوب.')
  if (!form.value.employment_type) return toast.error('نوع التوظيف مطلوب.')

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await employeeStore.updateEmployee(employeeId.value, form.value)
      toast.success('تم تحديث بيانات الموظف بنجاح.')
    } else {
      await employeeStore.createEmployee(form.value)
      toast.success('تم تسجيل الموظف الجديد بنجاح.')
    }
    goBack()
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'فشل حفظ البيانات. يرجى مراجعة الحقول.'
    toast.error(errorMsg)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.65;
}
</style>
