<!-- src/modules/hr/views/pay-periods/components/PayPeriodsFilter.vue -->
<template>
  <div
    class="p-4 sm:p-5 bg-surface-header rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm text-right font-sans transition-colors duration-200 mb-4"
    dir="rtl"
  >
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <!-- 1. البحث السريع -->
      <div class="md:col-span-6 flex flex-col space-y-1">
        <label for="payperiod-search" class="text-[11px] font-bold text-text-secondary pr-1">
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
            id="payperiod-search"
            type="text"
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            placeholder="ابحث باسم الفترة (مثلاً: أبريل)..."
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

      <!-- 2. مجموعة الدفع -->
      <div class="md:col-span-3 flex flex-col space-y-1">
        <label for="payperiod-group-filter" class="text-[11px] font-bold text-text-secondary pr-1">
          مجموعة الدفع
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-10 pl-1 flex items-center">
            <AppDropdown
              id="payperiod-group-filter"
              :model-value="payGroupFilter"
              :options="payGroupOptions"
              option-label="name"
              option-value="id"
              placeholder="كل المجموعات..."
              @update:model-value="$emit('update:payGroupFilter', $event)"
              class="w-full bg-transparent filter-embedded-dropdown"
            />
          </div>
        </div>
      </div>

      <!-- 3. حالة الفترة -->
      <div class="md:col-span-3 flex flex-col space-y-1">
        <label for="payperiod-status-filter" class="text-[11px] font-bold text-text-secondary pr-1">
          حالة الفترة
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>

          <select
            id="payperiod-status-filter"
            :value="statusFilter"
            @change="$emit('update:statusFilter', $event.target.value)"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
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
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePayGroupStore } from '@/modules/hr/stores/payGroupStore'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  searchQuery: { type: String, default: '' },
  payGroupFilter: { type: [String, Number], default: '' },
  statusFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:payGroupFilter', 'update:statusFilter'])

const payGroupStore = usePayGroupStore()

onMounted(() => {
  if (payGroupStore.groups.length === 0) {
    payGroupStore.fetchPayGroups({ is_active: 1 })
  }
})

const payGroupOptions = computed(() => {
  return [{ id: '', name: 'كل المجموعات' }, ...payGroupStore.groups]
})

const statusOptions = [
  { id: '', name: 'كل الحالات' },
  { id: 'open', name: 'مفتوحة (للصرف)' },
  { id: 'processing', name: 'قيد المعالجة' },
  { id: 'closed', name: 'مغلقة (مرحّلة)' },
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
