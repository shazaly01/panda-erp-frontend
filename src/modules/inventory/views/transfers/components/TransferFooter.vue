<!-- src/modules/inventory/views/transfers/components/TransferFooter.vue -->
<template>
  <div class="grid grid-cols-1 md:grid-cols-12 gap-4 text-right font-sans" dir="rtl">
    <!-- 1. بطاقة ملخص الكميات والقيمة الإجمالية للتحويل (4 أعمدة - مركزة وملمومة) -->
    <div
      class="md:col-span-4 p-4 bg-[#23252e] rounded-2xl border border-[#3b3f4f] shadow-xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-2.5 text-xs font-semibold text-gray-400">
        <h3
          class="text-xs font-black text-gray-200 border-b border-[#3b3f4f]/60 pb-2 flex justify-between items-center"
        >
          <span class="flex items-center gap-1.5">
            <svg
              class="w-4 h-4 text-[#e05e2b]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <span>ملخص البنود والقيمة المحولة</span>
          </span>
          <span
            class="text-[10px] text-gray-400 font-mono bg-[#16171b] px-2 py-0.5 rounded-md border border-[#3e414c]"
          >
            {{ totalItemsCount }} صنف مسجل
          </span>
        </h3>

        <div class="flex items-baseline justify-between text-sky-400">
          <span class="shrink-0">إجمالي الكميات المحولة:</span>
          <span class="flex-1 mx-2 border-b border-dotted border-sky-500/20"></span>
          <span class="font-mono font-bold shrink-0"
            >{{ formatNumber(totalTransferQuantity) }} وحدة</span
          >
        </div>

        <div class="flex items-baseline justify-between text-gray-400 pt-1">
          <span class="shrink-0">عدد البنود المنقولة:</span>
          <span class="flex-1 mx-2 border-b border-dotted border-[#3e414c]"></span>
          <span class="font-mono font-bold text-white shrink-0">{{ totalItemsCount }} صنف</span>
        </div>
      </div>

      <div class="pt-2">
        <div
          class="flex justify-between items-center bg-[#16171b] border border-emerald-500/30 p-2.5 rounded-xl shadow-inner text-emerald-400"
        >
          <span class="font-black text-xs">إجمالي تقييم البضاعة:</span>
          <span class="text-base font-mono font-black tracking-wide">
            {{ formatCurrency(totalTransferCost) }}
          </span>
        </div>

        <p
          v-if="getFieldError('total_cost')"
          class="text-rose-400 text-[10px] text-center font-bold mt-1 pr-1"
        >
          {{ getFieldError('total_cost') }}
        </p>
      </div>
    </div>

    <!-- 2. بطاقة ملاحظات وبيانات وسيلة النقل والتوثيق (8 أعمدة - مساحة عملية ومريحة) -->
    <div
      class="md:col-span-8 p-4 bg-[#23252e] rounded-2xl border border-[#3b3f4f] shadow-xl flex flex-col justify-between space-y-2"
    >
      <div class="flex flex-col flex-1">
        <div class="flex items-center justify-between border-b border-[#3b3f4f]/60 pb-2 mb-2">
          <label class="text-xs font-bold text-gray-200 flex items-center gap-1.5">
            <svg
              class="w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>ملاحظات وتفاصيل وسيلة النقل</span>
          </label>
          <span class="text-[10px] text-gray-500 font-normal">اختياري</span>
        </div>

        <textarea
          v-model="notesModel"
          rows="4"
          placeholder="سجل أسباب التحويل، اسم السائق، رقم وسيلة النقل، أو أي تعليمات استلام إضافية..."
          class="w-full flex-1 p-3 border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded-xl bg-[#16171b] text-white placeholder:text-gray-500 text-xs font-semibold focus:ring-1 focus:ring-[#e05e2b]/40 outline-none transition-all resize-none leading-relaxed"
        ></textarea>
      </div>

      <p v-if="getFieldError('notes')" class="text-rose-400 text-[10px] font-bold pr-1">
        {{ getFieldError('notes') }}
      </p>
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
