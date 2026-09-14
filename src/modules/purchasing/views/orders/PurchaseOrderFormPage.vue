<!--src/modules/purchasing/views/orders/PurchaseOrderFormPage.vue-->
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
      v-if="orderStore.error"
      class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ orderStore.error }}
    </div>

    <!-- منطقة الترويسة الذكية -->
    <OrderHeaderForm
      v-model="form"
      :validation-errors="orderStore.validationErrors"
      :is-requisition-linked="isRequisitionLinked"
      :route-badge-text="routeBadgeText"
      :route-badge-class="routeBadgeClass"
    />

    <!-- منطقة جدول الأصناف والإدخال الفوري -->
    <AppCard>
      <OrderItemsTable
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

    <!-- منطقة التذييل والإجماليات والشروط -->
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

    <!-- شريط الإجراءات السفلي العائم الثابت -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-[#23252e] border-t border-[#5d6170]/60 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-gray-400 font-medium flex items-center gap-2">
        <span
          class="w-2 h-2 rounded-full"
          :class="isRequisitionLinked ? 'bg-sky-400' : 'bg-emerald-400'"
        ></span>
        <span>
          {{
            isRequisitionLinked
              ? 'أمر الشراء مرتبط بطلب احتياج داخلي معتمد ومحدد الكميات.'
              : 'أمر شراء مباشر صادر للمورد بدون طلب احتياج مسبق.'
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
          :disabled="orderStore.loading"
          @click="handleSubmit(false)"
          class="text-gray-300 border-gray-600 hover:bg-gray-800"
        >
          <span v-if="orderStore.loading">جاري الحفظ...</span>
          <span v-else>{{ isEdit ? 'تحديث المسودة' : 'حفظ كمسودة' }}</span>
        </AppButton>

        <!-- زر الحفظ والاعتماد المباشر -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          size="sm"
          :disabled="orderStore.loading"
          @click="handleSubmit(true)"
          class="bg-[#e05e2b] hover:bg-[#d04f1e] text-white border-none shadow-[0_0_10px_rgba(224,94,43,0.3)]"
        >
          <span v-if="orderStore.loading">جاري الحفظ والتأكيد...</span>
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
import AppCard from '@/components/ui/AppCard.vue'

import OrderHeaderForm from './components/OrderHeaderForm.vue'
import OrderItemsTable from './components/OrderItemsTable.vue'
import OrderSummaryFooter from './components/OrderSummaryFooter.vue'

const {
  isFormLoaded,
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
  removeRow,
  triggerAddNewEmptyLine,
  handleGlobalItemSelect,
  orderStore,
} = usePurchaseOrderFormLogic()

const formPageTitle = computed(() => {
  if (isEdit.value) {
    return 'تعديل مسودة أمر شراء'
  }
  if (isRequisitionLinked.value) {
    return 'إصدار أمر شراء مرتبط بطلب احتياج داخلي'
  }
  return 'إصدار أمر شراء مباشر لمورد'
})
</script>
