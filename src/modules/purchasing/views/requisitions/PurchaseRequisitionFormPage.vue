<!-- src/modules/purchasing/views/requisitions/PurchaseRequisitionFormPage.vue -->
<template>
  <div class="space-y-3 text-right font-sans pb-24 transition-all duration-200" dir="rtl">
    <!-- مؤشر التحميل لكامل الشاشة أثناء جلب البيانات -->
    <FullScreenLoader :show="!isFormLoaded" message="جاري تحميل بيانات طلب الاحتياج..." />

    <!-- شريط عنوان الصفحة المتكيف مع رقم الطلب وحالته -->
    <div
      class="flex flex-wrap justify-between items-center py-1 border-b border-surface-border/60 gap-2"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ formPageTitle }}
        </h1>

        <span
          v-if="form.requisition_number"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ form.requisition_number }}
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
      v-if="requisitionStore.error"
      class="p-2.5 bg-danger/10 border border-danger/30 text-danger rounded-lg text-xs font-bold shadow-2xs"
    >
      {{ requisitionStore.error }}
    </div>

    <!-- 1. ترويسة الطلب المبسطة -->
    <RequisitionHeaderForm
      v-model="form"
      :departments="departmentsList"
      :employees="employeesList"
      :can-change-department="canChangeDepartment"
      :validation-errors="requisitionStore.validationErrors"
    />

    <!-- 2. منصة جدول إدخال البنود المباشر المجسّمة (بدون تغليف مزدوج) -->
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

    <!-- 3. تذييل الطلب والمبررات النظيفة -->
    <RequisitionSummaryFooter
      v-model="form"
      :calculated-estimated-total="calculatedEstimatedTotal"
      :total-items-count="totalItemsCount"
      :validation-errors="requisitionStore.validationErrors"
    />

    <!-- شريط الإجراءات السفلي العائم الثابت -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex flex-wrap justify-between items-center gap-2 px-4 sm:px-6"
    >
      <div class="text-xs text-text-secondary font-medium flex items-center gap-2">
        <span
          class="w-2 h-2 rounded-full shrink-0"
          :class="form.status === 'approved' ? 'bg-success' : 'bg-warning'"
        ></span>
        <span>
          {{
            form.status === 'approved'
              ? 'طلب الاحتياج معتمد رسمياً وجاهز للفرز والتوجيه المخزني أو الشرائي.'
              : 'يخضع طلب الاحتياج الداخلي لمراجعة واعتماد الإدارة المختصة قبل التنفيذ.'
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

        <!-- زر الحفظ كمسودة مؤقتة -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          variant="outline"
          size="sm"
          :disabled="isSubmitting || !isFormLoaded"
          @click="handleSubmit(false)"
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
  employeesList,
  canChangeDepartment,
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
    draft: 'bg-warning/15 text-warning border-warning/35',
    pending: 'bg-info/15 text-info border-info/35',
    submitted: 'bg-info/15 text-info border-info/35',
    approved: 'bg-success/15 text-success border-success/35',
    rejected: 'bg-danger/15 text-danger border-danger/35',
  }
  return map[status] || 'bg-surface-card text-text-secondary border-surface-border'
}
</script>
```[cite: 3, 56] تم الانتهاء من تحديث الشاشة الرئيسية لطلبات الشراء
(`PurchaseRequisitionFormPage.vue`) لتكتمل بذلك جميع شاشات ومكونات وحدة طلبات الشراء[cite: 56]. تفضل
بإرسال الشاشة التالية متى شئت.
