<!-- src/modules/accounting/views/dashboard/components/AccountingTreasuryAndParties.vue -->
<template>
  <section class="space-y-6">
    <!-- =========================================================
           1. ملخص السيولة حسب العملات + جدول أرصدة الخزائن والبنوك
           ========================================================= -->
    <div
      class="dashboard-enter dashboard-luminous-card rounded-xl p-5 space-y-5"
      style="--stagger-index: 9; --accent-rgb: 16, 185, 129"
    >
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3.5">
          <div
            class="dashboard-icon-gem flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          >
            <BuildingLibraryIcon class="h-5 w-5 drop-shadow-sm" stroke-width="2" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-text-primary">
              موقف السيولة وأرصدة الخزائن والحسابات البنكية
            </h3>
            <p class="text-xs font-medium text-text-muted">
              الأرصدة النقدية المتاحة بالعملة الأصلية والمعادل بـ ({{ baseCurrencyCode }})
            </p>
          </div>
        </div>

        <!-- تبويبات تصفية الحسابات النقدية -->
        <div
          class="inline-flex items-center rounded-xl border border-surface-border bg-surface-ground/80 p-1 self-start sm:self-auto shadow-inner"
        >
          <button
            v-for="tab in treasuryTabs"
            :key="tab.key"
            type="button"
            @click="selectedTreasuryFilter = tab.key"
            class="rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="
              selectedTreasuryFilter === tab.key
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                : 'text-text-secondary hover:text-text-primary'
            "
          >
            {{ tab.label }}
            <span class="opacity-85 mr-1">({{ tab.count }})</span>
          </button>
        </div>
      </div>

      <!-- بطاقات تجميع السيولة حسب كل عملة -->
      <div
        v-if="liquidityByCurrency.length > 0"
        class="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
      >
        <div
          v-for="(curr, cIdx) in liquidityByCurrency"
          :key="curr.currency_code"
          class="vault-plate-card group rounded-xl p-4 flex flex-col justify-between gap-2.5"
          :style="{ '--plate-accent': getCurrencyAccent(cIdx) }"
        >
          <!-- شريط لمعة علوي -->
          <span class="vault-plate-rim"></span>

          <div class="relative z-10 flex items-center justify-between gap-2">
            <span class="text-xs font-extrabold text-text-secondary truncate">
              {{ curr.currency_name }}
            </span>
            <span
              class="rounded-lg px-2.5 py-0.5 text-[11px] font-black tracking-wider text-white shadow-sm ring-1 ring-white/30"
              :style="{ background: getCurrencyBadgeGradient(cIdx) }"
            >
              {{ curr.currency_code }}
            </span>
          </div>

          <div class="relative z-10 flex items-baseline gap-1.5" dir="ltr">
            <span class="text-xl font-black tracking-tight text-text-primary tabular-nums">
              {{ formatNumber(curr.native_total) }}
            </span>
            <span class="text-xs font-extrabold text-text-muted">
              {{ curr.currency_symbol || curr.currency_code }}
            </span>
          </div>

          <div
            v-if="curr.currency_code !== baseCurrencyCode"
            class="relative z-10 text-[11px] text-text-muted flex items-center justify-between border-t border-surface-border/60 pt-2"
          >
            <span class="font-semibold">المعادل الأساسي:</span>
            <span
              class="font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums"
              dir="ltr"
            >
              {{ formatNumber(curr.base_total) }} {{ baseCurrencyCode }}
            </span>
          </div>
          <div
            v-else
            class="relative z-10 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border-t border-surface-border/50 pt-2 flex items-center justify-between"
          >
            <span>عملة النظام الأساسية</span>
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
          </div>
        </div>
      </div>

      <!-- جدول تفاصيل الخزائن والحسابات البنكية -->
      <div
        v-if="filteredTreasuryAccounts.length > 0"
        class="relative z-10 overflow-x-auto rounded-xl border border-surface-border shadow-md"
      >
        <table class="min-w-full divide-y divide-surface-border text-sm">
          <thead class="invoice-thead-3d">
            <tr>
              <th class="px-4 py-3 text-right text-xs font-extrabold">الحساب النقدي / البنك</th>
              <th class="px-4 py-3 text-right text-xs font-extrabold">النوع</th>
              <th class="px-4 py-3 text-center text-xs font-extrabold">العملة</th>
              <th class="px-4 py-3 text-left text-xs font-extrabold">الرصيد الأصلي</th>
              <th class="px-4 py-3 text-left text-xs font-extrabold">
                المعادل ({{ baseCurrencyCode }})
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-border/70 bg-surface-section">
            <tr
              v-for="acc in filteredTreasuryAccounts"
              :key="`${acc.kind}-${acc.id}`"
              class="transition-all duration-150 hover:bg-emerald-500/[0.06] dark:hover:bg-emerald-400/[0.09]"
            >
              <td class="px-4 py-3">
                <div class="font-extrabold text-text-primary">{{ acc.name }}</div>
                <div
                  v-if="acc.account_number"
                  class="text-[11px] text-text-muted font-mono mt-0.5"
                  dir="ltr"
                >
                  {{ acc.account_number }}
                </div>
              </td>

              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-extrabold shadow-sm"
                  :class="
                    acc.kind === 'box'
                      ? 'bg-amber-500/15 text-amber-700 border border-amber-500/40 dark:bg-amber-400/20 dark:text-amber-300 dark:border-amber-400/40'
                      : 'bg-sky-500/15 text-sky-700 border border-sky-500/40 dark:bg-sky-400/20 dark:text-sky-300 dark:border-sky-400/40'
                  "
                >
                  <WalletIcon v-if="acc.kind === 'box'" class="h-3.5 w-3.5" />
                  <CreditCardIcon v-else class="h-3.5 w-3.5" />
                  {{ acc.kind_label }}
                </span>
              </td>

              <td class="px-4 py-3 text-center">
                <span
                  class="inline-block rounded-md border border-surface-border bg-surface-card px-2.5 py-0.5 text-xs font-black text-text-primary shadow-sm"
                >
                  {{ acc.currency_code }}
                </span>
                <div
                  v-if="Number(acc.exchange_rate) !== 1"
                  class="text-[10px] font-bold text-text-muted mt-0.5 tabular-nums"
                  dir="ltr"
                >
                  × {{ acc.exchange_rate }}
                </div>
              </td>

              <td
                class="px-4 py-3 text-left font-extrabold text-text-primary tabular-nums"
                dir="ltr"
              >
                {{ formatNumber(acc.native_balance) }}
                <span class="text-xs font-bold text-text-muted ml-1">
                  {{ acc.currency_symbol || acc.currency_code }}
                </span>
              </td>

              <td
                class="px-4 py-3 text-left font-black tabular-nums"
                :class="
                  Number(acc.base_balance) >= 0
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-rose-700 dark:text-rose-300'
                "
                dir="ltr"
              >
                {{ formatNumber(acc.base_balance) }}
                <span class="text-xs font-bold text-text-muted ml-1">{{ baseCurrencyCode }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-else
        class="relative z-10 rounded-xl border border-dashed border-surface-border py-8 text-center text-xs font-semibold text-text-muted"
      >
        لا توجد حسابات نقدية أو بنكية نشطة مطابقة للتصفية الحالية.
      </div>
    </div>

    <!-- =========================================================
           2. أعلى الأطراف (المدينون والدائنون) + آخر 8 قيود مرحّلة
           ========================================================= -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <!-- أعلى العملاء المدينين والموردين الدائنين (6 أعمدة) -->
      <div
        class="xl:col-span-6 dashboard-enter dashboard-luminous-card rounded-xl p-5 flex flex-col justify-between gap-4"
        style="--stagger-index: 10; --accent-rgb: 99, 102, 241"
      >
        <div
          class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div class="flex items-center gap-3.5">
            <div
              class="dashboard-icon-gem flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            >
              <UsersIcon class="h-5 w-5 drop-shadow-sm" stroke-width="2" />
            </div>
            <div>
              <h3 class="text-base font-extrabold text-text-primary">
                أعلى الذمم المدينة والدائنة
              </h3>
              <p class="text-xs font-medium text-text-muted">
                أكبر 5 أرصدة مستحقة للتحصيل أو السداد حتى نهاية الفترة
              </p>
            </div>
          </div>

          <!-- تبديل بين المدينين والدائنين -->
          <div
            class="inline-flex items-center rounded-xl border border-surface-border bg-surface-ground/80 p-1 self-start sm:self-auto shadow-inner"
          >
            <button
              type="button"
              @click="activePartyTab = 'debtors'"
              class="rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer"
              :class="
                activePartyTab === 'debtors'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                  : 'text-text-secondary hover:text-text-primary'
              "
            >
              المدينون ({{ debtorsList.length }})
            </button>
            <button
              type="button"
              @click="activePartyTab = 'creditors'"
              class="rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer"
              :class="
                activePartyTab === 'creditors'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30'
                  : 'text-text-secondary hover:text-text-primary'
              "
            >
              الدائنون ({{ creditorsList.length }})
            </button>
          </div>
        </div>

        <!-- قائمة الأطراف مع أشرطة الوزن النسبي -->
        <div v-if="currentPartiesList.length > 0" class="relative z-10 space-y-3 flex-1">
          <div
            v-for="(party, idx) in currentPartiesList"
            :key="`${party.party_type}-${party.party_id}`"
            class="vault-plate-card rounded-xl p-3.5 transition-all duration-200"
            :style="{
              '--plate-accent': activePartyTab === 'debtors' ? '16, 185, 129' : '244, 63, 94',
            }"
          >
            <div class="relative z-10 flex items-center justify-between gap-3 mb-2.5">
              <div class="flex items-center gap-2.5 min-w-0">
                <span
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white shadow-sm"
                  :class="
                    activePartyTab === 'debtors'
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
                      : 'bg-gradient-to-br from-rose-400 to-pink-600'
                  "
                >
                  {{ idx + 1 }}
                </span>
                <span class="text-sm font-extrabold text-text-primary truncate">
                  {{ party.name }}
                </span>
              </div>

              <span
                class="text-sm font-black tabular-nums shrink-0"
                :class="
                  activePartyTab === 'debtors'
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-rose-700 dark:text-rose-300'
                "
                dir="ltr"
              >
                {{ formatNumber(party.balance) }}
                <span class="text-[11px] font-bold text-text-muted ml-1">
                  {{ baseCurrencyCode }}
                </span>
              </span>
            </div>

            <!-- قناة التقدم -->
            <div class="relative z-10 laser-progress-track h-2 w-full rounded-full">
              <div
                class="h-full rounded-full transition-all duration-700"
                :class="activePartyTab === 'debtors' ? 'laser-fill-emerald' : 'laser-fill-rose'"
                :style="{ width: `${calculatePartyPercentage(party.balance)}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="relative z-10 flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-10 text-center text-xs font-semibold text-text-muted"
        >
          {{
            activePartyTab === 'debtors'
              ? 'لا توجد أرصدة عملاء مدينة قائمة حالياً.'
              : 'لا توجد أرصدة موردين دائنة قائمة حالياً.'
          }}
        </div>
      </div>

      <!-- آخر 8 قيود مالية مرحّلة (6 أعمدة) -->
      <div
        class="xl:col-span-6 dashboard-enter dashboard-luminous-card rounded-xl p-5 flex flex-col justify-between gap-4"
        style="--stagger-index: 11; --accent-rgb: 255, 125, 20"
      >
        <div class="relative z-10 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3.5">
            <div
              class="dashboard-icon-gem flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            >
              <ClockIcon class="h-5 w-5 drop-shadow-sm" stroke-width="2" />
            </div>
            <div>
              <h3 class="text-base font-extrabold text-text-primary">
                آخر الحركات المالية المرحّلة
              </h3>
              <p class="text-xs font-medium text-text-muted">
                أحدث 8 قيود يومية تم اعتمادها وترحيلها في الدفاتر
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="$emit('view-all-entries')"
            class="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-3.5 py-1.5 text-xs font-extrabold text-primary dark:text-primary-light hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
          >
            <span>سجل القيود</span>
            <ArrowLeftIcon class="h-3.5 w-3.5" />
          </button>
        </div>

        <!-- الخط الزمني للقيود -->
        <div v-if="recentActivities.length > 0" class="relative z-10 space-y-2.5 flex-1">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            @click="$emit('open-entry', activity)"
            class="activity-beam-row group flex items-start justify-between gap-3 rounded-xl p-3.5 cursor-pointer"
          >
            <div class="flex items-start gap-3 min-w-0">
              <div
                class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-600 shadow-[0_0_10px_rgba(255,125,20,0.85)] group-hover:scale-125 transition-transform"
              ></div>

              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="rounded-md bg-primary/15 border border-primary/35 px-2 py-0.5 text-xs font-black text-primary dark:text-primary-light font-mono"
                    dir="ltr"
                  >
                    {{ activity.entry_number }}
                  </span>
                  <span
                    class="rounded-md bg-surface-card border border-surface-border px-2 py-0.5 text-[10px] font-extrabold text-text-secondary"
                  >
                    {{ activity.source_label }}
                  </span>
                  <span class="text-[11px] font-semibold text-text-muted">
                    {{ activity.date }}
                  </span>
                </div>

                <p class="mt-1.5 text-xs font-extrabold text-text-primary truncate max-w-md">
                  {{ activity.description || 'قيد محاسبي مرحّل' }}
                </p>

                <p
                  v-if="activity.created_by"
                  class="mt-0.5 text-[10px] font-medium text-text-muted"
                >
                  بواسطة: {{ activity.created_by }}
                </p>
              </div>
            </div>

            <div class="text-left shrink-0">
              <div
                class="text-xs sm:text-sm font-black text-text-primary tabular-nums group-hover:text-primary transition-colors"
                dir="ltr"
              >
                {{ formatNumber(activity.total_amount) }}
              </div>
              <div class="text-[10px] font-extrabold text-text-muted">{{ baseCurrencyCode }}</div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="relative z-10 flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-10 text-center text-xs font-semibold text-text-muted"
        >
          لا توجد قيود يومية مرحّلة لعرضها ضمن النطاق المحدد.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  BuildingLibraryIcon,
  WalletIcon,
  CreditCardIcon,
  UsersIcon,
  ClockIcon,
  ArrowLeftIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  treasuryAccounts: {
    type: Array,
    default: () => [],
  },
  liquidityByCurrency: {
    type: Array,
    default: () => [],
  },
  topParties: {
    type: Object,
    default: () => ({ top_debtors: [], top_creditors: [] }),
  },
  recentActivities: {
    type: Array,
    default: () => [],
  },
  baseCurrency: {
    type: Object,
    default: () => ({ code: 'SDG', symbol: '' }),
  },
})

