<!--src/modules/inventory/views/transfers/TransferForm.vue-->
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTransferFormLogic } from './composables/useTransferFormLogic'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'

import TransferHeader from './components/TransferHeader.vue'
import TransferFooter from './components/TransferFooter.vue'
import TransferItemsTable from './components/TransferItemsTable.vue'

const route = useRoute()

const {
  isEdit,
  isFormLoaded,
  form,
  items,
  detailSchema,
  visibleTableSchema,
  totalTransferCost,
  totalTransferQuantity,
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
  transferStore,
} = useTransferFormLogic()

const formPageTitle = computed(() => {
  if (isEdit.value) {
    return 'تعديل مسودة أمر التحويل المخزني'
  }
  if (route.meta.pageTitle) {
    return route.meta.pageTitle
  }
  return 'إصدار أمر تحويل بين المستودعات جديد'
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
      v-if="transferStore.error"
      class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ transferStore.error }}
    </div>

    <TransferHeader v-model="form" :validation-errors="transferStore.validationErrors" />

    <AppCard>
      <TransferItemsTable
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

    <TransferFooter
      v-model:notes="form.notes"
      v-model:status="form.status"
      :total-transfer-cost="totalTransferCost"
      :total-transfer-quantity="totalTransferQuantity"
      :total-items-count="totalItemsCount"
      :validation-errors="transferStore.validationErrors"
    />

    <div
      class="fixed bottom-0 right-0 left-0 bg-[#23252e] border-t border-[#5d6170]/60 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-gray-400 font-medium">
        تخضع عمليات التحويل للتدقيق المحاسبي المباشر ويتم ترحيل وتحديث كشوفات حركة الأصناف فور
        الاعتماد.
      </div>
      <div class="flex items-center gap-3">
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>
        <AppButton
          type="button"
          variant="outline"
          size="sm"
          :disabled="transferStore.loading"
          @click="handleSubmit(false)"
          class="text-gray-300 border-gray-600 hover:bg-gray-800"
        >
          <span v-if="transferStore.loading">جاري الحفظ...</span>
          <span v-else>{{ isEdit ? 'تحديث المسودة' : 'حفظ كمسودة' }}</span>
        </AppButton>
        <AppButton
          type="button"
          size="sm"
          :disabled="transferStore.loading"
          @click="handleSubmit(true)"
          class="bg-[#e05e2b] hover:bg-[#d04f1e] text-white border-none shadow-[0_0_10px_rgba(224,94,43,0.3)]"
        >
          <span v-if="transferStore.loading">جاري الترحيل والاعتماد...</span>
          <span v-else>حفظ واعتماد التحويل فوراً</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>
