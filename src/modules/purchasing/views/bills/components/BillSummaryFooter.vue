<!--src/modules/purchasing/views/bills/components/BillSummaryFooter.vue-->
<template>
  <div class="grid grid-cols-1 md:grid-cols-12 gap-4 text-right font-sans" dir="rtl">
    <!-- 1. بطاقة تفقيط الحسابات والإجماليات النهائية (5 أعمدة - ملمومة ومركزة) -->
    <div
      class="md:col-span-5 p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-2 text-xs font-semibold text-gray-400">
        <h3
          class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5 flex justify-between items-center"
        >
          <span>ملخص الحسابات والضريبة</span>
          <span
            class="text-[10px] text-gray-400 font-mono bg-[#16171b] px-2 py-0.5 rounded border border-[#3e414c]"
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

        <!-- حقل خصم الفاتورة الإجمالي -->
        <div class="flex flex-col gap-1 border-b border-gray-700/30 pb-1.5">
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
              class="h-7 px-2 bg-[#16171b] border border-[#3e414c] rounded text-[11px] text-gray-300 font-bold outline-none focus:border-[#e05e2b]"
            >
              <option value="fixed">مبلغ ثابت</option>
              <option value="percentage">نسبة مئوية %</option>
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              v-model.number="formData.discount_value"
              placeholder="قيمة الخصم..."
              class="h-7 w-full px-2 bg-[#16171b] border border-[#3e414c] rounded text-[11px] font-mono font-bold text-white outline-none focus:border-[#e05e2b] text-left"
            />
          </div>
        </div>

        <!-- ضريبة القيمة المضافة -->
        <div class="flex items-baseline justify-between text-sky-400">
          <span class="shrink-0">ضريبة المدخلات المستردة:</span>
          <span class="flex-1 mx-2 border-b border-dotted border-sky-500/20"></span>
          <span class="font-mono font-bold shrink-0"
            >+ {{ formatCurrency(calculatedTaxAmount) }}</span
          >
        </div>

        <!-- تكاليف الشحن والنقل المحملة -->
        <div
          class="flex justify-between items-center border-b border-gray-700/30 pb-1 text-gray-300"
        >
          <span>تكلفة الشحن والنقل:</span>
          <div class="w-28">
            <input
              type="number"
              step="0.01"
              min="0"
              v-model.number="formData.shipping_cost"
              placeholder="0.00"
              class="h-7 w-full px-2 bg-[#16171b] border border-[#3e414c] rounded text-[11px] font-mono font-bold text-white outline-none focus:border-[#e05e2b] text-left"
            />
          </div>
        </div>
      </div>

      <div class="pt-1 space-y-2">
        <!-- الإجمالي الصافي النهائي -->
        <div
          class="flex justify-between items-center bg-[#16171b] border border-emerald-500/30 p-2.5 rounded-lg shadow-[inner_0_0_10px_rgba(0,0,0,0.5)] text-emerald-400"
        >
          <span class="font-black text-xs">صافي الفاتورة الإجمالي:</span>
          <span class="text-xl font-mono font-black tracking-wide">
            {{ formatCurrency(calculatedTotalAmount) }}
          </span>
        </div>

        <!-- في حال كانت الفاتورة مسددة جزئياً أو كلياً -->
        <div
          v-if="formData.paid_amount > 0"
          class="flex justify-between items-center text-[11px] font-mono px-1"
        >
          <span class="text-gray-400"
            >المدفوع:
            <strong class="text-emerald-400">{{
              formatCurrency(formData.paid_amount)
            }}</strong></span
          >
          <span class="text-gray-400"
            >المتبقي:
            <strong class="text-rose-400">{{
              formatCurrency(calculatedRemainingAmount)
            }}</strong></span
          >
        </div>
      </div>
    </div>

    <!-- 2. بطاقة الشروط والملاحظات وبيانات التوريد (7 أعمدة - مريحة وعملية) -->
    <div
      class="md:col-span-7 p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-2"
    >
      <div class="flex flex-col flex-1">
        <div
          class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5 mb-2 flex justify-between items-center"
        >
          <label class="flex items-center gap-1.5">
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
            <span>ملاحظات الفاتورة وبيانات التوريد</span>
          </label>
          <span class="text-[10px] text-gray-500 font-normal">اختياري</span>
        </div>

        <textarea
          v-model="formData.notes"
          rows="6"
          placeholder="سجل شروط الدفع، تفاصيل بوليصة الشحن، أو أي ملاحظات توثيقية تخص عملية الشراء..."
          class="block w-full flex-1 min-h-[140px] p-3 border border-[#3e414c] hover:border-gray-500 rounded-lg bg-[#16171b] text-white placeholder:text-gray-500 text-xs font-semibold focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b] outline-none transition-all resize-none leading-relaxed"
        ></textarea>
      </div>

      <p v-if="getFieldError('notes')" class="text-rose-500 text-[10px] font-bold pr-1">
        {{ getFieldError('notes') }}
      </p>
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
  calculatedRemainingAmount: { type: Number, required: true },
  totalItemsCount: { type: Number, required: true },
  isDirectInventoryPurchase: { type: Boolean, default: true },
  isReceiptLinked: { type: Boolean, default: false },
  validationErrors: { type: Object, default: () => null },
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
