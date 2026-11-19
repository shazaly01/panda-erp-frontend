<!-- src/modules/purchasing/views/orders/PurchaseOrderFormPage.vue -->
<template>
  <div class="space-y-3 text-right font-sans pb-24 transition-all duration-200" dir="rtl">
    <!-- مؤشر التحميل لكامل الشاشة أثناء جلب البيانات -->
    <FullScreenLoader :show="!isFormLoaded" message="جاري تحميل بيانات أمر الشراء..." />

    <!-- شريط عنوان الصفحة المتكيف مع رقم الأمر وحالته -->
    <div
      class="flex flex-wrap justify-between items-center py-1 border-b border-surface-border/60 gap-2"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ formPageTitle }}
        </h1>

        <span
          v-if="form.order_number"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ form.order_number }}
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
      v-if="orderStore.error"
      class="p-2.5 bg-danger/10 border border-danger/30 text-danger rounded-lg text-xs font-bold shadow-2xs"
    >
      {{ orderStore.error }}
    </div>

    <!-- 1. ترويسة أمر الشراء والبيانات اللوجستية -->
    <OrderHeaderForm
      v-model="form"
      :validation-errors="orderStore.validationErrors"
      :is-requisition-linked="isRequisitionLinked"
      :route-badge-text="routeBadgeText"
      :route-badge-class="routeBadgeClass"
    />

    <!-- 2. منصة جدول بنود أمر الشراء المجسّمة (بدون تغليف مزدوج) -->
    <OrderItemsTable
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

    <!-- 3. تذييل أمر الشراء والإجماليات والشروط -->
    <OrderSummaryFooter
      v-model="form"
      :calculated-subtotal="calculatedSubtotal"
      :calculated-discount-amount="calculatedDiscountAmount"
      :calculated-tax-amount="calculatedTaxAmount"
      :calculated-shipping-cost="calculatedShippingCost"
      :calculated-total-amount="calculatedTotalAmount"
      :total-items-count="totalItemsCount"
      :validation-errors="orderStore.validationErrors"
    />

    <!-- شريط الإجراءات السفلي العائم الثابت والنظيف -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex flex-wrap justify-between items-center gap-2 px-4 sm:px-6"
    >
      <div class="text-xs text-text-secondary font-medium flex items-center gap-2">
        <span
          class="w-2 h-2 rounded-full shrink-0"
          :class="
            form.status === 'confirmed' ? 'bg-info' : isRequisitionLinked ? 'bg-info' : 'bg-success'
          "
        ></span>
        <span>
          {{
            form.status === 'confirmed'
              ? 'تعديل أمر الشراء المؤكد سيقوم بتحديث بنود وشروط التوريد المتفق عليها مع المورد.'
              : isRequisitionLinked
                ? 'أمر الشراء مرتبط بطلب احتياج داخلي معتمد ومحدد الكميات.'
                : 'أمر شراء مباشر صادر للمورد بدون طلب احتياج مسبق.'
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

        <!-- زر حفظ التعديلات لأمر الشراء المؤكد -->
        <AppButton
          v-if="form.status === 'confirmed'"
          type="button"
          size="sm"
          :disabled="isSubmitting || !isFormLoaded"
          @click="handleSubmit(false)"
        >
          <span v-if="isSubmitting">جاري تحديث أمر الشراء...</span>
          <span v-else>حفظ وتحديث أمر الشراء</span>
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

        <!-- زر الحفظ والاعتماد المباشر -->
        <AppButton
          v-if="form.status === 'draft' || !form.status"
          type="button"
          size="sm"
          :disabled="isSubmitting || !isFormLoaded"
          @click="handleSubmit(true)"
        >
          <span v-if="isSubmitting">جاري الحفظ والتأكيد...</span>
          <span v-else>حفظ واعتماد أمر الشراء فوراً</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePurchaseOrderFormLogic } from './composables/usePurchaseOrderFormLogic'

import AppButton from '@/components/ui/AppButton.vue'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'

import OrderHeaderForm from './components/OrderHeaderForm.vue'
import OrderItemsTable from './components/OrderItemsTable.vue'
import OrderSummaryFooter from './components/OrderSummaryFooter.vue'

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
  calculatedSubtotal,
  calculatedDiscountAmount,
  calculatedTaxAmount,
  calculatedShippingCost,
  calculatedTotalAmount,
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
  orderStore,
} = usePurchaseOrderFormLogic()

const formPageTitle = computed(() => {
  if (isEdit.value) {
    return form.status === 'confirmed' ? 'تعديل أمر شراء مؤكد' : 'تعديل مسودة أمر شراء'
  }
  if (isRequisitionLinked.value) {
    return 'إصدار أمر شراء مرتبط بطلب احتياج داخلي'
  }
  return 'إصدار أمر شراء مباشر لمورد'
})

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة قيد المراجعة',
    confirmed: 'أمر شراء مؤكد',
    partially_received: 'مستلم جزئياً',
    received: 'مستلم بالكامل',
    partially_billed: 'مفوتر جزئياً',
    billed: 'مفوتر بالكامل',
    closed: 'أمر شراء مغلق',
    cancelled: 'أمر ملغي',
  }
  return map[status] || status || 'مسودة جديدة'
}

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-warning/15 text-warning border-warning/35',
    confirmed: 'bg-info/15 text-info border-info/35',
    partially_received: 'bg-primary/15 text-primary border-primary/35',
    received: 'bg-success/15 text-success border-success/35',
    partially_billed: 'bg-warning/15 text-warning border-warning/35',
    billed: 'bg-success/15 text-success border-success/35',
    closed: 'bg-surface-ground text-text-secondary border-surface-border',
    cancelled: 'bg-danger/15 text-danger border-danger/35',
  }
  return map[status] || 'bg-surface-card text-text-secondary border-surface-border'
}
</script>
