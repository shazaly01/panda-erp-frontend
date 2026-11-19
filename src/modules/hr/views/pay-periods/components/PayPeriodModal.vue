<!-- src/modules/hr/views/pay-periods/components/PayPeriodModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="lg"
    border-color="border-primary"
    :loading="isSaving"
  >
    <PayPeriodForm v-model="form" :is-edit-mode="isEditMode" />

    <template #footer>
      <AppButton variant="secondary" size="sm" @click="close" :disabled="isSaving">
        إلغاء وتراجع
      </AppButton>
      <AppButton size="sm" @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'توليد الفترة' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { usePayPeriodStore } from '@/modules/hr/stores/payPeriodStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PayPeriodForm from './PayPeriodForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  periodToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const payPeriodStore = usePayPeriodStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.periodToEdit)

const title = computed(() => (isEditMode.value ? 'تعديل الفترة المالية' : 'توليد فترة مالية جديدة'))

const defaultForm = () => ({
  pay_group_id: '',
  name: '',
  start_date: '',
  end_date: '',
  status: 'open',
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          pay_group_id: props.periodToEdit.pay_group_id,
          name: props.periodToEdit.name,
          start_date: props.periodToEdit.start_date,
          end_date: props.periodToEdit.end_date,
          status: props.periodToEdit.status,
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
  if (!form.value.pay_group_id) return toast.error('يرجى اختيار مجموعة الدفع.')
  if (!form.value.name.trim()) return toast.error('يرجى إدخال اسم الفترة.')
  if (!form.value.start_date) return toast.error('تاريخ البداية مطلوب.')
  if (!form.value.end_date) return toast.error('تاريخ النهاية مطلوب.')

  if (new Date(form.value.end_date) < new Date(form.value.start_date)) {
    return toast.error('تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية.')
  }

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await payPeriodStore.updatePayPeriod(props.periodToEdit.id, form.value)
      toast.success('تم تحديث الفترة المالية بنجاح.')
    } else {
      await payPeriodStore.createPayPeriod(form.value)
      toast.success('تم توليد الفترة المالية بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات.')
  } finally {
    isSaving.value = false
  }
}
</script>
