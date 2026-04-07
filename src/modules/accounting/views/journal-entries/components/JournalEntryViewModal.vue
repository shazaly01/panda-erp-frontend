<!---->
<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      @click.self="close"
    >
      <Transition
        appear
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          class="bg-surface-section rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div class="flex justify-between items-center p-5 border-b border-surface-border">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-bold text-text-primary">تفاصيل القيد المحاسبي</h3>
              <span
                v-if="entry"
                :class="[
                  'px-2 py-0.5 text-[10px] font-bold rounded-full border',
                  entry.status === 'posted'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-600 border-amber-200',
                ]"
              >
                {{ entry.status === 'posted' ? 'مُرحل' : 'مسودة' }}
              </span>
            </div>
            <button
              @click="close"
              class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-border transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="p-5 overflow-y-auto flex-1">
            <div v-if="loading" class="flex justify-center items-center py-10">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>

            <div v-else-if="entry" class="space-y-6">
              <div
                class="grid grid-cols-2 md:grid-cols-5 gap-4 bg-surface-bg p-4 rounded-lg border border-surface-border"
              >
                <div>
                  <span class="block text-[10px] text-text-muted uppercase mb-1">رقم القيد</span>
                  <span class="font-mono font-bold">{{ entry.entry_number || '-' }}</span>
                </div>
                <div>
                  <span class="block text-[10px] text-text-muted uppercase mb-1">التاريخ</span>
                  <span class="font-medium" dir="ltr">{{ entry.date }}</span>
                </div>
                <div>
                  <span class="block text-[10px] text-text-muted uppercase mb-1">المصدر</span>
                  <span class="font-medium">{{ entry.source_label || entry.source }}</span>
                </div>
                <div>
                  <span class="block text-[10px] text-text-muted uppercase mb-1"
                    >الفرع / التاق</span
                  >
                  <span class="font-medium text-primary">{{
                    entry.cost_center?.name || entry.cost_center_name || 'قيد عام'
                  }}</span>
                </div>
                <div>
                  <span class="block text-[10px] text-text-muted uppercase mb-1">بواسطة</span>
                  <span class="font-medium">{{ entry.created_by?.name || '-' }}</span>
                </div>
                <div class="col-span-2 md:col-span-5 mt-2 pt-2 border-t border-surface-border">
                  <span class="block text-[10px] text-text-muted uppercase mb-1">البيان</span>
                  <span class="font-medium text-sm">{{ entry.description }}</span>
                </div>
              </div>

              <div class="border border-surface-border rounded-lg overflow-hidden">
                <table class="w-full text-sm text-left rtl:text-right text-text-primary">
                  <thead class="bg-surface-border/50 text-xs text-text-muted uppercase">
                    <tr>
                      <th class="px-4 py-3 font-semibold">الحساب</th>
                      <th class="px-4 py-3 font-semibold">مركز التكلفة (التاق)</th>
                      <th class="px-4 py-3 font-semibold">البيان الفرعي</th>
                      <th class="px-4 py-3 font-semibold text-center">مدين</th>
                      <th class="px-4 py-3 font-semibold text-center">دائن</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-surface-border bg-surface-bg">
                    <tr
                      v-for="line in entry.details"
                      :key="line.id"
                      class="hover:bg-surface-section/50"
                    >
                      <td class="px-4 py-3">
                        <div class="flex flex-col">
                          <span class="font-mono font-bold text-xs">{{ line.account_code }}</span>
                          <span>{{ line.account_name }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-xs">
                        {{ line.cost_center?.name || line.cost_center_name || '-' }}
                      </td>
                      <td class="px-4 py-3 text-xs text-text-muted">
                        {{ line.description || '-' }}
                      </td>
                      <td class="px-4 py-3 text-center font-mono text-emerald-600 font-bold">
                        {{
                          line.debit > 0
                            ? line.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })
                            : '-'
                        }}
                      </td>
                      <td class="px-4 py-3 text-center font-mono text-rose-600 font-bold">
                        {{
                          line.credit > 0
                            ? line.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })
                            : '-'
                        }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-surface-section font-bold">
                    <tr>
                      <td
                        colspan="3"
                        class="px-4 py-3 text-center text-text-muted uppercase text-xs"
                      >
                        الإجمالي
                      </td>
                      <td class="px-4 py-3 text-center font-mono text-emerald-600">
                        {{
                          entry.total_debit.toLocaleString(undefined, { minimumFractionDigits: 2 })
                        }}
                      </td>
                      <td class="px-4 py-3 text-center font-mono text-rose-600">
                        {{
                          entry.total_credit.toLocaleString(undefined, { minimumFractionDigits: 2 })
                        }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useJournalEntryStore } from '@/modules/accounting/stores/journalEntryStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  entryId: { type: Number, required: true },
})

const emit = defineEmits(['update:modelValue'])
const journalStore = useJournalEntryStore()

const loading = ref(false)
const entry = ref(null)

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen && props.entryId) {
      loading.value = true
      await journalStore.fetchEntry(props.entryId)
      entry.value = journalStore.currentEntry
      loading.value = false
    } else {
      entry.value = null
    }
  },
)

const close = () => {
  emit('update:modelValue', false)
}
</script>
