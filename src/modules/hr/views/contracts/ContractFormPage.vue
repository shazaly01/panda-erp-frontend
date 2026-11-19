<!-- src/modules/hr/views/contracts/ContractFormPage.vue -->
<template>
  <div class="space-y-3 max-w-5xl mx-auto pb-24 text-right font-sans" dir="rtl">
    <!-- مؤشر التحميل لكامل الشاشة -->
    <FullScreenLoader :show="isLoadingData" message="جاري تحميل بيانات العقد..." />

    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="goBack"
          class="p-1.5 rounded-lg bg-surface-card border border-surface-border text-text-secondary hover:text-primary hover:border-primary/60 transition-colors shadow-2xs cursor-pointer"
          title="العودة لقائمة العقود"
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
          <span>{{ isEditMode ? 'تعديل بيانات العقد' : 'إبرام عقد عمل جديد' }}</span>
        </h1>

        <span
          v-if="isEditMode && contractId"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          #{{ contractId }}
        </span>
      </div>
    </div>

    <!-- محتوى النموذج -->
    <div v-if="!isLoadingData" class="space-y-3">
      <!-- 1. بطاقة الترويسة: الموظف والهياكل والجدولة -->
      <div
        class="p-4 bg-surface-header/70 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm space-y-3 transition-colors duration-200"
      >
        <div class="flex items-center justify-between pb-1.5 border-b border-primary/15">
          <span class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span>الارتباط الوظيفي وهياكل الراتب والجدولة</span>
          </span>
          <span class="text-[10px] font-bold text-text-muted">الحقول المميزة بـ * إلزامية</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- الموظف -->
          <div class="md:col-span-2">
            <AppDropdown
              id="employee_id"
              label="الموظف *"
              v-model="form.employee_id"
              :options="employees"
              option-label="full_name"
              option-value="id"
              placeholder="-- اختر الموظف --"
              :disabled="isEditMode"
              required
            />
            <p
              v-if="isEditMode"
              class="text-[11px] text-warning font-bold mt-1 flex items-center gap-1 pr-1"
            >
              <span>•</span>
              <span>لا يمكن تغيير الموظف بعد إنشاء العقد. لربط موظف آخر، قم بإنشاء عقد جديد.</span>
            </p>
          </div>

          <!-- هيكل الراتب -->
          <div>
            <AppDropdown
              id="salary_structure_id"
              label="هيكل الراتب *"
              v-model="form.salary_structure_id"
              :options="salaryStructures"
              option-label="name"
              option-value="id"
              placeholder="-- اختر هيكل الراتب --"
              required
            />
          </div>

          <!-- مجموعة الدفع -->
          <div>
            <AppDropdown
              id="pay_group_id"
              label="مجموعة الدفع *"
              v-model="form.pay_group_id"
              :options="payGroups"
              option-label="name"
              option-value="id"
              placeholder="-- اختر مجموعة الدفع --"
              required
            />
          </div>

          <!-- قالب الجدولة -->
          <div>
            <AppDropdown
              id="working_schedule_id"
              label="قالب الجدولة (دورة العمل) *"
              v-model="form.working_schedule_id"
              :options="workingSchedules"
              option-label="name"
              option-value="id"
              placeholder="-- اختر قالب الجدولة --"
              required
            />
          </div>

          <!-- سياسة العمل الإضافي -->
          <div>
            <AppDropdown
              id="overtime_policy_id"
              label="سياسة العمل الإضافي"
              v-model="form.overtime_policy_id"
              :options="overtimePolicies"
              option-label="name"
              option-value="id"
              placeholder="-- اختر سياسة الإضافي (اختياري) --"
            />
          </div>
        </div>
      </div>

      <!-- 2. بطاقة التفاصيل المالية ونمط الحضور وفترة السريان -->
      <div
        class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs space-y-3 transition-colors duration-200"
      >
        <div class="flex items-center justify-between pb-1.5 border-b border-surface-border/80">
          <span class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>الراتب الأساسي ونمط الحضور وفترة السريان</span>
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- الراتب الأساسي -->
          <div>
            <AppInput
              id="basic_salary"
              type="number"
              label="الراتب الأساسي *"
              v-model="form.basic_salary"
              min="0"
              step="0.01"
              class="font-mono text-left"
              dir="ltr"
              placeholder="0.00"
              required
            />
          </div>

          <!-- نمط تسجيل الحضور -->
          <div>
            <AppDropdown
              id="attendance_mode"
              label="نمط تسجيل الحضور *"
              v-model="form.attendance_mode"
              :options="attendanceModes"
              option-label="label"
              option-value="value"
              required
            />
          </div>

          <!-- تاريخ بداية العقد -->
          <div>
            <AppInput
              id="start_date"
              type="date"
              label="تاريخ بداية العقد *"
              v-model="form.start_date"
              required
            />
          </div>

          <!-- تاريخ نهاية العقد -->
          <div>
            <AppInput
              id="end_date"
              type="date"
              label="تاريخ نهاية العقد (اختياري)"
              v-model="form.end_date"
              placeholder="يترك فارغاً للعقود المفتوحة"
            />
          </div>
        </div>
      </div>

      <!-- 3. بطاقة المرفقات والمستندات -->
      <div
        class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs space-y-2.5 transition-colors duration-200"
      >
        <div class="flex items-center justify-between pb-1.5 border-b border-surface-border/80">
          <span class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-info inline-block"></span>
            <span>نسخة العقد الموقعة (اختياري)</span>
          </span>
          <span class="text-[10px] font-mono text-text-muted">PDF, JPG, PNG • Max 2MB</span>
        </div>

        <div
          class="p-3 bg-surface-card border border-dashed border-surface-border hover:border-primary/60 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <input
            type="file"
            id="attachment"
            @change="handleFileUpload"
            accept=".pdf,.jpg,.jpeg,.png"
            class="block w-full text-xs text-text-secondary file:ml-3 file:py-1.5 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary-dark file:cursor-pointer cursor-pointer transition-colors"
          />

          <a
            v-if="isEditMode && currentAttachmentUrl"
            :href="currentAttachmentUrl"
            target="_blank"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-info/10 text-info border border-info/30 hover:bg-info hover:text-white text-xs font-bold whitespace-nowrap transition-colors shrink-0"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            <span>عرض المرفق الحالي</span>
          </a>
        </div>
      </div>
    </div>

    <!-- شريط الإجراءات السفلي الثابت -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex flex-wrap justify-between items-center gap-2 px-4 sm:px-6"
    >
      <div class="text-xs text-text-secondary font-medium">
        <span>تأكد من مطابقة هيكل الراتب وقالب الجدولة مع سياسة الموارد البشرية قبل الاعتماد.</span>
      </div>

      <div class="flex items-center gap-2">
        <AppButton type="button" variant="secondary" size="sm" @click="goBack" :disabled="isSaving">
          إلغاء وتراجع
        </AppButton>
        <AppButton type="button" size="sm" @click="submit" :disabled="isSaving">
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'اعتماد العقد' }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'

