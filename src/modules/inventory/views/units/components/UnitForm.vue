<!-- src/modules/inventory/views/units/components/UnitForm.vue -->
<template>
  <div
    class="-m-3 p-3.5 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-2.5 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- 1. اسم وحدة القياس -->
    <div>
      <AppInput
        id="unit-name"
        type="text"
        label="اسم وحدة القياس *"
        :model-value="modelValue.name"
        @update:model-value="updateField('name', $event)"
        placeholder="مثال: كيلو جرام، متر، حبة، كرتونة..."
        required
      />
    </div>

    <!-- 2. الرمز / الاختصار -->
    <div>
      <AppInput
        id="unit-symbol"
        type="text"
        label="الرمز / الاختصار *"
        :model-value="modelValue.symbol"
        @update:model-value="updateField('symbol', $event)"
        placeholder="مثال: كجم، م، قطعة، كرتون..."
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
          {{ modelValue.is_active ? 'وحدة القياس نشطة (متاحة للاستخدام)' : 'وحدة القياس موقوفة' }}
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

const props = defineProps({
  modelValue: { type: Object, required: true },
})

const emit = defineEmits(['update:modelValue'])

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>
