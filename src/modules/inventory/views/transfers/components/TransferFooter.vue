<!-- src/modules/inventory/views/transfers/components/TransferFooter.vue -->
<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 text-right font-sans transition-colors duration-200 items-stretch"
    dir="rtl"
  >
    <!-- 1. بطاقة ملاحظات وبيانات وسيلة النقل والتوثيق (7 أعمدة - الجانب الأيمن) -->
    <div
      class="lg:col-span-7 p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs flex flex-col justify-between space-y-2.5"
    >
      <div class="flex flex-col flex-1">
        <div
          class="flex items-center justify-between border-b border-surface-border/80 pb-2 mb-2.5"
        >
          <label class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>ملاحظات وتفاصيل وسيلة النقل</span>
          </label>
          <span class="text-[10px] text-text-muted font-bold">اختياري</span>
        </div>

        <textarea
          v-model="notesModel"
          rows="4"
          placeholder="سجل أسباب التحويل، اسم السائق، رقم وسيلة النقل، أو أي تعليمات استلام إضافية..."
          class="w-full flex-1 p-3 border border-surface-border hover:border-primary/50 focus:border-primary rounded-lg bg-surface-ground focus:bg-surface-section text-text-primary placeholder:text-text-muted text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none leading-relaxed"
        ></textarea>
      </div>

      <p v-if="getFieldError('notes')" class="text-danger text-[10px] font-bold pr-1">
        {{ getFieldError('notes') }}
      </p>
    </div>

    <!-- 2. بطاقة ملخص الكميات والقيمة الإجمالية للتحويل (5 أعمدة - نهاية مسار العين وفوق أزرار الحفظ) -->
    <div
      class="lg:col-span-5 p-4 bg-surface-section rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs flex flex-col justify-between space-y-3 transition-colors duration-200"
    >
      <div class="space-y-2 text-xs font-semibold text-text-secondary">
        <div class="flex items-center justify-between border-b border-surface-border/80 pb-2">
          <h3 class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>ملخص البنود والقيمة المحولة</span>
          </h3>
          <span
            class="text-[10px] text-primary font-mono font-bold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/25"
          >
            {{ totalItemsCount }} صنف مسجل
          </span>
        </div>

        <div class="flex items-baseline justify-between text-info pt-0.5">
          <span class="shrink-0">إجمالي الكميات المحولة:</span>
          <span class="flex-1 mx-2 border-b border-dotted border-info/30"></span>
          <span class="font-mono font-bold shrink-0">
            {{ formatNumber(totalTransferQuantity) }} وحدة
          </span>
        </div>

        <div class="flex items-baseline justify-between text-text-secondary pt-0.5">
          <span class="shrink-0">عدد البنود المنقولة:</span>
          <span class="flex-1 mx-2 border-b border-dotted border-surface-border"></span>
          <span class="font-mono font-bold text-text-primary shrink-0">
            {{ totalItemsCount }} صنف
          </span>
        </div>
      </div>

      <div class="pt-0.5">
        <div
          class="flex justify-between items-center gap-3 bg-primary/10 border border-primary/35 px-3.5 py-2.5 rounded-xl text-primary shadow-2xs"
        >
          <span class="font-black text-xs whitespace-nowrap">إجمالي تقييم البضاعة:</span>
          <span class="text-xl sm:text-2xl font-mono font-black tracking-tight whitespace-nowrap">
            {{ formatCurrency(totalTransferCost) }}
          </span>
        </div>

        <p
          v-if="getFieldError('total_cost')"
          class="text-danger text-[10px] text-center font-bold mt-1"
        >
          {{ getFieldError('total_cost') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters'

const notesModel = defineModel('notes', { type: String, default: '' })

const props = defineProps({
  totalTransferCost: { type: Number, required: true },
  totalTransferQuantity: { type: Number, required: true },
  totalItemsCount: { type: Number, required: true },
  validationErrors: { type: Object, default: () => null },
})

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0'
  const num = Number(value)
  if (isNaN(num)) return '0'
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 4,
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num)
}

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
