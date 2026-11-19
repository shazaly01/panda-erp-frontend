<!-- src/modules/hr/views/calendar-exceptions/components/CalendarExceptionModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="lg"
    border-color="border-primary"
    :loading="isSaving"
  >
    <CalendarExceptionForm
      ref="formRef"
      :initial-data="exception"
      :is-saving="isSaving"
      @submit="handleFormSubmit"
      @cancel="close"
    />

    <template #footer>
      <AppButton variant="secondary" size="sm" @click="close" :disabled="isSaving">
        إلغاء وتراجع
      </AppButton>
      <AppButton size="sm" @click="triggerSubmit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ exception && exception.id ? 'تحديث البيانات' : 'اعتماد الحالة' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import CalendarExceptionForm from './CalendarExceptionForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  exception: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'save'])

const formRef = ref(null)

const title = computed(() =>
  props.exception && props.exception.id
    ? 'تعديل حالة الطوارئ / العطلة'
    : 'تسجيل عطلة أو حالة طوارئ جديدة',
)

const close = () => {
  if (props.isSaving) return
  emit('update:modelValue', false)
}

const triggerSubmit = () => {
  formRef.value?.submit()
}

const handleFormSubmit = (formData) => {
  emit('save', formData)
}
</script>
