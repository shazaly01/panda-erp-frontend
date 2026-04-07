<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="structures" :is-loading="loading">
      <template #cell-structure_info="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <span class="font-bold text-sm text-text-primary">
            {{ item.name }}
          </span>
          <span class="text-xs text-text-muted max-w-xs truncate" :title="item.description">
            {{ item.description || 'لا يوجد وصف' }}
          </span>
        </div>
      </template>

      <template #cell-rules_count="{ item }">
        <div class="flex items-center gap-1.5">
          <span
            class="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
          >
            {{ item.rules_count || (item.rules ? item.rules.length : 0) }} قاعدة
          </span>
        </div>
      </template>

      <template #cell-employees_count="{ item }">
        <div class="flex items-center gap-1.5">
          <span
            class="px-2 py-0.5 text-xs font-bold rounded-full"
            :class="
              item.employees_count > 0
                ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400'
                : 'bg-surface-border text-text-muted'
            "
          >
            {{ item.employees_count || 0 }} موظف
          </span>
        </div>
      </template>

      <template #cell-status="{ item }">
        <span
          class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1.5"
          :class="
            item.is_active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          "
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="item.is_active ? 'bg-emerald-500' : 'bg-rose-500'"
          ></span>
          {{ item.is_active ? 'نشط' : 'موقوف' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('salary_structure.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل الهيكل"
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
            v-if="authStore.can('salary_structure.delete')"
            @click.stop="$emit('delete', item)"
            :class="[
              'p-1.5 rounded-lg transition-colors',
              item.employees_count > 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-rose-500 hover:text-rose-600 hover:bg-rose-50',
            ]"
            :title="item.employees_count > 0 ? 'لا يمكن الحذف لارتباطه بعقود موظفين' : 'حذف'"
            :disabled="item.employees_count > 0"
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
  structures: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'structure_info', label: 'هيكل الراتب', class: 'min-w-[250px]' },
  { key: 'rules_count', label: 'القواعد', class: 'min-w-[120px]' },
  { key: 'employees_count', label: 'موظفون مرتبطون', class: 'min-w-[150px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[100px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])
</script>
