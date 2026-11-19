<!-- src/modules/hr/views/pay-periods/components/PayPeriodGenerateModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    title="توليد الفترات المالية"
    size="md"
    border-color="border-primary"
    :loading="isGenerating"
  >
    <PayPeriodGenerateForm v-model="form" />

    <template #footer>
      <AppButton variant="secondary" size="sm" @click="close" :disabled="isGenerating">
        إلغاء وتراجع
      </AppButton>
      <AppButton size="sm" @click="submit" :disabled="isGenerating" :loading="isGenerating">
        <span v-if="isGenerating">جاري التوليد...</span>
        <span v-else>بدء التوليد</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { usePayPeriodStore } from '@/modules/hr/stores/payPeriodStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PayPeriodGenerateForm from './PayPeriodGenerateForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const payPeriodStore = usePayPeriodStore()

const isGenerating = ref(false)
const currentYear = new Date().getFullYear()

const defaultForm = () => ({
  pay_group_id: '',
  year: currentYear,
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      form.value = defaultForm()
    }
  },
)

const close = () => {
  if (isGenerating.value) return
  emit('update:modelValue', false)
}

const submit = async () => {
  if (!form.value.pay_group_id) return toast.error('يرجى تحديد مجموعة الدفع أولاً.')
  if (!form.value.year || form.value.year < 2020) return toast.error('يرجى إدخال سنة مالية صحيحة.')

  isGenerating.value = true
  try {
    const result = await payPeriodStore.generatePeriods(form.value)
    toast.success(result.message || 'تم توليد الفترات بنجاح.')

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء عملية التوليد.')
  } finally {
    isGenerating.value = false
  }
}
</script>
