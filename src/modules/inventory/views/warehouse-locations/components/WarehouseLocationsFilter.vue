<!-- src/modules/inventory/views/warehouse-locations/components/WarehouseLocationsFilter.vue -->
<template>
  <div
    class="p-4 sm:p-5 bg-surface-header rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm text-right font-sans transition-colors duration-200 mb-4"
    dir="rtl"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. البحث السريع -->
      <div class="flex flex-col space-y-1">
        <label for="loc-search" class="text-[11px] font-bold text-text-secondary pr-1">
          البحث السريع
        </label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs"
        >
          <span class="absolute right-3 text-text-muted pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>

          <input
            id="loc-search"
            type="text"
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            placeholder="ابحث باسم الموقع أو الكود..."
            class="block w-full h-full pr-10 pl-9 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-semibold"
          />

          <button
            v-if="searchQuery"
            type="button"
            @click="$emit('update:searchQuery', '')"
            class="absolute left-2.5 p-1 text-text-muted hover:text-danger rounded-md transition-colors cursor-pointer"
            title="مسح البحث"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 2. المستودع -->
      <div class="flex flex-col space-y-1">
        <label for="filter-warehouse" class="text-[11px] font-bold text-text-secondary pr-1">
          المستودع
        </label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs overflow-hidden"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-10 pl-1 flex items-center">
            <AppDropdown
              id="filter-warehouse"
              :model-value="warehouseFilter"
              :options="[{ id: '', name: 'كل المستودعات' }, ...warehouses]"
              option-label="name"
              option-value="id"
              placeholder="كل المستودعات..."
              class="w-full bg-transparent filter-embedded-dropdown"
              @update:model-value="$emit('update:warehouseFilter', $event)"
            />
          </div>
        </div>
      </div>

      <!-- 3. نوع الموقع -->
      <div class="flex flex-col space-y-1">
        <label for="filter-type" class="text-[11px] font-bold text-text-secondary pr-1">
          نوع الموقع
        </label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs"
        >
          <span class="absolute right-3 text-text-muted pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </span>

          <select
            id="filter-type"
            :value="typeFilter"
            @change="$emit('update:typeFilter', $event.target.value)"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="" class="bg-surface-section text-text-primary">كل الأنواع</option>
            <option value="aisle" class="bg-surface-section text-text-primary">ممر (Aisle)</option>
            <option value="rack" class="bg-surface-section text-text-primary">
              صف رفوف (Rack)
            </option>
            <option value="shelf" class="bg-surface-section text-text-primary">رف (Shelf)</option>
            <option value="bin" class="bg-surface-section text-text-primary">
              صندوق / حاوية (Bin)
            </option>
          </select>

          <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
      </div>

      <!-- 4. حالة التفعيل -->
      <div class="flex flex-col space-y-1">
        <label for="filter-status" class="text-[11px] font-bold text-text-secondary pr-1">
          حالة التفعيل
        </label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>

          <select
            id="filter-status"
            :value="statusFilter"
            @change="$emit('update:statusFilter', $event.target.value)"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="" class="bg-surface-section text-text-primary">كل الحالات</option>
            <option value="1" class="bg-surface-section text-text-primary">نشط</option>
            <option value="0" class="bg-surface-section text-text-primary">موقوف</option>
          </select>

          <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  searchQuery: { type: String, default: '' },
  warehouseFilter: { type: [String, Number], default: '' },
  typeFilter: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
  warehouses: { type: Array, default: () => [] },
})

defineEmits([
  'update:searchQuery',
  'update:warehouseFilter',
  'update:typeFilter',
  'update:statusFilter',
])
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
