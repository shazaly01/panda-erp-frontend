<!-- src/modules/purchasing/views/issues/PurchaseIssueFormPage.vue -->
<template>
  <div class="space-y-3 text-right font-sans pb-24 transition-all duration-200" dir="rtl">
    <!-- مؤشر التحميل لكامل الشاشة أثناء جلب البيانات -->
    <FullScreenLoader :show="!isFormLoaded" message="جاري تحميل بيانات إذن الصرف المخزني..." />

    <!-- شريط عنوان الصفحة المتكيف مع رقم الإذن وحالته -->
    <div
      class="flex flex-wrap justify-between items-center py-1 border-b border-surface-border/60 gap-2"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ formPageTitle }}
        </h1>

        <span
          v-if="form.issue_number"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ form.issue_number }}
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
      v-if="issueStore.error"
      class="p-2.5 bg-danger/10 border border-danger/30 text-danger rounded-lg text-xs font-bold shadow-2xs"
    >
      {{ issueStore.error }}
    </div>

    <!-- 1. ترويسة إذن الصرف والبيانات اللوجستية -->
    <IssueHeaderForm
      v-model="form"
      :departments="departmentsList"
      :validation-errors="issueStore.validationErrors"
      :is-requisition-linked="isRequisitionLinked"
      :route-badge-text="routeBadgeText"
      :route-badge-class="routeBadgeClass"
    />

    <!-- 2. منصة جدول بنود وفحص أصناف الصرف المجسّمة (بدون تغليف مزدوج) -->
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
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex flex-wrap justify-between items-center gap-2 px-4 sm:px-6"
    >
      <div class="text-xs text-text-secondary font-medium flex items-center gap-2">
        <span
          class="w-2 h-2 rounded-full shrink-0"
          :class="isConfirmedOrIssued ? 'bg-success' : 'bg-warning'"
        ></span>
        <span>
          {{
            isConfirmedOrIssued
              ? 'تعديل إذن الصرف المؤكد سيقوم بإعادة ضبط وتحديث حركات المخزون وكميات طلب الاحتياج تلقائياً.'
              : 'تأكيد الصرف سيقوم بخصم الكميات من أرصدة المستودع المحددة فورياً وبشكل نهائي.'
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

        <!-- زر حفظ التعديلات لإذن الصرف المؤكد/المنصرف -->
        <AppButton
          v-if="isConfirmedOrIssued"
          type="button"
          size="sm"
          :disabled="isSubmitting || !isFormLoaded"
          @click="handleSubmit(false)"
        >
          <span v-if="isSubmitting">جاري تحديث الصرف والمخزون...</span>
          <span v-else>حفظ وتحديث إذن الصرف</span>
        </AppButton>

        <!-- زر الحفظ كمسودة مؤقتة -->
        <AppButton
          v-if="form.status === 'draft' || !form.status"
          type="button"
          variant="outline"
          size="sm"
          :disabled="isSubmitting || !isFormLoaded"
          @click="handleSubmit(false)"
        >
          <span v-if="isSubmitting">جاري الحفظ...</span>
          <span v-else>{{ isEdit ? 'تحديث المسودة' : 'حفظ كمسودة' }}</span>
        </AppButton>

        <!-- زر الحفظ والتأكيد المباشر والخصم المخزني -->
        <AppButton
          v-if="form.status === 'draft' || !form.status"
          type="button"
          size="sm"
          :disabled="isSubmitting || !isFormLoaded"
          @click="handleSubmit(true)"
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
  departmentsList,
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

const isConfirmedOrIssued = computed(() => {
  return form.status === 'confirmed' || form.status === 'issued'
})

const formPageTitle = computed(() => {
  if (isEdit.value) {
    return isConfirmedOrIssued.value ? 'تعديل إذن صرف مخزني مؤكد' : 'تعديل مسودة إذن صرف مخزني'
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
    issued: 'تم الصرف والخصم',
    cancelled: 'ملغي',
  }
  return map[status] || status || 'مسودة جديدة'
}

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-warning/15 text-warning border-warning/35',
    confirmed: 'bg-success/15 text-success border-success/35',
    issued: 'bg-success/15 text-success border-success/35',
    cancelled: 'bg-danger/15 text-danger border-danger/35',
  }
  return map[status] || 'bg-surface-card text-text-secondary border-surface-border'
}
</script>
