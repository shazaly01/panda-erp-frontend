<!--src/modules/accounting/views/budgets/components/BudgetMatrixGrid.vue-->
<template>
  <div class="p-0 bg-transparent space-y-2.5 text-right font-sans" dir="rtl">
    <!-- منصة مصفوفة الموازنة المجسّمة (3D Elevated Stage - متطابقة مع جدول المبيعات) -->
    <div
      class="invoice-stage-3d rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200"
    >
      <div class="overflow-x-auto max-h-[620px] min-h-[260px] flex flex-col justify-between">
        <table class="w-full text-right border-collapse text-xs">
          <!-- ترويسة الأعمدة العكسية المجسّمة -->
          <thead class="invoice-thead-3d sticky top-0 z-20 select-none h-11 tracking-tight">
            <tr>
              <th
                class="px-3 py-2.5 font-black text-white dark:text-slate-900 min-w-[295px] sticky right-0 z-30 bg-slate-800 dark:bg-slate-200 shadow-[-4px_0_10px_-2px_rgba(15,23,42,0.28)] border-l border-slate-700 dark:border-slate-300"
              >
                <span class="inline-flex items-center gap-2 text-[13px]">
                  <span
                    class="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/25 inline-block"
                  ></span>
                  <span>البند المعتمد (حساب / مركز تكلفة)</span>
                </span>
              </th>

              <th
                class="px-3 py-2.5 font-bold text-slate-200 dark:text-slate-800 min-w-[175px] border-l border-slate-700/60 dark:border-slate-300/80"
              >
                نطاق التخصيص
              </th>

              <th
                v-for="period in periods"
                :key="period.key"
                class="px-2 py-2 font-black text-white dark:text-slate-900 text-center min-w-[112px] border-l border-slate-700/60 dark:border-slate-300/80"
              >
                <div class="truncate text-xs">{{ period.label }}</div>
                <div
                  class="text-[10px] text-slate-400 dark:text-slate-600 font-mono font-normal mt-0.5"
                >
                  {{ period.shortDate }}
                </div>
              </th>

              <th
                class="px-3 py-2.5 font-black text-primary-light dark:text-primary-dark text-center min-w-[130px] border-l border-slate-700/60 dark:border-slate-300/80 text-[13px]"
              >
                الإجمالي السنوي
              </th>

              <th
                class="px-3 py-2.5 font-bold text-slate-200 dark:text-slate-800 text-center min-w-[100px] border-l border-slate-700/60 dark:border-slate-300/80"
              >
                أدوات التوزيع
              </th>

              <th class="px-3 py-2.5 font-bold text-slate-400 dark:text-slate-600 text-center w-14">
                حذف
              </th>
            </tr>
          </thead>

          <!-- صفوف البيانات + سطر البحث والإضافة الفوري المدمج -->
          <tbody class="divide-y divide-surface-border/70">
            <tr
              v-for="(row, rowIndex) in rows"
              :key="row._key"
              class="invoice-row-3d invoice-row-filled animate-row-enter group"
            >
              <!-- البند المعتمد (مثبت يميناً مع خلفية صلبة تمنع تداخل النص عند التمرير الأفقي) -->
              <td
                class="p-2.5 sticky right-0 z-10 bg-surface-section group-hover:bg-surface-card transition-colors shadow-[-4px_0_10px_-3px_rgba(15,23,42,0.14)] border-l border-surface-border/80"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <span
                      class="w-5 h-5 rounded-md flex items-center justify-center font-mono font-black text-[11px] bg-primary text-white shadow-2xs shrink-0"
                    >
                      {{ rowIndex + 1 }}
                    </span>

                    <div class="flex flex-col min-w-0">
                      <span class="font-mono font-black text-primary text-[11px]">
                        {{ row.account_code }}
                      </span>
                      <span
                        class="font-black truncate max-w-[175px] text-xs text-text-primary mt-0.5"
                        :title="row.account_name"
                      >
                        {{ row.account_name }}
                      </span>
                    </div>
                  </div>

                  <!-- شارة نوع البند -->
                  <span
                    v-if="row.account_id"
                    :class="[
                      'text-[9px] px-2 py-0.5 rounded-md font-bold shrink-0 border',
                      row.account_type === 'expense'
                        ? 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/30'
                        : 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
                    ]"
                  >
                    {{ row.account_type === 'expense' ? 'حساب مصروف' : 'حساب إيراد' }}
                  </span>
                  <span
                    v-else
                    class="text-[9px] px-2 py-0.5 rounded-md font-bold shrink-0 border bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/35"
                  >
                    مجمع للإدارة
                  </span>
                </div>
              </td>

              <!-- نطاق التخصيص ومركز التكلفة -->
              <td class="p-2 border-l border-surface-border/60 align-middle">
                <div v-if="row.account_id" class="relative w-full h-9 flex items-center">
                  <select
                    v-model="row.cost_center_id"
                    class="invoice-pill-editable w-full h-9 pr-2.5 pl-6 border rounded-xl text-text-secondary text-xs font-bold outline-none appearance-none cursor-pointer transition-all"
                  >
                    <option :value="null" class="bg-surface-section text-text-muted">
                      -- عام للمنشأة --
                    </option>
                    <option
                      v-for="cc in costCenters"
                      :key="cc.id"
                      :value="cc.id"
                      class="bg-surface-section text-text-primary font-bold"
                    >
                      {{ cc.name }}
                    </option>
                  </select>
                  <span
                    class="absolute left-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none text-[8px]"
                  >
                    ▼
                  </span>
                </div>

                <div
                  v-else
                  class="h-9 flex items-center gap-1.5 px-2.5 bg-amber-500/10 rounded-xl border border-amber-500/25 text-[11px] text-amber-700 dark:text-amber-300 font-bold"
                >
                  <span>🏢</span>
                  <span class="truncate">لكافة منصرفات القسم</span>
                </div>
              </td>

              <!-- خلايا الشهور / الفترات (كبسولات مجسّمة قابلة للتعديل) -->
              <td
                v-for="(period, pIdx) in periods"
                :key="period.key"
                class="p-1.5 border-l border-surface-border/60 align-middle"
              >
                <input
                  :ref="(el) => setPeriodCellRef(el, rowIndex, period.key)"
                  type="number"
                  v-model.number="row.periods[period.key]"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  @focus="$event.target.select()"
                  @keydown.enter.prevent="focusNextPeriodOrSearch(rowIndex, pIdx)"
                  class="invoice-pill-editable w-full h-9 px-2 border rounded-xl text-center font-mono font-black text-xs text-text-primary outline-none transition-all placeholder:text-text-muted/45 placeholder:font-normal"
                />
              </td>

              <!-- الإجمالي السنوي المحسوب للبند -->
              <td class="p-2 text-center border-l border-surface-border/60 align-middle">
                <div
                  class="inline-flex items-center justify-center min-w-[96px] h-9 px-3 rounded-xl border transition-all"
                  :class="
                    calculateRowTotal(row) > 0
                      ? 'bg-primary/12 border-primary/35 text-primary shadow-2xs'
                      : 'bg-surface-ground/80 border-surface-border/60 text-text-muted'
                  "
                >
                  <span class="font-mono font-black text-xs">
                    {{ formatNumber(calculateRowTotal(row)) }}
                  </span>
                </div>
              </td>

              <!-- أزرار التوزيع الذكي السريع -->
              <td class="p-2 text-center border-l border-surface-border/60 align-middle">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    @click="distributeEvenly(row)"
                    class="p-1.5 rounded-lg bg-surface-card border border-surface-border hover:border-primary text-text-secondary hover:text-primary transition-all shadow-2xs cursor-pointer"
                    title="توزيع الإجمالي بالتساوي على كل الفترات"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    @click="copyFirstPeriodToAll(row)"
                    class="p-1.5 rounded-lg bg-surface-card border border-surface-border hover:border-emerald-500 text-text-secondary hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-2xs cursor-pointer"
                    title="نسخ مبلغ الشهر الأول لكافة الشهور"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                      />
                    </svg>
                  </button>
                </div>
              </td>

              <!-- حذف الصف -->
              <td class="p-1.5 text-center align-middle">
                <button
                  type="button"
                  @click="removeRow(rowIndex)"
                  class="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-colors cursor-pointer"
                  title="حذف هذا البند"
                >
                  <svg
                    class="w-4 h-4 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </td>
            </tr>

            <!-- =========================================================
                 سطر البحث والإضافة السطري الفوري (على غرار فاتورة المبيعات)
                 ========================================================= -->
            <tr class="invoice-row-3d invoice-row-empty">
              <td
                class="p-2.5 sticky right-0 z-10 bg-surface-section shadow-[-4px_0_10px_-3px_rgba(15,23,42,0.14)] border-l border-surface-border/80"
              >
                <div class="space-y-1.5">
                  <!-- شريط تبديل سريع مدمج داخل السطر -->
                  <div class="flex items-center justify-between gap-1">
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        @click="setSearchScope('all')"
                        :class="[
                          'px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer',
                          searchScope === 'all'
                            ? 'bg-primary text-white shadow-2xs'
                            : 'bg-surface-ground text-text-muted hover:text-text-primary border border-surface-border',
                        ]"
                      >
                        الكل
                      </button>
                      <button
                        type="button"
                        @click="setSearchScope('account')"
                        :class="[
                          'px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer',
                          searchScope === 'account'
                            ? 'bg-primary text-white shadow-2xs'
                            : 'bg-surface-ground text-text-muted hover:text-text-primary border border-surface-border',
                        ]"
                      >
                        حسابات
                      </button>
                      <button
                        type="button"
                        @click="setSearchScope('cost_center')"
                        :class="[
                          'px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer',
                          searchScope === 'cost_center'
                            ? 'bg-primary text-white shadow-2xs'
                            : 'bg-surface-ground text-text-muted hover:text-text-primary border border-surface-border',
                        ]"
                      >
                        مراكز تكلفة
                      </button>
                    </div>

                    <span
                      class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-warning/15 text-warning border border-warning/30"
                    >
                      إدخال سريع
                    </span>
                  </div>

                  <!-- حقل البحث السطري المدمج -->
                  <div class="relative w-full h-10 flex items-center">
                    <input
                      ref="searchInputRef"
                      type="text"
                      v-model="searchQuery"
                      @focus="onSearchFocus"
                      @input="onSearchInput"
                      @blur="closeDropdownDelayed"
                      @keydown="handleSearchKeydown"
                      :placeholder="searchPlaceholder"
                      class="invoice-cell-input-3d w-full h-10 pr-9 pl-3 bg-surface-card border border-primary/50 hover:border-primary focus:border-primary rounded-xl text-text-primary text-xs font-bold outline-none transition-all placeholder:text-text-muted placeholder:font-normal"
                      autocomplete="off"
                    />

                    <!-- أيقونة البحث أو التحميل -->
                    <span
                      class="absolute right-3 inset-y-0 flex items-center text-primary pointer-events-none"
                    >
                      <svg
                        v-if="!isSearching"
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2.2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                    </span>
                  </div>
                </div>
              </td>

              <!-- بقية خلايا سطر الإدخال الفارغ -->
              <td
                class="p-2 text-center text-text-muted/40 font-mono border-l border-surface-border/50"
              >
                —
              </td>
              <td
                v-for="period in periods"
                :key="`empty-${period.key}`"
                class="p-2 text-center text-text-muted/35 font-mono border-l border-surface-border/50"
              >
                —
              </td>
              <td
                class="p-2 text-center text-text-muted/40 font-mono border-l border-surface-border/50"
              >
                —
              </td>
              <td
                class="p-2 text-center text-text-muted/40 font-mono border-l border-surface-border/50"
              >
                —
              </td>
              <td class="p-2 text-center text-text-muted/40 font-mono">—</td>
            </tr>
          </tbody>

          <!-- صف الإجماليات العمودية لكافة الشهور (Footer) -->
          <tfoot class="sticky bottom-0 z-20 select-none">
            <tr
              class="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-t-2 border-primary font-bold"
            >
              <td
                class="p-3 sticky right-0 z-30 bg-slate-800 dark:bg-slate-200 shadow-[-4px_0_10px_-2px_rgba(15,23,42,0.28)] font-black text-xs border-l border-slate-700 dark:border-slate-300"
              >
                إجمالي المعتمد الشهري
              </td>
              <td
                class="p-3 text-slate-400 dark:text-slate-600 text-center border-l border-slate-700/60 dark:border-slate-300/80"
              >
                —
              </td>
              <td
                v-for="period in periods"
                :key="period.key"
                class="p-2 text-center font-mono text-primary-light dark:text-primary-dark text-xs font-black border-l border-slate-700/60 dark:border-slate-300/80"
              >
                {{ formatNumber(calculatePeriodTotal(period.key)) }}
              </td>
              <td
                class="p-3 text-center bg-primary/20 border-l border-slate-700/60 dark:border-slate-300/80 font-mono text-primary-light dark:text-primary-dark font-black text-sm"
              >
                {{ formatNumber(grandTotal) }}
              </td>
              <td colspan="2" class="p-3 text-center text-slate-400 dark:text-slate-600">—</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- شريط التحكم السريع ومؤشر البنود المدرجة أسفل المنصة -->
      <div
        class="px-4 py-2 bg-surface-ground/60 border-t border-surface-border/80 flex flex-wrap items-center justify-between gap-2"
      >
        <button
          type="button"
          @click="focusSearchInput"
          class="h-8 px-3.5 bg-surface-card hover:bg-primary hover:text-white text-primary border border-primary/45 hover:border-primary text-xs font-black rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>إضافة بند جديد للمصفوفة</span>
        </button>

        <div class="flex items-center gap-3 text-xs text-text-secondary">
          <span class="hidden sm:inline text-[11px] text-text-muted">
            تلميح: اكتب اسم الحساب أو مركز التكلفة في السطر واضغط
            <kbd
              class="px-1.5 py-0.5 bg-surface-card border border-surface-border rounded text-[10px] font-mono"
              >Enter</kbd
            >
            للإدراج الفوري
          </span>
          <span
            class="px-2.5 py-1 rounded-lg bg-surface-card border border-surface-border font-mono shadow-2xs"
          >
            البنود المدرجة:
            <strong class="text-primary font-black text-sm mr-1">{{ rows.length }}</strong>
          </span>
        </div>
      </div>
    </div>

    <!-- قائمة المقترحات الطافية الذكية عبر Teleport (متطابقة مع شاشة المبيعات) -->
    <Teleport to="body">
      <div
        v-if="isDropdownOpen && combinedResults.length > 0"
        :style="dropdownStyle"
        class="fixed bg-surface-section border border-surface-border rounded-xl shadow-2xl z-[9999] max-h-64 overflow-y-auto divide-y divide-surface-border/60 text-right font-sans transition-all"
        dir="rtl"
      >
        <div
          v-for="(item, idx) in combinedResults"
          :key="item._uid"
          :ref="(el) => setDropdownItemRef(el, idx)"
          @mousedown.prevent="selectSearchItem(item)"
          @mouseenter="highlightedIndex = idx"
          class="p-2.5 cursor-pointer flex items-center justify-between transition-colors"
          :class="
            highlightedIndex === idx
              ? 'bg-primary/10 border-r-4 border-primary'
              : 'hover:bg-surface-ground'
          "
        >
          <div class="flex flex-col gap-1 pr-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-text-primary truncate">{{ item.name }}</span>
              <span
                :class="[
                  'text-[9px] px-1.5 py-0.5 rounded font-bold border shrink-0',
                  item._kind === 'cost_center'
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    : 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
                ]"
              >
                {{
                  item._kind === 'cost_center'
                    ? 'مركز تكلفة (مجمع)'
                    : item.type_label || 'حساب مالي'
                }}
              </span>
            </div>

            <div class="flex items-center gap-3 text-[10px] text-text-muted font-mono">
              <span>الكود: {{ item.code || '---' }}</span>
              <span v-if="item.parent_account_name" class="font-sans text-text-secondary truncate">
                {{ item.parent_account_name }}
              </span>
            </div>
          </div>

          <span
            class="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all whitespace-nowrap shadow-2xs shrink-0 mr-2"
            :class="
              highlightedIndex === idx
                ? 'bg-primary text-white'
                : 'text-primary bg-primary/10 border border-primary/25'
            "
          >
            إدراج ↵
          </span>
        </div>
      </div>

      <!-- رسالة عدم وجود نتائج -->
      <div
        v-else-if="
          isDropdownOpen && searchQuery.trim() && !isSearching && combinedResults.length === 0
        "
        :style="dropdownStyle"
        class="fixed bg-surface-section border border-surface-border rounded-xl shadow-2xl z-[9999] p-4 text-center text-xs text-text-muted font-sans"
        dir="rtl"
      >
        لا توجد حسابات أو مراكز تكلفة مطابقة لـ "<strong class="text-text-primary">{{
          searchQuery
        }}</strong
        >"
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useToast } from 'vue-toastification'
import partySearchService from '@/modules/accounting/services/partySearch.service'

