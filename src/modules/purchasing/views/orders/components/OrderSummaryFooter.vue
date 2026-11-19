<!-- src/modules/purchasing/views/orders/components/OrderSummaryFooter.vue -->
<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 text-right font-sans transition-colors duration-200 items-stretch"
    dir="rtl"
  >
    <!-- 1. بطاقة الشروط والأحكام والملاحظات (7 أعمدة - الجانب الأيمن) -->
    <div
      class="lg:col-span-7 p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs flex flex-col justify-between space-y-3"
    >
      <div class="space-y-1.5 flex-1 flex flex-col">
        <div class="flex justify-between items-center border-b border-surface-border/80 pb-1.5">
          <label class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>شروط وأحكام التوريد</span>
          </label>
          <span class="text-[10px] text-text-muted font-bold">تظهر في الطباعة</span>
        </div>
        <textarea
          v-model="formData.terms_and_conditions"
          rows="2"
          placeholder="سجل شروط التوريد، غرامات التأخير، متطلبات التغليف والفحص الفني..."
          class="w-full flex-1 min-h-[62px] p-2.5 border border-surface-border hover:border-primary/50 focus:border-primary rounded-lg bg-surface-ground focus:bg-surface-section text-text-primary placeholder:text-text-muted text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none leading-relaxed"
        ></textarea>
        <p
          v-if="getFieldError('terms_and_conditions')"
          class="text-danger text-[10px] font-bold pr-1"
        >
          {{ getFieldError('terms_and_conditions') }}
        </p>
      </div>

      <div class="space-y-1.5 flex-1 flex flex-col">
        <div class="flex justify-between items-center border-b border-surface-border/80 pb-1.5">
          <label class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>ملاحظات داخلية</span>
          </label>
          <span class="text-[10px] text-text-muted font-bold">اختياري</span>
        </div>
        <textarea
          v-model="formData.notes"
          rows="2"
          placeholder="أي ملاحظات توثيقية إضافية تخص أمر الشراء..."
          class="w-full flex-1 min-h-[62px] p-2.5 border border-surface-border hover:border-primary/50 focus:border-primary rounded-lg bg-surface-ground focus:bg-surface-section text-text-primary placeholder:text-text-muted text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none leading-relaxed"
        ></textarea>
        <p v-if="getFieldError('notes')" class="text-danger text-[10px] font-bold pr-1">
          {{ getFieldError('notes') }}
        </p>
      </div>
    </div>

    <!-- 2. بطاقة تفقيط الحسابات والإجماليات المالية (5 أعمدة - نهاية مسار العين وفوق أزرار الحفظ) -->
    <div
      class="lg:col-span-5 p-4 bg-surface-section rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs flex flex-col justify-between space-y-3 transition-colors duration-200"
    >
      <div class="space-y-2 text-xs font-semibold text-text-secondary">
        <div class="flex items-center justify-between border-b border-surface-border/80 pb-2">
          <h3 class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>ملخص القيمة التقديرية والضريبة</span>
          </h3>
          <span
            class="text-[10px] text-primary font-mono font-bold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/25"
          >
            {{ totalItemsCount }} بند مسجل
          </span>
        </div>

        <!-- المجموع الفرعي قبل الخصم والضريبة -->
        <div class="flex items-baseline justify-between text-text-secondary pt-0.5">
          <span class="shrink-0">المجموع الفرعي:</span>
          <span class="flex-1 mx-2 border-b border-dotted border-surface-border"></span>
          <span class="font-mono font-bold text-text-primary shrink-0">
            {{ formatCurrency(calculatedSubtotal) }}
          </span>
        </div>

        <!-- حقل الخصم الإجمالي -->
        <div class="flex flex-col gap-1.5 border-b border-surface-border/50 pb-2">
          <div
            class="flex items-baseline justify-between"
            :class="Number(calculatedDiscountAmount) > 0 ? 'text-danger' : 'text-text-muted'"
          >
            <span class="shrink-0">الخصم الإجمالي (-):</span>
            <span class="flex-1 mx-2 border-b border-dotted border-danger/30"></span>
            <span class="font-mono font-bold shrink-0">
              {{ formatCurrency(calculatedDiscountAmount) }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <select
              v-model="formData.discount_type"
              class="h-8 px-2 bg-surface-ground border border-surface-border rounded-lg text-xs text-text-primary font-bold outline-none focus:border-primary cursor-pointer shrink-0"
            >
              <option value="fixed" class="bg-surface-section text-text-primary">مبلغ ثابت</option>
              <option value="percentage" class="bg-surface-section text-text-primary">
                نسبة مئوية %
              </option>
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              v-model.number="formData.discount_value"
              placeholder="قيمة الخصم..."
              class="h-8 w-full px-2.5 bg-surface-ground border border-surface-border rounded-lg text-xs font-mono font-bold text-danger outline-none focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 text-left transition-all"
            />
          </div>
        </div>

        <!-- ضريبة القيمة المضافة المتوقعة -->
        <div class="flex items-baseline justify-between text-info">
          <span class="shrink-0">ضريبة القيمة المضافة المتوقعة (+):</span>
          <span class="flex-1 mx-2 border-b border-dotted border-info/30"></span>
          <span class="font-mono font-bold shrink-0">
            {{ formatCurrency(calculatedTaxAmount) }}
          </span>
        </div>

        <!-- تكاليف الشحن والنقل التقديرية -->
        <div
          class="flex justify-between items-center border-b border-surface-border/50 pb-1.5 text-text-secondary"
        >
          <span>تكلفة الشحن والنقل (+):</span>
          <div class="w-32">
            <input
              type="number"
              step="0.01"
              min="0"
              v-model.number="formData.shipping_cost"
              placeholder="0.00"
              class="h-8 w-full px-2.5 bg-surface-ground border border-surface-border rounded-lg text-xs font-mono font-bold text-text-primary outline-none focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 text-left transition-all"
            />
          </div>
        </div>
      </div>

      <div class="pt-0.5">
        <!-- الإجمالي الصافي النهائي لأمر الشراء -->
        <div
          class="flex justify-between items-center gap-3 bg-primary/10 border border-primary/35 px-3.5 py-2.5 rounded-xl text-primary shadow-2xs"
        >
          <span class="font-black text-xs whitespace-nowrap">صافي قيمة الأمر الإجمالية:</span>
          <span class="text-xl sm:text-2xl font-mono font-black tracking-tight whitespace-nowrap">
            {{ formatCurrency(calculatedTotalAmount) }}
          </span>
        </div>
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
