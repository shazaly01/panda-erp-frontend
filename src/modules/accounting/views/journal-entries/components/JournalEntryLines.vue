<!--src/modules/accounting/views/journal-entries/components/JournalEntryLines.vue-->
<template>
  <div class="p-0 bg-transparent space-y-2.5 text-right font-sans" dir="rtl">
    <!-- منصة أطراف القيد المجسّمة (3D Elevated Stage) -->
    <div
      class="invoice-stage-3d rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200"
    >
      <div class="overflow-x-auto min-h-[240px] flex flex-col justify-between">
        <table class="w-full border-collapse text-right text-xs">
          <!-- ترويسة الجدول العكسية المجسّمة -->
          <thead class="invoice-thead-3d select-none h-11 tracking-tight">
            <tr>
              <th class="px-3 py-2.5 w-16 text-center text-slate-400 dark:text-slate-600 font-mono">
                #
              </th>
              <th
                class="px-3 py-2.5 min-w-[260px] text-right font-black text-white dark:text-slate-900 text-[13px]"
              >
                <span class="inline-flex items-center gap-2">
                  <span
                    class="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/25 inline-block"
                  ></span>
                  <span>الحساب المالي (الطرف المدين / الدائن)</span>
                </span>
              </th>
              <th
                v-if="costCenters.length > 0"
                class="px-3 py-2.5 min-w-[155px] w-44 text-center font-bold text-slate-200 dark:text-slate-800"
              >
                مركز التكلفة
              </th>
              <th
                class="px-3 py-2.5 min-w-[140px] w-40 text-center font-black text-emerald-300 dark:text-emerald-700 text-[13px]"
              >
                مدين (Debit)
              </th>
              <th
                class="px-3 py-2.5 min-w-[140px] w-40 text-center font-black text-rose-300 dark:text-rose-700 text-[13px]"
              >
                دائن (Credit)
              </th>
              <th
                class="px-3 py-2.5 min-w-[190px] w-56 text-right font-bold text-slate-200 dark:text-slate-800"
              >
                البيان الفرعي للسطر
              </th>
              <th class="px-3 py-2.5 w-14 text-center font-bold text-slate-400 dark:text-slate-600">
                حذف
              </th>
            </tr>
          </thead>

          <!-- صفوف القيد + سطر البحث والإضافة السطري المدمج -->
          <tbody class="divide-y divide-surface-border/70">
            <tr
              v-for="(line, index) in lines"
              :key="line._key || index"
              class="invoice-row-3d invoice-row-filled animate-row-enter"
            >
              <!-- 1. تسلسل السطر -->
              <td class="px-3 py-2.5 text-center font-mono align-middle">
                <span
                  class="w-5 h-5 rounded-md inline-flex items-center justify-center font-black text-[11px] bg-primary text-white shadow-2xs"
                >
                  {{ index + 1 }}
                </span>
              </td>

              <!-- 2. الحساب المالي المختار -->
              <td class="px-3 py-2.5 align-middle">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex flex-col min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span
                        class="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-primary/12 text-primary border border-primary/25"
                      >
                        {{ getAccountCode(line.account_id) }}
                      </span>
                      <span
                        v-if="Number(line.debit) > 0"
                        class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25"
                      >
                        مدين
                      </span>
                      <span
                        v-else-if="Number(line.credit) > 0"
                        class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-rose-500/12 text-rose-700 dark:text-rose-300 border border-rose-500/25"
                      >
                        دائن
                      </span>
                    </div>
                    <span
                      class="text-xs sm:text-[13px] font-black text-text-primary truncate mt-0.5"
                      :title="getAccountName(line.account_id)"
                    >
                      {{ getAccountName(line.account_id) }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- 3. مركز التكلفة -->
              <td v-if="costCenters.length > 0" class="px-3 py-2.5 align-middle">
                <div class="relative w-full h-9 flex items-center">
                  <select
                    :value="line.cost_center_id || ''"
                    @change="updateLineField(index, 'cost_center_id', $event.target.value || null)"
                    class="invoice-pill-editable w-full h-9 pr-2.5 pl-6 border rounded-xl text-text-secondary text-xs font-bold outline-none appearance-none cursor-pointer transition-all"
                  >
                    <option value="" class="bg-surface-section text-text-muted">
                      -- عام للقيد --
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
              </td>

              <!-- 4. مدين (Debit) -->
              <td class="px-3 py-2.5 align-middle">
                <div class="relative h-9 flex items-center justify-center">
                  <input
                    :id="`debit-${index}`"
                    type="number"
                    :value="line.debit || ''"
                    @input="handleDebitInput(index, $event.target.value)"
                    @focus="$event.target.select()"
                    @keydown.enter.prevent="handleDebitEnter(index)"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="invoice-pill-editable w-full h-9 px-2 border rounded-xl text-center font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 outline-none transition-all placeholder:text-text-muted/40"
                  />
                  <!-- زر موازنة سريعة يظهر عند وجود فرق وحقل المدين فارغ -->
                  <button
                    v-if="
                      !isBalanced &&
                      balanceDifference > 0 &&
                      !Number(line.debit) &&
                      !Number(line.credit) &&
                      totalCredit > totalDebit
                    "
                    type="button"
                    @click="autoBalanceSide(index, 'debit')"
                    class="absolute left-1.5 px-1.5 py-0.5 text-[9px] font-black rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                    title="إغلاق فرق الموازنة في الجانب المدين"
                  >
                    موازنة
                  </button>
                </div>
              </td>

              <!-- 5. دائن (Credit) -->
              <td class="px-3 py-2.5 align-middle">
                <div class="relative h-9 flex items-center justify-center">
                  <input
                    :id="`credit-${index}`"
                    type="number"
                    :value="line.credit || ''"
                    @input="handleCreditInput(index, $event.target.value)"
                    @focus="$event.target.select()"
                    @keydown.enter.prevent="moveToNextField(index, 'desc')"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="invoice-pill-editable w-full h-9 px-2 border rounded-xl text-center font-mono font-black text-sm text-rose-600 dark:text-rose-400 outline-none transition-all placeholder:text-text-muted/40"
                  />
                  <!-- زر موازنة سريعة يظهر عند وجود فرق وحقل الدائن فارغ -->
                  <button
                    v-if="
                      !isBalanced &&
                      balanceDifference > 0 &&
                      !Number(line.debit) &&
                      !Number(line.credit) &&
                      totalDebit > totalCredit
                    "
                    type="button"
                    @click="autoBalanceSide(index, 'credit')"
                    class="absolute left-1.5 px-1.5 py-0.5 text-[9px] font-black rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                    title="إغلاق فرق الموازنة في الجانب الدائن"
                  >
                    موازنة
                  </button>
                </div>
              </td>

              <!-- 6. البيان الفرعي -->
              <td class="px-3 py-2.5 align-middle">
                <div class="h-9 flex items-center">
                  <input
                    :id="`desc-${index}`"
                    type="text"
                    :value="line.description || ''"
                    @input="updateLineField(index, 'description', $event.target.value)"
                    @keydown.enter.prevent="returnToSearch"
                    placeholder="شرح السطر..."
                    class="invoice-pill-editable w-full h-9 px-3 border rounded-xl text-text-primary text-xs font-semibold outline-none transition-all placeholder:text-text-muted placeholder:font-normal"
                  />
                </div>
              </td>

              <!-- 7. حذف السطر -->
              <td class="px-3 py-2.5 text-center align-middle">
                <div class="h-9 flex items-center justify-center">
                  <button
                    type="button"
                    @click="removeLine(index)"
                    class="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-colors cursor-pointer"
                    title="حذف هذا السطر"
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
              </td>
            </tr>

            <!-- =========================================================
                 سطر البحث والإضافة الفوري المدمج داخل الجدول (POS Style)
                 ========================================================= -->
            <tr class="invoice-row-3d invoice-row-empty">
              <td class="px-3 py-2.5 text-center font-mono align-middle">
                <span
                  class="text-[9px] px-1.5 py-0.5 rounded font-sans font-bold bg-warning/15 text-warning border border-warning/30 whitespace-nowrap"
                >
                  بحث
                </span>
              </td>

              <td class="px-3 py-2.5 align-middle">
                <div class="relative w-full h-10 flex items-center">
                  <input
                    ref="searchInputRef"
                    type="text"
                    v-model="searchQuery"
                    @focus="onSearchFocus"
                    @input="onSearchInput"
                    @blur="closeDropdownDelayed"
                    @keydown="handleSearchKeydown"
                    placeholder="ابحث بكود أو اسم الحساب لإضافته فوراً للقيد..."
                    class="invoice-cell-input-3d w-full h-10 pr-9 pl-3 bg-surface-card border border-primary/50 hover:border-primary focus:border-primary rounded-xl text-text-primary text-xs font-bold outline-none transition-all placeholder:text-text-muted placeholder:font-normal"
                    autocomplete="off"
                  />

                  <span
                    class="absolute right-3 inset-y-0 flex items-center text-primary pointer-events-none"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </span>
                </div>
              </td>

              <td
                v-if="costCenters.length > 0"
                class="px-3 py-2.5 text-center text-text-muted/35 font-mono"
              >
                —
              </td>
              <td class="px-3 py-2.5 text-center text-text-muted/35 font-mono">—</td>
              <td class="px-3 py-2.5 text-center text-text-muted/35 font-mono">—</td>
              <td class="px-3 py-2.5 text-center text-text-muted/35 font-mono">—</td>
              <td class="px-3 py-2.5 text-center text-text-muted/35 font-mono">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- شريط المجاميع والموازنة المباشرة أسفل المنصة -->
      <div
        class="px-4 py-3 bg-surface-ground/70 border-t border-surface-border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3"
      >
        <!-- يمين: زر تركيز البحث السريع + عدد الأطراف -->
        <div class="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            @click="returnToSearch"
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
            <span>إضافة طرف جديد للقيد</span>
          </button>

          <span
            class="px-2.5 py-1 rounded-lg bg-surface-card border border-surface-border font-mono text-xs text-text-secondary shadow-2xs"
          >
            الأطراف المدرجة:
            <strong class="text-primary font-black text-sm mr-1">{{ lines.length }}</strong>
          </span>
        </div>

        <!-- يسار: بطاقة إجمالي المدين والدائن والفرق -->
        <div class="flex flex-wrap items-center gap-3 justify-between lg:justify-end">
          <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border shadow-2xs"
          >
            <span class="text-[11px] font-bold text-text-muted">إجمالي المدين:</span>
            <span class="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
              {{ formatNumber(totalDebit) }}
            </span>
          </div>

          <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border shadow-2xs"
          >
            <span class="text-[11px] font-bold text-text-muted">إجمالي الدائن:</span>
            <span class="font-mono text-sm font-black text-rose-600 dark:text-rose-400">
              {{ formatNumber(totalCredit) }}
            </span>
          </div>

          <div
            class="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border transition-colors"
            :class="
              isBalanced && totalDebit > 0
                ? 'bg-emerald-500/12 border-emerald-500/35 text-emerald-700 dark:text-emerald-300'
                : !isBalanced && (totalDebit > 0 || totalCredit > 0)
                  ? 'bg-rose-500/12 border-rose-500/35 text-rose-700 dark:text-rose-300'
                  : 'bg-surface-card border-surface-border text-text-secondary'
            "
          >
            <span class="text-[11px] font-black">الفرق:</span>
            <span class="font-mono text-base font-black">
              {{ formatNumber(balanceDifference) }}
            </span>
            <span
              v-if="!isBalanced && (totalDebit > 0 || totalCredit > 0)"
              class="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 animate-pulse"
            >
              غير متزن ⚠
            </span>
            <span
              v-else-if="isBalanced && totalDebit > 0"
              class="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30"
            >
              متزن ✓
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- قائمة المقترحات الطافية الذكية عبر Teleport -->
    <Teleport to="body">
      <div
        v-if="isDropdownOpen && filteredAccounts.length > 0"
        :style="dropdownStyle"
        class="fixed bg-surface-section border border-surface-border rounded-xl shadow-2xl z-[9999] max-h-64 overflow-y-auto divide-y divide-surface-border/60 text-right font-sans transition-all"
        dir="rtl"
      >
        <div
          v-for="(acc, idx) in filteredAccounts"
          :key="acc.id"
          :ref="(el) => setDropdownItemRef(el, idx)"
          @mousedown.prevent="selectAccount(acc)"
          @mouseenter="highlightedIndex = idx"
          class="p-2.5 cursor-pointer flex items-center justify-between transition-colors"
          :class="
            highlightedIndex === idx
              ? 'bg-primary/10 border-r-4 border-primary'
              : 'hover:bg-surface-ground'
          "
        >
          <div class="flex items-center gap-2.5 min-w-0 pr-1">
            <span
              class="text-xs font-mono font-black text-primary bg-primary/12 border border-primary/25 px-2 py-0.5 rounded-md shrink-0"
            >
              {{ acc.code }}
            </span>
            <span class="text-xs font-bold text-text-primary truncate">{{ acc.name }}</span>
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

      <div
        v-else-if="isDropdownOpen && searchQuery.trim() && filteredAccounts.length === 0"
        :style="dropdownStyle"
        class="fixed bg-surface-section border border-surface-border rounded-xl shadow-2xl z-[9999] p-4 text-center text-xs text-text-muted font-sans"
        dir="rtl"
      >
        لا توجد حسابات مطابقة لـ "<strong class="text-text-primary">{{ searchQuery }}</strong
        >"
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  lines: { type: Array, required: true },
  accounts: { type: Array, required: true },
  costCenters: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:lines'])

const searchInputRef = ref(null)
const dropdownItemRefs = ref([])
const searchQuery = ref('')
const isDropdownOpen = ref(false)
const highlightedIndex = ref(0)

const dropdownStyle = ref({
  top: 'auto',
  bottom: 'auto',
  right: '0px',
  width: '460px',
})

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

const filteredAccounts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) {
    return props.accounts.slice(0, 20)
  }
  return props.accounts
    .filter((acc) => {
      const nameMatch = String(acc.name || '')
        .toLowerCase()
        .includes(q)
      const codeMatch = String(acc.code || '')
        .toLowerCase()
        .includes(q)
      return nameMatch || codeMatch
    })
    .slice(0, 25)
})

