<!--src\components\ui\AppInput.vue-->
<template>
  <div>
    <div v-if="label" class="flex justify-between items-center mb-1">
      <label :for="id" class="block text-sm font-medium text-text-secondary">
        {{ label }}
      </label>
      <slot name="label-append"></slot>
    </div>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :dir="dir"
      :class="[
        'block w-full rounded-md py-2 px-3 transition-all duration-200 text-sm focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed',
        variant === 'sales'
          ? 'bg-transparent border-0 text-text-primary placeholder:text-text-muted focus:ring-0 p-0'
          : 'bg-surface-section border border-surface-border text-text-primary placeholder:text-text-muted shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20',
        inputClass,
      ]"
    />
  </div>
</template>

<script setup>
defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  dir: {
    type: String,
    default: null,
  },
  inputClass: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'default',
  },
})

defineEmits(['update:modelValue'])
</script>
