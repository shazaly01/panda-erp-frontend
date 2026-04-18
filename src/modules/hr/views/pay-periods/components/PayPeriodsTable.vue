<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="periods" :is-loading="loading">
      <template #cell-name="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <span class="font-bold text-sm text-text-primary">
            {{ item.name }}
          </span>
          <span class="text-[10px] text-text-muted">
            تاريخ التوليد: {{ item.created_at?.split(' ')[0] || '---' }}
          </span>
        </div>
      </template>

      <template #cell-group="{ item }">
        <div class="flex flex-col">
          <span class="text-sm font-medium text-primary">
            {{ item.pay_group?.name || '---' }}
          </span>
          <span class="text-[10px] text-text-muted"> دورة الصرف المرتبطة </span>
        </div>
      </template>

      <template #cell-range="{ item }">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1.5 text-xs text-text-primary">
            <span class="text-text-muted w-4">من:</span>
            <span class="font-mono bg-surface-ground px-1.5 rounded border border-surface-border">
              {{ item.start_date }}
            </span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-text-primary">
            <span class="text-text-muted w-4">إلى:</span>
            <span class="font-mono bg-surface-ground px-1.5 rounded border border-surface-border">
              {{ item.end_date }}
            </span>
          </div>
        </div>
      </template>

      <template #cell-status="{ item }">
        <div class="flex flex-col gap-1 items-start">
          <span
            class="px-2.5 py-0.5 text-[11px] font-bold rounded-full flex items-center gap-1.5"
            :class="getStatusClass(item.status)"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(item.status)"></span>
            {{ getStatusLabel(item.status) }}
          </span>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('hr.pay_periods.manage') && item.status !== 'closed'"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="تعديل الفترة (لتفعيلها أو تأجيلها)"
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
            v-if="
              authStore.can('hr.pay_periods.manage') &&
              (item.status === 'open' || item.status === 'pending')
            "
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف الفترة"
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

          <span v-if="item.status === 'closed'" class="text-[10px] text-text-muted italic px-2">
            مؤرشفة
          </span>
        </div>
      </template>
    </AppTable>

    <AppPagination
      v-if="pagination"
      :meta="pagination"
      @page-change="$emit('page-change', $event)"
    />
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue' // تأكد من استيراده

const props = defineProps({
  periods: { type: Array, required: true },
  pagination: { type: Object, default: null }, // 🚀 أضفنا الـ prop الخاص بالترقيم
  loading: { type: Boolean, default: false },
})

// 🚀 أضفنا حدث تغيير الصفحة
defineEmits(['edit', 'delete', 'page-change'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'name', label: 'اسم الفترة', class: 'min-w-[180px]' },
  { key: 'group', label: 'مجموعة الدفع', class: 'min-w-[150px]' },
  { key: 'range', label: 'النطاق الزمني', class: 'min-w-[180px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[120px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])

// --- دوال مساعدة للحالة (تم تحديثها لتشمل pending) ---
const getStatusLabel = (status) => {
  const labels = {
    pending: 'مجدولة', // 🚀 الإضافة الجديدة
    open: 'مفتوحة للصرف',
    processing: 'قيد المعالجة',
    closed: 'مغلقة ومرحّلة',
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-sky-50 text-sky-700 border border-sky-100', // 🚀 الإضافة الجديدة (لون أزرق فاتح)
    open: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    processing: 'bg-amber-50 text-amber-700 border border-amber-100',
    closed: 'bg-slate-50 text-slate-700 border border-slate-100',
  }
  return classes[status] || 'bg-surface-ground text-text-secondary border border-surface-border'
}

const getStatusDotClass = (status) => {
  const classes = {
    pending: 'bg-sky-500', // 🚀 الإضافة الجديدة
    open: 'bg-emerald-500',
    processing: 'bg-amber-500',
    closed: 'bg-slate-500',
  }
  return classes[status] || 'bg-gray-400'
}
</script>
