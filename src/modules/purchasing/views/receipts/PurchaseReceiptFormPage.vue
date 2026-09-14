<!--src/modules/purchasing/views/receipts/PurchaseReceiptFormPage.vue-->
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
      v-if="receiptStore.error"
      class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ receiptStore.error }}
    </div>

    <!-- منطقة الترويسة اللوجستية للبيانات الأساسية -->
    <ReceiptHeaderForm
      v-model="form"
      :validation-errors="receiptStore.validationErrors"
      :is-order-linked="isOrderLinked"
      :route-badge-text="routeBadgeText"
      :route-badge-class="routeBadgeClass"
    />

    <!-- منطقة جدول بنود وفحص الأصناف والاستلام السريع -->
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
        :handle-global-item-select="handleGlobalItemSelect"
        :is-form-loaded="isFormLoaded"
      />
    </AppCard>

    <!-- منطقة التذييل وإحصائيات الفحص وملاحظات المعاينة -->
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

    <!-- شريط الإجراءات السفلي العائم الثابت -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-[#23252e] border-t border-[#5d6170]/60 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] z-40 flex justify-between items-center px-6"
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

      <div class="flex items-center gap-3">
        <!-- زر إلغاء وتراجع -->
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>

        <!-- زر الحفظ كمسودة (يظهر فقط إذا كان السند مسودة) -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          variant="outline"
          size="sm"
          :disabled="receiptStore.loading"
          @click="handleSubmit(false)"
          class="text-gray-300 border-gray-600 hover:bg-gray-800"
        >
          <span v-if="receiptStore.loading">جاري الحفظ...</span>
          <span v-else>{{ isEdit ? 'تحديث المسودة' : 'حفظ كمسودة' }}</span>
        </AppButton>

        <!-- زر الحفظ وتأكيد الاستلام والترحيل المخزني الفوري -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          size="sm"
          :disabled="receiptStore.loading"
          @click="handleSubmit(true)"
          class="bg-[#e05e2b] hover:bg-[#d04f1e] text-white border-none shadow-[0_0_10px_rgba(224,94,43,0.3)]"
        >
          <span v-if="receiptStore.loading">جاري الترحيل وإثبات المخزون...</span>
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

import ReceiptHeaderForm from './components/ReceiptHeaderForm.vue'
import ReceiptItemsTable from './components/ReceiptItemsTable.vue'
import ReceiptSummaryFooter from './components/ReceiptSummaryFooter.vue'

const {
  isFormLoaded,
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
  removeRow,
  triggerAddNewEmptyLine,
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
</script>