const props = defineProps({
  modelValue: { type: Array, required: true },
  periods: { type: Array, required: true },
  costCenters: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])
const toast = useToast()

const rows = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// =========================================================
// 1. حالة البحث السطري الفوري والقائمة الطافية
// =========================================================
const searchInputRef = ref(null)
const periodCellRefs = ref({})
const dropdownItemRefs = ref([])

const searchScope = ref('all') // 'all' | 'account' | 'cost_center'
const searchQuery = ref('')
const accountResults = ref([])
const isDropdownOpen = ref(false)
const isSearching = ref(false)
const highlightedIndex = ref(0)

let debounceTimer = null
let abortController = null

const dropdownStyle = ref({
  top: 'auto',
  bottom: 'auto',
  right: '0px',
  width: '460px',
})

const searchPlaceholder = computed(() => {
  if (searchScope.value === 'account') {
    return 'ابحث بكود أو اسم الحساب المالي لإضافته فوراً...'
  }
  if (searchScope.value === 'cost_center') {
    return 'ابحث باسم أو كود مركز التكلفة لإضافته كموازنة مجمعة...'
  }
  return 'ابحث بكود أو اسم الحساب المالي أو مركز التكلفة لإضافته...'
})

const setPeriodCellRef = (el, rowIdx, periodKey) => {
  if (!periodCellRefs.value[rowIdx]) {
    periodCellRefs.value[rowIdx] = {}
  }
  if (el) {
    periodCellRefs.value[rowIdx][periodKey] = el
  }
}

