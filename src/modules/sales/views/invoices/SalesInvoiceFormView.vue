<!-- src/modules/sales/views/invoices/SalesInvoiceFormView.vue -->
<script setup>
import { onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useSalesInvoiceFormLogic } from './composables/useSalesInvoiceFormLogic'

import AppButton from '@/components/ui/AppButton.vue'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'

import SalesInvoiceHeader from './components/SalesInvoiceHeader.vue'
import SalesInvoiceFooter from './components/SalesInvoiceFooter.vue'
import SalesInvoiceItemsTable from './components/SalesInvoiceItemsTable.vue'
import SalesInvoicePreviewModal from './components/SalesInvoicePreviewModal.vue'

const {
  isEdit,
  isFormLoaded,
  isSubmitting,
  isPos,
  isFullscreen,
  toggleFullscreen,
  exitPosTerminal,
  autoPreviewAfterSave,
  isPreviewModalOpen,
  previewSaleData,
  lastSavedSale,
  openDraftPreview,
  openLastSavedPreview,
  form,
  items,
  headerSubtotal,
  headerDiscountAmount,
  headerVatAmount,
  headerGrandTotal,
  getValidationError,
  handleSubmit,
  handleCancel,
  formatNumber,
  unformatNumber,
  removeRow,
  triggerAddNewEmptyLine,
  invoiceStore,
} = useSalesInvoiceFormLogic()

// تركيز المؤشر التلقائي المباشر على حقل الباركود والبحث السطري
const focusBarcodeInput = () => {
  nextTick(() => {
    const barcodeInput = document.querySelector('input[placeholder*="امسح الباركود"]')
    if (barcodeInput) {
      barcodeInput.focus()
      if (typeof barcodeInput.select === 'function') {
        barcodeInput.select()
      }
    }
  })
}

