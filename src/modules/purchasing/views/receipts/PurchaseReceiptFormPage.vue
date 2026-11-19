<!-- src/modules/purchasing/views/receipts/PurchaseReceiptFormPage.vue -->
<template>
  <div class="space-y-3 text-right font-sans pb-24 transition-all duration-200" dir="rtl">
    <!-- مؤشر التحميل لكامل الشاشة أثناء جلب البيانات -->
    <FullScreenLoader :show="!isFormLoaded" message="جاري تحميل بيانات سند الاستلام المخزني..." />

    <!-- شريط عنوان الصفحة المتكيف مع رقم السند وحالته -->
    <div
      class="flex flex-wrap justify-between items-center py-1 border-b border-surface-border/60 gap-2"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ formPageTitle }}
        </h1>

        <span
          v-if="form.receipt_number"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ form.receipt_number }}
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
      v-if="receiptStore.error"
      class="p-2.5 bg-danger/10 border border-danger/30 text-danger rounded-lg text-xs font-bold shadow-2xs"
    >
      {{ receiptStore.error }}
    </div>

    <!-- 1. ترويسة سند الاستلام والبيانات اللوجستية -->
    <ReceiptHeaderForm
      v-model="form"
      :departments="departmentsList"
      :validation-errors="receiptStore.validationErrors"
      :is-order-linked="isOrderLinked"
      :route-badge-text="routeBadgeText"
      :route-badge-class="routeBadgeClass"
    />

    <!-- 2. منصة جدول بنود وفحص الأصناف والاستلام المجسّمة (بدون تغليف مزدوج) -->
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
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex flex-wrap justify-between items-center gap-2 px-4 sm:px-6"
    >
      <div class="text-xs text-text-secondary font-medium flex items-center gap-2">
        <span
          class="w-2 h-2 rounded-full shrink-0"
          :class="
            form.status === 'received' ? 'bg-success' : isOrderLinked ? 'bg-info' : 'bg-warning'
          "
        ></span>
        <span>
          {{
            form.status === 'received'
              ? 'تعديل سند الاستلام المؤكد سيقوم بإعادة ضبط وتحديث حركات المخزون وكميات أمر الشراء تلقائياً.'
              : isOrderLinked
                ? 'تأكيد استلام السند سيقوم بمطابقة أمر الشراء وزيادة رصيد المستودع بالكميات المقبولة.'
                : 'الاستلام المباشر سيقوم بإدخال الكميات المقبولة فورياً وتحديث رصيد المستودع المحدد.'
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

        <!-- زر حفظ التعديلات لسند الاستلام المؤكد -->
        <AppButton
          v-if="form.status === 'received'"
          type="button"
          size="sm"
          :disabled="isSubmitting || !isFormLoaded"
          @click="handleSubmit(false)"
        >
          <span v-if="isSubmitting">جاري تحديث السند والمخزون...</span>
          <span v-else>حفظ وتحديث سند الاستلام</span>
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

        <!-- زر الحفظ وتأكيد الاستلام والترحيل المخزني الفوري -->
        <AppButton
          v-if="form.status === 'draft' || !form.status"
          type="button"
          size="sm"
          :disabled="isSubmitting || !isFormLoaded"
          @click="handleSubmit(true)"
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
  departmentsList,
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
    return form.status === 'received'
      ? 'تعديل سند استلام مخزني مؤكد'
      : 'تعديل مسودة سند استلام مخزني'
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
    draft: 'bg-warning/15 text-warning border-warning/35',
    received: 'bg-success/15 text-success border-success/35',
    cancelled: 'bg-danger/15 text-danger border-danger/35',
  }
  return map[status] || 'bg-surface-card text-text-secondary border-surface-border'
}
</script>