const setDropdownItemRef = (el, idx) => {
  if (el) {
    dropdownItemRefs.value[idx] = el
  }
}

const updateDropdownPosition = () => {
  const el = searchInputRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const estimatedHeight = 256
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const openUpwards = spaceBelow < estimatedHeight && spaceAbove > spaceBelow

  const preferredWidth = Math.max(rect.width, 460)
  const maxWidth = Math.min(preferredWidth, window.innerWidth - 20)
  const rightOffset = Math.max(10, window.innerWidth - rect.right)

  dropdownStyle.value = openUpwards
    ? {
        top: 'auto',
        bottom: `${window.innerHeight - rect.top + 4}px`,
        right: `${rightOffset}px`,
        width: `${maxWidth}px`,
      }
    : {
        top: `${rect.bottom + 4}px`,
        bottom: 'auto',
        right: `${rightOffset}px`,
        width: `${maxWidth}px`,
      }
}

// دمج نتائج مراكز التكلفة المحلية مع نتائج الحسابات من الخادم
const combinedResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const list = []

  if (searchScope.value === 'all' || searchScope.value === 'cost_center') {
    const matchedCenters = props.costCenters.filter((cc) => {
      if (!q) return searchScope.value === 'cost_center' || props.costCenters.length <= 15
      const nameMatch = (cc.name || '').toLowerCase().includes(q)
      const codeMatch = (cc.code || '').toLowerCase().includes(q)
      return nameMatch || codeMatch
    })

    for (const cc of matchedCenters.slice(0, 8)) {
      list.push({
        _uid: `cc-${cc.id}`,
        _kind: 'cost_center',
        id: cc.id,
        code: cc.code || 'مركز تكلفة',
        name: cc.name,
        parent_account_name: 'موازنة مجمعة لكافة مصروفات القسم',
        raw: cc,
      })
    }
  }

  if (searchScope.value === 'all' || searchScope.value === 'account') {
    for (const acc of accountResults.value) {
      list.push({
        _uid: `acc-${acc.key || acc.account_id || acc.id}`,
        _kind: 'account',
        id: acc.account_id || acc.id,
        code: acc.code || '',
        name: acc.name || '',
        type_label: acc.type_label || 'حساب مالي',
        parent_account_name: acc.parent_account_name || '',
        raw: acc,
      })
    }
  }

  return list
})

