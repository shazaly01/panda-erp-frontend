<!--src/modules/inventory/views/adjustments/components/AdjustmentFooter.vue-->
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-right font-sans" dir="rtl">
    <!-- 1. بطاقة الأثر المالي والإجماليات النهائية -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-2 text-xs font-semibold text-gray-400">
        <h3 class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5">
          {{ summaryHeaderTitle }}
        </h3>

        <!-- في حالة الجرد الدوري والتسوية العامة: عرض الفائض والعجز بشكل مقارن -->
        <template v-if="isComparisonType">
          <div class="flex justify-between border-b border-gray-700/30 pb-1.5 text-emerald-400">
            <span>إجمالي قيمة الزيادة والوفر (+):</span>
            <span class="font-mono font-bold">{{ formatCurrency(totalSurplusCost) }}</span>
          </div>

          <div class="flex justify-between border-b border-gray-700/30 pb-1.5 text-rose-400">
            <span>إجمالي قيمة العجز والتالف (-):</span>
            <span class="font-mono font-bold">{{ formatCurrency(totalDeficitCost) }}</span>
          </div>
        </template>

        <!-- في حالة البضاعة التالفة أو الفاقد -->
        <template v-else-if="type === 'damage' || type === 'loss'">
          <div class="flex justify-between border-b border-gray-700/30 pb-1.5 text-rose-400">
            <span>إجمالي القيمة التقديرية للخسارة:</span>
            <span class="font-mono font-bold">{{ formatCurrency(totalDeficitCost) }}</span>
          </div>
        </template>

        <!-- في حالة الرصيد الافتتاحي -->
        <template v-else-if="type === 'opening_balance'">
          <div class="flex justify-between border-b border-gray-700/30 pb-1.5 text-emerald-400">
            <span>إجمالي تقييم بضاعة أول المدة:</span>
            <span class="font-mono font-bold">{{ formatCurrency(totalSurplusCost) }}</span>
          </div>
        </template>

        <div class="flex justify-between border-b border-gray-700/30 pb-1.5 text-gray-400">
          <span>إجمالي عدد البنود المسجلة:</span>
          <span class="font-mono font-bold text-white">{{ totalItemsCount }} بند</span>
        </div>
      </div>

      <div class="pt-2">
        <div
          class="flex justify-between items-center bg-[#16171b] border border-gray-700/50 p-2.5 rounded-lg shadow-[inner_0_0_10px_rgba(0,0,0,0.5)]"
          :class="[
            isComparisonType
              ? totalDifferenceCost > 0
                ? 'text-emerald-400 border-emerald-500/30'
                : totalDifferenceCost < 0
                  ? 'text-rose-500 border-rose-500/30'
                  : 'text-[#e05e2b] border-gray-700/50'
              : type === 'opening_balance'
                ? 'text-emerald-400 border-emerald-500/30'
                : 'text-rose-400 border-rose-500/30',
          ]"
        >
          <span class="font-black text-[11px]">{{ mainCostMetricLabel }}:</span>
          <span class="text-xl font-mono font-black tracking-wide">
            {{ isComparisonType && totalDifferenceCost > 0 ? '+' : ''
            }}{{ formatCurrency(displayedMainCost) }}
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

    <!-- 2. بطاقة ملخص الحالة والتوجيه المحاسبي -->
    <div class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl space-y-4">
      <h3 class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5">
        الحالة والتوجيه المحاسبي
      </h3>

      <div class="flex flex-col space-y-3 pt-1">
        <div
          class="p-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center justify-between"
        >
          <span class="text-xs font-bold text-gray-400">حالة المستند:</span>
          <span
            class="font-mono text-xs font-black px-2 py-0.5 rounded"
            :class="[
              statusModel === 'approved'
                ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-950/50 text-amber-400 border border-amber-500/30',
            ]"
          >
            {{ statusModel === 'approved' ? 'معتمد ومرحل دفترياً' : 'مسودة قيد المراجعة' }}
          </span>
        </div>

        <div class="p-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg flex flex-col space-y-1">
          <span class="text-[11px] font-bold text-gray-400">الأثر المالي المباشر:</span>
          <p class="text-[10px] text-gray-500 font-medium leading-relaxed">
            {{ accountingImpactDescription }}
          </p>
        </div>
      </div>
    </div>

    <!-- 3. بطاقة أسباب ومبررات التسوية -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col space-y-1.5"
    >
      <label class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5 mb-1">
        {{ notesFieldLabel }}
      </label>
      <textarea
        v-model="notesModel"
        rows="3"
        :placeholder="notesPlaceholder"
        class="block w-full h-full min-h-[96px] p-3 border border-[#3e414c] rounded-lg bg-[#16171b] text-white placeholder:text-gray-500 text-xs font-semibold focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b] outline-none transition-all resize-none"
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

