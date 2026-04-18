<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="md:col-span-2">
        <AppInput
          id="paygroup-name"
          type="text"
          label="اسم المجموعة *"
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="مثال: موظفي الإدارة، عمال المصنع"
          required
        />
      </div>

      <div class="md:col-span-2">
        <AppDropdown
          id="paygroup-frequency"
          label="دورة صرف الراتب *"
          :model-value="modelValue.frequency"
          @update:model-value="updateField('frequency', $event)"
          :options="frequencyOptions"
          option-label="label"
          option-value="value"
          placeholder="-- اختر الدورة --"
          required
        />
      </div>

      <div class="md:col-span-2 flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="paygroup-active"
          :checked="modelValue.is_active"
          @change="updateField('is_active', $event.target.checked)"
          class="w-4 h-4 text-primary bg-surface-ground border-surface-border rounded focus:ring-primary"
        />
        <label for="paygroup-active" class="text-sm font-medium text-text-primary cursor-pointer">
          مجموعة نشطة
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
// 🚀 إضافة سطري الاستيراد هذين
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  isEditMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const frequencyOptions = [
  { label: 'شهري', value: 'monthly' },
  { label: 'نصف شهري', value: 'bi_weekly' },
  { label: 'أسبوعي', value: 'weekly' },
  { label: 'يومي', value: 'daily' },
]

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>