import { useContractStore } from '@/modules/hr/stores/contractStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import { useSalaryStructureStore } from '@/modules/hr/stores/salaryStructureStore'
import { useOvertimePolicyStore } from '@/modules/hr/stores/overtimePolicyStore'
import { usePayGroupStore } from '@/modules/hr/stores/payGroupStore'
import { useWorkingScheduleStore } from '@/modules/hr/stores/workingScheduleStore'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const contractStore = useContractStore()
const employeeStore = useEmployeeStore()
const salaryStructureStore = useSalaryStructureStore()
const policyStore = useOvertimePolicyStore()
const payGroupStore = usePayGroupStore()
const scheduleStore = useWorkingScheduleStore()

const isEditMode = computed(() => route.name === 'contracts.edit')
const contractId = computed(() => route.params.id)

const isLoadingData = ref(false)
const isSaving = ref(false)

const employees = ref([])
const salaryStructures = ref([])
const overtimePolicies = ref([])
const payGroups = ref([])
const workingSchedules = ref([])
const currentAttachmentUrl = ref(null)

const attendanceModes = ref([
  { value: 'manual', label: 'يدوي' },
  { value: 'auto', label: 'تلقائي' },
])

const defaultForm = () => ({
  employee_id: null,
  salary_structure_id: null,
  pay_group_id: null,
  working_schedule_id: null,
  attendance_mode: 'manual',
  overtime_policy_id: null,
  basic_salary: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
})

