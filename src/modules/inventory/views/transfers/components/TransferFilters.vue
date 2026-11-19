<!-- src/modules/inventory/views/transfers/components/TransferFilters.vue -->
<template>
  <div
    class="p-5 bg-surface-header rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm space-y-4 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- الصف الأول: 4 أعمدة (البحث السريع + المستودع المصدر + المستودع الوجهة + حالة التحويل) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. البحث السريع -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">البحث السريع</label>
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
            type="text"
            v-model="search"
            placeholder="بحث برقم التحويل، الملاحظات..."
            class="block w-full h-full pr-10 pl-3 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-semibold"
          />
        </div>
      </div>

      <!-- 2. المستودع المصدر -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">المستودع المصدر</label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs overflow-hidden"
        >
          <span class="absolute right-3 text-warning pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-10 pl-1 flex items-center">
            <WarehouseDropdown
              id="transfer-from-warehouse-filter"
              v-model="fromWarehouseFilter"
              label=""
              placeholder="المستودع المصدر..."
              class="w-full bg-transparent filter-embedded-dropdown"
            />
          </div>
        </div>
      </div>

      <!-- 3. المستودع الوجهة -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">المستودع الوجهة</label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs overflow-hidden"
        >
          <span class="absolute right-3 text-success pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-10 pl-1 flex items-center">
            <WarehouseDropdown
              id="transfer-to-warehouse-filter"
              v-model="toWarehouseFilter"
              label=""
              placeholder="المستودع الوجهة..."
              class="w-full bg-transparent filter-embedded-dropdown"
            />
          </div>
        </div>
      </div>

      <!-- 4. حالة التحويل -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">حالة التحويل</label>
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
            v-model="statusFilter"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="" class="bg-surface-section text-text-primary">كافة الحالات</option>
            <option value="draft" class="bg-surface-section text-text-primary">
              مسودة قيد المراجعة
            </option>
            <option value="approved" class="bg-surface-section text-text-primary">
              معتمد ومرحل مخزنياً
            </option>
            <option value="cancelled" class="bg-surface-section text-text-primary">ملغي</option>
          </select>
          <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
      </div>
    </div>

    <!-- الصف الثاني: 4 أعمدة (من تاريخ + إلى تاريخ + زر إعادة ضبط الفلاتر) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
      <!-- 5. من تاريخ -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">من تاريخ</label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs"
        >
          <input
            type="date"
            v-model="fromDate"
            class="block w-full h-full pr-4 pl-14 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
          />
          <span
            class="absolute left-3 text-text-muted pointer-events-none flex items-center gap-1.5 text-xs z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>
        </div>
      </div>

      <!-- 6. إلى تاريخ -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">إلى تاريخ</label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs"
        >
          <input
            type="date"
            v-model="toDate"
            class="block w-full h-full pr-4 pl-14 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
          />
          <span
            class="absolute left-3 text-text-muted pointer-events-none flex items-center gap-1.5 text-xs z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>
        </div>
      </div>

      <!-- 7. زر إعادة تعيين الفلاتر -->
      <div class="sm:col-span-2 lg:col-span-2 flex justify-end">
        <button
          type="button"
          @click="resetFilters"
          class="w-full sm:w-auto min-w-[165px] h-11 px-4 bg-surface-card hover:bg-primary/10 text-text-secondary hover:text-primary text-xs font-bold rounded-lg border border-surface-border hover:border-primary/60 transition-all flex items-center justify-center gap-2 group shadow-xs cursor-pointer"
        >
          <svg
            class="w-4 h-4 text-text-muted group-hover:text-primary group-hover:rotate-180 transition-all duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>إعادة ضبط الفلاتر</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import WarehouseDropdown from '@/modules/inventory/forms/WarehouseDropdown.vue'

const search = defineModel('searchQuery', { type: String, default: '' })
const fromWarehouseFilter = defineModel('fromWarehouseFilter', {
  type: [String, Number],
  default: '',
})
const toWarehouseFilter = defineModel('toWarehouseFilter', { type: [String, Number], default: '' })
const statusFilter = defineModel('statusFilter', { type: String, default: '' })
const fromDate = defineModel('fromDateFilter', { type: String, default: '' })
const toDate = defineModel('toDateFilter', { type: String, default: '' })

const resetFilters = () => {
  search.value = ''
  fromWarehouseFilter.value = ''
  toWarehouseFilter.value = ''
  statusFilter.value = ''
  fromDate.value = ''
  toDate.value = ''
}
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}

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
