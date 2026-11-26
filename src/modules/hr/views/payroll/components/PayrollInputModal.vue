<!-- src/modules/hr/views/payroll/PayrollInputModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="dialogTitle"
    size="3xl"
    border-color="border-primary"
    :loading="isSubmitting"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <!-- مؤشر التحميل يظهر فقط في حال عدم توفر قائمة الموظفين في الذاكرة -->
    <div v-if="isLoadingData" class="flex flex-col items-center justify-center py-14 gap-3">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <span class="text-xs text-text-muted font-bold">جاري تجهيز بيانات الموظفين...</span>
    </div>

    <!-- نموذج الحركة المالية الموحد -->
    <PayrollInputForm
      v-else
      :initial-data="initialData"
      :employees="formattedEmployees"
      :is-saving="isSubmitting"
      :server-errors="validationErrors"
      @submit="saveInput"
      @cancel="handleClose"
    />
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { usePayrollInputStore } from '@/modules/hr/stores/payrollInputStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'

import AppDialog from '@/components/ui/AppDialog.vue'
import PayrollInputForm from './PayrollInputForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  inputToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'close', 'saved'])

const toast = useToast()
const payrollInputStore = usePayrollInputStore()
const employeeStore = useEmployeeStore()

const isSubmitting = ref(false)
const isLoadingData = ref(false)
const initialData = ref(null)
const validationErrors = ref({})

const isEditMode = computed(() => Boolean(props.inputToEdit?.id))

const dialogTitle = computed(() => {
  if (isEditMode.value) {
    const empName = props.inputToEdit?.employee_name ? ` — ${props.inputToEdit.employee_name}` : ''
    return `تعديل حركة مالية${empName}`
  }
  return 'إضافة حركة مالية جديدة (حافز / بدل / استقطاع / جزاء)'
})

const formattedEmployees = computed(() => {
  const currentEmployeeId = props.inputToEdit?.employee_id
  return (employeeStore.allEmployees || [])
    .filter(
      (emp) =>
        emp.id === currentEmployeeId ||
        (emp.status !== 'dismissed' && emp.status !== 'end_of_service'),
    )
    .map((emp) => ({
      ...emp,
      displayLabel: emp.employee_number
        ? `${emp.full_name} (${emp.employee_number})`
        : emp.full_name,
    }))
})

const buildDefaultFormData = () => ({
  employee_id: '',
  type: 'bonus',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  reason: '',
})

const openModalData = async () => {
  validationErrors.value = {}

  // حماية استباقية ضد تعديل الحركات المرحّلة أو المرتبطة بجزاءات لائحية
  if (isEditMode.value) {
    if (props.inputToEdit?.is_processed) {
      toast.warning('لا يمكن تعديل حركة مالية تم ترحيلها مسبقاً في مسير الرواتب.')
      handleClose(true)
      return
    }
    if (props.inputToEdit?.disciplinary_action_id) {
      toast.warning('هذا الاستقطاع مرتبط بجزاء لائحي ولا يمكن تعديله مباشرة من هنا.')
      handleClose(true)
      return
    }
  }

  const resolveInitialPayload = () => {
    if (isEditMode.value) {
      return {
        id: props.inputToEdit.id,
        employee_id: props.inputToEdit.employee_id,
        type: props.inputToEdit.type || 'bonus',
        amount: Number(props.inputToEdit.amount) || '',
        date: props.inputToEdit.date || new Date().toISOString().split('T')[0],
        reason: props.inputToEdit.reason || '',
      }
    }
    return buildDefaultFormData()
  }

  // فتح فوري بدون شاشة انتظار إذا كانت قائمة الموظفين محمّلة مسبقاً في Pinia
  if (employeeStore.allEmployees.length > 0) {
    initialData.value = resolveInitialPayload()
    isLoadingData.value = false
    employeeStore.fetchAllEmployees().catch(() => {})
    return
  }

  isLoadingData.value = true
  try {
    await employeeStore.fetchAllEmployees()
    initialData.value = resolveInitialPayload()
  } catch {
    toast.error('تعذر تحميل قائمة الموظفين، يرجى المحاولة مرة أخرى.')
  } finally {
    isLoadingData.value = false
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      await openModalData()
    } else {
      initialData.value = null
      validationErrors.value = {}
    }
  },
  { immediate: true },
)

const saveInput = async (formData) => {
  validationErrors.value = {}
  isSubmitting.value = true
  try {
    if (isEditMode.value) {
      await payrollInputStore.updateInput(props.inputToEdit.id, formData)
      toast.success('تم تحديث الحركة المالية بنجاح.')
    } else {
      await payrollInputStore.createInput(formData)
      toast.success('تم تسجيل الحركة المالية بنجاح.')
    }

    emit('saved')
    handleClose(true)
  } catch (error) {
    if (error.response?.status === 422 && error.response?.data?.errors) {
      validationErrors.value = error.response.data.errors
    }
    toast.error(
      error.response?.data?.message ||
        payrollInputStore.error ||
        'حدث خطأ أثناء حفظ الحركة المالية.',
    )
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = (force = false) => {
  if (isSubmitting.value && !force) return
  emit('update:modelValue', false)
  emit('close')
}
</script>
