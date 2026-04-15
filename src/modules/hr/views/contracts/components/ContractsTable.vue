<!--src\modules\hr\views\contracts\components\ContractsTable.vue-->
<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="contracts" :is-loading="loading">
      <template #cell-employee="{ item }">
        <div class="flex items-center gap-3 py-1">
          <div class="flex flex-col">
            <span class="font-bold text-sm text-text-primary">
              {{ item.employee?.full_name || 'موظف غير محدد' }}
            </span>
            <span class="text-xs text-text-muted font-mono">
              #{{ item.employee?.employee_number || '---' }}
            </span>
          </div>
        </div>
      </template>

      <template #cell-salary_details="{ item }">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {{ formatCurrency(item.basic_salary) }}
            </span>
            <span
              class="px-1.5 py-0.5 text-[10px] rounded bg-surface-border text-text-secondary border border-surface-border"
            >
              {{ getFrequencyLabel(item.salary_frequency) }}
            </span>
          </div>
          <span class="text-xs text-text-muted italic">
            {{ item.salary_structure?.name || 'هيكل غير محدد' }}
          </span>
        </div>
      </template>

      <template #cell-duration="{ item }">
        <div class="flex flex-col gap-1 text-xs">
          <div class="flex items-center gap-1.5 text-text-secondary">
            <span class="text-text-muted w-8">من:</span>
            <span class="font-medium" dir="ltr">{{ item.start_date }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-text-secondary">
            <span class="text-text-muted w-8">إلى:</span>
            <span class="font-medium" dir="ltr">{{ item.end_date || 'مفتوح المدة' }}</span>
          </div>
        </div>
      </template>

      <template #cell-status_attachment="{ item }">
        <div class="flex items-center gap-3">
          <span
            class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center gap-1.5"
            :class="
              item.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            "
          >
            {{ item.is_active ? 'ساري' : 'منتهي' }}
          </span>

          <a
            v-if="item.attachment_url"
            :href="item.attachment_url"
            target="_blank"
            class="text-sky-500 hover:text-sky-600 transition-colors p-1 bg-sky-50 rounded hover:bg-sky-100"
            title="عرض المرفق"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </a>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('hr.contracts.manage')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل العقد"
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
            v-if="authStore.can('hr.contracts.manage')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف العقد"
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
  contracts: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

// العناوين
const tableHeaders = computed(() => [
  { key: 'employee', label: 'الموظف', class: 'min-w-[200px]' },
  { key: 'salary_details', label: 'الراتب والدورة', class: 'min-w-[220px]' }, // تم زيادة العرض قليلاً
  { key: 'duration', label: 'مدة العقد', class: 'min-w-[160px]' },
  { key: 'status_attachment', label: 'الحالة والمرفقات', class: 'min-w-[140px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])

/**
 * تحويل الـ Enum القادم من الباك أند إلى نص عربي مفهوم
 */
const getFrequencyLabel = (value) => {
  const frequencies = {
    monthly: 'شهري',
    bi_weekly: 'كل أسبوعين',
    weekly: 'أسبوعي',
    daily: 'يومي',
  }
  return frequencies[value] || value || 'شهري'
}

/**
 * تنسيق العملة
 */
const formatCurrency = (value) => {
  if (!value) return '0.00'
  return new Intl.NumberFormat('ar-SD', {
    style: 'currency',
    currency: 'SDG',
    minimumFractionDigits: 2,
  }).format(value)
}
</script>