const onSearchFocus = () => {
  isDropdownOpen.value = true
  highlightedIndex.value = 0
  updateDropdownPosition()
}

const onSearchInput = () => {
  isDropdownOpen.value = true
  highlightedIndex.value = 0
  updateDropdownPosition()
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
    if (filteredAccounts.value.length > 0) {
      highlightedIndex.value = (highlightedIndex.value + 1) % filteredAccounts.value.length
      scrollHighlightedIntoView()
    }
  } else if (e.key === 'ArrowUp') {
    if (!isDropdownOpen.value || filteredAccounts.value.length === 0) return
    e.preventDefault()
    highlightedIndex.value =
      (highlightedIndex.value - 1 + filteredAccounts.value.length) % filteredAccounts.value.length
    scrollHighlightedIntoView()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (isDropdownOpen.value && filteredAccounts.value.length > 0) {
      const target = filteredAccounts.value[highlightedIndex.value] || filteredAccounts.value[0]
      if (target) {
        selectAccount(target)
      }
    }
  } else if (e.key === 'Escape') {
    isDropdownOpen.value = false
  }
}

const selectAccount = (selectedAcc) => {
  if (!selectedAcc) return

  const newLines = [...props.lines]
  newLines.push({
    _key: Date.now() + Math.random(),
    account_id: selectedAcc.id,
    cost_center_id: '',
    debit: 0,
    credit: 0,
    description: '',
  })
  emit('update:lines', newLines)

  searchQuery.value = ''
  isDropdownOpen.value = false
  highlightedIndex.value = 0

  const newIndex = newLines.length - 1
  nextTick(() => {
    moveToNextField(newIndex, 'debit')
  })
}

