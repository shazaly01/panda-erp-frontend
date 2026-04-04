<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
    >
      {{ label }}
    </label>

    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span class="text-gray-500 sm:text-sm">د.ل</span>
      </div>

      <input
        :id="id"
        ref="inputRef"
        type="text"
        :value="displayValue"
        @input="handleInput"
        :placeholder="placeholder"
        :required="required"
        dir="ltr"
        class="block w-full pl-12 pr-3 rounded-md shadow-sm transition-colors duration-200 bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:placeholder:text-text-muted dark:focus:ring-primary dark:focus:border-primary text-right"
        inputmode="decimal"
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
  placeholder: { type: String, default: '0' },
  required: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

// القيمة التي تظهر في الحقل (نص مع فواصل)
const displayValue = ref('')

// دالة لتنسيق الرقم بإضافة الفواصل
const formatNumber = (value) => {
  if (!value) return ''
  // 1. فصل الجزء الصحيح عن العشري
  let parts = value.toString().split('.')
  // 2. إضافة الفواصل للجزء الصحيح فقط
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  // 3. إعادة دمج الأجزاء
  return parts.join('.')
}

// مراقبة القيمة القادمة من الأب (Backend) وتحديث العرض
watch(
  () => props.modelValue,
  (newValue) => {
    // هذا الشرط يمنع مشاكل المؤشر أثناء الكتابة
    // نقوم بالتحديث فقط إذا كانت القيمة الجديدة مختلفة عن القيمة الحالية بعد إزالة الفواصل
    const currentRaw = displayValue.value.replace(/,/g, '')
    if (newValue != currentRaw) {
      displayValue.value = formatNumber(newValue)
    }
  },
  { immediate: true },
)

const handleInput = (event) => {
  let value = event.target.value

  // 1. السماح بالأرقام والنقطة فقط (إزالة أي حروف)
  value = value.replace(/[^0-9.]/g, '')

  // 2. منع تكرار النقطة العشرية
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }

  // 3. إرسال القيمة "النظيفة" (رقم صافي) للأب ليحفظها في قاعدة البيانات
  // إذا كانت القيمة تنتهي بنقطة (مثلاً "15.") نرسلها كما هي مؤقتاً لكي لا يحذف الـ v-model النقطة
  const rawValue = value === '' ? null : value
  emit('update:modelValue', rawValue)

  // 4. تحديث العرض بالفواصل فوراً
  displayValue.value = formatNumber(value)

  // الحفاظ على مكان المؤشر (اختياري لتحسين التجربة)
  // لكن في معظم المتصفحات الحديثة، Vue يتعامل مع هذا بشكل جيد عند الربط بـ :value
}
</script>