// الربط ثنائي الاتجاه للبيانات
const notesModel = defineModel('notes', { type: String, default: '' })
const statusModel = defineModel('status', { type: String, default: 'draft' })

const props = defineProps({
  type: { type: String, default: 'physical_count' },
  totalDifferenceCost: { type: Number, required: true },
  totalSurplusCost: { type: Number, required: true },
  totalDeficitCost: { type: Number, required: true },
  totalItemsCount: { type: Number, required: true },
  validationErrors: { type: Object, default: () => null },
})

const isComparisonType = computed(() => {
  return props.type === 'physical_count' || props.type === 'general_adjustment'
})

const summaryHeaderTitle = computed(() => {
  switch (props.type) {
    case 'damage':
      return 'ملخص تكلفة التالف والتكهين'
    case 'loss':
      return 'ملخص خسائر الفاقد والعجز'
    case 'opening_balance':
      return 'ملخص رأس مال الرصيد الافتتاحي'
    default:
      return 'الأثر المالي الإجمالي للتسوية'
  }
})

const mainCostMetricLabel = computed(() => {
  switch (props.type) {
    case 'damage':
      return 'إجمالي خسائر الإتلاف'
    case 'loss':
      return 'إجمالي قيمة العجز'
    case 'opening_balance':
      return 'إجمالي قيمة الرصيد الافتتاحي'
    default:
      return 'صافي أثر التسوية المالي'
  }
})

const displayedMainCost = computed(() => {
  if (props.type === 'damage' || props.type === 'loss') {
    return props.totalDeficitCost
  }
  if (props.type === 'opening_balance') {
    return props.totalSurplusCost
  }
  return props.totalDifferenceCost
})

const accountingImpactDescription = computed(() => {
  switch (props.type) {
    case 'damage':
      return 'عند الاعتماد، سيتم توليد قيد من حساب خسائر بضاعة تالفة إلى حساب المخزون وتخفيض الأرصدة فورياً.'
    case 'loss':
      return 'عند الاعتماد، سيتم توليد قيد من حساب خسائر فاقد وعجز المخزون إلى حساب المخزون وخصم الكميات.'
    case 'opening_balance':
      return 'عند الاعتماد، سيتم إثبات زيادة أصل المخزون مقابل حقوق الملكية (الأرباح المبقاة) كبضاعة أول المدة.'
    default:
      return 'عند الاعتماد، سيتم توليد قيد تسوية فروقات الجرد وضبط أرصدة المخزون اللحظية في المستودع المعتمد.'
  }
})

const notesFieldLabel = computed(() => {
  switch (props.type) {
    case 'damage':
      return 'أسباب ومبررات إتلاف البضاعة وتكهينها'
    case 'loss':
      return 'أسباب وملابسات الفاقد والعجز المخزني'
    case 'opening_balance':
      return 'ملاحظات وتوثيق الرصيد الافتتاحي'
    default:
      return 'مبررات وأسباب التسوية المخزنية'
  }
})

const notesPlaceholder = computed(() => {
  switch (props.type) {
    case 'damage':
      return 'سجل سبب التلف (انتهاء صلاحية، سوء تخزين، كسر أثناء النقل)...'
    case 'loss':
      return 'سجل تفاصيل محضر الفقد أو السرقة أو ملابسات النقص...'
    case 'opening_balance':
      return 'سجل رقم محضر الجرد الافتتاحي أو تفاصيل بداية النشاط...'
    default:
      return 'سجل أسباب الفروقات الجردية، لجنة الفحص، أو أي تفاصيل توثيقية إضافية...'
  }
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
