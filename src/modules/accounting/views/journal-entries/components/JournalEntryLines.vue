<!--src\modules\accounting\views\journal-entries\components\JournalEntryLines.vue-->
<template>
  <div
    class="bg-surface-section rounded-xl border border-surface-border mb-6 shadow-sm flex flex-col"
  >
    <div class="bg-primary/5 border-b border-primary/20 p-4">
      <div class="max-w-2xl">
        <label class="block text-sm font-bold text-primary mb-2 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          البحث السريع (أضف حساباً للقيد)
        </label>

        <div class="relative">
          <AutoComplete
            ref="posSearchInput"
            v-model="searchQuery"
            :suggestions="filteredAccounts"
            @complete="searchAccounts"
            @item-select="onAccountSelected"
            optionLabel="name"
            placeholder="ابحث باسم او رقم الحساب"
            class="w-full"
            :pt="{
              root: { class: 'w-full' },

              /* 1. إصلاح مشكلة اللون: استخدام ألوان الثيم (surface) بدلاً من الأبيض الصريح */
              input: {
                class:
                  'w-full px-4 py-3 text-sm font-bold text-white bg-slate-800 border border-primary/50 rounded-lg focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all placeholder-gray-400',
              },

              panel: {
                class:
                  'bg-surface-section border border-surface-border shadow-2xl rounded-xl z-[9999] max-h-60 overflow-y-auto',
              },

              /* 2. تلوين العنصر المحدد بالأسهم بوضوح شديد */
              item: ({ context }) => ({
                class: [
                  'px-4 py-3 cursor-pointer transition-all duration-200 border-b border-surface-border/30 last:border-0 outline-none',
                  context.focused || context.selected
                    ? 'bg-primary/10 text-primary border-r-4 border-r-primary font-bold'
                    : 'hover:bg-surface-border/50 text-text-primary',
                ],
              }),
            }"
          >
            <template #option="slotProps">
              <div class="flex items-center gap-3">
                <span
                  class="text-sm font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded"
                  >{{ slotProps.option.code }}</span
                >
                <span class="text-sm font-semibold">{{ slotProps.option.name }}</span>
              </div>
            </template>
          </AutoComplete>
        </div>
      </div>
    </div>

    <div class="p-2">
      <div
        class="hidden lg:grid grid-cols-12 gap-3 px-3 mb-2 text-[11px] font-bold text-text-muted uppercase tracking-wider"
      >
        <div class="col-span-4">الحساب المالي</div>
        <div class="col-span-2 text-center">مدين (Debit)</div>
        <div class="col-span-2 text-center">دائن (Credit)</div>
        <div class="col-span-3">البيان الفرعي</div>
        <div class="col-span-1 text-center">حذف</div>
      </div>

      <div v-if="lines.length === 0" class="py-12 text-center text-text-muted">
        <svg
          class="w-12 h-12 mx-auto mb-3 opacity-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p>استخدم مربع البحث بالأعلى لإضافة حسابات للقيد</p>
      </div>

      <TransitionGroup name="list" tag="div" class="space-y-1 relative">
        <div
          v-for="(line, index) in lines"
          :key="line._key"
          class="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 bg-surface-bg border border-surface-border rounded-lg items-center"
        >
          <div class="lg:col-span-4 flex flex-col">
            <span class="text-xs font-mono font-bold text-primary">{{
              getAccountCode(line.account_id)
            }}</span>
            <span class="text-sm font-semibold text-text-primary truncate">{{
              getAccountName(line.account_id)
            }}</span>
          </div>

          <div class="lg:col-span-2">
            <label class="lg:hidden text-xs text-text-muted mb-1 block">مدين</label>
            <AppInput
              :id="`debit-${index}`"
              type="number"
              v-model.number="line.debit"
              @input="handleDebitInput(index)"
              @keydown.enter.prevent="moveToNextField(index, 'credit')"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="font-mono text-center"
            />
          </div>

          <div class="lg:col-span-2">
            <label class="lg:hidden text-xs text-text-muted mb-1 block">دائن</label>
            <AppInput
              :id="`credit-${index}`"
              type="number"
              v-model.number="line.credit"
              @input="handleCreditInput(index)"
              @keydown.enter.prevent="moveToNextField(index, 'desc')"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="font-mono text-center"
            />
          </div>

          <div class="lg:col-span-3">
            <label class="lg:hidden text-xs text-text-muted mb-1 block">البيان</label>
            <AppInput
              :id="`desc-${index}`"
              type="text"
              v-model="line.description"
              @keydown.enter.prevent="returnToSearch()"
              placeholder="شرح السطر..."
            />
          </div>

          <div class="lg:col-span-1 flex items-center justify-center">
            <button
              type="button"
              @click="removeLine(index)"
              class="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
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
        </div>
      </TransitionGroup>
    </div>

    <div
      class="p-5 border-t border-surface-border transition-colors duration-300"
      :class="isBalanced && totalDebit > 0 ? 'bg-emerald-500/5' : 'bg-surface-bg'"
    >
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex gap-8">
          <div class="flex flex-col items-center">
            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1"
              >إجمالي المدين</span
            >
            <span class="text-xl font-mono font-bold text-text-primary">{{
              formatNumber(totalDebit)
            }}</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1"
              >إجمالي الدائن</span
            >
            <span class="text-xl font-mono font-bold text-text-primary">{{
              formatNumber(totalCredit)
            }}</span>
          </div>
        </div>
        <div class="flex flex-col items-center md:items-end min-w-[150px]">
          <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1"
            >الفرق (الموازنة)</span
          >
          <span
            class="text-2xl font-mono font-black"
            :class="isBalanced ? 'text-emerald-500' : 'text-rose-500'"
          >
            {{ formatNumber(balanceDifference) }}
          </span>
          <div class="mt-1 h-4">
            <span
              v-if="!isBalanced && totalDebit > 0"
              class="text-[10px] font-bold text-rose-500 animate-pulse bg-rose-50 px-2 py-0.5 rounded"
              >القيد غير متزن ⚠</span
            >
            <span
              v-else-if="isBalanced && totalDebit > 0"
              class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded"
              >القيد متزن وجاهز ✓</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AutoComplete from 'primevue/autocomplete'