const executeAccountSearch = async () => {
  const q = searchQuery.value.trim()
  if (searchScope.value === 'cost_center' || !q) {
    accountResults.value = []
    isSearching.value = false
    return
  }

  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()
  isSearching.value = true

  try {
    const data = await partySearchService.search(q, [], 10, abortController.signal)
    accountResults.value = Array.isArray(data) ? data : []
    highlightedIndex.value = 0
    updateDropdownPosition()
  } catch (err) {
    if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
      console.error('فشل البحث في الحسابات:', err)
      accountResults.value = []
    }
  } finally {
    isSearching.value = false
  }
}

const setSearchScope = (scope) => {
  searchScope.value = scope
  highlightedIndex.value = 0
  isDropdownOpen.value = true
  nextTick(() => {
    updateDropdownPosition()
    searchInputRef.value?.focus()
    if (scope !== 'cost_center' && searchQuery.value.trim()) {
      executeAccountSearch()
    }
  })
}

const onSearchFocus = () => {
  isDropdownOpen.value = true
  highlightedIndex.value = 0
  updateDropdownPosition()
  if (searchQuery.value.trim() && searchScope.value !== 'cost_center') {
    executeAccountSearch()
  }
}

const onSearchInput = () => {
  isDropdownOpen.value = true
  highlightedIndex.value = 0
  updateDropdownPosition()
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    executeAccountSearch()
  }, 240)
}

