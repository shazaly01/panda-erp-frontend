<!-- src/modules/sales/views/dashboard/components/SalesShiftsAndInvoices.vue -->
<template>
  <section class="space-y-6">
    <!-- =========================================================
           1. المراقبة الحية لورديات الكاشير ونقاط البيع (POS Shifts)
           ========================================================= -->
    <div
      class="dashboard-enter dashboard-luminous-card rounded-xl p-5 space-y-5"
      style="--stagger-index: 9; --accent-rgb: 14, 165, 233"
    >
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3.5">
          <div
            class="dashboard-icon-gem flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          >
            <ComputerDesktopIcon class="h-5 w-5 drop-shadow-sm" stroke-width="2" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-text-primary">
              المراقبة الحية لورديات الكاشير ونقاط البيع
            </h3>
            <p class="text-xs font-medium text-text-muted">
              متابعة مبيعات الجلسات المفتوحة حالياً ومطابقة النقد الفعلي للورديات المغلقة حديثاً
            </p>
          </div>
        </div>

        <!-- تبويبات التبديل بين الورديات المفتوحة والمغلقة -->
        <div
          class="inline-flex items-center rounded-xl border border-surface-border bg-surface-ground/80 p-1 self-start sm:self-auto shadow-inner"
        >
          <button
            type="button"
            @click="activeShiftTab = 'open'"
            class="rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            :class="
              activeShiftTab === 'open'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
                : 'text-text-secondary hover:text-text-primary'
            "
          >
            <span
              v-if="openShifts.length > 0"
              class="h-2 w-2 rounded-full"
              :class="activeShiftTab === 'open' ? 'bg-white animate-pulse' : 'bg-emerald-500'"
            ></span>
            <span>الورديات المفتوحة</span>
            <span class="opacity-85">({{ openShifts.length }})</span>
          </button>

          <button
            type="button"
            @click="activeShiftTab = 'closed'"
            class="rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="
              activeShiftTab === 'closed'
                ? 'bg-gradient-to-r from-slate-600 to-slate-800 text-white shadow-md shadow-slate-600/30'
                : 'text-text-secondary hover:text-text-primary'
            "
          >
            <span>آخر الورديات المغلقة</span>
            <span class="opacity-85 mr-1">({{ recentClosedShifts.length }})</span>
          </button>
        </div>
      </div>

      <!-- أ. عرض الورديات المفتوحة حالياً (بطاقات حية) -->
      <template v-if="activeShiftTab === 'open'">
        <div
          v-if="openShifts.length > 0"
          class="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <div
            v-for="shift in openShifts"
            :key="shift.id"
            class="vault-plate-card rounded-xl p-4 flex flex-col justify-between gap-3.5"
            style="--plate-accent: 14, 165, 233"
          >
            <span class="vault-plate-rim"></span>

            <!-- رأس بطاقة الوردية -->
            <div class="relative z-10 flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span
                    class="rounded-md bg-sky-500/15 border border-sky-500/35 px-2 py-0.5 text-xs font-black text-sky-700 dark:text-sky-300 font-mono"
                    dir="ltr"
                  >
                    {{ shift.shift_number }}
                  </span>
                  <span
                    class="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    مفتوحة
                  </span>
                </div>
                <p class="mt-1.5 text-sm font-extrabold text-text-primary truncate">
                  {{ shift.cashier_name || 'كاشير غير محدد' }}
                </p>
                <p class="text-[11px] font-medium text-text-muted truncate">
                  {{ shift.warehouse_name || 'المستودع الرئيسي' }}
                  <span v-if="shift.opened_at" class="mx-1">•</span>
                  <span v-if="shift.opened_at" dir="ltr">{{ shift.opened_at }}</span>
                </p>
              </div>

              <div class="text-left shrink-0">
                <span class="block text-[10px] font-bold text-text-muted">صافي المبيعات الحية</span>
                <span
                  class="text-lg font-black text-sky-700 dark:text-sky-300 tabular-nums"
                  dir="ltr"
                >
                  {{ formatNumber(shift.net_sales) }}
                </span>
                <span class="block text-[10px] font-extrabold text-text-muted">
                  {{ baseCurrencyCode }}
                </span>
              </div>
            </div>

            <!-- تفاصيل حركة الوردية -->
            <div
              class="relative z-10 grid grid-cols-3 gap-2 rounded-lg border border-surface-border/70 bg-surface-ground/60 px-3 py-2 text-center"
            >
              <div>
                <span class="block text-[10px] font-semibold text-text-muted">عهدة البداية</span>
                <span class="text-xs font-extrabold text-text-primary tabular-nums" dir="ltr">
                  {{ formatNumber(shift.opening_cash) }}
                </span>
              </div>
              <div class="border-x border-surface-border/70">
                <span class="block text-[10px] font-semibold text-text-muted">الفواتير</span>
                <span class="text-xs font-extrabold text-text-primary tabular-nums">
                  {{ shift.invoices_count }}
                </span>
              </div>
              <div>
                <span class="block text-[10px] font-semibold text-text-muted">المرتجعات</span>
                <span
                  class="text-xs font-extrabold tabular-nums"
                  :class="
                    Number(shift.live_returns) > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-text-secondary'
                  "
                  dir="ltr"
                >
                  {{ formatNumber(shift.live_returns) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="relative z-10 rounded-xl border border-dashed border-surface-border py-8 text-center text-xs font-semibold text-text-muted"
        >
          لا توجد ورديات كاشير مفتوحة حالياً ضمن نطاق التصفية المحدد.
        </div>
      </template>

      <!-- ب. جدول آخر 5 ورديات مغلقة ومطابقة النقدية -->
      <template v-else>
        <div
          v-if="recentClosedShifts.length > 0"
          class="relative z-10 overflow-x-auto rounded-xl border border-surface-border shadow-md"
        >
          <table class="min-w-full divide-y divide-surface-border text-sm">
            <thead class="invoice-thead-3d">
              <tr>
                <th class="px-4 py-3 text-right text-xs font-extrabold">الوردية / الكاشير</th>
                <th class="px-4 py-3 text-right text-xs font-extrabold">الإغلاق والاعتماد</th>
                <th class="px-4 py-3 text-left text-xs font-extrabold">إجمالي المبيعات</th>
                <th class="px-4 py-3 text-left text-xs font-extrabold">النقد المتوقع</th>
                <th class="px-4 py-3 text-left text-xs font-extrabold">النقد الفعلي</th>
                <th class="px-4 py-3 text-center text-xs font-extrabold">الفرق / المطابقة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-border/70 bg-surface-section">
              <tr
                v-for="shift in recentClosedShifts"
                :key="shift.id"
                class="transition-colors duration-150 hover:bg-primary/[0.04] dark:hover:bg-primary/[0.08]"
              >
                <td class="px-4 py-3">
                  <span
                    class="inline-block rounded-md bg-surface-card border border-surface-border px-2 py-0.5 text-xs font-black text-text-primary font-mono"
                    dir="ltr"
                  >
                    {{ shift.shift_number }}
                  </span>
                  <div class="mt-1 text-xs font-extrabold text-text-primary">
                    {{ shift.cashier_name || 'غير محدد' }}
                  </div>
                </td>

                <td class="px-4 py-3">
                  <div class="text-xs font-semibold text-text-secondary" dir="ltr">
                    {{ shift.closed_at || '—' }}
                  </div>
                  <div v-if="shift.closed_by" class="text-[11px] text-text-muted mt-0.5">
                    بواسطة: {{ shift.closed_by }}
                  </div>
                </td>

                <td
                  class="px-4 py-3 text-left font-extrabold text-text-primary tabular-nums"
                  dir="ltr"
                >
                  {{ formatNumber(shift.total_sales) }}
                  <span class="text-[11px] font-bold text-text-muted ml-1">
                    {{ baseCurrencyCode }}
                  </span>
                </td>

                <td
                  class="px-4 py-3 text-left font-bold text-text-secondary tabular-nums"
                  dir="ltr"
                >
                  {{ formatNumber(shift.closing_cash) }}
                </td>

                <td
                  class="px-4 py-3 text-left font-extrabold text-text-primary tabular-nums"
                  dir="ltr"
                >
                  {{ formatNumber(shift.actual_cash) }}
                </td>

                <td class="px-4 py-3 text-center">
                  <span
                    v-if="Math.abs(Number(shift.difference || 0)) < 0.01"
                    class="inline-flex items-center rounded-lg bg-emerald-500/15 border border-emerald-500/35 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300"
                  >
                    مطابق 100%
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-black tabular-nums"
                    :class="
                      Number(shift.difference) > 0
                        ? 'bg-sky-500/15 border border-sky-500/35 text-sky-700 dark:text-sky-300'
                        : 'bg-rose-500/15 border border-rose-500/35 text-rose-700 dark:text-rose-300'
                    "
                    dir="ltr"
                  >
                    {{ Number(shift.difference) > 0 ? '+' : ''
                    }}{{ formatNumber(shift.difference) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-else
          class="relative z-10 rounded-xl border border-dashed border-surface-border py-8 text-center text-xs font-semibold text-text-muted"
        >
          لا توجد ورديات مغلقة مسجلة ضمن نطاق التصفية المحدد.
        </div>
      </template>
    </div>

    <!-- =========================================================
           2. أحدث 8 فواتير مبيعات (Recent Invoices)
           ========================================================= -->
    <div
      class="dashboard-enter dashboard-luminous-card rounded-xl p-5 flex flex-col justify-between gap-4"
      style="--stagger-index: 10; --accent-rgb: 255, 125, 20"
    >
      <div class="relative z-10 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3.5">
          <div
            class="dashboard-icon-gem flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          >
            <DocumentTextIcon class="h-5 w-5 drop-shadow-sm" stroke-width="2" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-text-primary">
              أحدث فواتير المبيعات ونقاط البيع
            </h3>
            <p class="text-xs font-medium text-text-muted">
              آخر 8 فواتير مسجلة في النظام مع حالة السداد والترحيل المحاسبي
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="$emit('view-all-invoices')"
          class="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-3.5 py-1.5 text-xs font-extrabold text-primary dark:text-primary-light hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
        >
          <span>سجل الفواتير</span>
          <ArrowLeftIcon class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- قائمة الفواتير -->
      <div v-if="recentInvoices.length > 0" class="relative z-10 space-y-2.5">
        <div
          v-for="invoice in recentInvoices"
          :key="invoice.id"
          @click="$emit('open-invoice', invoice)"
          class="activity-beam-row group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3.5 cursor-pointer"
        >
          <div class="flex items-start gap-3 min-w-0">
            <div
              class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full group-hover:scale-125 transition-transform"
              :class="getStatusDotClass(invoice.status)"
            ></div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="rounded-md bg-primary/15 border border-primary/35 px-2 py-0.5 text-xs font-black text-primary dark:text-primary-light font-mono"
                  dir="ltr"
                >
                  {{ invoice.invoice_number }}
                </span>

                <span
                  class="rounded-md bg-surface-card border border-surface-border px-2 py-0.5 text-[10px] font-extrabold text-text-secondary"
                >
                  {{ getChannelLabel(invoice.channel) }}
                </span>

                <span
                  class="rounded-md px-2 py-0.5 text-[10px] font-extrabold"
                  :class="getPaymentStatusBadge(invoice.payment_status).class"
                >
                  {{ getPaymentStatusBadge(invoice.payment_status).label }}
                </span>

                <span
                  v-if="invoice.status === 'draft'"
                  class="rounded-md bg-amber-500/15 border border-amber-500/35 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300"
                >
                  مسودة
                </span>
                <span
                  v-else-if="invoice.status === 'cancelled'"
                  class="rounded-md bg-rose-500/15 border border-rose-500/35 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:text-rose-300"
                >
                  ملغاة
                </span>
                <span
                  v-else-if="invoice.posting_status === 'unposted'"
                  class="rounded-md bg-sky-500/15 border border-sky-500/35 px-2 py-0.5 text-[10px] font-extrabold text-sky-700 dark:text-sky-300"
                >
                  غير مرحّلة
                </span>

                <span class="text-[11px] font-semibold text-text-muted" dir="ltr">
                  {{ invoice.invoice_date }}
                </span>
              </div>

              <p
                class="mt-1.5 text-xs sm:text-sm font-extrabold text-text-primary truncate max-w-lg"
              >
                {{ invoice.customer_name || 'عميل نقدي' }}
              </p>

              <p v-if="invoice.cashier_name" class="mt-0.5 text-[10px] font-medium text-text-muted">
                البائع / الكاشير: {{ invoice.cashier_name }}
              </p>
            </div>
          </div>

          <div class="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
            <div
              class="text-sm font-black text-text-primary tabular-nums group-hover:text-primary transition-colors"
              dir="ltr"
            >
              {{ formatNumber(invoice.total_amount) }}
              <span class="text-[11px] font-extrabold text-text-muted ml-0.5">
                {{ invoice.currency_symbol || baseCurrencyCode }}
              </span>
            </div>

            <div
              v-if="Number(invoice.remaining_amount) > 0 && invoice.status !== 'cancelled'"
              class="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 tabular-nums"
              dir="ltr"
            >
              متبقي: {{ formatNumber(invoice.remaining_amount) }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="relative z-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-10 text-center text-xs font-semibold text-text-muted"
      >
        لا توجد فواتير مبيعات مسجلة لعرضها ضمن النطاق المحدد.
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ComputerDesktopIcon, DocumentTextIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  posShifts: {
    type: Object,
    default: () => ({
      open_shifts_count: 0,
      open_shifts: [],
      recent_closed_shifts: [],
    }),
  },
  recentInvoices: {
    type: Array,
    default: () => [],
  },
  baseCurrency: {
    type: Object,
    default: () => ({ code: 'SDG', symbol: '' }),
  },
})

defineEmits(['open-invoice', 'view-all-invoices'])

const baseCurrencyCode = computed(() => props.baseCurrency?.code || 'SDG')

// --- تبويبات ورديات الكاشير ---
const activeShiftTab = ref('open')
const openShifts = computed(() => props.posShifts?.open_shifts || [])
const recentClosedShifts = computed(() => props.posShifts?.recent_closed_shifts || [])

// --- أدوات العرض والتنسيق ---
const channelLabelsMap = {
  pos: 'نقطة بيع (POS)',
  standard: 'فاتورة مبيعات',
  online: 'متجر إلكتروني',
  whatsapp: 'واتساب',
  delivery: 'توصيل',
}

function getChannelLabel(channel) {
  return channelLabelsMap[channel] || channel || 'فاتورة مبيعات'
}

function getPaymentStatusBadge(paymentStatus) {
  switch (paymentStatus) {
    case 'paid':
      return {
        label: 'مدفوعة بالكامل',
        class:
          'bg-emerald-500/15 text-emerald-700 border border-emerald-500/35 dark:bg-emerald-400/20 dark:text-emerald-300',
      }
    case 'partial':
      return {
        label: 'مدفوعة جزئياً',
        class:
          'bg-amber-500/15 text-amber-700 border border-amber-500/35 dark:bg-amber-400/20 dark:text-amber-300',
      }
    default:
      return {
        label: 'غير مدفوعة (آجل)',
        class:
          'bg-rose-500/15 text-rose-700 border border-rose-500/35 dark:bg-rose-400/20 dark:text-rose-300',
      }
  }
}

function getStatusDotClass(status) {
  if (status === 'cancelled') {
    return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
  }
  if (status === 'draft') {
    return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
  }
  return 'bg-gradient-to-br from-amber-300 to-orange-600 shadow-[0_0_10px_rgba(255,125,20,0.85)]'
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
.vault-plate-rim {
  position: absolute;
  top: 0;
  inset-inline: 18%;
  height: 2px;
  border-radius: 9999px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--plate-accent, 14, 165, 233), 0.95),
    transparent
  );
  pointer-events: none;
}
</style>
