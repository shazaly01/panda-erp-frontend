<!--src/modules/inventory/views/adjustments/AdjustmentForm.vue-->
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAdjustmentFormLogic } from './composables/useAdjustmentFormLogic'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'

import AdjustmentHeader from './components/AdjustmentHeader.vue'
import AdjustmentFooter from './components/AdjustmentFooter.vue'
import AdjustmentItemsTable from './components/AdjustmentItemsTable.vue'

const route = useRoute()

const {
  isEdit,
  isFormLoaded,
  form,
  items,
  detailSchema,
  visibleTableSchema,
  totalDifferenceCost,
  totalSurplusCost,
  totalDeficitCost,
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
  adjustmentStore,
} = useAdjustmentFormLogic()

// عنوان الصفحة الديناميكي المتوافق مع المسار ونوع العملية
const formPageTitle = computed(() => {
  if (isEdit.value) {
    return 'تعديل مسودة وثيقة التسوية'
  }
  if (route.meta.pageTitle) {
    return route.meta.pageTitle
  }
  switch (form.value.type) {
    case 'physical_count':
      return 'إصدار محضر جرد دوري / فعلي جديد'
    case 'damage':
      return 'إصدار إذن إتلاف وتكهين بضاعة تالفة'
    case 'loss':
      return 'إصدار إذن تسوية فاقد وعجز مخزني'
    case 'opening_balance':
      return 'إدخال رصيد افتتاحي لبضاعة أول المدة'
    case 'general_adjustment':
      return 'إصدار تسوية مخزنية عامة'
    default:
      return 'إصدار وثيقة تسوية جردية جديدة'
  }
})
</script>

<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <div class="flex justify-between items-center py-1 border-b border-surface-border/60">
      <div>
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-[#e05e2b] rounded-full"></span>
          {{ formPageTitle }}
        </h1>
      </div>
    </div>

    <div
      v-if="adjustmentStore.error"
      class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ adjustmentStore.error }}
    </div>

    <AdjustmentHeader v-model="form" :validation-errors="adjustmentStore.validationErrors" />

    <AppCard>
      <AdjustmentItemsTable
        :items="items"
        :form="form"
        :detail-schema="detailSchema"
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

    <AdjustmentFooter
      v-model:notes="form.notes"
      v-model:status="form.status"
      :type="form.type"
      :total-difference-cost="totalDifferenceCost"
      :total-surplus-cost="totalSurplusCost"
      :total-deficit-cost="totalDeficitCost"
      :total-items-count="totalItemsCount"
      :validation-errors="adjustmentStore.validationErrors"
    />

    <div
      class="fixed bottom-0 right-0 left-0 bg-[#23252e] border-t border-[#5d6170]/60 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-gray-400 font-medium">
        تخضع كافة الحركات المخزنية للتدقيق المحاسبي المباشر وتحديث كشوفات حركة الأصناف فور الاعتماد.
      </div>
      <div class="flex items-center gap-3">
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>
        <AppButton
          type="button"
          variant="outline"
          size="sm"
          :disabled="adjustmentStore.loading"
          @click="handleSubmit(false)"
          class="text-gray-300 border-gray-600 hover:bg-gray-800"
        >
          <span v-if="adjustmentStore.loading">جاري الحفظ...</span>
          <span v-else>{{ isEdit ? 'تحديث المسودة' : 'حفظ كمسودة' }}</span>
        </AppButton>
        <AppButton
          type="button"
          size="sm"
          :disabled="adjustmentStore.loading"
          @click="handleSubmit(true)"
          class="bg-[#e05e2b] hover:bg-[#d04f1e] text-white border-none shadow-[0_0_10px_rgba(224,94,43,0.3)]"
        >
          <span v-if="adjustmentStore.loading">جاري الترحيل والاعتماد...</span>
          <span v-else>حفظ واعتماد التسوية فوراً</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>