const closeDropdownDelayed = () => {
  setTimeout(() => {
    isDropdownOpen.value = false
  }, 180)
}

const scrollHighlightedIntoView = () => {
  nextTick(() => {
    const el = dropdownItemRefs.value[highlightedIndex.value]
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' })
    }
  })
}

const handleSearchKeydown = (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!isDropdownOpen.value) {
      isDropdownOpen.value = true
      updateDropdownPosition()
      return
    }
    if (combinedResults.value.length > 0) {
      highlightedIndex.value = (highlightedIndex.value + 1) % combinedResults.value.length
      scrollHighlightedIntoView()
    }
  } else if (e.key === 'ArrowUp') {
    if (!isDropdownOpen.value || combinedResults.value.length === 0) return
    e.preventDefault()
    highlightedIndex.value =
      (highlightedIndex.value - 1 + combinedResults.value.length) % combinedResults.value.length
    scrollHighlightedIntoView()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (isDropdownOpen.value && combinedResults.value.length > 0) {
      const target = combinedResults.value[highlightedIndex.value] || combinedResults.value[0]
      if (target) {
        selectSearchItem(target)
      }
    } else if (searchQuery.value.trim()) {
      executeAccountSearch()
    }
  } else if (e.key === 'Escape') {
    isDropdownOpen.value = false
  }
}

