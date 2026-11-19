<!-- src/modules/hr/views/calendar-exceptions/components/CalendarExceptionsTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="exceptions" :is-loading="loading">
      <!-- 1. اسم الحالة ونوعها -->
      <template #cell-name_info="{ item }">
        <div class="flex flex-col items-start gap-1 py-1 text-right" dir="rtl">
          <span class="font-bold text-xs sm:text-sm text-text-primary">{{ item.name }}</span>
          <AppBadge :variant="getTypeVariant(item.type)" size="xs" pill>
            {{ getTypeLabel(item.type) }}
          </AppBadge>
        </div>
      </template>

      <!-- 2. التواريخ (البداية والنهاية) -->
      <template #cell-dates="{ item }">
        <div class="flex flex-col gap-1 text-xs text-right" dir="rtl">
          <div class="flex items-center gap-1.5">
            <span class="text-success font-bold text-[11px] w-7">من:</span>
            <span class="font-mono font-bold text-text-primary">
              {{ new Date(item.start_date).toLocaleDateString('ar-EG') }}
            </span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-danger font-bold text-[11px] w-7">إلى:</span>
            <span v-if="item.end_date" class="font-mono font-bold text-text-secondary">
              {{ new Date(item.end_date).toLocaleDateString('ar-EG') }}
            </span>
            <span v-else class="text-text-muted italic text-[11px]">مستمرة (غير محدد)</span>
          </div>
        </div>
      </template>

      <!-- 3. سياسة العمل الإضافي -->
      <template #cell-overtime_policy="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge v-if="item.treat_as_overtime_if_worked" variant="info" size="xs" pill>
            <span class="inline-flex items-center gap-1">
              <svg
                class="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>يُحسب كإضافي</span>
            </span>
          </AppBadge>

          <AppBadge v-else variant="secondary" size="xs" pill> يوم طبيعي / تعويض </AppBadge>
        </div>
      </template>

      <!-- 4. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            v-if="authStore.can('hr.calendar_exceptions.update')"
            type="button"
            @click="$emit('edit', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل الحالة"
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
            v-if="authStore.can('hr.calendar_exceptions.delete')"
            type="button"
            @click="$emit('delete', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف الحالة"
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
  exceptions: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'name_info', label: 'الحالة', class: 'min-w-[200px]' },
  { key: 'dates', label: 'الفترة', class: 'min-w-[180px]' },
  { key: 'overtime_policy', label: 'سياسة الحضور', class: 'min-w-[160px] text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[110px]' },
])

const getTypeLabel = (type) => {
  const types = {
    holiday: 'عطلة رسمية',
    emergency: 'طوارئ عامة',
    other: 'أخرى',
  }
  return types[type] || 'غير محدد'
}

const getTypeVariant = (type) => {
  const map = {
    holiday: 'success',
    emergency: 'danger',
    other: 'secondary',
  }
  return map[type] || 'secondary'
}
</script>
