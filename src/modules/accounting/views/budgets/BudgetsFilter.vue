<!--src/modules/accounting/views/budgets/BudgetsFilter.vue-->
<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <!-- البحث النصي بالاسم -->
      <div class="md:col-span-4">
        <AppInput
          id="budget-search-input"
          :model-value="searchQuery"
          placeholder="بحث باسم الموازنة التقديرية..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <!-- فلتر السنة المالية -->
      <div class="md:col-span-3">
        <AppDropdown
          id="budget-fiscal-year-filter"
          :model-value="fiscalYearFilter"
          :options="formattedFiscalYears"
          option-label="name"
          option-value="id"
          placeholder="كل السنوات المالية"
          @update:model-value="$emit('update:fiscalYearFilter', $event)"
        />
      </div>

      <!-- فلتر الحالة -->
      <div class="md:col-span-3">
        <AppDropdown
          id="budget-status-filter"
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'كل الحالات' },
            { id: 'draft', name: 'مسودة' },
            { id: 'approved', name: 'معتمدة' },
            { id: 'active', name: 'نشطة' },
            { id: 'closed', name: 'مغلقة' },
          ]"
          @update:model-value="$emit('update:statusFilter', $event)"
        />
      </div>

      <!-- فلتر نمط الرقابة -->
      <div class="md:col-span-2">
        <AppDropdown
          id="budget-control-mode-filter"
          :model-value="controlModeFilter"
          :options="[
            { id: '', name: 'كل أنماط الرقابة' },
            { id: 'advisory', name: 'استرشادي' },
            { id: 'warning', name: 'تحذير' },
            { id: 'strict_stop', name: 'منع صارم' },
          ]"
          @update:model-value="$emit('update:controlModeFilter', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
  controlModeFilter: { type: String, default: '' },
  fiscalYearFilter: { type: [String, Number], default: '' },
  fiscalYears: { type: Array, default: () => [] },
})

defineEmits([
  'update:searchQuery',
  'update:statusFilter',
  'update:controlModeFilter',
  'update:fiscalYearFilter',
])

const formattedFiscalYears = computed(() => [
  { id: '', name: 'كل السنوات المالية' },
  ...props.fiscalYears,
])
</script>
