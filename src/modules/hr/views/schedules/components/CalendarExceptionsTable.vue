<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="exceptions" :is-loading="loading">
      <!-- اسم الحالة ونوعها -->
      <template #cell-name_info="{ item }">
        <div class="flex flex-col py-1">
          <span class="font-bold text-sm text-text-primary">{{ item.name }}</span>
          <span
            class="mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full border w-fit"
            :class="{
              'bg-emerald-50 text-emerald-700 border-emerald-200': item.type === 'holiday',
              'bg-rose-50 text-rose-700 border-rose-200': item.type === 'emergency',
              'bg-gray-50 text-gray-700 border-gray-200': item.type === 'other',
            }"
          >
            {{ getTypeLabel(item.type) }}
          </span>
        </div>
      </template>

      <!-- التواريخ (البداية والنهاية) -->
      <template #cell-dates="{ item }">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1.5 text-xs text-text-primary font-medium">
            <span class="text-emerald-600 font-bold">من:</span>
            <span class="font-mono">{{
              new Date(item.start_date).toLocaleDateString('ar-EG')
            }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-text-primary font-medium">
            <span class="text-rose-600 font-bold">إلى:</span>
            <span v-if="item.end_date" class="font-mono">{{
              new Date(item.end_date).toLocaleDateString('ar-EG')
            }}</span>
            <span v-else class="text-text-muted italic text-[11px]">مستمرة (غير محدد)</span>
          </div>
        </div>
      </template>

      <!-- سياسة العمل الإضافي -->
      <template #cell-overtime_policy="{ item }">
        <div class="flex items-center gap-2">
          <span
            v-if="item.treat_as_overtime_if_worked"
            class="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            يُحسب كإضافي
          </span>
          <span
            v-else
            class="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200"
          >
            يوم طبيعي / تعويض
          </span>
        </div>
      </template>

      <!-- الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('hr.calendar_exceptions.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل الحالة"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('hr.calendar_exceptions.delete')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف الحالة"
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
  exceptions: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'name_info', label: 'الحالة', class: 'min-w-[200px]' },
  { key: 'dates', label: 'الفترة', class: 'min-w-[180px]' },
  { key: 'overtime_policy', label: 'سياسة الحضور', class: 'min-w-[160px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])

const getTypeLabel = (type) => {
  const types = {
    holiday: 'عطلة رسمية',
    emergency: 'طوارئ عامة',
    other: 'أخرى',
  }
  return types[type] || 'غير محدد'
}
</script>
