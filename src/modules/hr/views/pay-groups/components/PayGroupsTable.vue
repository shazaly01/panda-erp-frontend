<!-- src/modules/hr/views/pay-groups/components/PayGroupsTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="groups" :is-loading="loading">
      <!-- 1. اسم المجموعة -->
      <template #cell-name="{ item }">
        <div class="flex items-center gap-2.5 py-1 text-right" dir="rtl">
          <span class="font-bold text-xs sm:text-sm text-text-primary">
            {{ item.name }}
          </span>
          <AppBadge variant="primary" size="xs" class="font-mono"> #{{ item.id }} </AppBadge>
        </div>
      </template>

      <!-- 2. دورة الصرف -->
      <template #cell-frequency="{ item }">
        <div class="flex items-center justify-center" dir="rtl">
          <AppBadge variant="info" size="xs" pill>
            <span class="inline-flex items-center gap-1.5">
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
              <span>{{ getFrequencyLabel(item.frequency) }}</span>
            </span>
          </AppBadge>
        </div>
      </template>

      <!-- 3. الحالة -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge :variant="item.is_active ? 'success' : 'danger'" size="xs" pill>
            {{ item.is_active ? 'نشطة' : 'متوقفة' }}
          </AppBadge>
        </div>
      </template>

      <!-- 4. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            v-if="authStore.can('hr.pay_groups.manage')"
            type="button"
            @click="$emit('edit', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل المجموعة"
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
            v-if="authStore.can('hr.pay_groups.manage')"
            type="button"
            @click="$emit('delete', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف المجموعة"
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
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppBadge from '@/components/ui/AppBadge.vue'

defineProps({
  groups: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'name', label: 'اسم المجموعة', class: 'min-w-[200px]' },
  { key: 'frequency', label: 'دورة الصرف', class: 'min-w-[150px] text-center' },
  { key: 'status', label: 'الحالة', class: 'min-w-[120px] text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[110px]' },
])

const getFrequencyLabel = (freq) => {
  const labels = {
    monthly: 'شهري',
    bi_weekly: 'نصف شهري',
    weekly: 'أسبوعي',
    daily: 'يومي',
  }
  return labels[freq] || freq
}
</script>
