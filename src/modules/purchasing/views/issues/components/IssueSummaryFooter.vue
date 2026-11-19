<!-- src/modules/purchasing/views/issues/components/IssueSummaryFooter.vue -->
<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 text-right font-sans transition-colors duration-200 items-stretch"
    dir="rtl"
  >
    <!-- 1. بطاقة أسباب الصرف والملاحظات (8 أعمدة - الجانب الأيمن) -->
    <div
      class="lg:col-span-8 p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs flex flex-col justify-between space-y-2.5"
    >
      <div class="flex flex-col flex-1">
        <div
          class="flex items-center justify-between border-b border-surface-border/80 pb-2 mb-2.5"
        >
          <label class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>سبب الصرف والملاحظات الإدارية</span>
          </label>
          <span class="text-[10px] text-text-muted font-bold">اختياري</span>
        </div>

        <textarea
          v-model="formData.notes"
          rows="4"
          placeholder="سجل أسباب ومبررات الصرف، رقم أمر العمل، أو أي ملاحظات تخص تسليم المواد للجهة الطالبة..."
          class="w-full flex-1 min-h-[115px] p-3 border border-surface-border hover:border-primary/50 focus:border-primary rounded-lg bg-surface-ground focus:bg-surface-section text-text-primary placeholder:text-text-muted text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none leading-relaxed"
        ></textarea>
      </div>

      <p v-if="getFieldError('notes')" class="text-danger text-[10px] font-bold pr-1">
        {{ getFieldError('notes') }}
      </p>
    </div>

    <!-- 2. بطاقة ملخص الكميات وتكلفة الصرف الإجمالية (4 أعمدة - نهاية مسار العين وفوق أزرار الحفظ) -->
    <div
      class="lg:col-span-4 p-4 bg-surface-section rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs flex flex-col justify-between space-y-3 transition-colors duration-200"
    >
      <div class="space-y-2 text-xs font-semibold text-text-secondary">
        <div class="flex items-center justify-between border-b border-surface-border/80 pb-2">
          <h3 class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>ملخص بنود وكميات الصرف</span>
          </h3>
          <span
            class="text-[10px] text-primary font-mono font-bold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/25"
          >
            {{ totalItemsCount }} بند مسجل
          </span>
        </div>

        <!-- إجمالي عدد القطع والوحدات المنصرفة -->
        <div class="flex items-baseline justify-between text-info pt-0.5">
          <span class="shrink-0">إجمالي الكميات المنصرفة:</span>
          <span class="flex-1 mx-2 border-b border-dotted border-info/30"></span>
          <span class="font-mono font-bold shrink-0">
            {{ formatNumber(totalQuantitySum) }}
          </span>
        </div>

        <!-- متوسط تكلفة البند -->
        <div class="flex items-baseline justify-between text-text-secondary pt-0.5">
          <span class="shrink-0">متوسط تكلفة البند:</span>
          <span class="flex-1 mx-2 border-b border-dotted border-surface-border"></span>
          <span class="font-mono font-bold text-text-primary shrink-0">
            {{ formatCurrency(totalItemsCount > 0 ? calculatedTotalCost / totalItemsCount : 0) }}
          </span>
        </div>
      </div>

      <!-- إجمالي تكلفة البضاعة المنصرفة -->
      <div class="pt-1">
        <div
          class="flex justify-between items-center gap-3 bg-primary/10 border border-primary/35 px-3.5 py-2.5 rounded-xl text-primary shadow-2xs"
        >
          <span class="font-black text-xs whitespace-nowrap">إجمالي تكلفة الصرف:</span>
          <span class="text-lg sm:text-xl font-mono font-black tracking-tight whitespace-nowrap">
            {{ formatCurrency(calculatedTotalCost) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  calculatedTotalCost: { type: Number, required: true },
  totalItemsCount: { type: Number, required: true },
  totalQuantitySum: { type: Number, required: true },
  isRequisitionLinked: { type: Boolean, default: false },
  validationErrors: { type: Object, default: () => null },
})

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0'
  const num = Number(value)
  return isNaN(num) ? '0' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(num)
}

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
