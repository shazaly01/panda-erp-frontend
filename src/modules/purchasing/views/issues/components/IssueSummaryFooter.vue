<!--src/modules/purchasing/views/issues/components/IssueSummaryFooter.vue-->
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-right font-sans" dir="rtl">
    <!-- 1. بطاقة ملخص الكميات وتكلفة الصرف الإجمالية -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-2 text-xs font-semibold text-gray-400">
        <h3
          class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5 flex justify-between items-center"
        >
          <span>ملخص بنود وكميات الصرف</span>
          <span class="text-[10px] text-gray-400 font-mono">{{ totalItemsCount }} بند مسجل</span>
        </h3>

        <!-- إجمالي عدد القطع والوحدات المنصرفة -->
        <div class="flex justify-between border-b border-gray-700/30 pb-1 text-gray-300">
          <span>إجمالي الكميات المنصرفة:</span>
          <span class="font-mono font-bold text-sky-400">{{ formatNumber(totalQuantitySum) }}</span>
        </div>

        <!-- متوسط تكلفة البند -->
        <div class="flex justify-between border-b border-gray-700/30 pb-1 text-gray-300">
          <span>متوسط تكلفة البند:</span>
          <span class="font-mono font-bold">
            {{ formatCurrency(totalItemsCount > 0 ? calculatedTotalCost / totalItemsCount : 0) }}
          </span>
        </div>
      </div>

      <div class="pt-1 space-y-2">
        <!-- إجمالي تكلفة البضاعة المنصرفة -->
        <div
          class="flex justify-between items-center bg-[#16171b] border border-emerald-500/30 p-2.5 rounded-lg shadow-[inner_0_0_10px_rgba(0,0,0,0.5)] text-emerald-400"
        >
          <span class="font-black text-xs">إجمالي تكلفة الصرف:</span>
          <span class="text-xl font-mono font-black tracking-wide">
            {{ formatCurrency(calculatedTotalCost) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 2. بطاقة الأثر المخزني والتوجيه -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-3">
        <h3 class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5">
          الحالة والأثر المخزني
        </h3>

        <!-- حالة المستند -->
        <div
          class="p-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center justify-between"
        >
          <span class="text-xs font-bold text-gray-400">حالة الإذن:</span>
          <span
            class="font-mono text-xs font-black px-2.5 py-0.5 rounded"
            :class="statusBadgeClass"
          >
            {{ statusBadgeText }}
          </span>
        </div>

        <!-- الأثر المخزني المباشر -->
        <div
          class="p-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg flex flex-col space-y-1.5"
        >
          <div class="flex items-center gap-1.5">
            <span
              class="w-2 h-2 rounded-full"
              :class="formData.status === 'confirmed' ? 'bg-emerald-400' : 'bg-amber-400'"
            ></span>
            <span class="text-[11px] font-bold text-gray-300">الأثر على أرصدة المستودع:</span>
          </div>
          <p class="text-[10px] text-gray-400 font-medium leading-relaxed">
            {{ inventoryImpactDescription }}
          </p>
        </div>
      </div>

      <div
        class="p-2 bg-[#16171b]/60 border border-gray-800 rounded-lg text-[10px] text-gray-400 flex justify-between font-mono"
      >
        <span>نوع الحركة: إذن صرف بضاعة ومواد</span>
        <span>العملة: SAR (ر.س)</span>
      </div>
    </div>

    <!-- 3. بطاقة أسباب الصرف والملاحظات -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col space-y-1.5"
    >
      <label
        class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5 mb-1 flex justify-between items-center"
      >
        <span>سبب الصرف والملاحظات الإدارية</span>
        <span class="text-[10px] text-gray-500 font-normal">اختياري</span>
      </label>
      <textarea
        v-model="formData.notes"
        rows="4"
        placeholder="سجل أسباب ومبررات الصرف، رقم أمر العمل، أو أي ملاحظات تخص تسليم المواد للجهة الطالبة..."
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
  calculatedTotalCost: { type: Number, required: true },
  totalItemsCount: { type: Number, required: true },
  totalQuantitySum: { type: Number, required: true },
  isRequisitionLinked: { type: Boolean, default: false },
  validationErrors: { type: Object, default: () => null },
})

const statusBadgeText = computed(() => {
  switch (formData.value.status) {
    case 'confirmed':
      return 'تم الصرف والخصم من المستودع'
    case 'cancelled':
      return 'إذن صرف ملغي'
    default:
      return 'مسودة قيد التجهيز والمراجعة'
  }
})

const statusBadgeClass = computed(() => {
  switch (formData.value.status) {
    case 'confirmed':
      return 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
    case 'cancelled':
      return 'bg-rose-950/50 text-rose-400 border border-rose-500/30'
    default:
      return 'bg-amber-950/50 text-amber-400 border border-amber-500/30'
  }
})

const inventoryImpactDescription = computed(() => {
  if (formData.value.status === 'confirmed') {
    return 'تم إثبات حركة الصرف وخصم الكميات فعلياً من أرصدة المستودع مع توليد حركات المخزون المرتبطة.'
  }
  return 'حفظ الإذن كمسودة لا يؤثر على أرصدة المستودع. سيتم خصم الكميات المنصرفة لحظياً وتحديث بطاقة الصنف بمجرد الضغط على تأكيد وترحيل الصرف.'
})

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0'
  const num = Number(value)
  return isNaN(num) ? '0' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(num)
}

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
