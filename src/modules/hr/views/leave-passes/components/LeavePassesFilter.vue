<!-- src/modules/hr/views/leave-passes/components/LeavePassesFilter.vue -->
<template>
  <div
    class="p-4 sm:p-5 bg-surface-header rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm text-right font-sans transition-colors duration-200 mb-4"
    dir="rtl"
  >
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <!-- 1. البحث الذكي -->
      <div class="md:col-span-5 flex flex-col space-y-1">
        <label for="lp-search-query" class="text-[11px] font-bold text-text-secondary pr-1">
          البحث الذكي
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
            id="lp-search-query"
            type="text"
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            placeholder="ابحث باسم الموظف، الرقم الوظيفي، أو الهاتف..."
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

      <!-- 2. الحالة الحركية -->
      <div class="md:col-span-4 flex flex-col space-y-1">
        <label for="lp-status-filter" class="text-[11px] font-bold text-text-secondary pr-1">
          الحالة الحركية
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
            id="lp-status-filter"
            :value="statusFilter"
            @change="$emit('update:statusFilter', $event.target.value)"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="" class="bg-surface-section text-text-primary">
              كل الحالات الحركية
            </option>
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

      <!-- 3. تاريخ الإذن -->
      <div class="md:col-span-3 flex flex-col space-y-1">
        <label for="lp-date-filter" class="text-[11px] font-bold text-text-secondary pr-1">
          تاريخ الإذن
        </label>
        <div
          class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs"
        >
          <input
            id="lp-date-filter"
            type="date"
            :value="dateFilter"
            @input="$emit('update:dateFilter', $event.target.value)"
            class="block w-full h-full pr-3 pl-14 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
          />

          <button
            v-if="dateFilter"
            type="button"
            @click="$emit('update:dateFilter', '')"
            class="absolute left-8 p-1 text-text-muted hover:text-danger rounded-md transition-colors cursor-pointer z-10"
            title="مسح التاريخ"
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

          <span class="absolute left-3 text-text-muted pointer-events-none flex items-center z-10">
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
    </div>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: { type: String, default: '' },
  statusFilter: { type: [String, Number], default: '' },
  dateFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:statusFilter', 'update:dateFilter'])

const statusOptions = [
  { id: 'approved', name: 'معتمد للعبور (لم يخرج)' },
  { id: 'out', name: 'خارج المنشأة حالياً' },
  { id: 'returned', name: 'عاد للمنشأة (مغلق)' },
  { id: 'rejected', name: 'أذونات مرفوضة إدارياً' },
]
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}
</style>
