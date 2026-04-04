<template>
  <div class="flex flex-col space-y-2">
    <label :for="id" class="text-sm font-medium text-text-primary">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <div class="relative">
      <select
        :id="id"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :disabled="loading"
        class="w-full appearance-none rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 disabled:opacity-50 transition-colors duration-200"
        :class="[
          /* حدود الحقل */
          error
            ? 'border-danger focus:border-danger focus:ring-danger'
            : 'border-surface-border focus:border-primary focus:ring-primary',

          /* [التعديل هنا] تغيير الخلفية إلى لون داكن صريح ليتناسب مع الوضع الليلي */
          /* يمكنك استبدال bg-gray-800 بالكلاس المستخدم في AppInput لديك إذا اختلف */
          'bg-gray-800',

          /* لون النص */
          modelValue ? 'text-white' : 'text-gray-400',
        ]"
      >
        <option value="" disabled selected class="text-gray-400">
          {{ loading ? 'جاري التحميل...' : 'اختر نظام الاحتساب' }}
        </option>

        <option
          v-for="option in options"
          :key="option.id"
          :value="option.id"
          class="text-white bg-gray-800 hover:bg-gray-700"
        >
          {{ option.name }}
        </option>
      </select>

      <div
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted"
      >
        <svg
          v-if="loading"
          class="animate-spin h-5 w-5 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>

        <svg
          v-else
          class="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCalculationOptionStore } from '@/stores/calculationOptionStore'
import { storeToRefs } from 'pinia'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'خيار الاحتساب' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const store = useCalculationOptionStore()
const { options, loading, error } = storeToRefs(store)

onMounted(() => {
  store.fetchOptions()
})
</script>
