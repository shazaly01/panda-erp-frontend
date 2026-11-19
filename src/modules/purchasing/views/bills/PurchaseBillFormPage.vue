<!-- src/modules/purchasing/views/bills/PurchaseBillFormPage.vue -->
<template>
  <div class="space-y-3 text-right font-sans pb-24 transition-all duration-200" dir="rtl">
    <!-- مؤشر التحميل لكامل الشاشة أثناء جلب البيانات -->
    <FullScreenLoader :show="!isFormLoaded" message="جاري تحميل بيانات فاتورة المشتريات..." />

    <!-- شريط عنوان الصفحة المتكيف مع رقم الفاتورة وحالتها -->
    <div
      class="flex flex-wrap justify-between items-center py-1 border-b border-surface-border/60 gap-2"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ formPageTitle }}
        </h1>

        <span
          v-if="form.bill_number"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ form.bill_number }}
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
      v-if="billStore.error"
      class="p-2.5 bg-danger/10 border border-danger/30 text-danger rounded-lg text-xs font-bold shadow-2xs"
    >
      {{ billStore.error }}
    </div>

    <!-- 1. منطقة الترويسة الذكية -->
    <BillHeaderForm
      v-model="form"
      :departments="departmentsList"
      :validation-errors="billStore.validationErrors"
      :is-receipt-linked="isReceiptLinked"
      :is-direct-inventory-purchase="isDirectInventoryPurchase"
      :route-badge-text="routeBadgeText"
      :route-badge-class="routeBadgeClass"
    />

    <!-- 2. منصة جدول الأصناف المجسّمة (بدون تغليف مزدوج) -->
    <BillItemsTable
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

    <!-- 3. منطقة التذييل والإجماليات والتوجيه المحاسبي -->
    <BillSummaryFooter
      v-model="form"
      :calculated-subtotal="calculatedSubtotal"
      :calculated-discount-amount="calculatedDiscountAmount"
      :calculated-tax-amount="calculatedTaxAmount"
      :calculated-shipping-cost="calculatedShippingCost"
      :calculated-total-amount="calculatedTotalAmount"
      :calculated-remaining-amount="calculatedRemainingAmount"
      :total-items-count="totalItemsCount"
      :is-direct-inventory-purchase="isDirectInventoryPurchase"
      :is-receipt-linked="isReceiptLinked"
      :validation-errors="billStore.validationErrors"
    />

    <!-- 4. بطاقة استعراض سندات الصرف وسجل السداد المرتبط بالفاتورة -->
    <div
      v-if="billStore.currentBill?.voucher_details?.length > 0"
      class="p-4 bg-surface-section rounded-xl border border-surface-border border-t-4 border-t-success shadow-xs space-y-3 transition-colors duration-200"
    >
      <div class="flex items-center justify-between border-b border-surface-border/80 pb-2">
        <h3 class="text-xs font-black text-text-primary flex items-center gap-1.5">
          <span class="w-1.5 h-3.5 rounded-full bg-success inline-block"></span>
          <span>سندات الصرف والمدفوعات المرتبطة بالفاتورة</span>
        </h3>
        <span
          class="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-success/10 text-success border border-success/25"
        >
          إجمالي المسدد: {{ formatNumber(form.paid_amount) }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        <div
          v-for="item in billStore.currentBill.voucher_details"
          :key="item.id"
          class="p-3 bg-surface-card border border-surface-border rounded-xl space-y-1.5 text-xs shadow-2xs transition-colors hover:border-primary/40"
        >
          <div class="flex items-center justify-between">
            <span class="font-mono font-black text-primary">
              #{{ item.voucher?.number || item.voucher_id }}
            </span>
            <span class="font-mono font-black text-success">
              {{ formatNumber(item.amount) }}
            </span>
          </div>
          <div
            class="flex items-center justify-between text-text-secondary text-[11px] font-medium"
          >
            <span>
              {{
                item.voucher?.payment_method === 'bank'
                  ? item.voucher?.bank_account?.name || 'حساب بنكي'
                  : item.voucher?.box?.name || 'خزينة نقدية'
              }}
            </span>
            <span class="font-mono text-text-muted">{{ item.voucher?.date || '-' }}</span>
          </div>
          <p
            v-if="item.description"
            class="text-text-muted text-[11px] truncate border-t border-surface-border/50 pt-1"
            :title="item.description"
          >
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- نافذة سند الصرف المالي الموحد للتسوية -->
    <VoucherModal
      v-if="isVoucherModalOpen"
      v-model="isVoucherModalOpen"
      type="payment"
      :prefill-data="voucherPrefillData"
      @saved="handleVoucherSaved"
      @close="closeVoucherModal"
    />

    <!-- 5. شريط الإجراءات السفلي العائم الثابت -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex flex-wrap justify-between items-center gap-2 px-4 sm:px-6"
    >
      <div class="text-xs text-text-secondary font-medium flex items-center gap-2">
        <span
          class="w-2 h-2 rounded-full shrink-0"
          :class="isDirectInventoryPurchase ? 'bg-success' : 'bg-info'"
        ></span>
        <span>
          {{
            form.status === 'posted'
              ? 'تعديل الفاتورة المرحلة سيقوم بتحديث القيد المحاسبي وحركة المخزون تلقائياً في مكانهما.'
              : isDirectInventoryPurchase
                ? 'الشراء المباشر يقوم بتحديث المخزون وقيد ذمة المورد فورياً عند الترحيل.'
                : 'الفاتورة المرتبطة بسند استلام تقوم بإقفال وسيط الاستلام وإثبات ذمة المورد.'
          }}
        </span>
      </div>

      <div class="flex items-center gap-2 sm:gap-2.5">
        <!-- زر إلغاء وتراجع -->
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>

        <!-- زر السداد المباشر (يظهر فقط إذا كانت الفاتورة مرحلة ومتبقي عليها ذمة) -->
        <AppButton
          v-if="
            (form.status === 'posted' || form.status === 'partially_paid') &&
            calculatedRemainingAmount > 0
          "
          type="button"
          variant="success"
          size="sm"
          @click="openVoucherModal"
        >
          سداد دفعة مالية بسند صرف
        </AppButton>

        <!-- زر حفظ التعديلات للفاتورة المرحلة -->
        <AppButton
          v-if="form.status === 'posted'"
          type="button"
          size="sm"
          :disabled="billStore.loading || !isFormLoaded"
          @click="handleSubmit(false)"
        >
          <span v-if="billStore.loading">جاري حفظ التعديلات وتحديث القيد والمخزون...</span>
          <span v-else>حفظ وتحديث الفاتورة</span>
        </AppButton>

        <!-- زر الحفظ كمسودة -->
        <AppButton
          v-if="form.status === 'draft' || !form.status"
          type="button"
          variant="outline"
          size="sm"
          :disabled="billStore.loading || !isFormLoaded"
          @click="handleSubmit(false)"
        >
          <span v-if="billStore.loading">جاري الحفظ...</span>
          <span v-else>{{ isEdit ? 'تحديث المسودة' : 'حفظ كمسودة' }}</span>
        </AppButton>

        <!-- زر الحفظ والترحيل المباشر -->
        <AppButton
          v-if="form.status === 'draft' || !form.status"
          type="button"
          size="sm"
          :disabled="billStore.loading || !isFormLoaded"
          @click="handleSubmit(true)"
        >
          <span v-if="billStore.loading">جاري الترحيل وتوليد القيد...</span>
          <span v-else>حفظ وترحيل الفاتورة فوراً</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePurchaseBillFormLogic } from './composables/usePurchaseBillFormLogic'

