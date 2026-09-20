<!-- src/modules/purchasing/views/requisitions/PurchaseRequisitionFormPage.vue -->
<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <!-- مؤشر التحميل لكامل الشاشة أثناء جلب البيانات -->
    <FullScreenLoader :show="!isFormLoaded" message="جاري تحميل بيانات طلب الاحتياج..." />

    <!-- شريط عنوان الصفحة المتكيف مع رقم الطلب وحالته -->
    <div
      class="flex flex-wrap justify-between items-center py-1 border-b border-surface-border/60 gap-3"
    >
      <div class="flex items-center gap-3">
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-[#e05e2b] rounded-full"></span>
          {{ formPageTitle }}
        </h1>

        <span
          v-if="form.requisition_number"
          class="px-2.5 py-0.5 text-xs font-mono font-bold rounded-lg bg-[#e05e2b]/15 text-[#e05e2b] border border-[#e05e2b]/30"
        >
          {{ form.requisition_number }}
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
      v-if="requisitionStore.error"
      class="p-3 bg-rose-950/40 border border-rose-900/50 text-rose-400 rounded-xl text-xs font-bold shadow-sm"
    >
      {{ requisitionStore.error }}
    </div>

    <!-- 1. ترويسة الطلب المبسطة -->
    <RequisitionHeaderForm
      v-model="form"
      :departments="departmentsList"
      :validation-errors="requisitionStore.validationErrors"
    />

    <!-- 2. جدول إدخال البنود المباشر والمدمج -->
    <AppCard>
      <RequisitionItemsTable
        :items="items"
        :get-validation-error="getValidationError"
        :format-number="formatNumber"
        :unformat-number="unformatNumber"
        :trigger-add-new-empty-line="triggerAddNewEmptyLine"
        :remove-row="removeRow"
        :select-product-for-row="selectProductForRow"
        :handle-item-name-input="handleItemNameInput"
        :sync-unit-details="syncUnitDetails"
        :increment-quantity="incrementQuantity"
        :decrement-quantity="decrementQuantity"
      />
    </AppCard>

    <!-- 3. تذييل الطلب والمبررات النظيفة -->
    <RequisitionSummaryFooter
      v-model="form"
      :calculated-estimated-total="calculatedEstimatedTotal"
      :total-items-count="totalItemsCount"
      :validation-errors="requisitionStore.validationErrors"
    />

    <!-- شريط الإجراءات السفلي العائم النظيف -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-[#1e2027] border-t border-[#3b3f4f] p-3.5 shadow-[0_-4px_25px_rgba(0,0,0,0.5)] z-40 flex justify-end items-center px-4 sm:px-8"
    >
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

        <!-- زر التقديم والإرسال المباشر للاعتماد -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          size="sm"
          :disabled="isSubmitting || !isFormLoaded"
          @click="handleSubmit(true)"
          class="bg-[#e05e2b] hover:bg-[#d04f1e] text-white border-none shadow-[0_0_15px_rgba(224,94,43,0.35)] font-bold px-5"
        >
          <span v-if="isSubmitting">جاري الإرسال...</span>
          <span v-else>إرسال طلب الاحتياج للاعتماد</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePurchaseRequisitionFormLogic } from './composables/usePurchaseRequisitionFormLogic'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'

import RequisitionHeaderForm from './components/RequisitionHeaderForm.vue'
import RequisitionItemsTable from './components/RequisitionItemsTable.vue'
import RequisitionSummaryFooter from './components/RequisitionSummaryFooter.vue'

const {
  isFormLoaded,
  isSubmitting,
  isEdit,
  form,
  items,
  departmentsList,
  calculatedEstimatedTotal,
  totalItemsCount,
  getValidationError,
  formatNumber,
  unformatNumber,
  triggerAddNewEmptyLine,
  removeRow,
  selectProductForRow,
  handleItemNameInput,
  syncUnitDetails,
  incrementQuantity,
  decrementQuantity,
  handleSubmit,
  handleCancel,
  requisitionStore,
} = usePurchaseRequisitionFormLogic()

const formPageTitle = computed(() => {
  if (isEdit.value) {
    return 'تعديل مسودة طلب الاحتياج الداخلي'
  }
  return 'إنشاء طلب احتياج داخلي جديد'
})

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة قيد الإعداد',
    pending: 'بانتظار الاعتماد',
    submitted: 'بانتظار الاعتماد',
    approved: 'معتمد رسمياً',
    rejected: 'مرفوض',
  }
  return map[status] || status || 'مسودة جديدة'
}

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    pending: 'bg-sky-950/40 text-sky-400 border-sky-500/30',
    submitted: 'bg-sky-950/40 text-sky-400 border-sky-500/30',
    approved: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-rose-950/40 text-rose-400 border-rose-500/30',
  }
  return map[status] || 'bg-gray-800 text-gray-300 border-gray-600'
}
</script>
