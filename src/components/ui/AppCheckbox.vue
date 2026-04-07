<template>
  <div class="flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      :id="id"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="w-4 h-4 text-primary border-surface-border rounded focus:ring-primary focus:ring-2 bg-surface-section transition-all"
    />
    <label :for="id" class="text-sm font-medium text-text-primary cursor-pointer">
      {{ label }}
    </label>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  id: { type: String, default: () => `checkbox-${Math.random().toString(36).substr(2, 9)}` },
})
defineEmits(['update:modelValue'])
</script>
