<!-- src/modules/purchasing/views/requisitions/PurchaseRequisitionFormPage.vue -->
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
      v-if="requisitionStore.error"
      class="p-3 bg-rose-950/40 border border-rose-900/50 text-rose-400 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ requisitionStore.error }}
    </div>

    <!-- منطقة ترويسة الطلب -->
    <RequisitionHeaderForm
      v-model="form"
      :departments="departmentsList"
      :validation-errors="requisitionStore.validationErrors"
    />

    <!-- منطقة جدول الأصناف والبنود المطلوبة -->
    <AppCard>
      <RequisitionItemsTable
        :items="items"
        :get-validation-error="getValidationError"
        :format-number="formatNumber"
        :unformat-number="unformatNumber"
        :trigger-add-new-empty-line="triggerAddNewEmptyLine"
        :remove-row="removeRow"
        :handle-global-item-select="handleGlobalItemSelect"
        :sync-unit-details="syncUnitDetails"
      />
    </AppCard>

    <!-- منطقة التذييل والإجماليات ودورة الاعتماد -->
    <RequisitionSummaryFooter
      v-model="form"
      :calculated-estimated-total="calculatedEstimatedTotal"
      :total-items-count="totalItemsCount"
      :validation-errors="requisitionStore.validationErrors"
    />

    <!-- شريط الإجراءات السفلي العائم الثابت -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-[#23252e] border-t border-[#5d6170]/60 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-gray-400 font-medium flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#e05e2b] animate-pulse"></span>
        <span>
          طلبات الشراء تتطلب مراجعة واعتماد الإدارة المختصة قبل تحويلها إلى أوامر شراء رسمية.
        </span>
      </div>

      <div class="flex items-center gap-3">
        <!-- زر إلغاء وتراجع -->
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>

        <!-- زر الحفظ كمسودة (متاح فقط في حالة المسودة) -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          variant="outline"
          size="sm"
          :disabled="requisitionStore.loading"
          @click="handleSubmit(false)"
          class="text-gray-300 border-gray-600 hover:bg-gray-800"
        >
          <span v-if="requisitionStore.loading">جاري الحفظ...</span>
          <span v-else>{{ isEdit ? 'تحديث المسودة' : 'حفظ كمسودة' }}</span>
        </AppButton>

        <!-- زر الحفظ والتقديم المباشر للاعتماد -->
        <AppButton
          v-if="form.status === 'draft'"
          type="button"
          size="sm"
          :disabled="requisitionStore.loading"
          @click="handleSubmit(true)"
          class="bg-[#e05e2b] hover:bg-[#d04f1e] text-white border-none shadow-[0_0_10px_rgba(224,94,43,0.3)]"
        >
          <span v-if="requisitionStore.loading">جاري التقديم للاعتماد...</span>
          <span v-else>حفظ وتقديم الطلب للاعتماد فوراً</span>
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

import RequisitionHeaderForm from './components/RequisitionHeaderForm.vue'
import RequisitionItemsTable from './components/RequisitionItemsTable.vue'
import RequisitionSummaryFooter from './components/RequisitionSummaryFooter.vue'

const {
  isFormLoaded,
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
  handleGlobalItemSelect,
  syncUnitDetails,
  handleSubmit,
  handleCancel,
  requisitionStore,
} = usePurchaseRequisitionFormLogic()

const formPageTitle = computed(() => {
  if (isEdit.value) {
    return 'تعديل مسودة طلب شراء داخلي'
  }
  return 'إنشاء طلب شراء داخلي جديد للموظفين'
})
</script>
