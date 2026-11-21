<!-- src/modules/inventory/views/dashboard/components/InventoryAlertsAndMovements.vue -->
<template>
  <section class="space-y-6">
    <!-- =========================================================
           1. بطاقات الرقابة الاستباقية (نواقص إعادة الطلب + صلاحيات التشغيلات)
           ========================================================= -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <!-- أ. نواقص حد إعادة الطلب (6 أعمدة) -->
      <div
        class="xl:col-span-6 dashboard-enter dashboard-luminous-card rounded-xl p-5 flex flex-col justify-between gap-4"
        style="--stagger-index: 9; --accent-rgb: 245, 158, 11"
      >
        <div class="relative z-10 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3.5">
            <div
              class="dashboard-icon-gem flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            >
              <BellAlertIcon class="h-5 w-5 drop-shadow-sm" stroke-width="2" />
            </div>
            <div>
              <h3 class="text-base font-extrabold text-text-primary">أصناف بلغت حد إعادة الطلب</h3>
              <p class="text-xs font-medium text-text-muted">
                أعلى 6 أصناف من حيث مقدار العجز عن الحد الأدنى والكميات المقترحة للتوريد
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="$emit('view-reorder-report')"
            class="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm shrink-0"
          >
            <span>تقرير النواقص</span>
            <ArrowLeftIcon class="h-3.5 w-3.5" />
          </button>
        </div>

        <!-- قائمة أصناف إعادة الطلب -->
        <div v-if="reorderAlertsList.length > 0" class="relative z-10 space-y-3 flex-1">
          <div
            v-for="item in reorderAlertsList"
            :key="`${item.product_id}-${item.warehouse_id}`"
            class="vault-plate-card rounded-xl p-3.5 transition-all duration-200"
            style="--plate-accent: 245, 158, 11"
          >
            <span class="vault-plate-rim"></span>

            <div class="relative z-10 flex items-start justify-between gap-3 mb-2">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span
                    v-if="item.sku"
                    class="rounded-md bg-amber-500/15 border border-amber-500/35 px-2 py-0.5 text-[11px] font-black text-amber-700 dark:text-amber-300 font-mono"
                    dir="ltr"
                  >
                    {{ item.sku }}
                  </span>
                  <span
                    class="rounded-md bg-surface-card border border-surface-border px-2 py-0.5 text-[10px] font-extrabold text-text-secondary"
                  >
                    {{ item.warehouse_name || 'مستودع' }}
                  </span>
                </div>
                <p class="mt-1 text-sm font-extrabold text-text-primary truncate">
                  {{ item.product_name }}
                </p>
              </div>

              <div class="text-left shrink-0">
                <span class="block text-[10px] font-bold text-text-muted">مقترح الطلب</span>
                <span
                  class="inline-block rounded-lg bg-emerald-500/15 border border-emerald-500/35 px-2 py-0.5 text-xs font-black text-emerald-700 dark:text-emerald-300 tabular-nums"
                  dir="ltr"
                >
                  +{{ formatNumber(item.suggested_order) }}
                </span>
              </div>
            </div>

            <!-- شريط مقارنة المتاح بالحد الأدنى -->
            <div class="relative z-10 space-y-1.5">
              <div class="flex items-center justify-between text-[11px] font-bold">
                <span class="text-rose-600 dark:text-rose-400 tabular-nums">
                  المتاح: {{ formatNumber(item.available_quantity) }}
                </span>
                <span class="text-text-muted tabular-nums">
                  الحد الأدنى: {{ formatNumber(item.min_quantity) }} (عجز:
                  {{ formatNumber(item.shortage_quantity) }})
                </span>
              </div>

              <div class="laser-progress-track h-2 w-full rounded-full">
                <div
                  class="h-full rounded-full transition-all duration-700 laser-fill-amber"
                  :style="{
                    width: `${calculateStockRatio(item.available_quantity, item.min_quantity)}%`,
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="relative z-10 flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-10 text-center text-xs font-semibold text-text-muted"
        >
          جميع الأصناف فوق حدود إعادة الطلب المعتمدة حالياً.
        </div>
      </div>

      <!-- ب. رقابة صلاحيات الدفعات والتشغيلات (6 أعمدة) -->
      <div
        class="xl:col-span-6 dashboard-enter dashboard-luminous-card rounded-xl p-5 flex flex-col justify-between gap-4"
        style="--stagger-index: 10; --accent-rgb: 244, 63, 94"
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
                التشغيلات المنتهية أو قريبة الانتهاء
              </h3>
              <p class="text-xs font-medium text-text-muted">
                متابعة تواريخ الصلاحية خلال 60 يوماً والكميات القائمة بالمستودعات
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="$emit('view-expiry-report')"
            class="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3.5 py-1.5 text-xs font-extrabold text-rose-700 dark:text-rose-300 hover:bg-rose-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm shrink-0"
          >
            <span>تقرير الصلاحيات</span>
            <ArrowLeftIcon class="h-3.5 w-3.5" />
          </button>
        </div>

        <!-- قائمة التشغيلات -->
        <div v-if="expiringBatches.length > 0" class="relative z-10 space-y-3 flex-1">
          <div
            v-for="batch in expiringBatches"
            :key="batch.id"
            class="vault-plate-card rounded-xl p-3.5 transition-all duration-200"
            :style="{
              '--plate-accent': batch.status === 'EXPIRED' ? '244, 63, 94' : '245, 158, 11',
            }"
          >
            <span class="vault-plate-rim"></span>

            <div class="relative z-10 flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span
                    class="rounded-md bg-surface-card border border-surface-border px-2 py-0.5 text-[11px] font-black text-text-primary font-mono"
                    dir="ltr"
                  >
                    {{ batch.batch_number }}
                  </span>

                  <span
                    v-if="batch.sku"
                    class="rounded-md bg-indigo-500/15 border border-indigo-500/35 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 font-mono"
                    dir="ltr"
                  >
                    {{ batch.sku }}
                  </span>

                  <span
                    class="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold"
                    :class="
                      batch.status === 'EXPIRED'
                        ? 'bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300'
                    "
                  >
                    {{
                      batch.status === 'EXPIRED'
                        ? `منتهية منذ ${Math.abs(batch.days_remaining)} يوم`
                        : `متبقي ${batch.days_remaining} يوم`
                    }}
                  </span>
                </div>

                <p class="mt-1.5 text-sm font-extrabold text-text-primary truncate">
                  {{ batch.product_name }}
                </p>

                <p class="mt-0.5 text-[11px] font-semibold text-text-muted">
                  تاريخ الانتهاء: <span dir="ltr">{{ batch.expiry_date }}</span>
                </p>
              </div>

              <div class="text-left shrink-0">
                <span class="block text-[10px] font-bold text-text-muted">الرصيد القائم</span>
                <span
                  class="text-base font-black tabular-nums"
                  :class="
                    batch.status === 'EXPIRED'
                      ? 'text-rose-600 dark:text-rose-300'
                      : 'text-amber-700 dark:text-amber-300'
                  "
                  dir="ltr"
                >
                  {{ formatNumber(batch.current_stock) }}
                </span>
                <span class="block text-[10px] font-bold text-text-muted">وحدة</span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="relative z-10 flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-10 text-center text-xs font-semibold text-text-muted"
        >
          لا توجد تشغيلات منتهية أو قريبة من انتهاء الصلاحية خلال 60 يوماً.
        </div>
      </div>
    </div>

    <!-- =========================================================
           2. أحدث 8 حركات مخزنية مسجلة (Recent Stock Movements)
           ========================================================= -->
    <div
      class="dashboard-enter dashboard-luminous-card rounded-xl p-5 flex flex-col justify-between gap-4"
      style="--stagger-index: 11; --accent-rgb: 14, 165, 233"
    >
      <div class="relative z-10 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3.5">
          <div
            class="dashboard-icon-gem flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          >
            <ArrowsRightLeftIcon class="h-5 w-5 drop-shadow-sm" stroke-width="2" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-text-primary">
              أحدث الحركات والعمليات المخزنية
            </h3>
            <p class="text-xs font-medium text-text-muted">
              آخر 8 حركات وارد ومنصرف مسجلة على المستودعات مع الرصيد التراكمي بعد الحركة
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="$emit('view-stock-card')"
          class="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/15 px-3.5 py-1.5 text-xs font-extrabold text-sky-700 dark:text-sky-300 hover:bg-sky-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
        >
          <span>كارت الصنف التفصيلي</span>
          <ArrowLeftIcon class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- قائمة الحركات المخزنية -->
      <div v-if="recentMovements.length > 0" class="relative z-10 space-y-2.5">
        <div
          v-for="mv in recentMovements"
          :key="mv.id"
          @click="$emit('open-movement', mv)"
          class="activity-beam-row group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3.5 cursor-pointer"
        >
          <div class="flex items-start gap-3 min-w-0">
            <div
              class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full group-hover:scale-125 transition-transform"
              :class="
                mv.direction === 'in'
                  ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.85)]'
                  : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.85)]'
              "
            ></div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="rounded-md px-2 py-0.5 text-[11px] font-extrabold"
                  :class="
                    mv.direction === 'in'
                      ? 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/15 border border-rose-500/35 text-rose-700 dark:text-rose-300'
                  "
                >
                  {{ getMovementTypeLabel(mv.movement_type) }}
                </span>

                <span
                  v-if="mv.sku"
                  class="rounded-md bg-sky-500/15 border border-sky-500/35 px-2 py-0.5 text-[11px] font-black text-sky-700 dark:text-sky-300 font-mono"
                  dir="ltr"
                >
                  {{ mv.sku }}
                </span>

                <span
                  v-if="mv.warehouse_name"
                  class="rounded-md bg-surface-card border border-surface-border px-2 py-0.5 text-[10px] font-extrabold text-text-secondary"
                >
                  {{ mv.warehouse_name }}
                </span>

                <span class="text-[11px] font-semibold text-text-muted" dir="ltr">
                  {{ mv.created_at }}
                </span>
              </div>

              <p
                class="mt-1.5 text-xs sm:text-sm font-extrabold text-text-primary truncate max-w-xl"
              >
                {{ mv.product_name || 'صنف غير محدد' }}
              </p>

              <p class="mt-0.5 text-[10px] font-medium text-text-muted truncate max-w-xl">
                <span v-if="mv.created_by">بواسطة: {{ mv.created_by }}</span>
                <span v-if="mv.created_by && mv.notes" class="mx-1.5">•</span>
                <span v-if="mv.notes">{{ mv.notes }}</span>
              </p>
            </div>
          </div>

          <div class="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
            <div
              class="text-sm font-black tabular-nums"
              :class="
                mv.direction === 'in'
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-rose-700 dark:text-rose-300'
              "
              dir="ltr"
            >
              {{ mv.direction === 'in' ? '+' : '-' }}{{ formatNumber(mv.quantity) }}
              <span class="text-[11px] font-bold text-text-muted ml-0.5">
                {{ mv.unit_name || 'وحدة' }}
              </span>
            </div>

            <div
              class="flex items-center gap-2 text-[11px] font-bold text-text-muted tabular-nums"
              dir="ltr"
            >
              <span>{{ formatNumber(mv.total_cost) }} {{ baseCurrencyCode }}</span>
              <span>•</span>
              <span class="text-text-secondary">
                الرصيد: {{ formatNumber(mv.balance_after_movement) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="relative z-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-10 text-center text-xs font-semibold text-text-muted"
      >
        لا توجد حركات مخزنية مسجلة لعرضها ضمن النطاق المحدد.
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import {
  BellAlertIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
  ArrowLeftIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  reorderAlertsList: {
    type: Array,
    default: () => [],
  },
  expiringBatches: {
    type: Array,
    default: () => [],
  },
  recentMovements: {
    type: Array,
    default: () => [],
  },
  baseCurrency: {
    type: Object,
    default: () => ({ code: 'SDG', symbol: '' }),
  },
})

defineEmits(['view-reorder-report', 'view-expiry-report', 'view-stock-card', 'open-movement'])

const baseCurrencyCode = computed(() => props.baseCurrency?.code || 'SDG')

const movementTypeLabels = {
  purchase: 'استلام مشتريات',
  sales: 'منصرف مبيعات',
  out: 'صرف تشغيل / أقسام',
  in: 'إضافة مخزنية',
  transfer_in: 'تحويل وارد',
  transfer_out: 'تحويل صادر',
  adjustment_in: 'تسوية جردية (فائض)',
  adjustment_out: 'تسوية جردية (عجز)',
  opening_balance: 'رصيد افتتاحي',
  production_in: 'إنتاج تام وارد',
  production_out: 'خامات للإنتاج',
  purchase_return: 'مردود مشتريات',
  damage: 'إتلاف بضاعة',
  loss: 'فاقد وتسريب',
}

function getMovementTypeLabel(type) {
  return movementTypeLabels[type] || type || 'حركة مخزنية'
}

function calculateStockRatio(available, minQty) {
  const avail = Math.max(0, Number(available) || 0)
  const min = Number(minQty) || 0
  if (min <= 0) return 0
  return Math.min(100, Math.max(6, (avail / min) * 100))
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
    rgba(var(--plate-accent, 245, 158, 11), 0.95),
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

.laser-fill-amber {
  background: linear-gradient(90deg, #d97706 0%, #f59e0b 65%, #fcd34d 100%);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.55);
}
</style>
