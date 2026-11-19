<!-- src/modules/hr/views/shift-overrides/components/ShiftOverrideModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="lg"
    border-color="border-primary"
    :loading="isSaving"
  >
    <ShiftOverrideForm
      ref="formRef"
      :initial-data="override"
      :is-saving="isSaving"
      :employees="employees"
      :shifts="shifts"
      @submit="handleFormSubmit"
      @cancel="close"
    />

    <template #footer>
      <AppButton variant="secondary" size="sm" @click="close" :disabled="isSaving">
        إلغاء وتراجع
      </AppButton>
      <AppButton size="sm" @click="triggerSubmit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ override && override.id ? 'تحديث البيانات' : 'اعتماد التجاوز' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import ShiftOverrideForm from './ShiftOverrideForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  override: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  employees: { type: Array, default: () => [] },
  shifts: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'save'])

const formRef = ref(null)

const title = computed(() =>
  props.override && props.override.id ? 'تعديل تجاوز الوردية' : 'إضافة تجاوز وردية جديد',
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
