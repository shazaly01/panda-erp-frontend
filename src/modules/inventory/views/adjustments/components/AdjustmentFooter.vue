<!-- src/modules/inventory/views/adjustments/components/AdjustmentFooter.vue -->
<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 text-right font-sans transition-colors duration-200 items-stretch"
    dir="rtl"
  >
    <!-- 1. بطاقة أسباب ومبررات التسوية (7 أعمدة - الجانب الأيمن) -->
    <div
      class="lg:col-span-7 p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs flex flex-col justify-between space-y-2.5"
    >
      <div class="flex flex-col flex-1">
        <div
          class="flex items-center justify-between border-b border-surface-border/80 pb-2 mb-2.5"
        >
          <label class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>{{ notesFieldLabel }}</span>
          </label>
          <span class="text-[10px] text-text-muted font-bold">اختياري</span>
        </div>

        <textarea
          v-model="notesModel"
          rows="4"
          :placeholder="notesPlaceholder"
          class="w-full flex-1 p-3 border border-surface-border hover:border-primary/50 focus:border-primary rounded-lg bg-surface-ground focus:bg-surface-section text-text-primary placeholder:text-text-muted text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none leading-relaxed"
        ></textarea>
      </div>

      <p v-if="getFieldError('notes')" class="text-danger text-[10px] font-bold pr-1">
        {{ getFieldError('notes') }}
      </p>
    </div>

    <!-- 2. بطاقة الأثر المالي والإجماليات النهائية (5 أعمدة - نهاية مسار العين وفوق أزرار الحفظ) -->
    <div
      class="lg:col-span-5 p-4 bg-surface-section rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs flex flex-col justify-between space-y-3 transition-colors duration-200"
    >
      <div class="space-y-2 text-xs font-semibold text-text-secondary">
        <div class="flex items-center justify-between border-b border-surface-border/80 pb-2">
          <h3 class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>{{ summaryHeaderTitle }}</span>
          </h3>
          <span
            class="text-[10px] text-primary font-mono font-bold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/25"
          >
            {{ totalItemsCount }} بند مسجل
          </span>
        </div>

        <!-- في حالة الجرد الدوري والتسوية العامة: عرض الفائض والعجز بشكل مقارن مع خط نقطي رابط -->
        <template v-if="isComparisonType">
          <div class="flex items-baseline justify-between text-success pt-0.5">
            <span class="shrink-0">إجمالي قيمة الزيادة والوفر (+):</span>
            <span class="flex-1 mx-2 border-b border-dotted border-success/30"></span>
            <span class="font-mono font-bold shrink-0">{{ formatCurrency(totalSurplusCost) }}</span>
          </div>

          <div class="flex items-baseline justify-between text-danger">
            <span class="shrink-0">إجمالي قيمة العجز والتالف (-):</span>
            <span class="flex-1 mx-2 border-b border-dotted border-danger/30"></span>
            <span class="font-mono font-bold shrink-0">{{ formatCurrency(totalDeficitCost) }}</span>
          </div>
        </template>

        <!-- في حالة البضاعة التالفة أو الفاقد -->
        <template v-else-if="type === 'damage' || type === 'loss'">
          <div class="flex items-baseline justify-between text-danger pt-0.5">
            <span class="shrink-0">إجمالي القيمة التقديرية للخسارة:</span>
            <span class="flex-1 mx-2 border-b border-dotted border-danger/30"></span>
            <span class="font-mono font-bold shrink-0">{{ formatCurrency(totalDeficitCost) }}</span>
          </div>
        </template>

        <!-- في حالة الرصيد الافتتاحي -->
        <template v-else-if="type === 'opening_balance'">
          <div class="flex items-baseline justify-between text-success pt-0.5">
            <span class="shrink-0">إجمالي تقييم بضاعة أول المدة:</span>
            <span class="flex-1 mx-2 border-b border-dotted border-success/30"></span>
            <span class="font-mono font-bold shrink-0">{{ formatCurrency(totalSurplusCost) }}</span>
          </div>
        </template>

        <div class="flex items-baseline justify-between text-text-secondary pt-0.5">
          <span class="shrink-0">إجمالي عدد البنود المسجلة:</span>
          <span class="flex-1 mx-2 border-b border-dotted border-surface-border"></span>
          <span class="font-mono font-bold text-text-primary shrink-0">
            {{ totalItemsCount }} بند
          </span>
        </div>
      </div>

      <div class="pt-0.5">
        <div
          class="flex justify-between items-center gap-3 border px-3.5 py-2.5 rounded-xl shadow-2xs transition-colors"
          :class="[
            isComparisonType
              ? totalDifferenceCost > 0
                ? 'bg-success/10 text-success border-success/35'
                : totalDifferenceCost < 0
                  ? 'bg-danger/10 text-danger border-danger/35'
                  : 'bg-primary/10 text-primary border-primary/35'
              : type === 'opening_balance'
                ? 'bg-success/10 text-success border-success/35'
                : 'bg-danger/10 text-danger border-danger/35',
          ]"
        >
          <span class="font-black text-xs whitespace-nowrap">{{ mainCostMetricLabel }}:</span>
          <span class="text-xl sm:text-2xl font-mono font-black tracking-tight whitespace-nowrap">
            {{ isComparisonType && totalDifferenceCost > 0 ? '+' : ''
            }}{{ formatCurrency(displayedMainCost) }}
          </span>
        </div>

        <p
          v-if="getFieldError('total_cost')"
          class="text-danger text-[10px] text-center font-bold mt-1"
        >
          {{ getFieldError('total_cost') }}
        </p>
      </div>
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
