<!--src/modules/purchasing/views/orders/components/OrderSummaryFooter.vue-->
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-right font-sans" dir="rtl">
    <!-- 1. بطاقة تفقيط الحسابات والإجماليات المالية -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-2 text-xs font-semibold text-gray-400">
        <h3
          class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5 flex justify-between items-center"
        >
          <span>ملخص القيمة التقديرية والضريبة</span>
          <span class="text-[10px] text-gray-400 font-mono">{{ totalItemsCount }} بند مسجل</span>
        </h3>

        <!-- المجموع الفرعي قبل الخصم والضريبة -->
        <div class="flex justify-between border-b border-gray-700/30 pb-1 text-gray-300">
          <span>المجموع الفرعي:</span>
          <span class="font-mono font-bold">{{ formatCurrency(calculatedSubtotal) }}</span>
        </div>

        <!-- حقل الخصم الإجمالي -->
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

        <!-- ضريبة القيمة المضافة المتوقعة -->
        <div class="flex justify-between border-b border-gray-700/30 pb-1 text-sky-400">
          <span>ضريبة القيمة المضافة المتوقعة:</span>
          <span class="font-mono font-bold">+ {{ formatCurrency(calculatedTaxAmount) }}</span>
        </div>

        <!-- تكاليف الشحن والنقل التقديرية -->
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

      <div class="pt-1">
        <!-- الإجمالي الصافي النهائي لأمر الشراء -->
        <div
          class="flex justify-between items-center bg-[#16171b] border border-emerald-500/30 p-2.5 rounded-lg shadow-[inner_0_0_10px_rgba(0,0,0,0.5)] text-emerald-400"
        >
          <span class="font-black text-xs">صافي قيمة الأمر الإجمالية:</span>
          <span class="text-xl font-mono font-black tracking-wide">
            {{ formatCurrency(calculatedTotalAmount) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 2. بطاقة الحالة ومسار الاعتماد المستندي -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-3">
        <h3 class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5">
          الحالة والأثر التشغيلي
        </h3>

        <!-- حالة أمر الشراء الحالية -->
        <div
          class="p-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center justify-between"
        >
          <span class="text-xs font-bold text-gray-400">حالة المستند:</span>
          <span
            class="font-mono text-xs font-black px-2.5 py-0.5 rounded border"
            :class="statusBadgeClass"
          >
            {{ statusBadgeText }}
          </span>
        </div>

        <!-- طبيعة المستند والأثر المخزني والمالي -->
        <div
          class="p-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg flex flex-col space-y-1.5"
        >
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-sky-400"></span>
            <span class="text-[11px] font-bold text-gray-300">الأثر التشغيلي المتوقع:</span>
          </div>
          <p class="text-[10px] text-gray-400 font-medium leading-relaxed">
            أمر الشراء التزام تعاقدي مع المورد. لا يولد قيوداً محاسبية دفترية ولا يحرك أرصدة المخزون
            بشكل مباشر إلا بعد إصدار سندات الاستلام المخزني أو فواتير الشراء المرتبطة به.
          </p>
        </div>
      </div>

      <!-- تفاصيل العملة وسعر التحويل -->
      <div
        class="p-2 bg-[#16171b]/60 border border-gray-800 rounded-lg text-[10px] text-gray-400 flex justify-between font-mono"
      >
        <span>سعر التحويل: {{ formData.exchange_rate || 1.0 }}</span>
        <span>العملة: {{ currencyLabel }}</span>
      </div>
    </div>

    <!-- 3. بطاقة الشروط والأحكام والملاحظات -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col space-y-2.5"
    >
      <div class="space-y-1">
        <label class="text-[11px] font-black text-gray-300 flex justify-between items-center">
          <span>شروط وأحكام التوريد</span>
          <span class="text-[10px] text-gray-500 font-normal">تظهر في الطباعة</span>
        </label>
        <textarea
          v-model="formData.terms_and_conditions"
          rows="2"
          placeholder="سجل شروط التوريد، غرامات التأخير، متطلبات التغليف والفحص الفني..."
          class="block w-full p-2.5 border border-[#3e414c] rounded-lg bg-[#16171b] text-white placeholder:text-gray-500 text-xs font-semibold focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b] outline-none transition-all resize-none"
        ></textarea>
        <p v-if="getFieldError('terms_and_conditions')" class="text-rose-500 text-[10px] font-bold">
          {{ getFieldError('terms_and_conditions') }}
        </p>
      </div>

      <div class="space-y-1">
        <label class="text-[11px] font-black text-gray-300 flex justify-between items-center">
          <span>ملاحظات داخلية</span>
          <span class="text-[10px] text-gray-500 font-normal">اختياري</span>
        </label>
        <textarea
          v-model="formData.notes"
          rows="2"
          placeholder="أي ملاحظات توثيقية إضافية تخص أمر الشراء..."
          class="block w-full p-2.5 border border-[#3e414c] rounded-lg bg-[#16171b] text-white placeholder:text-gray-500 text-xs font-semibold focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b] outline-none transition-all resize-none"
        ></textarea>
        <p v-if="getFieldError('notes')" class="text-rose-500 text-[10px] font-bold">
          {{ getFieldError('notes') }}
        </p>
      </div>
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
  totalItemsCount: { type: Number, required: true },
  validationErrors: { type: Object, default: () => null },
})

const statusBadgeText = computed(() => {
  switch (formData.value.status) {
    case 'confirmed':
      return 'أمر شراء مؤكد'
    case 'partially_received':
      return 'مستلم جزئياً'
    case 'received':
      return 'مستلم بالكامل'
    case 'partially_billed':
      return 'مفوتر جزئياً'
    case 'billed':
      return 'مفوتر بالكامل'
    case 'closed':
      return 'أمر شراء مغلق'
    case 'cancelled':
      return 'أمر ملغي'
    default:
      return 'مسودة قيد المراجعة'
  }
})

const statusBadgeClass = computed(() => {
  switch (formData.value.status) {
    case 'confirmed':
      return 'bg-blue-950/50 text-blue-400 border-blue-500/30'
    case 'partially_received':
      return 'bg-indigo-950/50 text-indigo-400 border-indigo-500/30'
    case 'received':
      return 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
    case 'partially_billed':
      return 'bg-purple-950/50 text-purple-400 border-purple-500/30'
    case 'billed':
      return 'bg-teal-950/50 text-teal-400 border-teal-500/30'
    case 'closed':
      return 'bg-gray-800 text-gray-300 border-gray-600'
    case 'cancelled':
      return 'bg-rose-950/50 text-rose-400 border-rose-500/30'
    default:
      return 'bg-amber-950/40 text-amber-400 border-amber-500/30'
  }
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
