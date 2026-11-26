<!-- src/modules/hr/views/payroll/PayrollInputsFilter.vue -->
<template>
  <div
    class="p-4 bg-surface-header rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm mb-6 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
      <!-- 1. البحث السريع باسم الموظف أو السبب -->
      <div class="lg:col-span-5 flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1"> البحث السريع </label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs"
        >
          <span class="absolute right-3 text-text-muted pointer-events-none z-10">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            placeholder="ابحث باسم الموظف أو البيان..."
            class="block w-full h-full pr-9 pl-8 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-semibold"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="$emit('update:searchQuery', '')"
            class="absolute left-2.5 text-text-muted hover:text-danger p-1 rounded transition-colors cursor-pointer"
            title="مسح نص البحث"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- 2. نوع المدخل المالي -->
      <div class="lg:col-span-3 flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1"> نوع الحركة المالية </label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs overflow-hidden"
        >
          <div class="w-full h-full px-1 flex items-center">
            <AppDropdown
              id="payroll-input-type-filter"
              :model-value="typeFilter"
              :options="typeOptions"
              option-label="name"
              option-value="id"
              placeholder="كل أنواع المدخلات"
              class="w-full bg-transparent filter-embedded-dropdown"
              @update:model-value="$emit('update:typeFilter', $event)"
            />
          </div>
        </div>
      </div>

      <!-- 3. حالة الترحيل لمسير الرواتب -->
      <div class="lg:col-span-2 flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1"> حالة الترحيل </label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs overflow-hidden"
        >
          <div class="w-full h-full px-1 flex items-center">
            <AppDropdown
              id="payroll-input-processed-filter"
              :model-value="processedFilter"
              :options="processedOptions"
              option-label="name"
              option-value="id"
              placeholder="كل الحالات"
              class="w-full bg-transparent filter-embedded-dropdown"
              @update:model-value="$emit('update:processedFilter', $event)"
            />
          </div>
        </div>
      </div>

      <!-- 4. زر إعادة ضبط التصفية -->
      <div class="lg:col-span-2 flex items-center justify-end">
        <button
          type="button"
          @click="resetAllFilters"
          :disabled="!hasActiveFilters"
          class="w-full h-11 px-3 rounded-lg border border-surface-border bg-surface-card hover:border-primary hover:text-primary text-text-secondary text-xs font-bold transition-colors disabled:opacity-45 disabled:pointer-events-none cursor-pointer shadow-2xs"
        >
          مسح التصفية
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  typeFilter: { type: String, default: '' },
  processedFilter: { type: String, default: '' },
})

const emit = defineEmits(['update:searchQuery', 'update:typeFilter', 'update:processedFilter'])

const typeOptions = [
  { id: '', name: 'كل أنواع المدخلات' },
  { id: 'bonus', name: 'حوافز ومكافآت' },
  { id: 'penalty', name: 'جزاءات وغرامات' },
  { id: 'allowance', name: 'بدلات إضافية' },
  { id: 'deduction', name: 'استقطاعات أخرى' },
]

const processedOptions = [
  { id: '', name: 'كل الحالات' },
  { id: '1', name: 'تم ترحيلها للراتب' },
  { id: '0', name: 'بانتظار الترحيل' },
]

const hasActiveFilters = computed(() =>
  Boolean(props.searchQuery?.trim() || props.typeFilter !== '' || props.processedFilter !== ''),
)

const resetAllFilters = () => {
  emit('update:searchQuery', '')
  emit('update:typeFilter', '')
  emit('update:processedFilter', '')
}
</script>

<style scoped>
:deep(.filter-embedded-dropdown .p-dropdown),
:deep(.filter-embedded-dropdown [data-pc-name='dropdown']),
:deep(.filter-embedded-dropdown [data-pc-section='root']),
:deep(.filter-embedded-dropdown div.inline-flex) {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  height: 42px !important;
  min-height: 42px !important;
}

:deep(.filter-embedded-dropdown .p-dropdown-label),
:deep(.filter-embedded-dropdown [data-pc-section='input']) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  padding: 0 0.25rem !important;
  display: flex !important;
  align-items: center !important;
}
</style>
