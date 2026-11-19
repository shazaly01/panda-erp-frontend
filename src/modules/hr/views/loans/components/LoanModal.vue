<!-- src/modules/hr/views/loans/components/LoanModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="lg"
    border-color="border-primary"
    :loading="isSaving"
  >
    <LoanForm v-model="form" :is-edit-mode="isEditMode" />

    <template #footer>
      <AppButton variant="secondary" size="sm" @click="close" :disabled="isSaving">
        إلغاء وتراجع
      </AppButton>
      <AppButton size="sm" @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'تسجيل طلب السلفة' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useLoanStore } from '@/modules/hr/stores/loanStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import LoanForm from './LoanForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  loanToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const loanStore = useLoanStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.loanToEdit)

const title = computed(() => (isEditMode.value ? 'تعديل طلب السلفة' : 'طلب سلفة جديدة'))

const getNextMonthDate = () => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  date.setDate(1)
  return date.toISOString().split('T')[0]
}

const defaultForm = () => ({
  employee_id: null,
  amount: '',
  installments_count: 1,
  deduction_start_date: getNextMonthDate(),
  reason: '',
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          employee_id: props.loanToEdit.employee_id,
          amount: props.loanToEdit.amount,
          installments_count: props.loanToEdit.installments_count,
          deduction_start_date: props.loanToEdit.deduction_start_date,
          reason: props.loanToEdit.reason,
        }
      } else {
        form.value = defaultForm()
      }
    }
  },
  { immediate: true },
)

const close = () => {
  if (isSaving.value) return
  emit('update:modelValue', false)
}

const submit = async () => {
  if (!form.value.employee_id) return toast.error('يرجى اختيار الموظف.')
  if (!form.value.amount || form.value.amount <= 0)
    return toast.error('مبلغ السلفة يجب أن يكون أكبر من صفر.')
  if (!form.value.installments_count || form.value.installments_count < 1)
    return toast.error('عدد الأقساط يجب أن يكون 1 على الأقل.')
  if (!form.value.deduction_start_date) return toast.error('تاريخ بدء الخصم مطلوب.')
  if (!form.value.reason.trim()) return toast.error('سبب السلفة مطلوب.')

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await loanStore.updateLoan(props.loanToEdit.id, form.value)
      toast.success('تم تحديث طلب السلفة بنجاح.')
    } else {
      await loanStore.createLoan(form.value)
      toast.success('تم تسجيل طلب السلفة بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء الحفظ.')
  } finally {
    isSaving.value = false
  }
}
</script>
