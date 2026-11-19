<!-- src/modules/hr/views/working-schedules/components/WorkingSchedulesTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="schedules" :is-loading="loading">
      <!-- 1. اسم القالب -->
      <template #cell-name="{ item }">
        <div class="flex items-center gap-2 py-1 text-right" dir="rtl">
          <span class="font-bold text-xs sm:text-sm text-text-primary">{{ item.name }}</span>
        </div>
      </template>

      <!-- 2. نوع القالب -->
      <template #cell-type="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge :variant="item.type === 'fixed' ? 'info' : 'warning'" size="xs" pill>
            {{ item.type === 'fixed' ? 'ثابت' : 'مرن / متغير' }}
          </AppBadge>
        </div>
      </template>

      <!-- 3. طول الدورة (دورة العمل) -->
      <template #cell-cycle_days="{ item }">
        <div class="flex items-center justify-center gap-1.5 text-xs" dir="rtl">
          <svg
            class="w-4 h-4 text-primary shrink-0"
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
          <span class="font-mono font-black text-text-primary">{{ item.cycle_days }}</span>
          <span class="text-text-secondary font-bold">يوم</span>
        </div>
      </template>

      <!-- 4. تاريخ الإنشاء -->
      <template #cell-created_at="{ item }">
        <div class="text-center" dir="rtl">
          <span class="text-xs font-mono font-semibold text-text-secondary">
            {{ item.created_at ? new Date(item.created_at).toLocaleDateString('ar-EG') : '---' }}
          </span>
        </div>
      </template>

      <!-- 5. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            v-if="authStore.can('hr.working_schedules.update')"
            type="button"
            @click="$emit('edit', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل قالب الجدولة"
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
            v-if="authStore.can('hr.working_schedules.delete')"
            type="button"
            @click="$emit('delete', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف القالب"
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
  schedules: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'name', label: 'اسم القالب', class: 'min-w-[200px]' },
  { key: 'type', label: 'النوع', class: 'min-w-[130px] text-center' },
  { key: 'cycle_days', label: 'دورة العمل', class: 'min-w-[140px] text-center' },
  { key: 'created_at', label: 'تاريخ الإنشاء', class: 'min-w-[140px] text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[110px]' },
])
</script>
