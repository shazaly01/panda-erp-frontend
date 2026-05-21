<!--src\modules\core\views\documents\DocumentsList.vue--->
<template>
  <div>
    <div v-if="loading" class="text-center p-4 text-text-muted">جاري تحميل مستندات الأرشيف...</div>
    <div v-else-if="error" class="text-center p-4 text-rose-500 font-semibold">{{ error }}</div>

    <AppTable
      v-else-if="documents.length > 0"
      :headers="tableHeaders"
      :items="documents"
      :is-loading="loading"
    >
      <template #cell-type_label="{ item }">
        <span
          class="px-2 py-1 text-xs font-medium rounded-full bg-surface-secondary text-text-main"
        >
          {{ item.type_label || 'مستند عام' }}
        </span>
      </template>

      <template #cell-file_size="{ item }">
        <span class="text-sm text-text-muted font-mono">{{ item.file_size }}</span>
        <span
          class="text-xs text-text-muted uppercase bg-surface-border px-1 rounded ml-1 font-sans"
        >
          {{ item.extension }}
        </span>
      </template>

      <template #cell-created_at="{ item }">
        <span class="text-sm text-text-muted">{{ formatDate(item.created_at) }}</span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2 space-x-reverse justify-end">
          <button
            type="button"
            @click="$emit('preview', item)"
            class="p-1 text-sky-500 hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded transition-all"
            title="معاينة المستند"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>

          <button
            type="button"
            @click="documentStore.downloadDocument(item.id)"
            class="p-1 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded transition-all"
            title="تحميل الملف للجهاز"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>

          <button
            type="button"
            @click="$emit('delete', item)"
            class="p-1 text-rose-500 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-all"
            title="حذف المستند"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </template>
    </AppTable>

    <div
      v-else
      class="text-center text-text-muted py-8 border-2 border-dashed border-surface-border rounded-md"
    >
      <p class="text-sm">لا توجد وثائق مؤرشفة لهذا السجل حالياً.</p>
    </div>
  </div>
</template>

<script setup>
import AppTable from '@/components/ui/AppTable.vue'
import { formatDate } from '@/utils/formatters'
useDocumentStore
import { useDocumentStore } from '@/stores/documentStore' // استدعاء الاستور مباشرة لتسريع عمليات التحميل

const documentStore = useDocumentStore()

defineProps({
  documents: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
})

// بث الأحداث للمكون الأب لمعالجة المنبثقات الأخرى أو التأكيدات
defineEmits(['delete', 'preview'])

// الهيدرز بمواصفات DMS عالمية ومفهرسة
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'اسم المستند' },
  { key: 'type_label', label: 'نوع المستند' },
  { key: 'file_size', label: 'الحجم التقني' },
  { key: 'created_at', label: 'تاريخ الأرشفة' },
  { key: 'actions', label: 'الإجراءات', class: 'text-left' },
]
</script>
