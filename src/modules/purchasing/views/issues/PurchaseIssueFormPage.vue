<!--src/modules/purchasing/views/issues/PurchaseIssueFormPage.vue-->
<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <!-- شريط عنوان الصفحة المتكيف -->
    <div class="flex justify-between items-center py-1 border-b border-surface-border/60">
      <div>
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-[#e05e2b] rounded-full"></span>
          {{ formPageTitle }}
        </h1>
      </div>
    </div>

    <!-- رسالة الخطأ العام من المتجر -->
    <div
      v-if="issueStore.error"
      class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ issueStore.error }}
    </div>

    <!-- منطقة الترويسة الذكية -->
    <IssueHeaderForm
      v-model="form"
      :validation-errors="issueStore.validationErrors"
      :is-requisition-linked="isRequisitionLinked"
      :route-badge-text="routeBadgeText"
      :route-badge-class="routeBadgeClass"
    />

    <!-- منطقة جدول الأصناف والإدخال الفوري -->
    <AppCard>
      <IssueItemsTable
        :items="items"
        :form="form"
        :visible-table-schema="visibleTableSchema"
        :get-validation-error="getValidationError"
        :format-number="formatNumber"
        :unformat-number="unformatNumber"
        :sync-unit-details="syncUnitDetails"
        :remove-row="removeRow"
        :trigger-add-new-empty-line="triggerAddNewEmptyLine"
        :handle-global-item-select="handleGlobalItemSelect"
        :is-form-loaded="isFormLoaded"
      />
    </AppCard>

    <!-- منطقة التذييل والإجماليات والأثر المخزني -->
    <IssueSummaryFooter
      v-model="form"
      :calculated-total-cost="calculatedTotalCost"
      :total-items-count="totalItemsCount"
      :total-quantity-sum="totalQuantitySum"
      :is-requisition-linked="isRequisitionLinked"
      :validation-errors="issueStore.validationErrors"
    />

    <!-- شريط الإجراءات السفلي العائم الثابت -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-[#23252e] border-t border-[#5d6170]/60 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] z-40 flex justify-between items-center px-6"
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

      <div class="flex items-center gap-3">
        <!-- زر إلغاء وتراجع -->
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>

        <!-- زر الحفظ كمسودة -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          variant="outline"
          size="sm"
          :disabled="issueStore.loading"
          @click="handleSubmit(false)"
          class="text-gray-300 border-gray-600 hover:bg-gray-800"
        >
          <span v-if="issueStore.loading">جاري الحفظ...</span>
          <span v-else>{{ isEdit ? 'تحديث المسودة' : 'حفظ كمسودة' }}</span>
        </AppButton>

        <!-- زر الحفظ والتأكيد المباشر -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          size="sm"
          :disabled="issueStore.loading"
          @click="handleSubmit(true)"
          class="bg-[#e05e2b] hover:bg-[#d04f1e] text-white border-none shadow-[0_0_10px_rgba(224,94,43,0.3)]"
        >
          <span v-if="issueStore.loading">جاري التأكيد والخصم...</span>
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

import IssueHeaderForm from './components/IssueHeaderForm.vue'
import IssueItemsTable from './components/IssueItemsTable.vue'
import IssueSummaryFooter from './components/IssueSummaryFooter.vue'

const {
  isFormLoaded,
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
  removeRow,
  triggerAddNewEmptyLine,
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
</script>
