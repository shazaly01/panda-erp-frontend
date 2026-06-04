<template>
  <div>
    <div v-if="label" class="flex justify-between items-center mb-1">
      <label :for="id" class="block text-sm font-medium text-gray-700 dark:text-text-secondary">
        {{ label }}
      </label>
      <slot name="label-append"></slot>
    </div>

    <textarea
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :dir="dir"
      :rows="rows"
      class="block w-full rounded-xl shadow-sm py-2.5 px-4 transition-all duration-200 bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-ground dark:border-blue-500/40 dark:text-text-primary dark:placeholder:text-text-muted dark:focus:ring-2 dark:focus:ring-sky-400 dark:focus:border-sky-400 dark:shadow-[0_0_15px_rgba(56,189,248,0.12)] disabled:opacity-60 disabled:cursor-not-allowed resize-none"
    ></textarea>
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
    type: String,
    default: '',
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
  rows: {
    type: [String, Number],
    default: 3,
  },
})

defineEmits(['update:modelValue'])
</script>
