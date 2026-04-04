<template>
  <div class="form-group">
    <label v-if="label" class="form-label">{{ label }}</label>
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      class="form-select w-full rounded-md border-gray-300"
      :class="{ 'border-red-500': error }"
    >
      <option value="">{{ placeholder }}</option>
      <option value="draft">مسودة (Draft)</option>
      <option value="posted">مرحّل (Posted)</option>
      <option value="cancelled">ملغى (Cancelled)</option>
    </select>
    <p v-if="error" class="text-sm text-red-500 mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'الحالة' },
  placeholder: { type: String, default: 'الكل' },
  error: { type: String, default: null },
})

defineEmits(['update:modelValue'])
</script>
