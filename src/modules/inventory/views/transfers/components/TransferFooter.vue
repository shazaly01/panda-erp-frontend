<!--src/modules/inventory/views/transfers/components/TransferFooter.vue-->
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-right font-sans" dir="rtl">
    <!-- 1. بطاقة ملخص الكميات والقيمة الإجمالية للتحويل -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-2 text-xs font-semibold text-gray-400">
        <h3 class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5">
          ملخص البنود والقيمة المحولة
        </h3>

        <div class="flex justify-between border-b border-gray-700/30 pb-1.5 text-sky-400">
          <span>إجمالي الكميات المحولة:</span>
          <span class="font-mono font-bold">{{ formatNumber(totalTransferQuantity) }} وحدة</span>
        </div>

        <div class="flex justify-between border-b border-gray-700/30 pb-1.5 text-gray-400">
          <span>إجمالي عدد البنود المسجلة:</span>
          <span class="font-mono font-bold text-white">{{ totalItemsCount }} صنف</span>
        </div>
      </div>

      <div class="pt-2">
        <div
          class="flex justify-between items-center bg-[#16171b] border border-emerald-500/30 p-2.5 rounded-lg shadow-[inner_0_0_10px_rgba(0,0,0,0.5)] text-emerald-400"
        >
          <span class="font-black text-[11px]">إجمالي تقييم البضاعة المحولة:</span>
          <span class="text-xl font-mono font-black tracking-wide">
            {{ formatCurrency(totalTransferCost) }}
          </span>
        </div>

        <p
          v-if="getFieldError('total_cost')"
          class="text-rose-500 text-[10px] text-center font-bold mt-1"
        >
          {{ getFieldError('total_cost') }}
        </p>
      </div>
    </div>

    <!-- 2. بطاقة ملخص الحالة والتوجيه المحاسبي والمخزني -->
    <div class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl space-y-4">
      <h3 class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5">
        الحالة والتوجيه المخزني
      </h3>

      <div class="flex flex-col space-y-3 pt-1">
        <div
          class="p-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center justify-between"
        >
          <span class="text-xs font-bold text-gray-400">حالة المستند:</span>
          <span
            class="font-mono text-xs font-black px-2 py-0.5 rounded"
            :class="[
              statusModel === 'approved' || statusModel === 'completed'
                ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-950/50 text-amber-400 border border-amber-500/30',
            ]"
          >
            {{
              statusModel === 'approved' || statusModel === 'completed'
                ? 'معتمد ومرحل مخزنياً'
                : 'مسودة قيد المراجعة'
            }}
          </span>
        </div>

        <div class="p-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg flex flex-col space-y-1">
          <span class="text-[11px] font-bold text-gray-400">الأثر المباشر للتحويل:</span>
          <p class="text-[10px] text-gray-500 font-medium leading-relaxed">
            عند الاعتماد، سيتم خصم الكميات من رصيد المستودع المصدر وإضافتها لرصيد المستودع الوجهة مع
            توليد قيد نقل تكلفة المخزون.
          </p>
        </div>
      </div>
    </div>

    <!-- 3. بطاقة ملاحظات وبيانات وسيلة النقل والتوثيق -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col space-y-1.5"
    >
      <label class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5 mb-1">
        ملاحظات وتفاصيل أمر التحويل
      </label>
      <textarea
        v-model="notesModel"
        rows="3"
        placeholder="سجل أسباب التحويل، اسم السائق، رقم وسيلة النقل، أو أي تعليمات استلام إضافية..."
        class="block w-full h-full min-h-[96px] p-3 border border-[#3e414c] rounded-lg bg-[#16171b] text-white placeholder:text-gray-500 text-xs font-semibold focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b] outline-none transition-all resize-none"
      ></textarea>
      <p v-if="getFieldError('notes')" class="text-rose-500 text-[10px] font-bold mt-0.5">
        {{ getFieldError('notes') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters'

// الربط ثنائي الاتجاه للبيانات
const notesModel = defineModel('notes', { type: String, default: '' })
const statusModel = defineModel('status', { type: String, default: 'draft' })

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