const selectSearchItem = (item) => {
  if (!item) return

  const initialPeriods = {}
  props.periods.forEach((p) => {
    initialPeriods[p.key] = ''
  })

  if (item._kind === 'cost_center') {
    const cc = item.raw
    const isDuplicate = rows.value.some((r) => !r.account_id && r.cost_center_id === cc.id)
    if (isDuplicate) {
      toast.warning('تمت إضافة موازنة مجمعة لهذا المركز مسبقاً.')
    }

    rows.value = [
      ...rows.value,
      {
        _key: Date.now() + Math.random(),
        account_id: null,
        account_code: cc.code || 'مركز تكلفة',
        account_name: cc.name,
        account_type: 'expense',
        cost_center_id: cc.id,
        periods: initialPeriods,
      },
    ]
  } else {
    const account = item.raw
    const accountId = account.account_id || account.id
    const isDuplicate = rows.value.some(
      (r) => r.account_id === accountId && r.cost_center_id === null,
    )
    if (isDuplicate) {
      toast.warning('هذا الحساب مضاف مسبقاً بنفس مركز التكلفة.')
    }

    rows.value = [
      ...rows.value,
      {
        _key: Date.now() + Math.random(),
        account_id: accountId,
        account_code: account.code || '',
        account_name: account.name || '',
        account_type: account.type || 'expense',
        cost_center_id: null,
        periods: initialPeriods,
      },
    ]
  }

  searchQuery.value = ''
  accountResults.value = []
  isDropdownOpen.value = false
  highlightedIndex.value = 0

  // توجيه المؤشر تلقائياً إلى أول فترة زمنية في السطر المضاف لبدء إدخال المبالغ فوراً
  const newRowIdx = rows.value.length - 1
  const firstPeriodKey = props.periods[0]?.key
  nextTick(() => {
    if (firstPeriodKey && periodCellRefs.value[newRowIdx]?.[firstPeriodKey]) {
      const input = periodCellRefs.value[newRowIdx][firstPeriodKey]
      input.focus()
      input.select()
    } else {
      searchInputRef.value?.focus()
    }
  })
}