const form = ref(defaultForm())
const attachmentFile = ref(null)

onMounted(async () => {
  isLoadingData.value = true

  try {
    if (isEditMode.value) {
      await employeeStore.fetchEmployees({ per_page: 500 })
    } else {
      await employeeStore.fetchEmployees({ per_page: 500, without_active_contract: 1 })
    }
    employees.value = employeeStore.employees

    await salaryStructureStore.fetchStructures({ per_page: 500, is_active: 1 })
    salaryStructures.value = salaryStructureStore.structures

    await policyStore.fetchPolicies({ per_page: 100 })
    overtimePolicies.value = policyStore.policies

    await payGroupStore.fetchPayGroups({ is_active: 1 })
    payGroups.value = payGroupStore.groups

    await scheduleStore.fetchSchedules({ per_page: 100 })
    workingSchedules.value = scheduleStore.schedules

    if (isEditMode.value) {
      const contractData = await contractStore.fetchContractById(contractId.value)

      form.value = {
        employee_id: contractData.employee?.id || contractData.employee_id,
        salary_structure_id: contractData.salary_structure?.id || contractData.salary_structure_id,
        pay_group_id: contractData.pay_group?.id || contractData.pay_group_id || null,
        working_schedule_id:
          contractData.working_schedule?.id || contractData.working_schedule_id || null,
        attendance_mode: contractData.attendance_mode || 'manual',
        overtime_policy_id:
          contractData.overtime_policy?.id || contractData.overtime_policy_id || null,
        basic_salary: contractData.basic_salary,
        start_date: contractData.start_date,
        end_date: contractData.end_date || '',
      }
      currentAttachmentUrl.value = contractData.attachment_url
    }
  } catch (error) {
    toast.error('حدث خطأ أثناء تحميل البيانات.')
    goBack()
  } finally {
    isLoadingData.value = false
  }
})

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  attachmentFile.value = file || null
}

const goBack = () => {
  router.push({ name: 'ContractsList' })
}

const submit = async () => {
  if (!form.value.employee_id) return toast.error('يجب اختيار الموظف.')
  if (!form.value.salary_structure_id) return toast.error('يجب اختيار هيكل الراتب.')
  if (!form.value.pay_group_id) return toast.error('يجب تحديد مجموعة الدفع.')
  if (!form.value.working_schedule_id) return toast.error('يجب تحديد قالب الجدولة (دورة العمل).')
  if (!form.value.basic_salary || form.value.basic_salary < 0)
    return toast.error('الراتب الأساسي غير صالح.')
  if (!form.value.start_date) return toast.error('تاريخ البداية مطلوب.')

  isSaving.value = true

  const formData = new FormData()
  formData.append('employee_id', String(form.value.employee_id))
  formData.append('salary_structure_id', String(form.value.salary_structure_id))
  formData.append('pay_group_id', String(form.value.pay_group_id))
  formData.append('working_schedule_id', String(form.value.working_schedule_id))
  formData.append('attendance_mode', form.value.attendance_mode)
  formData.append('basic_salary', String(form.value.basic_salary))
  formData.append('start_date', form.value.start_date)

  if (form.value.overtime_policy_id) {
    formData.append('overtime_policy_id', String(form.value.overtime_policy_id))
  }

  if (form.value.end_date) {
    formData.append('end_date', form.value.end_date)
  }

  if (attachmentFile.value) {
    formData.append('attachment', attachmentFile.value)
  }

  try {
    if (isEditMode.value) {
      formData.append('_method', 'PUT')
      await contractStore.updateContract(contractId.value, formData)
      toast.success('تم تحديث العقد بنجاح.')
    } else {
      await contractStore.createContract(formData)
      toast.success('تم إبرام العقد الجديد بنجاح.')
    }
    goBack()
  } catch (error) {
    const errorMsg =
      error.response?.data?.message || 'فشل حفظ البيانات. يرجى مراجعة الحقول والملف المرفق.'
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
