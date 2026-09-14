<!-- src/modules/purchasing/views/requisitions/components/RequisitionSummaryFooter.vue -->
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-right font-sans" dir="rtl">
    <!-- 1. بطاقة ملخص التكاليف التقديرية وإجمالي البنود -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-2 text-xs font-semibold text-gray-400">
        <h3
          class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5 flex justify-between items-center"
        >
          <span>ملخص التقدير المالي للطلب</span>
          <span class="text-[10px] text-gray-400 font-mono">{{ totalItemsCount }} بند مسجل</span>
        </h3>

        <!-- عدد البنود الفعلية المدخلة -->
        <div class="flex justify-between border-b border-gray-700/30 pb-1 text-gray-300">
          <span>إجمالي البنود الصالحة:</span>
          <span class="font-mono font-bold">{{ totalItemsCount }} أصناف</span>
        </div>

        <!-- توضيح حول طبيعة التسعير التقديري -->
        <div
          class="p-2 bg-[#16171b] border border-[#3e414c] rounded-lg text-[10px] text-gray-400 leading-relaxed"
        >
          <p>
            الأسعار المدونة هي تقديرية لأغراض الدراسة الميزانية وصلاحيات الاعتماد، وتحدد الأسعار
            النهائية رسمياً عند طرح عروض الأسعار وإصدار أمر الشراء.
          </p>
        </div>
      </div>

      <div class="pt-1 space-y-2">
        <!-- الإجمالي التقديري الصافي -->
        <div
          class="flex justify-between items-center bg-[#16171b] border border-emerald-500/30 p-2.5 rounded-lg shadow-[inner_0_0_10px_rgba(0,0,0,0.5)] text-emerald-400"
        >
          <span class="font-black text-xs">إجمالي التكلفة التقديرية:</span>
          <span class="text-xl font-mono font-black tracking-wide">
            {{ formatCurrency(calculatedEstimatedTotal) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 2. بطاقة دورة الاعتماد ومتابعة مسار الطلب -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-3">
        <h3 class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5">
          مسار الاعتماد الداخلي
        </h3>

        <!-- حالة المستند الحالية -->
        <div
          class="p-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center justify-between"
        >
          <span class="text-xs font-bold text-gray-400">حالة الطلب:</span>
          <span
            class="font-mono text-xs font-black px-2.5 py-0.5 rounded border"
            :class="statusBadgeClass"
          >
            {{ statusBadgeText }}
          </span>
        </div>

        <!-- شرح مسار سير العمل -->
        <div
          class="p-2.5 bg-[#16171b] border border-[#3e414c] rounded-lg flex flex-col space-y-1.5"
        >
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-[#e05e2b]"></span>
            <span class="text-[11px] font-bold text-gray-300">سير الإجراءات:</span>
          </div>
          <p class="text-[10px] text-gray-400 font-medium leading-relaxed">
            مسودة &larr; تقديم للاعتماد &larr; مراجعة مدير القسم والمشتريات &larr; اعتماد &larr;
            إصدار أمر شراء.
          </p>
        </div>

        <!-- إظهار سبب الرفض في حال كان الطلب مرفوضاً -->
        <div
          v-if="formData.rejection_reason"
          class="p-2.5 bg-rose-950/30 border border-rose-900/50 rounded-lg space-y-1 text-rose-300 text-xs"
        >
          <span class="font-bold block text-[11px] text-rose-400">سبب الرفض المسجل:</span>
          <p class="text-[10px] leading-relaxed">{{ formData.rejection_reason }}</p>
        </div>
      </div>

      <div
        class="p-2 bg-[#16171b]/60 border border-gray-800 rounded-lg text-[10px] text-gray-400 flex justify-between font-mono"
      >
        <span>الأولوية المحددة:</span>
        <span class="font-bold text-amber-400">{{ priorityLabel }}</span>
      </div>
    </div>

    <!-- 3. بطاقة الشروط والملاحظات وتبرير الشراء -->
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col space-y-1.5"
    >
      <label
        class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5 mb-1 flex justify-between items-center"
      >
        <span>مبررات الشراء والملاحظات العامة</span>
        <span class="text-[10px] text-gray-500 font-normal">اختياري</span>
      </label>
      <textarea
        v-model="formData.notes"
        rows="4"
        placeholder="سجل أسباب ومبررات طلب الشراء، القسم المستفيد، أو أي تعليمات خاصة بالمشتريات..."
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
  calculatedEstimatedTotal: { type: Number, required: true },
  totalItemsCount: { type: Number, required: true },
  validationErrors: { type: Object, default: () => null },
})

const statusBadgeText = computed(() => {
  switch (formData.value.status) {
    case 'pending':
    case 'submitted':
      return 'بانتظار الاعتماد'
    case 'approved':
      return 'طلب معتمد'
    case 'rejected':
      return 'طلب مرفوض'
    default:
      return 'مسودة قيد الإعداد'
  }
})

const statusBadgeClass = computed(() => {
  switch (formData.value.status) {
    case 'pending':
    case 'submitted':
      return 'bg-sky-950/50 text-sky-400 border-sky-500/30'
    case 'approved':
      return 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
    case 'rejected':
      return 'bg-rose-950/50 text-rose-400 border-rose-500/30'
    default:
      return 'bg-amber-950/50 text-amber-400 border-amber-500/30'
  }
})

const priorityLabel = computed(() => {
  switch (formData.value.priority) {
    case 'low':
      return 'منخفضة'
    case 'high':
      return 'عاجلة'
    case 'urgent':
      return 'طارئة جداً'
    default:
      return 'متوسطة'
  }
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