import AppButton from '@/components/ui/AppButton.vue'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'

import BillHeaderForm from './components/BillHeaderForm.vue'
import BillItemsTable from './components/BillItemsTable.vue'
import BillSummaryFooter from './components/BillSummaryFooter.vue'
import VoucherModal from '@/modules/accounting/views/vouchers/components/VoucherModal.vue'

const {
  isFormLoaded,
  isEdit,
  form,
  items,
  departmentsList,
  visibleTableSchema,
  isReceiptLinked,
  isDirectInventoryPurchase,
  routeBadgeText,
  routeBadgeClass,
  calculatedSubtotal,
  calculatedDiscountAmount,
  calculatedTaxAmount,
  calculatedShippingCost,
  calculatedTotalAmount,
  calculatedRemainingAmount,
  totalItemsCount,
  isVoucherModalOpen,
  voucherPrefillData,
  openVoucherModal,
  closeVoucherModal,
  handleVoucherSaved,
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
  billStore,
} = usePurchaseBillFormLogic()

const formPageTitle = computed(() => {
  if (isEdit.value) {
    return form.status === 'posted' ? 'تعديل فاتورة مشتريات مرحلة' : 'تعديل مسودة فاتورة مشتريات'
  }
  if (isReceiptLinked.value) {
    return 'إصدار فاتورة مشتريات مرتبطة بسند استلام مخزني'
  }
  return 'إصدار فاتورة مشتريات وشراء مباشر للمخزن'
})

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة قيد المراجعة',
    posted: 'فاتورة مرحلة',
    partially_paid: 'مدفوعة جزئياً',
    paid: 'مدفوعة بالكامل',
    cancelled: 'فاتورة ملغاة',
  }
  return map[status] || status || 'مسودة جديدة'
}

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-warning/15 text-warning border-warning/35',
    posted: 'bg-info/15 text-info border-info/35',
    partially_paid: 'bg-primary/15 text-primary border-primary/35',
    paid: 'bg-success/15 text-success border-success/35',
    cancelled: 'bg-danger/15 text-danger border-danger/35',
  }
  return map[status] || 'bg-surface-card text-text-secondary border-surface-border'
}
</script>