defineEmits(['open-entry', 'view-all-entries'])

const baseCurrencyCode = computed(() => props.baseCurrency?.code || 'SDG')

const currencyAccents = ['16, 185, 129', '14, 165, 233', '245, 158, 11', '168, 85, 247']
const currencyGradients = [
  'linear-gradient(135deg, #10b981, #047857)',
  'linear-gradient(135deg, #38bdf8, #1d4ed8)',
  'linear-gradient(135deg, #fbbf24, #d97706)',
  'linear-gradient(135deg, #c084fc, #7e22ce)',
]

function getCurrencyAccent(index) {
  return currencyAccents[index % currencyAccents.length]
}

function getCurrencyBadgeGradient(index) {
  return currencyGradients[index % currencyGradients.length]
}

// --- تصفية الخزائن والبنوك ---
const selectedTreasuryFilter = ref('all')

const treasuryTabs = computed(() => {
  const all = props.treasuryAccounts || []
  const boxesCount = all.filter((a) => a.kind === 'box').length
  const banksCount = all.filter((a) => a.kind === 'bank').length

  return [
    { key: 'all', label: 'الكل', count: all.length },
    { key: 'box', label: 'الخزائن', count: boxesCount },
    { key: 'bank', label: 'البنوك', count: banksCount },
  ]
})

