<!-- src/modules/inventory/views/adjustments/components/AdjustmentFooter.vue -->
<template>
  <div class="grid grid-cols-1 md:grid-cols-12 gap-4 text-right font-sans" dir="rtl">
    <!-- 1. بطاقة الأثر المالي والإجماليات النهائية (5 أعمدة - ملمومة ومركزة) -->
    <div
      class="md:col-span-5 p-4 bg-[#23252e] rounded-2xl border border-[#3b3f4f] shadow-xl flex flex-col justify-between space-y-3"
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
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span>{{ summaryHeaderTitle }}</span>
          </span>
          <span
            class="text-[10px] text-gray-400 font-mono bg-[#16171b] px-2 py-0.5 rounded-md border border-[#3e414c]"
          >
            {{ totalItemsCount }} بند مسجل
          </span>
        </h3>

        <!-- في حالة الجرد الدوري والتسوية العامة: عرض الفائض والعجز بشكل مقارن مع خط نقطي رابط -->
        <template v-if="isComparisonType">
          <div class="flex items-baseline justify-between text-emerald-400">
            <span class="shrink-0">إجمالي قيمة الزيادة والوفر (+):</span>
            <span class="flex-1 mx-2 border-b border-dotted border-emerald-500/20"></span>
            <span class="font-mono font-bold shrink-0">{{ formatCurrency(totalSurplusCost) }}</span>
          </div>

          <div class="flex items-baseline justify-between text-rose-400">
            <span class="shrink-0">إجمالي قيمة العجز والتالف (-):</span>
            <span class="flex-1 mx-2 border-b border-dotted border-rose-500/20"></span>
            <span class="font-mono font-bold shrink-0">{{ formatCurrency(totalDeficitCost) }}</span>
          </div>
        </template>

        <!-- في حالة البضاعة التالفة أو الفاقد -->
        <template v-else-if="type === 'damage' || type === 'loss'">
          <div class="flex items-baseline justify-between text-rose-400">
            <span class="shrink-0">إجمالي القيمة التقديرية للخسارة:</span>
            <span class="flex-1 mx-2 border-b border-dotted border-rose-500/20"></span>
            <span class="font-mono font-bold shrink-0">{{ formatCurrency(totalDeficitCost) }}</span>
          </div>
        </template>

        <!-- في حالة الرصيد الافتتاحي -->
        <template v-else-if="type === 'opening_balance'">
          <div class="flex items-baseline justify-between text-emerald-400">
            <span class="shrink-0">إجمالي تقييم بضاعة أول المدة:</span>
            <span class="flex-1 mx-2 border-b border-dotted border-emerald-500/20"></span>
            <span class="font-mono font-bold shrink-0">{{ formatCurrency(totalSurplusCost) }}</span>
          </div>
        </template>

        <div class="flex items-baseline justify-between text-gray-400 pt-1">
          <span class="shrink-0">إجمالي عدد البنود المسجلة:</span>
          <span class="flex-1 mx-2 border-b border-dotted border-[#3e414c]"></span>
          <span class="font-mono font-bold text-white shrink-0">{{ totalItemsCount }} بند</span>
        </div>
      </div>

      <div class="pt-2">
        <div
          class="flex justify-between items-center bg-[#16171b] border p-2.5 rounded-xl shadow-inner"
          :class="[
            isComparisonType
              ? totalDifferenceCost > 0
                ? 'text-emerald-400 border-emerald-500/30'
                : totalDifferenceCost < 0
                  ? 'text-rose-400 border-rose-500/30'
                  : 'text-[#e05e2b] border-[#3e414c]'
              : type === 'opening_balance'
                ? 'text-emerald-400 border-emerald-500/30'
                : 'text-rose-400 border-rose-500/30',
          ]"
        >
          <span class="font-black text-xs">{{ mainCostMetricLabel }}:</span>
          <span class="text-base font-mono font-black tracking-wide">
            {{ isComparisonType && totalDifferenceCost > 0 ? '+' : ''
            }}{{ formatCurrency(displayedMainCost) }}
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

    <!-- 2. بطاقة أسباب ومبررات التسوية (7 أعمدة - متناسبة وعملية) -->
    <div
      class="md:col-span-7 p-4 bg-[#23252e] rounded-2xl border border-[#3b3f4f] shadow-xl flex flex-col justify-between space-y-2"
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
            <span>{{ notesFieldLabel }}</span>
          </label>
          <span class="text-[10px] text-gray-500 font-normal">اختياري</span>
        </div>

        <textarea
          v-model="notesModel"
          rows="4"
          :placeholder="notesPlaceholder"
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
import { computed } from 'vue'
import { formatCurrency } from '@/utils/formatters'

// الربط ثنائي الاتجاه للبيانات
const notesModel = defineModel('notes', { type: String, default: '' })

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
