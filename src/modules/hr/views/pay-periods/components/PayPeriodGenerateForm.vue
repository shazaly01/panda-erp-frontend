<!-- src/modules/hr/views/pay-periods/components/PayPeriodGenerateForm.vue -->
<template>
  <div
    class="-m-3 p-3.5 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-3 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- بطاقة شرح التوليد التلقائي -->
    <div
      class="bg-surface-card border border-info/40 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs"
    >
      <div
        class="w-8 h-8 rounded-lg bg-info/15 border border-info/30 text-info flex items-center justify-center shrink-0 mt-0.5"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div class="space-y-0.5">
        <h4 class="font-black text-xs text-text-primary">
          توليد الفترات التلقائي (Bulk Generation)
        </h4>
        <p class="text-[11px] text-text-secondary leading-relaxed">
          سيقوم النظام آلياً باحتساب التقويم وإنشاء جميع الفترات المالية للسنة المحددة بناءً على
          دورة الصرف الخاصة بالمجموعة (مثال: 12 فترة للمجموعة الشهرية، 52 للمجموعة الأسبوعية).
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3">
      <!-- 1. مجموعة الدفع المستهدفة -->
      <div>
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

      <!-- 2. السنة المالية -->
      <div>
        <AppInput
          id="generate-year"
          type="number"
          label="السنة المالية *"
          :model-value="modelValue.year"
          @update:model-value="updateField('year', $event)"
          placeholder="مثال: 2026"
          min="2020"
          max="2050"
          class="font-mono text-left"
          dir="ltr"
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

onMounted(() => {
  if (payGroupStore.groups.length === 0) {
    payGroupStore.fetchPayGroups({ is_active: 1 })
  }
})

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>
