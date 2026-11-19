<!-- src/modules/hr/views/employees/components/EmployeesFilter.vue -->
<template>
  <div
    class="p-4 sm:p-5 bg-surface-header rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm text-right font-sans transition-colors duration-200 mb-4"
    dir="rtl"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      <!-- 1. البحث السريع -->
      <div class="flex flex-col space-y-1">
        <label for="emp-search-query" class="text-[11px] font-bold text-text-secondary pr-1">
          البحث السريع
        </label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs"
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
            id="emp-search-query"
            type="text"
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            placeholder="الاسم، الكود، الهاتف..."
            class="block w-full h-full pr-9 pl-8 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-semibold"
          />

          <button
            v-if="searchQuery"
            type="button"
            @click="$emit('update:searchQuery', '')"
            class="absolute left-2 p-1 text-text-muted hover:text-danger rounded-md transition-colors cursor-pointer"
            title="مسح البحث"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <!-- 2. الإدارة / القسم -->
      <div class="flex flex-col space-y-1">
        <label for="emp-dept-filter" class="text-[11px] font-bold text-text-secondary pr-1">
          الإدارة / القسم
        </label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs overflow-hidden"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-9 pl-1 flex items-center">
            <AppDropdown
              id="emp-dept-filter"
              :model-value="departmentId"
              :options="[{ id: '', dropdownName: 'كل الإدارات والأقسام' }, ...departments]"
              option-label="dropdownName"
              option-value="id"
              placeholder="كل الإدارات..."
              @update:model-value="$emit('update:departmentId', $event)"
              class="w-full bg-transparent filter-embedded-dropdown"
            />
          </div>
        </div>
      </div>

      <!-- 3. المسمى الوظيفي -->
      <div class="flex flex-col space-y-1">
        <label for="emp-pos-filter" class="text-[11px] font-bold text-text-secondary pr-1">
          المسمى الوظيفي
        </label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs overflow-hidden"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-9 pl-1 flex items-center">
            <AppDropdown
              id="emp-pos-filter"
              :model-value="positionId"
              :options="[{ id: '', name: 'كل المسميات الوظيفية' }, ...positions]"
              option-label="name"
              option-value="id"
              placeholder="كل المسميات..."
              @update:model-value="$emit('update:positionId', $event)"
              class="w-full bg-transparent filter-embedded-dropdown"
            />
          </div>
        </div>
      </div>

      <!-- 4. الحالة الوظيفية -->
      <div class="flex flex-col space-y-1">
        <label for="emp-status-filter" class="text-[11px] font-bold text-text-secondary pr-1">
          الحالة الوظيفية
        </label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>

          <select
            id="emp-status-filter"
            :value="status"
            @change="$emit('update:status', $event.target.value)"
            class="block w-full h-full pr-9 pl-7 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option
              v-for="opt in statusOptions"
              :key="opt.id"
              :value="opt.id"
              class="bg-surface-section text-text-primary"
            >
              {{ opt.name }}
            </option>
          </select>

          <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
      </div>

      <!-- 5. حالة العقد -->
      <div class="flex flex-col space-y-1">
        <label for="emp-contract-filter" class="text-[11px] font-bold text-text-secondary pr-1">
          حالة العقد
        </label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </span>

          <select
            id="emp-contract-filter"
            :value="contractFilter"
            @change="$emit('update:contractFilter', $event.target.value)"
            class="block w-full h-full pr-9 pl-7 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option
              v-for="opt in contractOptions"
              :key="opt.id"
              :value="opt.id"
              class="bg-surface-section text-text-primary"
            >
              {{ opt.name }}
            </option>
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
  departmentId: { type: [String, Number], default: '' },
  positionId: { type: [String, Number], default: '' },
  status: { type: String, default: '' },
  contractFilter: { type: String, default: '' },
  departments: { type: Array, default: () => [] },
  positions: { type: Array, default: () => [] },
})

defineEmits([
  'update:searchQuery',
  'update:departmentId',
  'update:positionId',
  'update:status',
  'update:contractFilter',
])

const statusOptions = [
  { id: '', name: 'كل الحالات' },
  { id: 'active', name: 'نشط (على رأس العمل)' },
  { id: 'probation', name: 'فترة تجربة' },
  { id: 'on_leave', name: 'في إجازة' },
  { id: 'resigned', name: 'مستقيل' },
  { id: 'terminated', name: 'منهى خدماته' },
]

const contractOptions = [
  { id: '', name: 'جميع حالات العقود' },
  { id: 'without_contract', name: 'بدون عقد عمل نهائياً' },
  { id: 'without_active_contract', name: 'بدون عقد نشط' },
]
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