const filteredTreasuryAccounts = computed(() => {
  const all = props.treasuryAccounts || []
  if (selectedTreasuryFilter.value === 'all') return all
  return all.filter((acc) => acc.kind === selectedTreasuryFilter.value)
})

// --- تبويبات المدينين والدائنين ---
const activePartyTab = ref('debtors')

const debtorsList = computed(() => props.topParties?.top_debtors || [])
const creditorsList = computed(() => props.topParties?.top_creditors || [])

const currentPartiesList = computed(() => {
  return activePartyTab.value === 'debtors' ? debtorsList.value : creditorsList.value
})

const maxPartyBalance = computed(() => {
  if (!currentPartiesList.value.length) return 1
  return Math.max(...currentPartiesList.value.map((p) => Number(p.balance) || 0), 1)
})

function calculatePartyPercentage(balance) {
  const val = Number(balance) || 0
  return Math.min(100, Math.max(8, (val / maxPartyBalance.value) * 100))
}

function formatNumber(value) {
  const num = Number(value) || 0
  const hasDecimals = num % 1 !== 0
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(num)
}
</script>

<style scoped>
/* شريط اللمعة الليزرية العلوي داخل الصفيحة */
.vault-plate-rim {
  position: absolute;
  top: 0;
  inset-inline: 18%;
  height: 2px;
  border-radius: 9999px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--plate-accent, 16, 185, 129), 0.95),
    transparent
  );
  pointer-events: none;
}

/* قناة التقدم المتوافقة تلقائياً مع الوضعين الفاتح والداكن عبر متغيرات الثيم */
.laser-progress-track {
  background-color: rgb(var(--color-surface-ground));
  border: 1px solid rgba(var(--color-surface-border), 0.65);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.16);
  overflow: hidden;
}

.laser-fill-emerald {
  background: linear-gradient(90deg, #059669 0%, #10b981 65%, #6ee7b7 100%);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.55);
}

.laser-fill-rose {
  background: linear-gradient(90deg, #e11d48 0%, #f43f5e 65%, #fda4af 100%);
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.55);
}
</style>
