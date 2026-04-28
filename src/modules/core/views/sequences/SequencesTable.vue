<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="sequences"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-model_info="{ item }">
        <div class="flex flex-col gap-1.5 py-1">
          <span class="font-bold text-text-primary text-sm leading-tight break-all">
            {{ formatModelName(item.model) }}
          </span>
          <span
            v-if="item.branch_id"
            class="inline-flex items-center text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded w-fit mt-0.5"
          >
            فرع مخصص: {{ item.branch_id }}
          </span>
          <span
            v-else
            class="inline-flex items-center text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-0.5"
          >
            عام (لكل الفروع)
          </span>
        </div>
      </template>

      <template #cell-format="{ item }">
        <span
          class="text-sm font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-md text-center tracking-wider"
        >
          {{ item.format }}
        </span>
      </template>

      <template #cell-reset_frequency="{ item }">
        <span
          :class="[
            'px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1',
            item.reset_frequency === 'yearly'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : item.reset_frequency === 'monthly'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-100 text-gray-600 border-gray-200',
          ]"
        >
          <span
            :class="[
              'w-1.5 h-1.5 rounded-full',
              item.reset_frequency === 'yearly'
                ? 'bg-amber-500'
                : item.reset_frequency === 'monthly'
                  ? 'bg-emerald-500'
                  : 'bg-gray-400',
            ]"
          ></span>
          {{ translateFrequency(item.reset_frequency) }}
        </span>
      </template>

      <template #cell-next_value="{ item }">
        <span class="font-bold text-text-primary text-base">
          {{ item.next_value }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('update_sequences')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل الترقيم"
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
  sequences: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['edit', 'row-clicked'])

const authStore = useAuthStore()

const tableHeaders = computed(() => {
  const headers = [
    { key: 'model_info', label: 'المستند / النموذج', class: 'min-w-[250px]' },
    { key: 'format', label: 'صيغة الترقيم', class: 'min-w-[150px]' },
    { key: 'reset_frequency', label: 'تيرة التصفير', class: 'min-w-[120px]' },
    { key: 'next_value', label: 'الرقم القادم', class: 'text-center min-w-[100px]' },
  ]

  if (authStore.can('update_sequences')) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left min-w-[80px]' })
  }
  return headers
})

// دوال مساعدة للعرض
const formatModelName = (modelPath) => {
  if (!modelPath.includes('\\')) return modelPath // مثل RECEIPT و PAYMENT
  const parts = modelPath.split('\\')
  return parts[parts.length - 1] // استخراج اسم الكلاس فقط مثل JournalEntry
}

const translateFrequency = (frequency) => {
  const translations = {
    yearly: 'سنوياً',
    monthly: 'شهرياً',
    never: 'مستمر (لا يصفر)',
  }
  return translations[frequency] || frequency
}
</script>
