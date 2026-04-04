<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="fiscalYears"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-name="{ item }">
        <span class="font-bold text-text-primary text-base">
          {{ item.name }}
        </span>
      </template>

      <template #cell-duration="{ item }">
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-2 text-xs">
            <span
              class="w-8 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded text-center"
              >من</span
            >
            <span class="font-mono text-text-primary">{{ item.start_date }}</span>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span
              class="w-8 text-rose-700 font-semibold bg-rose-50 border border-rose-100 px-1 py-0.5 rounded text-center"
              >إلى</span
            >
            <span class="font-mono text-text-primary">{{ item.end_date }}</span>
          </div>
        </div>
      </template>

      <template #cell-status="{ item }">
        <span
          :class="[
            'px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1.5',
            item.status === 'open'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : item.status === 'closed'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-blue-50 text-blue-700 border-blue-200',
          ]"
        >
          <span
            :class="[
              'w-1.5 h-1.5 rounded-full',
              item.status === 'open'
                ? 'bg-emerald-500'
                : item.status === 'closed'
                  ? 'bg-rose-500'
                  : 'bg-blue-500',
            ]"
          ></span>
          {{ item.status_label || item.status }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('fiscal_year.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل"
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
            v-if="authStore.can('fiscal_year.delete')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف"
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
  fiscalYears: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['page-change', 'edit', 'delete', 'row-clicked'])

const authStore = useAuthStore()

const tableHeaders = computed(() => {
  const headers = [
    { key: 'name', label: 'اسم السنة المالية', class: 'min-w-[180px]' },
    { key: 'duration', label: 'الفترة الزمنية', class: 'min-w-[150px]' },
    { key: 'status', label: 'الحالة', class: 'min-w-[120px]' },
  ]

  if (authStore.can('fiscal_year.update') || authStore.can('fiscal_year.delete')) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' })
  }
  return headers
})
</script>
