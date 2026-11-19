<!--src\modules\accounting\views\journal-entries\components\JournalEntryViewModal.vue-->
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
      class="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans text-right"
      dir="rtl"
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
          class="bg-surface-section rounded-2xl border border-surface-border border-t-4 border-t-primary shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <!-- رأس النافذة -->
          <div
            class="flex justify-between items-center px-5 py-4 border-b border-surface-border bg-surface-section"
          >
            <div class="flex items-center gap-3">
              <span class="w-2 h-5 rounded-full bg-primary inline-block"></span>
              <h3 class="text-base md:text-lg font-black text-text-primary">
                تفاصيل القيد المحاسبي
              </h3>
              <span
                v-if="entry"
                :class="[
                  'px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center gap-1.5',
                  entry.status === 'posted'
                    ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-500/30',
                ]"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="entry.status === 'posted' ? 'bg-emerald-500' : 'bg-amber-500'"
                ></span>
                {{ entry.status === 'posted' ? 'مُرحل' : 'مسودة' }}
              </span>
            </div>

            <button
              type="button"
              @click="close"
              class="text-text-muted hover:text-text-primary p-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-primary/50 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- محتوى النافذة -->
          <div class="p-5 overflow-y-auto flex-1 space-y-5">
            <div v-if="loading" class="flex flex-col justify-center items-center py-14 gap-3">
              <div class="animate-spin rounded-full h-9 w-9 border-b-2 border-primary"></div>
              <span class="text-xs text-text-muted font-bold">جاري تحميل تفاصيل القيد...</span>
            </div>

            <div v-else-if="entry" class="space-y-5">
              <!-- بطاقة البيانات الرئيسية للقيد -->
              <div
                class="grid grid-cols-2 md:grid-cols-5 gap-3.5 bg-surface-header/60 p-4 rounded-xl border border-surface-border shadow-2xs"
              >
                <div class="bg-surface-card p-2.5 rounded-lg border border-surface-border/80">
                  <span class="block text-[10px] font-bold text-text-muted mb-1">رقم القيد</span>
                  <span class="font-mono font-black text-xs text-primary">
                    {{ entry.entry_number || '-' }}
                  </span>
                </div>

                <div class="bg-surface-card p-2.5 rounded-lg border border-surface-border/80">
                  <span class="block text-[10px] font-bold text-text-muted mb-1">التاريخ</span>
                  <span class="font-mono font-bold text-xs text-text-primary" dir="ltr">
                    {{ entry.date }}
                  </span>
                </div>

                <div class="bg-surface-card p-2.5 rounded-lg border border-surface-border/80">
                  <span class="block text-[10px] font-bold text-text-muted mb-1">المصدر</span>
                  <span class="font-bold text-xs text-text-primary">
                    {{ entry.source_label || entry.source }}
                  </span>
                </div>

                <div class="bg-surface-card p-2.5 rounded-lg border border-surface-border/80">
                  <span class="block text-[10px] font-bold text-text-muted mb-1"
                    >الفرع / التاق</span
                  >
                  <span class="font-bold text-xs text-primary truncate block">
                    {{ entry.cost_center?.name || entry.cost_center_name || 'قيد عام' }}
                  </span>
                </div>

                <div
                  class="col-span-2 md:col-span-1 bg-surface-card p-2.5 rounded-lg border border-surface-border/80"
                >
                  <span class="block text-[10px] font-bold text-text-muted mb-1">بواسطة</span>
                  <span class="font-bold text-xs text-text-primary truncate block">
                    {{ entry.created_by?.name || '-' }}
                  </span>
                </div>

                <div
                  class="col-span-2 md:col-span-5 bg-surface-card p-3 rounded-lg border border-surface-border/80"
                >
                  <span class="block text-[10px] font-bold text-text-muted mb-1">
                    البيان العام للقيد
                  </span>
                  <span class="font-bold text-xs sm:text-sm text-text-primary">
                    {{ entry.description || '-' }}
                  </span>
                </div>
              </div>

              <!-- منصة تفاصيل الأطراف المجسّمة -->
              <div class="invoice-stage-3d rounded-2xl overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-right border-collapse">
                    <thead class="invoice-thead-3d select-none h-10">
                      <tr>
                        <th class="px-4 py-2.5 font-black text-white dark:text-slate-900">
                          الحساب المالي
                        </th>
                        <th class="px-4 py-2.5 font-bold text-slate-200 dark:text-slate-800">
                          مركز التكلفة (التاق)
                        </th>
                        <th class="px-4 py-2.5 font-bold text-slate-200 dark:text-slate-800">
                          البيان الفرعي
                        </th>
                        <th
                          class="px-4 py-2.5 font-black text-center text-emerald-300 dark:text-emerald-700"
                        >
                          مدين
                        </th>
                        <th
                          class="px-4 py-2.5 font-black text-center text-rose-300 dark:text-rose-700"
                        >
                          دائن
                        </th>
                      </tr>
                    </thead>

                    <tbody class="divide-y divide-surface-border/70">
                      <tr
                        v-for="line in entry.details"
                        :key="line.id"
                        class="invoice-row-3d invoice-row-filled"
                      >
                        <td class="px-4 py-3">
                          <div class="flex items-center gap-2">
                            <span
                              class="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-primary/12 text-primary border border-primary/25"
                            >
                              {{ line.account_code }}
                            </span>
                            <span class="font-bold text-text-primary">
                              {{ line.account_name }}
                            </span>
                          </div>
                        </td>

                        <td class="px-4 py-3 text-text-secondary font-semibold">
                          {{ line.cost_center?.name || line.cost_center_name || '-' }}
                        </td>

                        <td class="px-4 py-3 text-text-muted">
                          {{ line.description || '-' }}
                        </td>

                        <td
                          class="px-4 py-3 text-center font-mono font-black text-sm text-emerald-600 dark:text-emerald-400"
                        >
                          {{
                            line.debit > 0
                              ? Number(line.debit).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : '—'
                          }}
                        </td>

                        <td
                          class="px-4 py-3 text-center font-mono font-black text-sm text-rose-600 dark:text-rose-400"
                        >
                          {{
                            line.credit > 0
                              ? Number(line.credit).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : '—'
                          }}
                        </td>
                      </tr>
                    </tbody>

                    <tfoot>
                      <tr
                        class="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-t-2 border-primary font-black"
                      >
                        <td colspan="3" class="px-4 py-3 text-center text-xs">
                          إجمالي أطراف القيد المتوازن
                        </td>
                        <td
                          class="px-4 py-3 text-center font-mono text-sm text-emerald-300 dark:text-emerald-700"
                        >
                          {{
                            Number(entry.total_debit).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          }}
                        </td>
                        <td
                          class="px-4 py-3 text-center font-mono text-sm text-rose-300 dark:text-rose-700"
                        >
                          {{
                            Number(entry.total_credit).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          }}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- تذييل النافذة -->
          <div
            class="px-5 py-3 bg-surface-ground/60 border-t border-surface-border flex justify-end"
          >
            <button
              type="button"
              @click="close"
              class="px-5 py-2 bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary hover:border-primary/50 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              إغلاق
            </button>
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