const focusNextPeriodOrSearch = (rowIdx, periodIdx) => {
  const nextPeriod = props.periods[periodIdx + 1]
  if (nextPeriod && periodCellRefs.value[rowIdx]?.[nextPeriod.key]) {
    const nextInput = periodCellRefs.value[rowIdx][nextPeriod.key]
    nextInput.focus()
    nextInput.select()
  } else {
    focusSearchInput()
  }
}

const focusSearchInput = () => {
  nextTick(() => {
    searchInputRef.value?.focus()
    searchInputRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })
}

// =========================================================
// 2. دوال الحسابات والتوزيع السريع
// =========================================================
const formatNumber = (num) =>
  Number(num || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const calculateRowTotal = (row) => {
  return Object.values(row.periods || {}).reduce((sum, val) => sum + (Number(val) || 0), 0)
}

const calculatePeriodTotal = (periodKey) => {
  return rows.value.reduce((sum, row) => sum + (Number(row.periods?.[periodKey]) || 0), 0)
}

const grandTotal = computed(() => {
  return rows.value.reduce((sum, row) => sum + calculateRowTotal(row), 0)
})

const removeRow = (index) => {
  const updated = [...rows.value]
  updated.splice(index, 1)
  rows.value = updated
}

const distributeEvenly = (row) => {
  const currentTotal = calculateRowTotal(row)
  if (currentTotal <= 0) {
    toast.info('يرجى إدخال مبلغ أولاً في أي شهر لتوزيعه.')
    return
  }
  const count = props.periods.length
  if (count === 0) return

  const splitAmount = Math.round((currentTotal / count) * 100) / 100
  props.periods.forEach((p) => {
    row.periods[p.key] = splitAmount
  })
}

const copyFirstPeriodToAll = (row) => {
  if (props.periods.length === 0) return
  const firstKey = props.periods[0].key
  const baseAmount = Number(row.periods[firstKey]) || 0

  if (baseAmount <= 0) {
    toast.info('يرجى إدخال مبلغ في الشهر الأول ليتم نسخه.')
    return
  }

  props.periods.forEach((p) => {
    row.periods[p.key] = baseAmount
  })
}

const handleWindowScrollOrResize = () => {
  if (isDropdownOpen.value) {
    updateDropdownPosition()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleWindowScrollOrResize, true)
  window.addEventListener('resize', handleWindowScrollOrResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleWindowScrollOrResize, true)
  window.removeEventListener('resize', handleWindowScrollOrResize)
  if (abortController) {
    abortController.abort()
  }
  clearTimeout(debounceTimer)
})
</script>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
