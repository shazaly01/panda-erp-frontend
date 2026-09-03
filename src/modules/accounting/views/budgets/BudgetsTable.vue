<!--src/modules/accounting/views/budgets/BudgetsTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="budgets"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('view-report', $event)"
    >
      <!-- معلومات الموازنة والسنة المالية -->
      <template #cell-budget_info="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-sm text-text-primary">
              {{ item.name }}
            </span>
            <span
              v-if="item.period_type?.label"
              class="text-[10px] px-1.5 py-0.5 rounded bg-surface-border text-text-muted border border-surface-border font-medium"
            >
              {{ item.period_type.label }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs text-text-muted font-mono" dir="ltr">
            <span>{{ item.start_date }}</span>
            <span>&rarr;</span>
            <span>{{ item.end_date }}</span>
            <span
              v-if="item.fiscal_year?.name"
              class="px-1.5 bg-surface-border rounded-sm font-sans truncate max-w-[120px]"
            >
              سنة: {{ item.fiscal_year.name }}
            </span>
          </div>
        </div>
      </template>

      <!-- نمط الرقابة -->
      <template #cell-control_mode="{ item }">
        <span
          :class="[
            'px-2 py-0.5 text-[11px] font-bold rounded-md border inline-flex items-center gap-1.5',
            item.control_mode?.value === 'strict_stop'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : item.control_mode?.value === 'warning'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-50 text-slate-700 border-slate-200',
          ]"
        >
          <span
            :class="[
              'w-1.5 h-1.5 rounded-full',
              item.control_mode?.value === 'strict_stop'
                ? 'bg-rose-500'
                : item.control_mode?.value === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-slate-400',
            ]"
          ></span>
          {{ item.control_mode?.label || item.control_mode?.value }}
        </span>
      </template>

      <!-- إجمالي المعتمد المالي -->
      <template #cell-total_amount="{ item }">
        <div class="flex flex-col gap-0.5">
          <span class="font-mono font-bold text-sm text-primary">
            {{ formatNumber(item.total_amount) }}
          </span>
          <span class="text-[10px] text-text-muted">
            {{ item.lines_count || item.lines?.length || 0 }} بنود موازنة
          </span>
        </div>
      </template>

      <!-- حالة الموازنة -->
      <template #cell-status="{ item }">
        <span
          :class="[
            'px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1.5',
            item.status?.value === 'active'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : item.status?.value === 'approved'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : item.status?.value === 'closed'
                  ? 'bg-gray-100 text-gray-700 border-gray-300'
                  : 'bg-amber-50 text-amber-700 border-amber-200',
          ]"
        >
          <span
            :class="[
              'w-1.5 h-1.5 rounded-full',
              item.status?.value === 'active'
                ? 'bg-emerald-500 animate-pulse'
                : item.status?.value === 'approved'
                  ? 'bg-blue-500'
                  : item.status?.value === 'closed'
                    ? 'bg-gray-400'
                    : 'bg-amber-400',
            ]"
          ></span>
          {{ item.status?.label || item.status?.value }}
        </span>
      </template>

      <!-- الإجراءات والعمليات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <!-- تقرير الانحراف الفعلي -->
          <button
            v-if="authStore.can('report.budget_variance.view')"
            @click.stop="$emit('view-report', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="عرض تقرير الموازنة والانحراف"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </button>

          <!-- زر الاعتماد (للمسودات فقط) -->
          <button
            v-if="item.status?.value === 'draft' && authStore.can('budget.approve')"
            @click.stop="$emit('approve', item)"
            class="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="اعتماد الموازنة"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <!-- زر التفعيل (للمعتمدة فقط) -->
          <button
            v-if="item.status?.value === 'approved' && authStore.can('budget.activate')"
            @click.stop="$emit('activate', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تفعيل الموازنة وبدء الرقابة"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </button>

          <!-- زر التعديل (للمسودات فقط) -->
          <button
            v-if="item.status?.value === 'draft' && authStore.can('budget.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="تعديل الموازنة والبنود"
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

          <!-- زر الإغلاق (للمعتمدة أو النشطة) -->
          <button
            v-if="
              (item.status?.value === 'approved' || item.status?.value === 'active') &&
              authStore.can('budget.close')
            "
            @click.stop="$emit('close', item)"
            class="p-1.5 text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="إغلاق الموازنة نهائياً"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </button>

          <!-- زر الحذف (للمسودات فقط) -->
          <button
            v-if="item.status?.value === 'draft' && authStore.can('budget.delete')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف مسودة الموازنة"
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

defineProps({
  budgets: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'view-report', 'edit', 'approve', 'activate', 'close', 'delete'])

const authStore = useAuthStore()

const formatNumber = (num) => {
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const tableHeaders = computed(() => [
  { key: 'budget_info', label: 'الموازنة التقديرية', class: 'min-w-[200px]' },
  { key: 'control_mode', label: 'نمط الرقابة', class: 'min-w-[140px]' },
  { key: 'total_amount', label: 'المعتمد المالي', class: 'min-w-[150px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[120px]' },
  { key: 'actions', label: 'الإجراءات', class: 'text-left min-w-[160px]' },
])
</script>
