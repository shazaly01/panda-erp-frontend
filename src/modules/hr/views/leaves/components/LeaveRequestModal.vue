<!-- src/modules/hr/views/leaves/components/LeaveRequestModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="lg"
    border-color="border-primary"
    :loading="isSaving"
  >
    <LeaveRequestForm v-model="form" :is-edit-mode="isEditMode" />

    <template #footer>
      <AppButton variant="secondary" size="sm" @click="close" :disabled="isSaving">
        إلغاء وتراجع
      </AppButton>
      <AppButton size="sm" @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'تقديم الطلب' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useLeaveStore } from '@/modules/hr/stores/leaveStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import LeaveRequestForm from './LeaveRequestForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  requestToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const leaveStore = useLeaveStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.requestToEdit)

const title = computed(() => (isEditMode.value ? 'تعديل طلب الإجازة' : 'تقديم طلب إجازة جديد'))

const getTodayDate = () => new Date().toISOString().split('T')[0]

const defaultForm = () => ({
  employee_id: null,
  leave_type_id: null,
  start_date: getTodayDate(),
  end_date: getTodayDate(),
  reason: '',
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          employee_id: props.requestToEdit.employee_id,
          leave_type_id: props.requestToEdit.leave_type_id || props.requestToEdit.leave_type?.id,
          start_date: props.requestToEdit.start_date,
          end_date: props.requestToEdit.end_date,
          reason: props.requestToEdit.reason || '',
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
  if (!form.value.leave_type_id) return toast.error('يرجى تحديد نوع الإجازة.')
  if (!form.value.start_date) return toast.error('تاريخ بداية الإجازة مطلوب.')
  if (!form.value.end_date) return toast.error('تاريخ نهاية الإجازة مطلوب.')

  if (new Date(form.value.end_date) < new Date(form.value.start_date)) {
    return toast.error('تاريخ النهاية يجب أن يكون مساوياً أو بعد تاريخ البداية.')
  }

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await leaveStore.updateLeaveRequest(props.requestToEdit.id, form.value)
      toast.success('تم تحديث طلب الإجازة بنجاح.')
    } else {
      await leaveStore.createLeaveRequest(form.value)
      toast.success('تم تقديم طلب الإجازة بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ الطلب.')
  } finally {
    isSaving.value = false
  }
}
</script>
