<!--src/modules/purchasing/views/bills/components/BillSummaryFooter.vue-->
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-right font-sans" dir="rtl">
    <!-- 1. بطاقة تفقيط الحسابات والإجماليات النهائية -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-2 text-xs font-semibold text-gray-400">
        <h3
          class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5 flex justify-between items-center"
        >
          <span>ملخص الحسابات والضريبة</span>
          <span class="text-[10px] text-gray-400 font-mono">{{ totalItemsCount }} بند مسجل</span>
        </h3>

        <!-- المجموع الفرعي قبل الخصم والضريبة -->
        <div class="flex justify-between border-b border-gray-700/30 pb-1 text-gray-300">
          <span>المجموع الفرعي:</span>
          <span class="font-mono font-bold">{{ formatCurrency(calculatedSubtotal) }}</span>
        </div>

        <!-- حقل خصم الفاتورة الإجمالي -->
        <div class="flex flex-col gap-1 border-b border-gray-700/30 pb-1.5">
          <div class="flex justify-between items-center text-amber-400">
            <span>الخصم الإجمالي:</span>
            <span class="font-mono font-bold"
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
        <div class="flex justify-between border-b border-gray-700/30 pb-1 text-sky-400">
          <span>ضريبة المدخلات المستردة:</span>
          <span class="font-mono font-bold">+ {{ formatCurrency(calculatedTaxAmount) }}</span>
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

    <!-- 2. بطاقة الأثر المالي والمحاسبي والتوجيه -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-3">
        <h3 class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5">
          الحالة والتوجيه المحاسبي
        </h3>

        <!-- حالة الفاتورة -->
        <div
          class="p-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center justify-between"
        >
          <span class="text-xs font-bold text-gray-400">حالة المستند:</span>
          <span
            class="font-mono text-xs font-black px-2.5 py-0.5 rounded"
            :class="statusBadgeClass"
          >
            {{ statusBadgeText }}
          </span>
        </div>

        <!-- الأثر المالي والمخزني المباشر -->
        <div
          class="p-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg flex flex-col space-y-1.5"
        >
          <div class="flex items-center gap-1.5">
            <span
              class="w-2 h-2 rounded-full"
              :class="isDirectInventoryPurchase ? 'bg-emerald-400' : 'bg-sky-400'"
            ></span>
            <span class="text-[11px] font-bold text-gray-300">الأثر المالي والمخزني المتوقع:</span>
          </div>
          <p class="text-[10px] text-gray-400 font-medium leading-relaxed">
            {{ accountingImpactDescription }}
          </p>
        </div>
      </div>

      <!-- تفاصيل العملة وسعر الصرف -->
      <div
        class="p-2 bg-[#16171b]/60 border border-gray-800 rounded-lg text-[10px] text-gray-400 flex justify-between font-mono"
      >
        <span>سعر التحويل: {{ formData.exchange_rate || 1.0 }}</span>
        <span>العملة: {{ currencyLabel }}</span>
      </div>
    </div>

    <!-- 3. بطاقة الشروط والملاحظات -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col space-y-1.5"
    >
      <label
        class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5 mb-1 flex justify-between items-center"
      >
        <span>ملاحظات الفاتورة وبيانات التوريد</span>
        <span class="text-[10px] text-gray-500 font-normal">اختياري</span>
      </label>
      <textarea
        v-model="formData.notes"
        rows="4"
        placeholder="سجل شروط الدفع، تفاصيل بوليصة الشحن، أو أي ملاحظات توثيقية تخص عملية الشراء..."
        class="block w-full h-full min-h-[140px] p-3 border border-[#3e414c] rounded-lg bg-[#16171b] text-white placeholder:text-gray-500 text-xs font-semibold focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b] outline-none transition-all resize-none"
      ></textarea>
      <p v-if="getFieldError('notes')" class="text-rose-500 text-[10px] font-bold mt-0.5">
        {{ getFieldError('notes') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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

const statusBadgeText = computed(() => {
  switch (formData.value.status) {
    case 'posted':
      return 'مرحلة ومثبتة دفترياً'
    case 'partially_paid':
      return 'مسددة جزئياً'
    case 'paid':
      return 'مدفوعة بالكامل'
    case 'cancelled':
      return 'فاتورة ملغاة'
    default:
      return 'مسودة قيد المراجعة'
  }
})

const statusBadgeClass = computed(() => {
  switch (formData.value.status) {
    case 'posted':
      return 'bg-blue-950/50 text-blue-400 border border-blue-500/30'
    case 'partially_paid':
      return 'bg-amber-950/50 text-amber-400 border border-amber-500/30'
    case 'paid':
      return 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
    case 'cancelled':
      return 'bg-rose-950/50 text-rose-400 border border-rose-500/30'
    default:
      return 'bg-gray-800 text-gray-300 border border-gray-600'
  }
})

const accountingImpactDescription = computed(() => {
  if (props.isReceiptLinked) {
    return 'إقفال وسيط البضاعة المستلمة غير المفوترة (GRNI) مقابل ذمم المورد (AP)، وإثبات ضريبة القيمة المضافة للمدخلات. لا حركة مخزنية هنا لأن الاستلام مثبت مسبقاً.'
  }
  return 'شراء مباشر: توليد قيد من أصل المخزون وضريبة المدخلات إلى ذمم الموردين، مع زيادة رصيد المستودع المحدد فورياً بحركة شراء لحظية.'
})

const currencyLabel = computed(() => {
  switch (Number(formData.value.currency_id)) {
    case 2:
      return 'USD ($)'
    case 3:
      return 'EUR (€)'
    default:
      return 'SAR (ر.س)'
  }
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
