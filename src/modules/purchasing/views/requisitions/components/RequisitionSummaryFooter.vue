<!-- src/modules/purchasing/views/requisitions/components/RequisitionSummaryFooter.vue -->
<template>
  <div class="space-y-3 text-right font-sans transition-colors duration-200" dir="rtl">
    <!-- تنبيه في حال وجود سبب رفض مسجل مسبقاً للطلب -->
    <div
      v-if="formData.rejection_reason"
      class="p-3.5 bg-danger/10 border border-danger/30 rounded-xl space-y-1 text-danger text-xs shadow-2xs"
    >
      <div class="flex items-center gap-2 font-black text-xs">
        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>سبب الرفض المسجل من الإدارة:</span>
      </div>
      <p class="text-xs text-text-primary leading-relaxed pr-6 font-medium">
        {{ formData.rejection_reason }}
      </p>
    </div>

    <!-- بطاقة مبررات الاحتياج والملاحظات -->
    <div
      class="p-4 bg-surface-section rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs space-y-2.5 transition-colors duration-200"
    >
      <div class="flex items-center justify-between border-b border-surface-border/80 pb-2">
        <label class="text-xs font-black text-text-primary flex items-center gap-1.5">
          <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
          <span>مبررات الاحتياج أو ملاحظات عامة</span>
        </label>
        <span class="text-[10px] text-text-muted font-bold">اختياري</span>
      </div>

      <textarea
        v-model="formData.notes"
        rows="3"
        placeholder="سجل هنا أي تفاصيل توضح سبب الاحتياج، الموقع أو القسم المستفيد، أو أي تعليمات خاصة لمسؤول المشتريات..."
        class="w-full p-3 border border-surface-border hover:border-primary/50 focus:border-primary rounded-lg bg-surface-ground focus:bg-surface-section text-text-primary placeholder:text-text-muted text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none leading-relaxed"
      ></textarea>

      <p v-if="getFieldError('notes')" class="text-danger text-[10px] font-bold pr-1">
        {{ getFieldError('notes') }}
      </p>
    </div>
  </div>
</template>

<script setup>
const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  calculatedEstimatedTotal: { type: Number, default: 0 },
  totalItemsCount: { type: Number, default: 0 },
  validationErrors: { type: Object, default: () => null },
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