const props = defineProps({
  lines: { type: Array, required: true },
  accounts: { type: Array, required: true },
})

const emit = defineEmits(['update:lines'])

// --- متغيرات البحث السريع (POS Style) ---
const posSearchInput = ref(null)
const searchQuery = ref('')
const filteredAccounts = ref([])

// دالة البحث (تعمل مع رقم الحساب واسمه)
const searchAccounts = (event) => {
  setTimeout(() => {
    if (!event.query.trim().length) {
      filteredAccounts.value = [...props.accounts]
    } else {
      filteredAccounts.value = props.accounts.filter((acc) => {
        return acc.name.includes(event.query) || acc.code.includes(event.query)
      })
    }
  }, 50)
}

// عند اختيار حساب من شريط البحث
const onAccountSelected = (event) => {
  const selectedAcc = event.value

  // إضافة السطر الجديد
  const newLines = [...props.lines]
  newLines.push({
    _key: Date.now(),
    account_id: selectedAcc.id,
    debit: 0,
    credit: 0,
    description: '',
  })
  emit('update:lines', newLines)

  // تفريغ شريط البحث فوراً ليكون جاهزاً للمرة القادمة
  searchQuery.value = ''

  // نقل المؤشر إلى حقل "المدين" في السطر الجديد الذي تم إنشاؤه للتو
  const newIndex = newLines.length - 1
  setTimeout(() => {
    moveToNextField(newIndex, 'debit')
  }, 50)
}

// دوال جلب الأسماء والأكواد للعرض في الجدول
const getAccountCode = (id) => props.accounts.find((a) => a.id === id)?.code || ''
const getAccountName = (id) => props.accounts.find((a) => a.id === id)?.name || ''

// --- إدارة التنقل بلوحة المفاتيح (الكيبورد) ---
const moveToNextField = (index, fieldName) => {
  const el = document.getElementById(`${fieldName}-${index}`)
  if (el) {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
    if (input) {
      input.focus()
      input.select()
    }
  }
}

// العودة لشريط البحث عند الانتهاء من السطر
const returnToSearch = () => {
  if (posSearchInput.value) {
    const inputElement = posSearchInput.value.$el.querySelector('input')
    if (inputElement) {
      inputElement.focus()
    }
  }
}

// --- العمليات الحسابية وإدارة الأسطر العادية ---
const totalDebit = computed(() =>
  props.lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0),
)
const totalCredit = computed(() =>
  props.lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0),
)
const balanceDifference = computed(() => Math.abs(totalDebit.value - totalCredit.value))
const isBalanced = computed(() => balanceDifference.value < 0.001)

const removeLine = (index) => {
  const newLines = [...props.lines]
  newLines.splice(index, 1)
  emit('update:lines', newLines)
}

const handleDebitInput = (index) => {
  if (props.lines[index].debit > 0) props.lines[index].credit = 0
  emit('update:lines', props.lines)
}

const handleCreditInput = (index) => {
  if (props.lines[index].credit > 0) props.lines[index].debit = 0
  emit('update:lines', props.lines)
}

const formatNumber = (num) =>
  Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
