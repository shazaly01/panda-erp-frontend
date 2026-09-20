<!-- src/modules/purchasing/views/orders/components/OrderSummaryFooter.vue -->
<template>
  <div class="grid grid-cols-1 md:grid-cols-12 gap-4 text-right font-sans" dir="rtl">
    <!-- 1. بطاقة تفقيط الحسابات والإجماليات المالية (5 أعمدة - مركزة وملمومة) -->
    <div
      class="md:col-span-5 p-4 bg-[#23252e] rounded-2xl border border-[#3b3f4f] shadow-xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-2 text-xs font-semibold text-gray-400">
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
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span>ملخص القيمة التقديرية والضريبة</span>
          </span>
          <span
            class="text-[10px] text-gray-400 font-mono bg-[#16171b] px-2 py-0.5 rounded-md border border-[#3e414c]"
          >
            {{ totalItemsCount }} بند مسجل
          </span>
        </h3>

        <!-- المجموع الفرعي قبل الخصم والضريبة -->
        <div class="flex items-baseline justify-between text-gray-300">
          <span class="shrink-0">المجموع الفرعي:</span>
          <span class="flex-1 mx-2 border-b border-dotted border-gray-700/60"></span>
          <span class="font-mono font-bold shrink-0">{{ formatCurrency(calculatedSubtotal) }}</span>
        </div>

        <!-- حقل الخصم الإجمالي -->
        <div class="flex flex-col gap-1 border-b border-[#3b3f4f]/40 pb-1.5">
          <div class="flex items-baseline justify-between text-amber-400">
            <span class="shrink-0">الخصم الإجمالي:</span>
            <span class="flex-1 mx-2 border-b border-dotted border-amber-500/20"></span>
            <span class="font-mono font-bold shrink-0"
              >- {{ formatCurrency(calculatedDiscountAmount) }}</span
            >
          </div>
          <div class="flex items-center gap-2 pt-0.5">
            <select
              v-model="formData.discount_type"
              style="color-scheme: dark"
              class="h-8 px-2 bg-[#16171b] border border-[#3e414c] rounded-lg text-[11px] text-gray-300 font-bold outline-none focus:border-[#e05e2b] cursor-pointer"
            >
              <option value="fixed" class="bg-[#16171b]">مبلغ ثابت</option>
              <option value="percentage" class="bg-[#16171b]">نسبة مئوية %</option>
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              v-model.number="formData.discount_value"
              placeholder="قيمة الخصم..."
              class="h-8 w-full px-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg text-xs font-mono font-bold text-white outline-none focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b]/30 text-left placeholder-gray-500 transition-all"
            />
          </div>
        </div>

        <!-- ضريبة القيمة المضافة المتوقعة -->
        <div class="flex items-baseline justify-between text-sky-400">
          <span class="shrink-0">ضريبة القيمة المضافة المتوقعة:</span>
          <span class="flex-1 mx-2 border-b border-dotted border-sky-500/20"></span>
          <span class="font-mono font-bold shrink-0"
            >+ {{ formatCurrency(calculatedTaxAmount) }}</span
          >
        </div>

        <!-- تكاليف الشحن والنقل التقديرية -->
        <div
          class="flex justify-between items-center border-b border-[#3b3f4f]/40 pb-1.5 text-gray-300"
        >
          <span>تكلفة الشحن والنقل:</span>
          <div class="w-32">
            <input
              type="number"
              step="0.01"
              min="0"
              v-model.number="formData.shipping_cost"
              placeholder="0.00"
              class="h-8 w-full px-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg text-xs font-mono font-bold text-white outline-none focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b]/30 text-left placeholder-gray-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div class="pt-1">
        <!-- الإجمالي الصافي النهائي لأمر الشراء -->
        <div
          class="flex justify-between items-center bg-[#16171b] border border-emerald-500/30 p-2.5 rounded-xl shadow-inner text-emerald-400"
        >
          <span class="font-black text-xs">صافي قيمة الأمر الإجمالية:</span>
          <span class="text-base font-mono font-black tracking-wide">
            {{ formatCurrency(calculatedTotalAmount) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 2. بطاقة الشروط والأحكام والملاحظات (7 أعمدة - مريحة وعملية) -->
    <div
      class="md:col-span-7 p-4 bg-[#23252e] rounded-2xl border border-[#3b3f4f] shadow-xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-1.5 flex-1 flex flex-col">
        <div class="flex justify-between items-center border-b border-[#3b3f4f]/60 pb-1.5">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>شروط وأحكام التوريد</span>
          </label>
          <span class="text-[10px] text-gray-500 font-normal">تظهر في الطباعة</span>
        </div>
        <textarea
          v-model="formData.terms_and_conditions"
          rows="2"
          placeholder="سجل شروط التوريد، غرامات التأخير، متطلبات التغليف والفحص الفني..."
          class="w-full flex-1 min-h-[60px] p-2.5 border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded-xl bg-[#16171b] text-white placeholder:text-gray-500 text-xs font-semibold focus:ring-1 focus:ring-[#e05e2b]/40 outline-none transition-all resize-none leading-relaxed"
        ></textarea>
        <p
          v-if="getFieldError('terms_and_conditions')"
          class="text-rose-400 text-[10px] font-bold pr-1"
        >
          {{ getFieldError('terms_and_conditions') }}
        </p>
      </div>

      <div class="space-y-1.5 flex-1 flex flex-col">
        <div class="flex justify-between items-center border-b border-[#3b3f4f]/60 pb-1.5">
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
            <span>ملاحظات داخلية</span>
          </label>
          <span class="text-[10px] text-gray-500 font-normal">اختياري</span>
        </div>
        <textarea
          v-model="formData.notes"
          rows="2"
          placeholder="أي ملاحظات توثيقية إضافية تخص أمر الشراء..."
          class="w-full flex-1 min-h-[60px] p-2.5 border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded-xl bg-[#16171b] text-white placeholder:text-gray-500 text-xs font-semibold focus:ring-1 focus:ring-[#e05e2b]/40 outline-none transition-all resize-none leading-relaxed"
        ></textarea>
        <p v-if="getFieldError('notes')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('notes') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  calculatedSubtotal: { type: Number, required: true },
  calculatedDiscountAmount: { type: Number, required: true },
  calculatedTaxAmount: { type: Number, required: true },
  calculatedShippingCost: { type: Number, required: true },
  calculatedTotalAmount: { type: Number, required: true },
  totalItemsCount: { type: Number, required: true },
  validationErrors: { type: Object, default: () => null },
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
