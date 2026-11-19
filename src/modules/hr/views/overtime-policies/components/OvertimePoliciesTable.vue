<!-- src/modules/hr/views/overtime-policies/components/OvertimePoliciesTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="policies" :is-loading="loading">
      <!-- 1. اسم السياسة -->
      <template #cell-name="{ item }">
        <div class="flex items-center gap-2 py-1 text-right" dir="rtl">
          <span class="font-bold text-xs sm:text-sm text-text-primary">
            {{ item.name }}
          </span>
        </div>
      </template>

      <!-- 2. معايير الدوام -->
      <template #cell-base_specs="{ item }">
        <div class="flex flex-col gap-1 text-xs text-right" dir="rtl">
          <div class="flex items-center gap-1.5 text-text-secondary">
            <span class="text-text-muted w-16">أيام/شهر:</span>
            <span class="font-bold font-mono text-text-primary">{{
              item.working_days_per_month
            }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-text-secondary">
            <span class="text-text-muted w-16">ساعات/يوم:</span>
            <span class="font-bold font-mono text-text-primary">{{
              item.working_hours_per_day
            }}</span>
          </div>
        </div>
      </template>

      <!-- 3. مضاعفات الإضافي -->
      <template #cell-rates="{ item }">
        <div class="flex flex-wrap gap-1.5 py-1 text-right" dir="rtl">
          <AppBadge variant="success" size="xs" class="font-mono">
            عادي: {{ item.regular_rate }}x
          </AppBadge>
          <AppBadge variant="warning" size="xs" class="font-mono">
            ويكند: {{ item.weekend_rate }}x
          </AppBadge>
          <AppBadge variant="danger" size="xs" class="font-mono">
            عطلة: {{ item.holiday_rate }}x
          </AppBadge>
        </div>
      </template>

      <!-- 4. حساب الساعة والضريبة -->
      <template #cell-wage_tax="{ item }">
        <div class="flex flex-col gap-1 text-xs text-right" dir="rtl">
          <div class="flex items-center gap-1.5 text-text-secondary flex-wrap">
            <span class="text-text-muted w-20">نسبة الراتب:</span>
            <span
              class="font-bold font-mono"
              :class="Number(item.wage_factor || 1) !== 1.0 ? 'text-warning' : 'text-text-primary'"
            >
              {{ Math.round(Number(item.wage_factor || 1.0) * 100) }}%
            </span>
            <span v-if="item.fixed_monthly_hours" class="text-[10px] text-text-muted font-mono">
              ({{ item.fixed_monthly_hours }} س/شهر)
            </span>
          </div>

          <div class="flex items-center gap-1.5 text-text-secondary">
            <span class="text-text-muted w-20">ضريبة الإضافي:</span>
            <AppBadge
              :variant="Number(item.tax_rate) > 0 ? 'danger' : 'secondary'"
              size="xs"
              class="font-mono"
            >
              {{ Number(item.tax_rate) > 0 ? `${item.tax_rate}%` : 'بدون ضريبة' }}
            </AppBadge>
          </div>
        </div>
      </template>

      <!-- 5. طريقة الحساب -->
      <template #cell-calc_type="{ item }">
        <div class="flex flex-col items-center justify-center gap-1" dir="rtl">
          <AppBadge :variant="item.is_daily_basis ? 'info' : 'primary'" size="xs" pill>
            {{ item.is_daily_basis ? 'بنظام الأيام' : 'بنظام الساعات' }}
          </AppBadge>
          <span v-if="item.is_daily_basis" class="text-[10px] text-text-muted text-center">
            يُحسب اليوم بعد
            <strong class="font-mono">{{ item.hours_to_day_threshold }}</strong> ساعات
          </span>
        </div>
      </template>

      <!-- 6. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            v-if="authStore.can('hr.overtime_policies.manage')"
            type="button"
            @click="$emit('edit', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل السياسة"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            type="button"
            @click="$emit('delete', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف السياسة"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

    <AppPagination :meta="pagination || {}" @page-change="$emit('page-change', $event)" />
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppBadge from '@/components/ui/AppBadge.vue'

defineProps({
  policies: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'name', label: 'اسم السياسة', class: 'min-w-[170px]' },
  { key: 'base_specs', label: 'معايير الدوام', class: 'min-w-[140px]' },
  { key: 'rates', label: 'مضاعفات الإضافي', class: 'min-w-[200px]' },
  { key: 'wage_tax', label: 'حساب الساعة والضريبة', class: 'min-w-[190px]' },
  { key: 'calc_type', label: 'طريقة الحساب', class: 'min-w-[150px] text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[110px]' },
])
</script>
