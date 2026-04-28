<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="mappings"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-mapping_info="{ item }">
        <div class="flex flex-col gap-1.5 py-1">
          <span class="font-bold text-text-primary text-base leading-tight">
            {{ item.name }}
          </span>
          <div class="flex items-center gap-1 text-xs text-text-muted">
            <svg
              class="w-3.5 h-3.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            <span class="font-mono">{{ item.key }}</span>
          </div>
        </div>
      </template>

      <template #cell-linked_account="{ item }">
        <div v-if="item.account_id" class="flex items-center gap-2">
          <span
            class="text-[11px] font-mono font-bold bg-gray-100 text-gray-800 border border-gray-200 px-2 py-0.5 rounded text-center tracking-wider"
          >
            {{ item.account_code }}
          </span>
          <span class="text-sm font-medium text-text-primary">
            {{ item.account_name }}
          </span>
        </div>
        <div v-else>
          <span
            class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1 bg-rose-50 text-rose-700 border-rose-200"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            غير مربوط
          </span>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('account_mapping.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل الربط"
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
  mappings: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['edit', 'row-clicked'])

const authStore = useAuthStore()

const tableHeaders = computed(() => {
  const headers = [
    { key: 'mapping_info', label: 'المفتاح النظامي', class: 'min-w-[250px]' },
    { key: 'linked_account', label: 'الحساب المحاسبي المرتبط', class: 'min-w-[250px]' },
  ]

  if (authStore.can('account_mapping.update')) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left min-w-[80px]' })
  }
  return headers
})
</script>