const getAccountCode = (id) => props.accounts.find((a) => a.id === id)?.code || ''
const getAccountName = (id) => props.accounts.find((a) => a.id === id)?.name || ''

const moveToNextField = (index, fieldName) => {
  const el = document.getElementById(`${fieldName}-${index}`)
  if (el) {
    el.focus()
    if (typeof el.select === 'function') {
      el.select()
    }
  }
}

const handleDebitEnter = (index) => {
  const currentLine = props.lines[index]
  if (currentLine && Number(currentLine.debit) > 0) {
    moveToNextField(index, 'desc')
  } else {
    moveToNextField(index, 'credit')
  }
}

const returnToSearch = () => {
  nextTick(() => {
    searchInputRef.value?.focus()
    searchInputRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })
}

const totalDebit = computed(() =>
  props.lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0),
)
const totalCredit = computed(() =>
  props.lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0),
)
const balanceDifference = computed(() => Math.abs(totalDebit.value - totalCredit.value))
const isBalanced = computed(() => balanceDifference.value < 0.001)

const updateLineField = (index, field, value) => {
  const newLines = [...props.lines]
  newLines[index] = { ...newLines[index], [field]: value }
  emit('update:lines', newLines)
}

const removeLine = (index) => {
  const newLines = [...props.lines]
  newLines.splice(index, 1)
  emit('update:lines', newLines)
}

