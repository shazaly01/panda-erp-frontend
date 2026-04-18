<template>
  <div class="space-y-5">
    <div class="bg-sky-50 border border-sky-100 rounded-lg p-4 mb-4 flex gap-3 text-sky-800">
      <svg
        class="w-6 h-6 shrink-0 mt-0.5 text-sky-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div>
        <h4 class="font-bold text-sm">توليد الفترات التلقائي (Bulk Generation)</h4>
        <p class="text-xs mt-1 text-sky-700 leading-relaxed">
          سيقوم النظام آلياً باحتساب التقويم وإنشاء جميع الفترات المالية للسنة المحددة بناءً على
          دورة الصرف الخاصة بالمجموعة (مثال: 12 فترة للمجموعة الشهرية، 52 للمجموعة الأسبوعية).
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="md:col-span-2">
        <AppDropdown
          id="generate-paygroup"
          label="مجموعة الدفع المستهدفة *"
          :model-value="modelValue.pay_group_id"
          @update:model-value="updateField('pay_group_id', $event)"
          :options="payGroupStore.groups"
          option-label="name"
          option-value="id"
          placeholder="-- اختر مجموعة الدفع --"
          required
        />
      </div>

      <div class="md:col-span-2">
        <AppInput
          id="generate-year"
          type="number"
          label="السنة المالية *"
          :model-value="modelValue.year"
          @update:model-value="updateField('year', $event)"
          placeholder="مثال: 2026"
          min="2020"
          max="2050"
          required
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePayGroupStore } from '@/modules/hr/stores/payGroupStore'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
})

const emit = defineEmits(['update:modelValue'])
const payGroupStore = usePayGroupStore()

// جلب المجموعات النشطة عند فتح النافذة
onMounted(() => {
  if (payGroupStore.groups.length === 0) {
    payGroupStore.fetchPayGroups({ is_active: 1 })
  }
})

// تحديث النموذج المربوط بالمكون الأب
const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>
