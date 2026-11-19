<!-- src/modules/hr/views/pay-groups/components/PayGroupForm.vue -->
<template>
  <div
    class="-m-3 p-3.5 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-3 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- 1. اسم المجموعة -->
    <div>
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

    <!-- 2. دورة صرف الراتب -->
    <div>
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

    <!-- 3. حالة التفعيل -->
    <div
      class="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-card border border-surface-border"
    >
      <label class="relative inline-flex items-center cursor-pointer select-none">
        <input
          type="checkbox"
          :checked="modelValue.is_active"
          @change="updateField('is_active', $event.target.checked)"
          class="sr-only peer"
        />
        <div
          class="w-10 h-5 bg-surface-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"
        ></div>
        <span class="ms-2.5 text-xs font-bold text-text-primary">
          {{ modelValue.is_active ? 'مجموعة الدفع نشطة (متاحة للاستخدام)' : 'مجموعة الدفع متوقفة' }}
        </span>
      </label>

      <span
        class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
        :class="
          modelValue.is_active
            ? 'bg-success/10 text-success border-success/30'
            : 'bg-danger/10 text-danger border-danger/30'
        "
      >
        {{ modelValue.is_active ? 'مفعّلة' : 'معطّلة' }}
      </span>
    </div>
  </div>
</template>

<script setup>
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