const handleDebitInput = (index, rawVal) => {
  const val = Number(rawVal) || 0
  const newLines = [...props.lines]
  newLines[index] = {
    ...newLines[index],
    debit: val,
    credit: val > 0 ? 0 : newLines[index].credit,
  }
  emit('update:lines', newLines)
}

const handleCreditInput = (index, rawVal) => {
  const val = Number(rawVal) || 0
  const newLines = [...props.lines]
  newLines[index] = {
    ...newLines[index],
    credit: val,
    debit: val > 0 ? 0 : newLines[index].debit,
  }
  emit('update:lines', newLines)
}

const autoBalanceSide = (index, side) => {
  const diff = Math.round(balanceDifference.value * 100) / 100
  if (diff <= 0) return
  const newLines = [...props.lines]
  newLines[index] = {
    ...newLines[index],
    debit: side === 'debit' ? diff : 0,
    credit: side === 'credit' ? diff : 0,
  }
  emit('update:lines', newLines)
  nextTick(() => {
    moveToNextField(index, 'desc')
  })
}

const formatNumber = (num) =>
  Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const handleWindowScrollOrResize = () => {
  if (isDropdownOpen.value) {
    updateDropdownPosition()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleWindowScrollOrResize, true)
  window.addEventListener('resize', handleWindowScrollOrResize)
  nextTick(() => {
    searchInputRef.value?.focus()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleWindowScrollOrResize, true)
  window.removeEventListener('resize', handleWindowScrollOrResize)
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
