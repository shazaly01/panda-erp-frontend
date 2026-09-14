<!--src/modules/purchasing/views/receipts/components/ReceiptSummaryFooter.vue-->
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-right font-sans" dir="rtl">
    <!-- 1. بطاقة ملخص الكميات والتكلفة التقديرية -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-2 text-xs font-semibold text-gray-400">
        <h3
          class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5 flex justify-between items-center"
        >
          <span>إحصائيات الفحص والاستلام</span>
          <span class="text-[10px] text-gray-400 font-mono">{{ totalItemsCount }} بند مسجل</span>
        </h3>

        <!-- إجمالي الكميات المستلمة فعلياً -->
        <div class="flex justify-between border-b border-gray-700/30 pb-1 text-sky-300">
          <span>إجمالي الكميات المستلمة:</span>
          <span class="font-mono font-bold">{{ formatNumber(totalReceivedQuantity) }}</span>
        </div>

        <!-- إجمالي الكميات المقبولة لإدخالها المخزن -->
        <div class="flex justify-between border-b border-gray-700/30 pb-1 text-emerald-400">
          <span>الكميات المقبولة (للمخزن):</span>
          <span class="font-mono font-bold">{{ formatNumber(totalAcceptedQuantity) }}</span>
        </div>

        <!-- إجمالي الكميات المرفوضة في الفحص -->
        <div class="flex justify-between border-b border-gray-700/30 pb-1 text-rose-400">
          <span>الكميات المرفوضة (تالف/غير مطابق):</span>
          <span class="font-mono font-bold">{{ formatNumber(totalRejectedQuantity) }}</span>
        </div>
      </div>

      <!-- إجمالي التكلفة التقديرية للبضاعة المقبولة -->
      <div class="pt-1">
        <div
          class="flex justify-between items-center bg-[#16171b] border border-emerald-500/30 p-2.5 rounded-lg shadow-[inner_0_0_10px_rgba(0,0,0,0.5)] text-emerald-400"
        >
          <span class="font-black text-xs">إجمالي التكلفة التقديرية:</span>
          <span class="text-lg font-mono font-black tracking-wide">
            {{ formatCurrency(totalEstimatedCost) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 2. بطاقة الحالة التشغيلية والأثر المخزني -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-3">
        <h3 class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5">
          الحالة والأثر المخزني
        </h3>

        <!-- حالة السند الحالية -->
        <div
          class="p-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center justify-between"
        >
          <span class="text-xs font-bold text-gray-400">حالة السند:</span>
          <span
            class="font-mono text-xs font-black px-2.5 py-0.5 rounded"
            :class="statusBadgeClass"
          >
            {{ statusBadgeText }}
          </span>
        </div>

        <!-- توضيح الأثر اللوجستي والمخزني -->
        <div
          class="p-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg flex flex-col space-y-1.5"
        >
          <div class="flex items-center gap-1.5">
            <span
              class="w-2 h-2 rounded-full"
              :class="formData.status === 'received' ? 'bg-emerald-400' : 'bg-amber-400'"
            ></span>
            <span class="text-[11px] font-bold text-gray-300">الأثر المخزني المباشر:</span>
          </div>
          <p class="text-[10px] text-gray-400 font-medium leading-relaxed">
            {{ inventoryImpactDescription }}
          </p>
        </div>
      </div>

      <!-- إشعار الربط المرجعي -->
      <div
        class="p-2 bg-[#16171b]/60 border border-gray-800 rounded-lg text-[10px] text-gray-400 flex justify-between font-mono"
      >
        <span
          >نوع العملية:
          {{ isOrderLinked ? 'توريد وفق أمر شراء معتمد' : 'إدخال مخزني حر ومباشر' }}</span
        >
      </div>
    </div>

    <!-- 3. بطاقة الملاحظات وتقرير المعاينة -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col space-y-1.5"
    >
      <label
        class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5 mb-1 flex justify-between items-center"
      >
        <span>ملاحظات الاستلام وتقرير المعاينة</span>
        <span class="text-[10px] text-gray-500 font-normal">اختياري</span>
      </label>
      <textarea
        v-model="formData.notes"
        rows="4"
        placeholder="سجل حالة الصناديق، سلامة التغليف، ملاحظات السائق والناقل، أو تفاصيل الفحص الظاهري..."
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
  totalItemsCount: { type: Number, required: true },
  totalReceivedQuantity: { type: Number, required: true },
  totalAcceptedQuantity: { type: Number, required: true },
  totalRejectedQuantity: { type: Number, required: true },
  totalEstimatedCost: { type: Number, required: true },
  isOrderLinked: { type: Boolean, default: false },
  validationErrors: { type: Object, default: () => null },
})

const statusBadgeText = computed(() => {
  switch (formData.value.status) {
    case 'received':
      return 'تم الاستلام وإثبات المخزون'
    case 'cancelled':
      return 'سند استلام ملغي'
    default:
      return 'مسودة قيد الفحص والمراجعة'
  }
})

const statusBadgeClass = computed(() => {
  switch (formData.value.status) {
    case 'received':
      return 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
    case 'cancelled':
      return 'bg-rose-950/50 text-rose-400 border border-rose-500/30'
    default:
      return 'bg-amber-950/50 text-amber-400 border border-amber-500/30'
  }
})

const inventoryImpactDescription = computed(() => {
  if (formData.value.status === 'received') {
    return 'تم ترحيل الكميات المقبولة فعلياً إلى رصيد المستودع، وتم إنشاء حركات المخزون ذات الصلة بنجاح.'
  }
  if (formData.value.status === 'cancelled') {
    return 'السند ملغي ولا يوجد له أي تأثير على أرصدة المستودع أو حركة المخزون.'
  }
  return 'المسودة الحالية لا تؤثر على أرصدة المستودع. عند الضغط على تأكيد الاستلام، سيتم إدخال الكميات المقبولة فقط إلى المخزن.'
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