onMounted(() => {
  window.addEventListener('pos:focus-barcode', focusBarcodeInput)
  if (isPos.value) {
    focusBarcodeInput()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('pos:focus-barcode', focusBarcodeInput)
})
</script>

<template>
  <div
    :class="[
      'space-y-3 text-right font-sans pb-24 transition-all duration-200',
      isPos ? 'min-h-screen bg-surface-ground p-3.5' : '',
    ]"
    dir="rtl"
  >
    <!-- مؤشر التحميل لكامل الشاشة أثناء جلب البيانات الأولية -->
    <FullScreenLoader :show="!isFormLoaded" message="جاري تحميل بيانات شاشة المبيعات..." />

    <!-- أزرار التحكم السريعة للكاشير (بدون شريط عنوان مشتت) -->
    <div v-if="isPos" class="flex items-center justify-end gap-2 flex-wrap">
      <!-- خيار المعاينة التلقائية بعد الترحيل المباشر -->
      <label
        class="flex items-center gap-1.5 cursor-pointer select-none bg-surface-card border border-surface-border px-2.5 py-1.5 rounded-lg text-xs font-bold text-text-secondary hover:text-text-primary hover:border-primary/50 transition-colors shadow-2xs"
        title="عرض الفاتورة بنافذة منبثقة مخصصة للقطة الشاشة تلقائياً بعد كل عملية حفظ"
      >
        <input
          type="checkbox"
          v-model="autoPreviewAfterSave"
          class="rounded border-surface-border text-primary focus:ring-primary/20 w-3.5 h-3.5 cursor-pointer accent-primary"
        />
        <span class="text-[11px]">معاينة تلقائية بعد الحفظ</span>
      </label>

      <!-- زر استرجاع ومعاينة آخر فاتورة محفوظة إن وجدت -->
      <button
        v-if="lastSavedSale"
        type="button"
        @click="openLastSavedPreview"
        class="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500 hover:text-white flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        title="معاينة آخر فاتورة تم ترحيلها بنجاح لأخذ لقطة شاشة"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="text-[11px]">
          آخر فاتورة ({{ lastSavedSale.invoice_number || `#${lastSavedSale.id}` }})
        </span>
      </button>

      <!-- زر تفعيل وإلغاء وضع ملء الشاشة -->
      <button
        type="button"
        @click="toggleFullscreen"
        class="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-surface-border bg-surface-card hover:bg-surface-section text-text-primary flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        :title="isFullscreen ? 'إنهاء وضع ملء الشاشة' : 'تفعيل وضع ملء الشاشة الكامل'"
      >
        <svg
          v-if="!isFullscreen"
          class="w-3.5 h-3.5 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
        <svg
          v-else
          class="w-3.5 h-3.5 text-warning"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 9L4 4m0 0h4m-4 0v4m7 7l5 5m0 0v-4m0 4h-4M9 15l-5 5m0 0h4m-4 0v-4m16-7l-5-5m0 0h4m-4 0v4"
          />
        </svg>
        <span>{{ isFullscreen ? 'تصغير الشاشة' : 'شاشة كاملة' }}</span>
      </button>

      <!-- زر الخروج وإغلاق الشاشة -->
      <button
        type="button"
        @click="exitPosTerminal"
        class="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-danger/30 bg-danger/10 text-danger hover:bg-danger hover:text-white flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        title="الخروج من شاشة الكاشير والعودة للقائمة الرئيسية"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span>إغلاق وخروج</span>
      </button>
    </div>

    <!-- ترويسة شاشة المبيعات داخل التطبيق العادي -->
    <div v-else class="flex justify-between items-center py-1 border-b border-surface-border/60">
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ isEdit ? 'تعديل فاتورة مبيعات' : 'فاتورة مبيعات جديدة' }}
        </h1>
        <span
          v-if="form.invoice_number"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ form.invoice_number }}
        </span>
      </div>
    </div>

    <!-- تنبيه أخطاء السيرفر إن وجدت -->
    <div
      v-if="invoiceStore.error"
      class="p-2.5 bg-danger/10 border border-danger/30 text-danger rounded-lg text-xs font-bold shadow-2xs"
    >
      {{ invoiceStore.error }}
    </div>

    <!-- ترويسة الفاتورة المدمجة -->
    <SalesInvoiceHeader v-model="form" :validation-errors="invoiceStore.validationErrors" />

    <!-- منصة جدول الأصناف والباركود المباشر (بدون تغليف مزدوج) -->
    <SalesInvoiceItemsTable
      :items="items"
      :form="form"
      :get-validation-error="getValidationError"
      :format-number="formatNumber"
      :unformat-number="unformatNumber"
      :remove-row="removeRow"
      :trigger-add-new-empty-line="triggerAddNewEmptyLine"
      :is-form-loaded="isFormLoaded"
    />

    <!-- تذييل الفاتورة وحسابات الإجمالي والدفع -->
    <SalesInvoiceFooter
      v-model:notes="form.notes"
      v-model:discountType="form.discount_type"
      v-model:discountValue="form.discount_value"
      v-model:serviceCharge="form.service_charge"
      v-model:deliveryFee="form.delivery_fee"
      v-model:cashAmount="form.cash_amount"
      v-model:bankAmount="form.bank_amount"
      v-model:paymentMode="form.payment_mode"
      :subtotal="headerSubtotal"
      :discount-amount="headerDiscountAmount"
      :vat-amount="headerVatAmount"
      :grand-total="headerGrandTotal"
      :validation-errors="invoiceStore.validationErrors"
    />

    <!-- شريط الإجراءات السفلي الثابت -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex flex-wrap justify-between items-center gap-2 px-4 sm:px-6"
    >
      <div class="text-xs text-text-secondary font-medium">
        <span v-if="isPos" class="text-primary font-bold">
          ⚡ وضع الكاشير السريع: ترحيل فوري وتصفير تلقائي للبدء بالفاتورة التالية فوراً.
        </span>
        <span v-else> مستند المبيعات يخضع للمراقبة الجردية والتدقيق اللحظي للأرصدة. </span>
      </div>

      <div class="flex items-center gap-2 sm:gap-2.5">
        <!-- زر معاينة الفاتورة قبل الترحيل لأخذ سكرين شوت -->
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          @click="openDraftPreview"
          title="معاينة شكل الفاتورة الحالية لأخذ لقطة شاشة ومشاركتها"
        >
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>معاينة الفاتورة</span>
          </span>
        </AppButton>

        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          {{ isPos ? 'إلغاء وخروج' : 'إلغاء وتراجع' }}
        </AppButton>

        <!-- زر الحفظ كمسودة (يظهر في وضع الفاتورة القياسية الجديدة فقط) -->
        <AppButton
          v-if="!isPos && !isEdit"
          type="button"
          variant="outline"
          size="sm"
          :disabled="invoiceStore.loading || isSubmitting"
          @click="handleSubmit(false)"
        >
          <span>حفظ كمسودة</span>
        </AppButton>

        <!-- زر الحفظ والترحيل الرئيسي -->
        <AppButton
          type="button"
          size="sm"
          :disabled="invoiceStore.loading || isSubmitting"
          @click="handleSubmit(true)"
        >
          <span v-if="invoiceStore.loading || isSubmitting">جاري ترحيل حركة المبيعات...</span>
          <span v-else-if="isPos">حفظ الفاتورة والبدء بالتالية ↵</span>
          <span v-else>{{
            isEdit ? 'تحديث ومزامنة الفاتورة' : 'ترحيل وإصدار الفاتورة النهائية'
          }}</span>
        </AppButton>
      </div>
    </div>

    <!-- نافذة معاينة الفاتورة المنبثقة المخصصة للقطات الشاشة والواتساب -->
    <SalesInvoicePreviewModal v-model="isPreviewModalOpen" :sale="previewSaleData" />
  </div>
</template>
