<!-- src/modules/purchasing/views/requisitions/components/RequisitionSummaryFooter.vue -->
<template>
  <div class="space-y-3 text-right font-sans" dir="rtl">
    <!-- تنبيه في حال وجود سبب رفض مسجل مسبقاً للطلب -->
    <div
      v-if="formData.rejection_reason"
      class="p-4 bg-rose-950/30 border border-rose-900/50 rounded-2xl space-y-1 text-rose-300 text-xs shadow-sm"
    >
      <div class="flex items-center gap-2 text-rose-400 font-bold text-xs">
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
      <p class="text-xs text-rose-200/90 leading-relaxed pr-6">
        {{ formData.rejection_reason }}
      </p>
    </div>

    <!-- بطاقة مبررات الاحتياج والملاحظات فقط (مبسطة ونظيفة بصرياً) -->
    <div class="p-4 bg-[#23252e] rounded-2xl border border-[#3b3f4f] shadow-lg space-y-2.5">
      <div class="flex items-center justify-between">
        <label class="text-xs font-bold text-gray-200 flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span>مبررات الاحتياج أو ملاحظات عامة</span>
        </label>
        <span class="text-[11px] text-gray-500 font-normal">اختياري</span>
      </div>

      <textarea
        v-model="formData.notes"
        rows="3"
        placeholder="سجل هنا أي تفاصيل توضح سبب الاحتياج، الموقع أو القسم المستفيد، أو أي تعليمات خاصة لمسؤول المشتريات..."
        class="w-full p-3 border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded-xl bg-[#16171b] text-white placeholder:text-gray-500 text-xs font-semibold focus:ring-1 focus:ring-[#e05e2b]/40 outline-none transition-all resize-none leading-relaxed"
      ></textarea>

      <p v-if="getFieldError('notes')" class="text-rose-400 text-[10px] font-bold pr-1">
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
