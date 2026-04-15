<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="policies" :is-loading="loading">
      <template #cell-name="{ item }">
        <div class="flex items-center gap-3 py-1">
          <span class="font-bold text-sm text-text-primary">
            {{ item.name }}
          </span>
        </div>
      </template>

      <template #cell-base_specs="{ item }">
        <div class="flex flex-col gap-1 text-xs">
          <div class="flex items-center gap-1.5 text-text-secondary">
            <span class="text-text-muted w-16">أيام/شهر:</span>
            <span class="font-bold font-mono">{{ item.working_days_per_month }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-text-secondary">
            <span class="text-text-muted w-16">ساعات/يوم:</span>
            <span class="font-bold font-mono">{{ item.working_hours_per_day }}</span>
          </div>
        </div>
      </template>

      <template #cell-rates="{ item }">
        <div class="flex flex-wrap gap-2 py-1">
          <span
            class="px-1.5 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
          >
            عادي: {{ item.regular_rate }}x
          </span>
          <span
            class="px-1.5 py-0.5 text-[10px] rounded bg-amber-50 text-amber-700 border border-amber-200"
          >
            ويكند: {{ item.weekend_rate }}x
          </span>
          <span
            class="px-1.5 py-0.5 text-[10px] rounded bg-rose-50 text-rose-700 border border-rose-200"
          >
            عطلة: {{ item.holiday_rate }}x
          </span>
        </div>
      </template>

      <template #cell-calc_type="{ item }">
        <div class="flex flex-col items-start gap-1">
          <span
            class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center gap-1.5"
            :class="
              item.is_daily_basis
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            "
          >
            {{ item.is_daily_basis ? 'بنظام الأيام' : 'بنظام الساعات' }}
          </span>
          <span v-if="item.is_daily_basis" class="text-[10px] text-text-muted italic">
            يُحسب اليوم بعد {{ item.hours_to_day_threshold }} ساعات
          </span>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('hr.overtime_policies.manage')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل السياسة"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('hr.overtime_policies.manage')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف السياسة"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </template>
    </AppTable>

    <AppPagination :meta="pagination" @page-change="$emit('page-change', $event)" />
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const props = defineProps({
  policies: { type: Array, required: true }, // استبدلنا contracts بـ policies
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

// العناوين المتوافقة مع هيكل OvertimePolicy
const tableHeaders = computed(() => [
  { key: 'name', label: 'اسم السياسة', class: 'min-w-[180px]' },
  { key: 'base_specs', label: 'معايير العمل', class: 'min-w-[140px]' },
  { key: 'rates', label: 'المضاعفات (Rates)', class: 'min-w-[200px]' },
  { key: 'calc_type', label: 'طريقة الحساب', class: 'min-w-[150px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])
</script>
