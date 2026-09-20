<!-- src/modules/purchasing/views/bills/PurchaseBillFormPage.vue -->
<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <!-- مؤشر التحميل لكامل الشاشة أثناء جلب البيانات -->
    <FullScreenLoader :show="!isFormLoaded" message="جاري تحميل بيانات فاتورة المشتريات..." />

    <!-- شريط عنوان الصفحة المتكيف مع رقم الفاتورة وحالتها -->
    <div
      class="flex flex-wrap justify-between items-center py-1 border-b border-surface-border/60 gap-3"
    >
      <div class="flex items-center gap-3">
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-[#e05e2b] rounded-full"></span>
          {{ formPageTitle }}
        </h1>

        <span
          v-if="form.bill_number"
          class="px-2.5 py-0.5 text-xs font-mono font-bold rounded-lg bg-[#e05e2b]/15 text-[#e05e2b] border border-[#e05e2b]/30"
        >
          {{ form.bill_number }}
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
      v-if="billStore.error"
      class="p-3 bg-rose-950/40 border border-rose-900/50 text-rose-400 rounded-xl text-xs font-bold shadow-sm"
    >
      {{ billStore.error }}
    </div>

    <!-- 1. منطقة الترويسة الذكية -->
    <BillHeaderForm
      v-model="form"
      :validation-errors="billStore.validationErrors"
      :is-receipt-linked="isReceiptLinked"
      :is-direct-inventory-purchase="isDirectInventoryPurchase"
      :route-badge-text="routeBadgeText"
      :route-badge-class="routeBadgeClass"
    />

    <!-- 2. منطقة جدول الأصناف والإدخال الفوري والذكي -->
    <AppCard>
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
    </AppCard>

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
    <AppCard
      v-if="billStore.currentBill?.voucher_details?.length > 0"
      class="border border-surface-border/80 bg-surface-card/40 p-4 rounded-xl space-y-3"
    >
      <div class="flex items-center justify-between border-b border-surface-border/50 pb-2">
        <h3 class="text-xs font-black text-text-primary flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          سندات الصرف والمدفوعات المرتبطة بالفاتورة
        </h3>
        <span class="text-[11px] font-mono font-bold text-emerald-400">
          إجمالي المسدد: {{ formatNumber(form.paid_amount) }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="item in billStore.currentBill.voucher_details"
          :key="item.id"
          class="p-3 bg-surface-bg border border-surface-border/60 rounded-lg space-y-1.5 text-xs"
        >
          <div class="flex items-center justify-between">
            <span class="font-mono font-black text-primary"
              >#{{ item.voucher?.number || item.voucher_id }}</span
            >
            <span class="font-mono font-bold text-emerald-400">
              {{ formatNumber(item.amount) }}
            </span>
          </div>
          <div class="flex items-center justify-between text-text-muted text-[11px]">
            <span>
              {{
                item.voucher?.payment_method === 'bank'
                  ? item.voucher?.bank_account?.name || 'حساب بنكي'
                  : item.voucher?.box?.name || 'خزينة نقدية'
              }}
            </span>
            <span class="font-mono">{{ item.voucher?.date || '-' }}</span>
          </div>
          <p
            v-if="item.description"
            class="text-text-muted text-[11px] truncate"
            :title="item.description"
          >
            {{ item.description }}
          </p>
        </div>
      </div>
    </AppCard>

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
      class="fixed bottom-0 right-0 left-0 bg-[#1e2027] border-t border-[#3b3f4f] p-3.5 shadow-[0_-4px_25px_rgba(0,0,0,0.5)] z-40 flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 gap-3"
    >
      <div class="text-xs text-gray-400 font-medium flex items-center gap-2">
        <span
          class="w-2 h-2 rounded-full"
          :class="isDirectInventoryPurchase ? 'bg-emerald-400' : 'bg-sky-400'"
        ></span>
        <span>
          {{
            isDirectInventoryPurchase
              ? 'الشراء المباشر يقوم بتحديث المخزون وقيد ذمة المورد فورياً عند الترحيل.'
              : 'الفاتورة المرتبطة بسند استلام تقوم بإقفال وسيط الاستلام وإثبات ذمة المورد.'
          }}
        </span>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
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
          size="sm"
          @click="openVoucherModal"
          class="bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-[0_0_10px_rgba(16,185,129,0.3)]"
        >
          سداد دفعة مالية بسند صرف
        </AppButton>

        <!-- زر الحفظ كمسودة -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          variant="outline"
          size="sm"
          :disabled="billStore.loading || !isFormLoaded"
          @click="handleSubmit(false)"
          class="text-gray-300 border-gray-600 hover:bg-gray-800"
        >
          <span v-if="billStore.loading">جاري الحفظ...</span>
          <span v-else>{{ isEdit ? 'تحديث المسودة' : 'حفظ كمسودة' }}</span>
        </AppButton>

        <!-- زر الحفظ والترحيل المباشر -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          size="sm"
          :disabled="billStore.loading || !isFormLoaded"
          @click="handleSubmit(true)"
          class="bg-[#e05e2b] hover:bg-[#d04f1e] text-white border-none shadow-[0_0_15px_rgba(224,94,43,0.35)] font-bold px-5"
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
import AppCard from '@/components/ui/AppCard.vue'
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
    return 'تعديل مسودة فاتورة مشتريات'
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
    draft: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    posted: 'bg-blue-950/40 text-blue-400 border-blue-500/30',
    partially_paid: 'bg-indigo-950/40 text-indigo-400 border-indigo-500/30',
    paid: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-rose-950/40 text-rose-400 border-rose-500/30',
  }
  return map[status] || 'bg-gray-800 text-gray-300 border-gray-600'
}
</script>
