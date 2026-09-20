<!-- src/modules/purchasing/views/issues/PurchaseIssueFormPage.vue -->
<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <!-- مؤشر التحميل لكامل الشاشة أثناء جلب البيانات -->
    <FullScreenLoader :show="!isFormLoaded" message="جاري تحميل بيانات إذن الصرف المخزني..." />

    <!-- شريط عنوان الصفحة المتكيف مع رقم الإذن وحالته -->
    <div
      class="flex flex-wrap justify-between items-center py-1 border-b border-surface-border/60 gap-3"
    >
      <div class="flex items-center gap-3">
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-[#e05e2b] rounded-full"></span>
          {{ formPageTitle }}
        </h1>

        <span
          v-if="form.issue_number"
          class="px-2.5 py-0.5 text-xs font-mono font-bold rounded-lg bg-[#e05e2b]/15 text-[#e05e2b] border border-[#e05e2b]/30"
        >
          {{ form.issue_number }}
        </span>
      </div>

      <div v-if="form.status" class="flex items-center gap-2 text-xs">
        <span
          class="px-2.5 py-0.5 rounded-lg border text-[11px] font-bold"
          :class="getStatusBadgeClass(form.status)"
        >
          {{ getStatusLabel(form.status) }}
        </span>
      </div>
    </div>

    <!-- رسالة الخطأ العام من المتجر إن وجدت -->
    <div
      v-if="issueStore.error"
      class="p-3 bg-rose-950/40 border border-rose-900/50 text-rose-400 rounded-xl text-xs font-bold shadow-sm"
    >
      {{ issueStore.error }}
    </div>

    <!-- 1. ترويسة إذن الصرف والبيانات اللوجستية -->
    <IssueHeaderForm
      v-model="form"
      :validation-errors="issueStore.validationErrors"
      :is-requisition-linked="isRequisitionLinked"
      :route-badge-text="routeBadgeText"
      :route-badge-class="routeBadgeClass"
    />

    <!-- 2. جدول بنود وفحص أصناف الصرف والإدخال المباشر -->
    <AppCard>
      <IssueItemsTable
        :items="items"
        :form="form"
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
    </AppCard>

    <!-- 3. تذييل إذن الصرف والإجماليات والأثر المخزني -->
    <IssueSummaryFooter
      v-model="form"
      :calculated-total-cost="calculatedTotalCost"
      :total-items-count="totalItemsCount"
      :total-quantity-sum="totalQuantitySum"
      :is-requisition-linked="isRequisitionLinked"
      :validation-errors="issueStore.validationErrors"
    />

    <!-- شريط الإجراءات السفلي العائم الثابت والنظيف -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-[#1e2027] border-t border-[#3b3f4f] p-3.5 shadow-[0_-4px_25px_rgba(0,0,0,0.5)] z-40 flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 gap-3"
    >
      <div class="text-xs text-gray-400 font-medium flex items-center gap-2">
        <span
          class="w-2 h-2 rounded-full"
          :class="form.status === 'confirmed' ? 'bg-emerald-400' : 'bg-amber-400'"
        ></span>
        <span>
          {{
            form.status === 'confirmed'
              ? 'إذن الصرف مؤكد ومرحل - تم خصم الكميات من المستودع بنجاح.'
              : 'تأكيد الصرف سيقوم بخصم الكميات من أرصدة المستودع المحددة فورياً وبشكل نهائي.'
          }}
        </span>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
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
          class="text-gray-300 border-gray-600 hover:bg-gray-800"
        >
          <span v-if="isSubmitting">جاري الحفظ...</span>
          <span v-else>{{ isEdit ? 'تحديث المسودة' : 'حفظ كمسودة' }}</span>
        </AppButton>

        <!-- زر الحفظ والتأكيد المباشر والخصم المخزني -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          size="sm"
          :disabled="isSubmitting || !isFormLoaded"
          @click="handleSubmit(true)"
          class="bg-[#e05e2b] hover:bg-[#d04f1e] text-white border-none shadow-[0_0_15px_rgba(224,94,43,0.35)] font-bold px-5"
        >
          <span v-if="isSubmitting">جاري التأكيد والخصم...</span>
          <span v-else>حفظ وتأكيد الصرف فوراً</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePurchaseIssueFormLogic } from './composables/usePurchaseIssueFormLogic'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'

import IssueHeaderForm from './components/IssueHeaderForm.vue'
import IssueItemsTable from './components/IssueItemsTable.vue'
import IssueSummaryFooter from './components/IssueSummaryFooter.vue'

const {
  isFormLoaded,
  isSubmitting,
  isEdit,
  form,
  items,
  visibleTableSchema,
  isRequisitionLinked,
  routeBadgeText,
  routeBadgeClass,
  calculatedTotalCost,
  totalItemsCount,
  totalQuantitySum,
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
  issueStore,
} = usePurchaseIssueFormLogic()

const formPageTitle = computed(() => {
  if (isEdit.value) {
    return 'تعديل مسودة إذن صرف مخزني'
  }
  if (isRequisitionLinked.value) {
    return 'إصدار إذن صرف مخزني بناءً على طلب احتياج داخلي'
  }
  return 'إصدار إذن صرف مخزني مباشر'
})

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة قيد المراجعة',
    confirmed: 'تم الصرف والخصم',
    cancelled: 'ملغي',
  }
  return map[status] || status || 'مسودة جديدة'
}

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    confirmed: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-rose-950/40 text-rose-400 border-rose-500/30',
  }
  return map[status] || 'bg-gray-800 text-gray-300 border-gray-600'
}
</script>
