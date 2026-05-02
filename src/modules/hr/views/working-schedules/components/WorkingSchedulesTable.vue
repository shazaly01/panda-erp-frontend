<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="schedules" :is-loading="loading">
      <!-- اسم القالب -->
      <template #cell-name="{ item }">
        <span class="font-bold text-sm text-text-primary">{{ item.name }}</span>
      </template>

      <!-- نوع القالب -->
      <template #cell-type="{ item }">
        <span
          class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit"
          :class="
            item.type === 'fixed'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-purple-50 text-purple-700 border-purple-200'
          "
        >
          {{ item.type === 'fixed' ? 'ثابت' : 'مرن/متغير' }}
        </span>
      </template>

      <!-- طول الدورة (دورة العمل) -->
      <template #cell-cycle_days="{ item }">
        <div class="flex items-center gap-1.5 font-medium text-text-primary">
          <svg
            class="w-4 h-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{{ item.cycle_days }} يوم</span>
        </div>
      </template>

      <!-- تاريخ الإنشاء -->
      <template #cell-created_at="{ item }">
        <span class="text-xs text-text-muted">
          {{ new Date(item.created_at).toLocaleDateString('ar-EG') }}
        </span>
      </template>

      <!-- الإجراءات (Actions) -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('hr.working_schedules.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل قالب الجدولة"
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
            v-if="authStore.can('hr.working_schedules.delete')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف القالب"
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

    <!-- الترقيم (Pagination) -->
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
  schedules: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

// تعريف رؤوس الجدول بناءً على هيكلة AppTable
const tableHeaders = computed(() => [
  { key: 'name', label: 'اسم القالب', class: 'min-w-[200px]' },
  { key: 'type', label: 'النوع', class: 'min-w-[120px]' },
  { key: 'cycle_days', label: 'دورة العمل', class: 'min-w-[150px]' },
  { key: 'created_at', label: 'تاريخ الإنشاء', class: 'min-w-[150px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])
</script>
