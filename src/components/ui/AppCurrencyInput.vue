<!--src\components\ui\AppCurrencyInput.vue-->
<template>
  <div class="w-full">
    <div v-if="label" class="flex justify-between items-center mb-1">
      <label :for="id" class="block text-sm font-medium text-text-secondary">
        {{ label }}
      </label>
      <slot name="label-append"></slot>
    </div>

    <div class="relative w-full flex items-center">
      <div
        v-if="symbol"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 text-xs font-mono font-bold select-none text-text-muted"
      >
        <span>{{ symbol }}</span>
      </div>

      <input
        :id="id"
        ref="inputRef"
        type="text"
        :value="displayValue"
        @input="handleInput"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        dir="ltr"
        inputmode="decimal"
        autocomplete="off"
        :class="[
          'block w-full rounded-md shadow-sm py-2 text-sm font-bold text-right font-mono transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed',
          symbol ? 'pl-12 pr-3' : 'px-3',
          variant === 'sales'
            ? 'bg-transparent border-0 text-text-primary placeholder:text-text-muted focus:ring-0 p-0'
            : 'bg-surface-section border border-surface-border text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20',
          inputClass,
        ]"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: { type: [Number, String], default: '' },
  symbol: { type: String, default: 'د.ل' },
  placeholder: { type: String, default: '0' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  inputClass: { type: String, default: '' },
  variant: { type: String, default: 'default' },
})

const emit = defineEmits(['update:modelValue'])

const inputRef = ref(null)
const displayValue = ref('')

// دالة لتنسيق الرقم بإضافة الفواصل
const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return ''
  let parts = value.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

// مراقبة القيمة القادمة من الأب وتحديث العرض
watch(
  () => props.modelValue,
  (newValue) => {
    const currentRaw = displayValue.value.replace(/,/g, '')
    if (newValue != currentRaw) {
      displayValue.value = formatNumber(newValue)
    }
  },
  { immediate: true },
)

const handleInput = (event) => {
  let value = event.target.value

  // 1. السماح بالأرقام والنقطة فقط
  value = value.replace(/[^0-9.]/g, '')

  // 2. منع تكرار النقطة العشرية
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }

  // 3. إرسال القيمة النظيفة للأب
  const rawValue = value === '' ? null : value
  emit('update:modelValue', rawValue)

  // 4. تحديث العرض بالفواصل فوراً
  displayValue.value = formatNumber(value)
}
</script>
