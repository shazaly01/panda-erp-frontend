<!-- src/modules/hr/views/shifts/components/ShiftModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="lg"
    border-color="border-primary"
    :loading="isSaving"
  >
    <ShiftForm v-model="form" />

    <template #footer>
      <AppButton variant="secondary" size="sm" @click="close" :disabled="isSaving">
        إلغاء وتراجع
      </AppButton>
      <AppButton size="sm" @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة الوردية' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useShiftStore } from '@/modules/hr/stores/shiftStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import ShiftForm from './ShiftForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  shiftToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const shiftStore = useShiftStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.shiftToEdit)

const title = computed(() => (isEditMode.value ? 'تعديل بيانات الوردية' : 'إضافة وردية جديدة'))

const defaultForm = () => ({
  name: '',
  start_time: '08:00',
  end_time: '16:00',
  grace_period_minutes: 15,
  is_active: true,
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          name: props.shiftToEdit.name,
          start_time: props.shiftToEdit.start_time,
          end_time: props.shiftToEdit.end_time,
          grace_period_minutes: props.shiftToEdit.grace_period_minutes,
          is_active: props.shiftToEdit.is_active ?? true,
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
  if (!form.value.name.trim()) return toast.error('يرجى إدخال اسم الوردية.')
  if (!form.value.start_time || !form.value.end_time) return toast.error('أوقات الوردية مطلوبة.')

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await shiftStore.updateShift(props.shiftToEdit.id, form.value)
      toast.success('تم تحديث إعدادات الوردية بنجاح.')
    } else {
      await shiftStore.createShift(form.value)
      toast.success('تم إضافة الوردية بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch {
    toast.error(shiftStore.error || 'حدث خطأ أثناء حفظ الوردية.')
  } finally {
    isSaving.value = false
  }
}
</script>
