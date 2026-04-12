<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    <div class="flex items-center justify-between">
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
          <h1 class="text-2xl font-bold text-text-primary">
            {{ isEditMode ? 'تعديل بيانات الموظف' : 'تسجيل موظف جديد' }}
          </h1>
          <p class="text-sm text-text-muted mt-1">
            {{
              isEditMode
                ? `تحديث السجل الوظيفي لـ ${form.full_name}`
                : 'إدخال البيانات الأساسية والوظيفية للموظف الجديد.'
            }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="isLoadingData" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>

    <div v-else class="space-y-6">
      <AppCard class="p-6">
        <h2
          class="text-lg font-bold text-text-primary mb-5 flex items-center gap-2 border-b border-surface-border pb-3"
        >
          <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          البيانات الشخصية
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
            />
          </div>

          <div>
            <AppDropdown id="gender" label="الجنس" v-model="form.gender" :options="genderOptions" />
          </div>
          <div>
            <AppDropdown
              id="marital_status"
              label="الحالة الاجتماعية"
              v-model="form.marital_status"
              :options="maritalStatusOptions"
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
          <div class="lg:col-span-2">
            <AppInput
              id="email"
              type="email"
              label="البريد الإلكتروني الشخصي"
              v-model="form.email"
              class="font-mono text-left"
              dir="ltr"
            />
          </div>
        </div>
      </AppCard>

      <AppCard class="p-6">
        <h2
          class="text-lg font-bold text-text-primary mb-5 flex items-center gap-2 border-b border-surface-border pb-3"
        >
          <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          البيانات الوظيفية
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <AppInput
              id="employee_number"
              label="رقم الموظف (الكود) *"
              v-model="form.employee_number"
              class="font-mono text-left font-bold"
              dir="ltr"
              required
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

          <div class="lg:col-span-3">
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
        </div>
      </AppCard>

      <div class="flex justify-end gap-3 pt-2">
        <AppButton variant="secondary" @click="goBack" :disabled="isSaving"> إلغاء </AppButton>
        <AppButton @click="submit" :disabled="isSaving">
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

import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()
const positionStore = usePositionStore()

const isEditMode = computed(() => route.name === 'employees.edit')
const employeeId = computed(() => route.params.id)

const isLoadingData = ref(false)
const isSaving = ref(false)

// --- خيارات القوائم المنسدلة (Enums) ---
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
  { id: 'active', name: 'نشط' },
  { id: 'on_leave', name: 'في إجازة' },
  { id: 'resigned', name: 'مستقيل' },
  { id: 'terminated', name: 'منهى خدماته' },
  { id: 'probation', name: 'فترة تجربة' },
]

// تصفية المدراء (استبعاد الموظف نفسه في حالة التعديل حتى لا يكون مديراً لنفسه)
const availableManagers = computed(() => {
  const allEmployees = employeeStore.employees || []
  if (!isEditMode.value) return allEmployees
  return allEmployees.filter((emp) => emp.id !== Number(employeeId.value))
})

// --- بيانات النموذج ---
const defaultForm = () => ({
  full_name: '',
  national_id: '',
  email: '',
  phone: '',
  employee_number: '',
  join_date: new Date().toISOString().split('T')[0], // تاريخ اليوم افتراضياً
  gender: null,
  marital_status: null,
  employment_type: 'full_time',
  status: 'active',
  department_id: null,
  position_id: null,
  manager_id: null,
  user_id: null, // سيتم ربطه لاحقاً من متجر المستخدمين إن وجد
})

const form = ref(defaultForm())

// --- تحميل البيانات الأولية ---
onMounted(async () => {
  isLoadingData.value = true

  try {
    // جلب القوائم المنسدلة من الإعدادات إذا لم تكن موجودة
    if (departmentStore.flatDepartments.length === 0) await departmentStore.fetchDepartments()
    if (positionStore.flatPositions.length === 0) await positionStore.fetchPositions()
    if (employeeStore.employees.length === 0) await employeeStore.fetchEmployees({ per_page: 100 }) // جلب المدراء

    // إذا كنا في وضع التعديل، نجلب بيانات الموظف المحددة
    if (isEditMode.value) {
      const employeeData = await employeeStore.fetchEmployeeById(employeeId.value)

      form.value = {
        full_name: employeeData.full_name,
        national_id: employeeData.national_id || '',
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        employee_number: employeeData.employee_number,
        join_date: employeeData.join_date,
        gender: employeeData.gender || null,
        marital_status: employeeData.marital_status || null,
        employment_type: employeeData.employment_type || 'full_time',
        status: employeeData.status || 'active',
        department_id: employeeData.department?.id || null,
        position_id: employeeData.position?.id || null,
        manager_id: employeeData.manager?.id || null,
        user_id: employeeData.user_id || null,
      }
    }
  } catch (error) {
    toast.error('حدث خطأ أثناء تحميل البيانات. العودة للقائمة.')
    goBack()
  } finally {
    isLoadingData.value = false
  }
})

// --- الإجراءات ---
const goBack = () => {
  router.push({ name: 'EmployeesList' })
}

const submit = async () => {
  // تحقق أساسي (Validation)
  if (!form.value.full_name.trim()) return toast.error('الاسم الرباعي مطلوب.')
  if (!form.value.employee_number.trim()) return toast.error('رقم الموظف مطلوب.')
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
