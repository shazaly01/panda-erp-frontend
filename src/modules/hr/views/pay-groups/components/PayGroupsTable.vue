<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="groups" :is-loading="loading">
      <template #cell-name="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <span class="font-bold text-sm text-text-primary">
            {{ item.name }}
          </span>
          <span class="text-[10px] text-text-muted font-mono"> ID: #{{ item.id }} </span>
        </div>
      </template>

      <template #cell-frequency="{ item }">
        <div class="flex items-center gap-2">
          <span class="p-1.5 bg-primary/5 text-primary rounded-lg">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <span class="text-sm font-medium text-text-primary">
            {{ getFrequencyLabel(item.frequency) }}
          </span>
        </div>
      </template>

      <template #cell-status="{ item }">
        <span
          class="px-2.5 py-0.5 text-[11px] font-bold rounded-full flex items-center gap-1.5 w-fit"
          :class="
            item.is_active
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-rose-50 text-rose-700 border border-rose-100'
          "
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="item.is_active ? 'bg-emerald-500' : 'bg-rose-500'"
          ></span>
          {{ item.is_active ? 'نشطة' : 'متوقفة' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('hr.pay_groups.manage')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="تعديل المجموعة"
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
            v-if="authStore.can('hr.pay_groups.manage')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف المجموعة"
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
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'

const props = defineProps({
  groups: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'name', label: 'اسم المجموعة', class: 'min-w-[200px]' },
  { key: 'frequency', label: 'دورة الصرف', class: 'min-w-[150px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[120px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
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
