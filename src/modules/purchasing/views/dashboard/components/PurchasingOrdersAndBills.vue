<!-- src/modules/purchasing/views/dashboard/components/PurchasingOrdersAndBills.vue -->
<template>
  <section class="space-y-6">
    <!-- =========================================================
           1. متابعة أوامر الشراء المفتوحة ونسبة إنجاز الاستلام المخزني
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
            <ClipboardDocumentCheckIcon class="h-5 w-5 drop-shadow-sm" stroke-width="2" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-text-primary">
              متابعة أوامر الشراء المفتوحة ونسب التوريد
            </h3>
            <p class="text-xs font-medium text-text-muted">
              أحدث 5 أوامر شراء قيد التنفيذ وموقف الاستلام المخزني ومواعيد التسليم المتوقعة
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="$emit('view-all-orders')"
          class="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/15 px-3.5 py-1.5 text-xs font-extrabold text-sky-700 dark:text-sky-300 hover:bg-sky-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <span>سجل أوامر الشراء</span>
          <ArrowLeftIcon class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- بطاقات أوامر الشراء المفتوحة -->
      <div
        v-if="openPurchaseOrders.length > 0"
        class="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <div
          v-for="order in openPurchaseOrders"
          :key="order.id"
          @click="$emit('open-order', order)"
          class="vault-plate-card group rounded-xl p-4 flex flex-col justify-between gap-3.5 cursor-pointer"
          :style="{
            '--plate-accent': order.is_overdue ? '244, 63, 94' : '14, 165, 233',
          }"
        >
          <span class="vault-plate-rim"></span>

          <!-- رأس بطاقة أمر الشراء -->
          <div class="relative z-10 flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-1.5">
                <span
                  class="rounded-md bg-sky-500/15 border border-sky-500/35 px-2 py-0.5 text-xs font-black text-sky-700 dark:text-sky-300 font-mono"
                  dir="ltr"
                >
                  {{ order.order_number }}
                </span>

                <span
                  class="rounded-md px-2 py-0.5 text-[10px] font-extrabold"
                  :class="getOrderStatusBadgeClass(order.status)"
                >
                  {{ order.status_label }}
                </span>

                <span
                  v-if="order.is_overdue"
                  class="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/40 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:text-rose-300"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  متأخر التوريد
                </span>
              </div>

              <p
                class="mt-1.5 text-sm font-extrabold text-text-primary truncate group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors"
              >
                {{ order.supplier_name || 'مورد غير محدد' }}
              </p>

              <p class="text-[11px] font-medium text-text-muted truncate">
                {{ order.department_name || 'عام' }}
                <span v-if="order.order_date" class="mx-1">•</span>
                <span v-if="order.order_date" dir="ltr">{{ order.order_date }}</span>
              </p>
            </div>

            <div class="text-left shrink-0">
              <span class="block text-[10px] font-bold text-text-muted">قيمة الأمر</span>
              <span class="text-base font-black text-text-primary tabular-nums" dir="ltr">
                {{ formatNumber(order.total_amount) }}
              </span>
              <span class="block text-[10px] font-extrabold text-text-muted">
                {{ order.currency_symbol || baseCurrencyCode }}
              </span>
            </div>
          </div>

          <!-- شريط تقدم الاستلام المخزني وموعد التسليم -->
          <div
            class="relative z-10 space-y-2 rounded-lg border border-surface-border/70 bg-surface-ground/60 px-3 py-2.5"
          >
            <div class="flex items-center justify-between gap-2 text-[11px]">
              <span class="font-bold text-text-secondary">نسبة إنجاز الاستلام:</span>
              <span
                class="font-black tabular-nums"
                :class="
                  Number(order.receipt_progress) >= 100
                    ? 'text-emerald-600 dark:text-emerald-300'
                    : 'text-sky-700 dark:text-sky-300'
                "
                dir="ltr"
              >
                {{ Number(order.receipt_progress || 0).toFixed(1) }}%
              </span>
            </div>

            <div class="laser-progress-track h-2 w-full rounded-full">
              <div
                class="h-full rounded-full transition-all duration-700"
                :class="
                  Number(order.receipt_progress) >= 100
                    ? 'laser-fill-emerald'
                    : order.is_overdue
                      ? 'laser-fill-rose'
                      : 'laser-fill-sky'
                "
                :style="{
                  width: `${Math.min(100, Math.max(0, Number(order.receipt_progress || 0)))}%`,
                }"
              ></div>
            </div>

            <div
              v-if="order.expected_delivery_date"
              class="flex items-center justify-between text-[10px] font-semibold pt-0.5"
              :class="
                order.is_overdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-text-muted'
              "
            >
              <span>التسليم المتوقع:</span>
              <span dir="ltr">{{ order.expected_delivery_date }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="relative z-10 rounded-xl border border-dashed border-surface-border py-8 text-center text-xs font-semibold text-text-muted"
      >
        لا توجد أوامر شراء مفتوحة حالياً ضمن نطاق التصفية المحدد.
      </div>
    </div>

    <!-- =========================================================
           2. أحدث 8 فواتير مشتريات (Recent Bills)
           ========================================================= -->
    <div
      class="dashboard-enter dashboard-luminous-card rounded-xl p-5 flex flex-col justify-between gap-4"
      style="--stagger-index: 10; --accent-rgb: 99, 102, 241"
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
              أحدث فواتير المشتريات والشراء المباشر
            </h3>
            <p class="text-xs font-medium text-text-muted">
              آخر 8 فواتير مشتريات مسجلة في النظام وموقف السداد للموردين
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="$emit('view-all-bills')"
          class="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-3.5 py-1.5 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
        >
          <span>سجل الفواتير</span>
          <ArrowLeftIcon class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- قائمة أحدث الفواتير -->
      <div v-if="recentBills.length > 0" class="relative z-10 space-y-2.5">
        <div
          v-for="bill in recentBills"
          :key="bill.id"
          @click="$emit('open-bill', bill)"
          class="activity-beam-row group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3.5 cursor-pointer"
        >
          <div class="flex items-start gap-3 min-w-0">
            <div
              class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full group-hover:scale-125 transition-transform"
              :class="getBillStatusDotClass(bill.status)"
            ></div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="rounded-md bg-indigo-500/15 border border-indigo-500/35 px-2 py-0.5 text-xs font-black text-indigo-700 dark:text-indigo-300 font-mono"
                  dir="ltr"
                >
                  {{ bill.bill_number }}
                </span>

                <span
                  class="rounded-md px-2 py-0.5 text-[10px] font-extrabold"
                  :class="getBillStatusBadgeClass(bill.status)"
                >
                  {{ bill.status_label }}
                </span>

                <span
                  v-if="bill.warehouse_name"
                  class="rounded-md bg-surface-card border border-surface-border px-2 py-0.5 text-[10px] font-extrabold text-text-secondary"
                >
                  {{ bill.warehouse_name }}
                </span>

                <span class="text-[11px] font-semibold text-text-muted" dir="ltr">
                  {{ bill.bill_date }}
                </span>
              </div>

              <p
                class="mt-1.5 text-xs sm:text-sm font-extrabold text-text-primary truncate max-w-lg"
              >
                {{ bill.supplier_name || 'مورد غير محدد' }}
              </p>

              <p
                v-if="
                  bill.due_date && Number(bill.remaining_amount) > 0 && bill.status !== 'cancelled'
                "
                class="mt-0.5 text-[10px] font-semibold text-text-muted"
              >
                تاريخ الاستحقاق: <span dir="ltr">{{ bill.due_date }}</span>
              </p>
            </div>
          </div>

          <div class="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
            <div
              class="text-sm font-black text-text-primary tabular-nums group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors"
              dir="ltr"
            >
              {{ formatNumber(bill.total_amount) }}
              <span class="text-[11px] font-extrabold text-text-muted ml-0.5">
                {{ bill.currency_symbol || baseCurrencyCode }}
              </span>
            </div>

            <div
              v-if="Number(bill.remaining_amount) > 0 && bill.status !== 'cancelled'"
              class="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 tabular-nums"
              dir="ltr"
            >
              متبقي: {{ formatNumber(bill.remaining_amount) }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="relative z-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-10 text-center text-xs font-semibold text-text-muted"
      >
        لا توجد فواتير مشتريات مسجلة لعرضها ضمن النطاق المحدد.
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import {
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  openPurchaseOrders: {
    type: Array,
    default: () => [],
  },
  recentBills: {
    type: Array,
    default: () => [],
  },
  baseCurrency: {
    type: Object,
    default: () => ({ code: 'SDG', symbol: '' }),
  },
})

defineEmits(['open-order', 'view-all-orders', 'open-bill', 'view-all-bills'])

const baseCurrencyCode = computed(() => props.baseCurrency?.code || 'SDG')

function getOrderStatusBadgeClass(status) {
  switch (status) {
    case 'received':
      return 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/35 dark:bg-emerald-400/20 dark:text-emerald-300'
    case 'partially_received':
    case 'partially_billed':
      return 'bg-amber-500/15 text-amber-700 border border-amber-500/35 dark:bg-amber-400/20 dark:text-amber-300'
    case 'cancelled':
      return 'bg-rose-500/15 text-rose-700 border border-rose-500/35 dark:bg-rose-400/20 dark:text-rose-300'
    default:
      return 'bg-sky-500/15 text-sky-700 border border-sky-500/35 dark:bg-sky-400/20 dark:text-sky-300'
  }
}

function getBillStatusBadgeClass(status) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/35 dark:bg-emerald-400/20 dark:text-emerald-300'
    case 'partially_paid':
      return 'bg-sky-500/15 text-sky-700 border border-sky-500/35 dark:bg-sky-400/20 dark:text-sky-300'
    case 'posted':
      return 'bg-indigo-500/15 text-indigo-700 border border-indigo-500/35 dark:bg-indigo-400/20 dark:text-indigo-300'
    case 'cancelled':
      return 'bg-rose-500/15 text-rose-700 border border-rose-500/35 dark:bg-rose-400/20 dark:text-rose-300'
    default:
      return 'bg-amber-500/15 text-amber-700 border border-amber-500/35 dark:bg-amber-400/20 dark:text-amber-300'
  }
}

function getBillStatusDotClass(status) {
  if (status === 'cancelled') {
    return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
  }
  if (status === 'draft') {
    return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
  }
  if (status === 'paid') {
    return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]'
  }
  return 'bg-gradient-to-br from-indigo-400 to-violet-600 shadow-[0_0_10px_rgba(99,102,241,0.85)]'
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

.laser-fill-sky {
  background: linear-gradient(90deg, #0284c7 0%, #0ea5e9 65%, #7dd3fc 100%);
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.55);
}

.laser-fill-rose {
  background: linear-gradient(90deg, #e11d48 0%, #f43f5e 65%, #fda4af 100%);
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.55);
}
</style>
