<!-- src/modules/hr/views/leaves/components/LeavesFilter.vue -->
<template>
  <div
    class="p-4 sm:p-5 bg-surface-header rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm text-right font-sans transition-colors duration-200 mb-4"
    dir="rtl"
  >
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <!-- 1. البحث السريع -->
      <div class="md:col-span-6 flex flex-col space-y-1">
        <label for="leave-search" class="text-[11px] font-bold text-text-secondary pr-1">
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
            id="leave-search"
            type="text"
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            placeholder="ابحث باسم الموظف أو الرقم الوظيفي..."
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

      <!-- 2. نوع الإجازة -->
      <div class="md:col-span-3 flex flex-col space-y-1">
        <label for="leave-type-filter" class="text-[11px] font-bold text-text-secondary pr-1">
          نوع الإجازة
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
            id="leave-type-filter"
            :value="typeFilter"
            @change="
              $emit(
                'update:typeFilter',
                $event.target.value === '' ? '' : Number($event.target.value),
              )
            "
            class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option
              v-for="opt in leaveTypesOptions"
              :key="String(opt.id)"
              :value="opt.id"
              class="bg-surface-section text-text-primary"
            >
              {{ opt.name }}
            </option>
          </select>

          <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
      </div>

      <!-- 3. حالة الطلب -->
      <div class="md:col-span-3 flex flex-col space-y-1">
        <label for="leave-status-filter" class="text-[11px] font-bold text-text-secondary pr-1">
          حالة الطلب
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
            id="leave-status-filter"
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
defineProps({
  searchQuery: { type: String, default: '' },
  typeFilter: { type: [String, Number], default: '' },
  statusFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:typeFilter', 'update:statusFilter'])

const statusOptions = [
  { id: '', name: 'كل الحالات' },
  { id: 'pending', name: 'قيد الانتظار' },
  { id: 'approved', name: 'معتمدة' },
  { id: 'rejected', name: 'مرفوضة' },
]

const leaveTypesOptions = [
  { id: '', name: 'كل أنواع الإجازات' },
  { id: 1, name: 'إجازة سنوية' },
  { id: 2, name: 'إجازة مرضية' },
  { id: 3, name: 'إجازة طارئة' },
]
</script>
