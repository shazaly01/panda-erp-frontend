<!--src/modules/sales/views/customers/components/CustomersTable.vue-->
<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="customers" :is-loading="loading">
      <!-- عمود بيانات العميل والكود -->
      <template #cell-customer_info="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-sm text-text-primary">
              {{ item.name }}
            </span>
            <span
              v-if="item.partner_code"
              class="text-xs font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded tracking-wider"
            >
              {{ item.partner_code }}
            </span>
          </div>
          <span v-if="item.commercial_name" class="text-xs text-text-muted">
            {{ item.commercial_name }}
          </span>
        </div>
      </template>

      <!-- نوع الكيان -->
      <template #cell-type="{ item }">
        <span
          class="px-2 py-0.5 text-xs font-medium rounded-md"
          :class="
            item.type === 'company'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200'
              : 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200'
          "
        >
          {{ item.type === 'company' ? 'شركة' : 'فرد' }}
        </span>
      </template>

      <!-- بيانات الاتصال والعنوان -->
      <template #cell-contact="{ item }">
        <div class="flex flex-col text-xs text-text-muted gap-0.5 max-w-xs">
          <span v-if="item.phone" class="font-mono text-text-secondary" dir="ltr">
            {{ item.phone }}
          </span>
          <span v-if="item.email" class="font-mono text-text-muted truncate" :title="item.email">
            {{ item.email }}
          </span>
          <span v-if="item.address" class="truncate" :title="item.address">
            {{ item.address }}
          </span>
          <span v-if="!item.phone && !item.email && !item.address">---</span>
        </div>
      </template>

      <!-- البيانات المالية والائتمانية -->
      <template #cell-financial="{ item }">
        <div class="flex flex-col text-xs gap-0.5">
          <div class="flex items-center gap-1">
            <span class="text-text-muted">الحد:</span>
            <span class="font-mono font-semibold text-text-primary">
              {{ Number(item.credit_limit || 0).toLocaleString() }}
            </span>
            <span class="text-[10px] text-text-muted">{{ item.currency?.symbol || '' }}</span>
          </div>
          <div v-if="item.credit_period_days" class="text-[11px] text-text-muted">
            فترة التحصيل: {{ item.credit_period_days }} يوم
          </div>
        </div>
      </template>

      <!-- الحالة -->
      <template #cell-status="{ item }">
        <span
          class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1.5"
          :class="getStatusBadgeClasses(item.status)"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClasses(item.status)"></span>
          {{ getStatusLabel(item.status) }}
        </span>
      </template>

      <!-- الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('core.partners.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
            title="تعديل بيانات العميل"
            type="button"
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
            v-if="authStore.can('core.partners.delete')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
            title="حذف العميل"
            type="button"
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
  customers: { type: Array, required: true },
  pagination: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'customer_info', label: 'العميل والاسم التجاري', class: 'min-w-[200px]' },
  { key: 'type', label: 'النوع', class: 'min-w-[100px]' },
  { key: 'contact', label: 'الاتصال والعنوان', class: 'min-w-[200px]' },
  { key: 'financial', label: 'الائتمان والتحصيل', class: 'min-w-[150px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[110px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])

const getStatusLabel = (status) => {
  switch (status) {
    case 'active':
      return 'نشط'
    case 'inactive':
      return 'غير نشط'
    case 'blocked':
      return 'محظور'
    default:
      return status || '---'
  }
}

const getStatusBadgeClasses = (status) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
    case 'inactive':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
    case 'blocked':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const getStatusDotClasses = (status) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-500'
    case 'inactive':
      return 'bg-amber-500'
    case 'blocked':
      return 'bg-rose-500'
    default:
      return 'bg-gray-400'
  }
}
</script>
