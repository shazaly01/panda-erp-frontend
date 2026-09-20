<!-- src/modules/purchasing/views/receipts/PurchaseReceiptFormPage.vue -->
<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <!-- مؤشر التحميل لكامل الشاشة أثناء جلب البيانات -->
    <FullScreenLoader :show="!isFormLoaded" message="جاري تحميل بيانات سند الاستلام المخزني..." />

    <!-- شريط عنوان الصفحة المتكيف مع رقم السند وحالته -->
    <div
      class="flex flex-wrap justify-between items-center py-1 border-b border-surface-border/60 gap-3"
    >
      <div class="flex items-center gap-3">
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-[#e05e2b] rounded-full"></span>
          {{ formPageTitle }}
        </h1>

        <span
          v-if="form.receipt_number"
          class="px-2.5 py-0.5 text-xs font-mono font-bold rounded-lg bg-[#e05e2b]/15 text-[#e05e2b] border border-[#e05e2b]/30"
        >
          {{ form.receipt_number }}
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
      v-if="receiptStore.error"
      class="p-3 bg-rose-950/40 border border-rose-900/50 text-rose-400 rounded-xl text-xs font-bold shadow-sm"
    >
      {{ receiptStore.error }}
    </div>

    <!-- 1. ترويسة سند الاستلام والبيانات اللوجستية -->
    <ReceiptHeaderForm
      v-model="form"
      :validation-errors="receiptStore.validationErrors"
      :is-order-linked="isOrderLinked"
      :route-badge-text="routeBadgeText"
      :route-badge-class="routeBadgeClass"
    />

    <!-- 2. جدول بنود وفحص الأصناف والاستلام -->
    <AppCard>
      <ReceiptItemsTable
        :items="items"
        :form="form"
        :visible-table-schema="visibleTableSchema"
        :get-validation-error="getValidationError"
        :format-number="formatNumber"
        :unformat-number="unformatNumber"
        :sync-unit-details="syncUnitDetails"
        :handle-quantity-received-change="handleQuantityReceivedChange"
        :handle-quantity-accepted-change="handleQuantityAcceptedChange"
        :handle-quantity-rejected-change="handleQuantityRejectedChange"
        :remove-row="removeRow"
        :trigger-add-new-empty-line="triggerAddNewEmptyLine"
        :select-product-for-row="selectProductForRow"
        :handle-global-item-select="handleGlobalItemSelect"
        :increment-quantity="incrementQuantity"
        :decrement-quantity="decrementQuantity"
        :is-form-loaded="isFormLoaded"
      />
    </AppCard>

    <!-- 3. تذييل السند وإحصائيات الفحص والملاحظات -->
    <ReceiptSummaryFooter
      v-model="form"
      :total-items-count="totalItemsCount"
      :total-received-quantity="totalReceivedQuantity"
      :total-accepted-quantity="totalAcceptedQuantity"
      :total-rejected-quantity="totalRejectedQuantity"
      :total-estimated-cost="totalEstimatedCost"
      :is-order-linked="isOrderLinked"
      :validation-errors="receiptStore.validationErrors"
    />

    <!-- شريط الإجراءات السفلي العائم الثابت والنظيف -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-[#1e2027] border-t border-[#3b3f4f] p-3.5 shadow-[0_-4px_25px_rgba(0,0,0,0.5)] z-40 flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 gap-3"
    >
      <div class="text-xs text-gray-400 font-medium flex items-center gap-2">
        <span
          class="w-2 h-2 rounded-full"
          :class="isOrderLinked ? 'bg-sky-400' : 'bg-emerald-400'"
        ></span>
        <span>
          {{
            isOrderLinked
              ? 'تأكيد استلام السند سيقوم بمطابقة أمر الشراء وزيادة رصيد المستودع بالكميات المقبولة.'
              : 'الاستلام المباشر سيقوم بإدخال الكميات المقبولة فورياً وتحديث رصيد المستودع المحدد.'
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

        <!-- زر الحفظ وتأكيد الاستلام والترحيل المخزني الفوري -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          size="sm"
          :disabled="isSubmitting || !isFormLoaded"
          @click="handleSubmit(true)"
          class="bg-[#e05e2b] hover:bg-[#d04f1e] text-white border-none shadow-[0_0_15px_rgba(224,94,43,0.35)] font-bold px-5"
        >
          <span v-if="isSubmitting">جاري الترحيل وإثبات المخزون...</span>
          <span v-else>حفظ وتأكيد الاستلام المخزني فوراً</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePurchaseReceiptFormLogic } from './composables/usePurchaseReceiptFormLogic'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'

import ReceiptHeaderForm from './components/ReceiptHeaderForm.vue'
import ReceiptItemsTable from './components/ReceiptItemsTable.vue'
import ReceiptSummaryFooter from './components/ReceiptSummaryFooter.vue'

const {
  isFormLoaded,
  isSubmitting,
  isEdit,
  form,
  items,
  visibleTableSchema,
  isOrderLinked,
  routeBadgeText,
  routeBadgeClass,
  totalItemsCount,
  totalReceivedQuantity,
  totalAcceptedQuantity,
  totalRejectedQuantity,
  totalEstimatedCost,
  getValidationError,
  handleSubmit,
  handleCancel,
  formatNumber,
  unformatNumber,
  syncUnitDetails,
  handleQuantityReceivedChange,
  handleQuantityAcceptedChange,
  handleQuantityRejectedChange,
  incrementQuantity,
  decrementQuantity,
  removeRow,
  triggerAddNewEmptyLine,
  selectProductForRow,
  handleGlobalItemSelect,
  receiptStore,
} = usePurchaseReceiptFormLogic()

const formPageTitle = computed(() => {
  if (isEdit.value) {
    return 'تعديل مسودة سند استلام مخزني'
  }
  if (isOrderLinked.value) {
    return 'سند استلام مخزني مستند لأمر شراء'
  }
  return 'إنشاء سند استلام مخزني وإدخال بضائع مباشر'
})

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة قيد الفحص',
    received: 'تم الاستلام وإثبات المخزون',
    cancelled: 'ملغي',
  }
  return map[status] || status || 'مسودة جديدة'
}

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    received: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-rose-950/40 text-rose-400 border-rose-500/30',
  }
  return map[status] || 'bg-gray-800 text-gray-300 border-gray-600'
}
</script>
