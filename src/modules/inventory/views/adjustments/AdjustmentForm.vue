<!-- src/modules/inventory/views/adjustments/AdjustmentForm.vue -->
<template>
  <div class="space-y-3 text-right font-sans pb-24 transition-all duration-200" dir="rtl">
    <!-- مؤشر التحميل لكامل الشاشة أثناء جلب البيانات -->
    <FullScreenLoader :show="!isFormLoaded" message="جاري تحميل بيانات وثيقة التسوية الجردية..." />

    <!-- شريط عنوان الصفحة المتكيف مع رقم الوثيقة وحالتها -->
    <div
      class="flex flex-wrap justify-between items-center py-1 border-b border-surface-border/60 gap-2"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ formPageTitle }}
        </h1>

        <span
          v-if="form.adjustment_number"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ form.adjustment_number }}
        </span>
      </div>

      <div v-if="form.status" class="flex items-center gap-2 text-xs">
        <span
          class="px-2.5 py-0.5 rounded-full border text-[11px] font-bold"
          :class="getStatusBadgeClass(form.status)"
        >
          {{ getStatusLabel(form.status) }}
        </span>
      </div>
    </div>

    <!-- رسالة الخطأ العام من المتجر إن وجدت -->
    <div
      v-if="adjustmentStore.error"
      class="p-2.5 bg-danger/10 border border-danger/30 text-danger rounded-lg text-xs font-bold shadow-2xs"
    >
      {{ adjustmentStore.error }}
    </div>

    <!-- 1. ترويسة وثيقة التسوية الجردية -->
    <AdjustmentHeader v-model="form" :validation-errors="adjustmentStore.validationErrors" />

    <!-- 2. منصة جدول بنود وفروقات التسوية الجردية المجسّمة (بدون تغليف مزدوج) -->
    <AdjustmentItemsTable
      :items="items"
      :form="form"
      :detail-schema="detailSchema"
      :visible-table-schema="visibleTableSchema"
      :get-validation-error="getValidationError"
      :format-number="formatNumber"
      :unformat-number="unformatNumber"
      :sync-unit-details="syncUnitDetails"
      :recalculate-line="recalculateLine"
      :increment-quantity="incrementQuantity"
      :decrement-quantity="decrementQuantity"
      :remove-row="removeRow"
      :trigger-add-new-empty-line="triggerAddNewEmptyLine"
      :select-product-for-row="selectProductForRow"
      :handle-global-item-select="handleGlobalItemSelect"
      :is-form-loaded="isFormLoaded"
    />

    <!-- 3. تذييل وثيقة التسوية والأثر المالي والمحاسبي -->
    <AdjustmentFooter
      v-model:notes="form.notes"
      v-model:status="form.status"
      :type="form.type"
      :total-difference-cost="totalDifferenceCost"
      :total-surplus-cost="totalSurplusCost"
      :total-deficit-cost="totalDeficitCost"
      :total-items-count="totalItemsCount"
      :validation-errors="adjustmentStore.validationErrors"
    />

    <!-- شريط الإجراءات السفلي العائم الثابت -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex flex-wrap justify-between items-center gap-2 px-4 sm:px-6"
    >
      <div class="text-xs text-text-secondary font-medium flex items-center gap-2">
        <span
          class="w-2 h-2 rounded-full shrink-0"
          :class="form.status === 'approved' ? 'bg-success' : 'bg-warning'"
        ></span>
        <span>
          {{
            form.status === 'approved'
              ? 'وثيقة التسوية معتمدة ومرحلة دفترياً - تم تطبيق القيود وتحديث رصيد المستودع.'
              : 'تخضع كافة الحركات المخزنية للتدقيق المحاسبي المباشر وتحديث كشوفات حركة الأصناف فور الاعتماد.'
          }}
        </span>
      </div>

      <div class="flex items-center gap-2 sm:gap-2.5">
        <!-- زر التراجع والإلغاء -->
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          :disabled="isSubmitting"
          @click="handleCancel"
        >
          إلغاء وتراجع
        </AppButton>

        <!-- زر الحفظ كمسودة مؤقتة -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          variant="outline"
          size="sm"
          :disabled="isSubmitting || !isFormLoaded"
          @click="handleSubmit(false)"
        >
          <span v-if="isSubmitting">جاري الحفظ...</span>
          <span v-else>{{ isEdit ? 'تحديث المسودة' : 'حفظ كمسودة' }}</span>
        </AppButton>

        <!-- زر الحفظ والاعتماد المباشر وتطبيق الأثر المخزني -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          size="sm"
          :disabled="isSubmitting || !isFormLoaded"
          @click="handleSubmit(true)"
        >
          <span v-if="isSubmitting">جاري الترحيل والاعتماد...</span>
          <span v-else>حفظ واعتماد التسوية فوراً</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAdjustmentFormLogic } from './composables/useAdjustmentFormLogic'

import AppButton from '@/components/ui/AppButton.vue'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'

import AdjustmentHeader from './components/AdjustmentHeader.vue'
import AdjustmentFooter from './components/AdjustmentFooter.vue'
import AdjustmentItemsTable from './components/AdjustmentItemsTable.vue'

const route = useRoute()

const {
  isEdit,
  isFormLoaded,
  isSubmitting,
  form,
  items,
  detailSchema,
  visibleTableSchema,
  totalDifferenceCost,
  totalSurplusCost,
  totalDeficitCost,
  totalItemsCount,
  getValidationError,
  handleSubmit,
  handleCancel,
  formatNumber,
  unformatNumber,
  syncUnitDetails,
  recalculateLine,
  incrementQuantity,
  decrementQuantity,
  removeRow,
  triggerAddNewEmptyLine,
  selectProductForRow,
  handleGlobalItemSelect,
  adjustmentStore,
} = useAdjustmentFormLogic()

const formPageTitle = computed(() => {
  if (isEdit.value) {
    return 'تعديل مسودة وثيقة التسوية'
  }
  if (route.meta?.pageTitle) {
    return route.meta.pageTitle
  }
  switch (form.value.type) {
    case 'physical_count':
      return 'إصدار محضر جرد دوري / فعلي جديد'
    case 'damage':
      return 'إصدار إذن إتلاف وتكهين بضاعة تالفة'
    case 'loss':
      return 'إصدار إذن تسوية فاقد وعجز مخزني'
    case 'opening_balance':
      return 'إدخال رصيد افتتاحي لبضاعة أول المدة'
    case 'general_adjustment':
      return 'إصدار تسوية مخزنية عامة'
    default:
      return 'إصدار وثيقة تسوية جردية جديدة'
  }
})

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة قيد المراجعة',
    approved: 'معتمد ومرحل دفترياً',
    cancelled: 'ملغي',
  }
  return map[status] || status || 'مسودة جديدة'
}

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-warning/15 text-warning border-warning/35',
    approved: 'bg-success/15 text-success border-success/35',
    cancelled: 'bg-danger/15 text-danger border-danger/35',
  }
  return map[status] || 'bg-surface-card text-text-secondary border-surface-border'
}
</script>
