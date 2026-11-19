<!-- src/modules/hr/views/leave-passes/components/LeavePassModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="lg"
    border-color="border-primary"
    :loading="isSaving"
  >
    <LeavePassForm v-model="form" :is-edit-mode="isEditMode" />

    <template #footer>
      <AppButton variant="secondary" size="sm" @click="close" :disabled="isSaving">
        إلغاء وتراجع
      </AppButton>
      <AppButton size="sm" @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ وإصدار الإذن...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إصدار واعتماد الإذن' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useLeavePassStore } from '@/modules/hr/stores/leavePassStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import LeavePassForm from './LeavePassForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  leavePassToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const leavePassStore = useLeavePassStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.leavePassToEdit)

const title = computed(() =>
  isEditMode.value ? 'تعديل تفاصيل إذن خروج قائم' : 'إصدار إذن خروج مؤقت مباشر',
)

const defaultForm = () => ({
  employee_id: null,
  date: new Date().toISOString().split('T')[0],
  reason: '',
  requested_leave_at: '',
  requested_return_at: '',
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          employee_id: props.leavePassToEdit.employee?.id || null,
          date: props.leavePassToEdit.date || new Date().toISOString().split('T')[0],
          reason: props.leavePassToEdit.reason || '',
          requested_leave_at: props.leavePassToEdit.requested_leave_at || '',
          requested_return_at: props.leavePassToEdit.requested_return_at || '',
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
  if (!form.value.employee_id) return toast.error('يجب اختيار الموظف طالب الإذن.')
  if (!form.value.date) return toast.error('حقل تاريخ الإذن مطلوب.')
  if (!form.value.reason.trim()) return toast.error('يرجى كتابة سبب الخروج المؤقت.')
  if (!form.value.requested_leave_at) return toast.error('يرجى تحديد وقت الخروج المتوقع.')
  if (!form.value.requested_return_at) return toast.error('يرجى تحديد وقت العودة المتوقع للمنشأة.')

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await leavePassStore.updateLeavePass(props.leavePassToEdit.id, form.value)
      toast.success('تم تحديث بيانات إذن الخروج بنجاح.')
    } else {
      await leavePassStore.createLeavePass(form.value)
      toast.success('تم إصدار إذن الخروج واعتماده فورياً بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ غير متوقع أثناء حفظ الإذن.')
  } finally {
    isSaving.value = false
  }
}
</script>
