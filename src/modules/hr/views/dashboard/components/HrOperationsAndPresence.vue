<!-- src/modules/hr/views/dashboard/components/HrOperationsAndPresence.vue -->
<template>
  <section class="space-y-6">
    <!-- =========================================================
           1. شريط التواجد الميداني اللحظي والأمن والسلامة (Live Presence)
           ========================================================= -->
    <div
      class="dashboard-enter dashboard-luminous-card rounded-xl p-5 space-y-5"
      style="--stagger-index: 7; --accent-rgb: 16, 185, 129"
    >
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3.5">
          <div
            class="dashboard-icon-gem flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          >
            <ShieldCheckIcon class="h-5 w-5 drop-shadow-sm" stroke-width="2" />
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-base font-extrabold text-text-primary">
                التواجد الميداني اللحظي وحركة البوابة
              </h3>
              <span
                v-if="livePresence.date"
                class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>مباشر •</span>
                <span dir="ltr">{{ livePresence.date }}</span>
              </span>
            </div>
            <p class="text-xs font-medium text-text-muted">
              حصر لحظي للموظفين المتواجدين داخل المنشأة، أذونات الخروج المؤقت، وحركة الزوار اليوم
            </p>
          </div>
        </div>

        <!-- أزرار الوصول السريع للوحة الطوارئ وسجل الزوار -->
        <div class="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            @click="$emit('view-emergency-muster')"
            class="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-xs font-extrabold text-rose-700 dark:text-rose-300 hover:bg-rose-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
          >
            <span>لوحة الطوارئ (Muster)</span>
            <ArrowLeftIcon class="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            @click="$emit('view-visitors')"
            class="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/15 px-3 py-1.5 text-xs font-extrabold text-sky-700 dark:text-sky-300 hover:bg-sky-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
          >
            <span>سجل الزوار</span>
            <ArrowLeftIcon class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <!-- بطاقات التواجد اللحظي الخمس -->
      <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <!-- 1. داخل المنشأة حالياً -->
        <div
          class="vault-plate-card rounded-xl p-4 flex items-center justify-between gap-3"
          style="--plate-accent: 16, 185, 129"
        >
          <span class="vault-plate-rim"></span>
          <div class="relative z-10 min-w-0">
            <span class="block text-[11px] font-bold text-text-muted">على رأس العمل بالداخل</span>
            <span
              class="mt-1 block text-2xl font-black text-emerald-700 dark:text-emerald-300 tabular-nums"
              dir="ltr"
            >
              {{ formatNumber(livePresence.inside_duty_count) }}
            </span>
            <span class="text-[10px] font-semibold text-text-muted">موظف متواجد حالياً</span>
          </div>
          <div
            class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
          >
            <UserCircleIcon class="h-5 w-5" />
          </div>
        </div>

        <!-- 2. خروج مؤقت حالياً -->
        <div
          class="vault-plate-card rounded-xl p-4 flex items-center justify-between gap-3"
          style="--plate-accent: 245, 158, 11"
        >
          <span class="vault-plate-rim"></span>
          <div class="relative z-10 min-w-0">
            <span class="block text-[11px] font-bold text-text-muted">خروج مؤقت (بإذن)</span>
            <span
              class="mt-1 block text-2xl font-black text-amber-700 dark:text-amber-300 tabular-nums"
              dir="ltr"
            >
              {{ formatNumber(livePresence.temporary_out_count) }}
            </span>
            <span class="text-[10px] font-semibold text-text-muted">خارج البوابة مؤقتاً</span>
          </div>
          <div
            class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300"
          >
            <ArrowRightStartOnRectangleIcon class="h-5 w-5" />
          </div>
        </div>

        <!-- 3. انصرفوا بنهاية الدوام -->
        <div
          class="vault-plate-card rounded-xl p-4 flex items-center justify-between gap-3"
          style="--plate-accent: 99, 102, 241"
        >
          <span class="vault-plate-rim"></span>
          <div class="relative z-10 min-w-0">
            <span class="block text-[11px] font-bold text-text-muted">تسجيل انصراف اليوم</span>
            <span
              class="mt-1 block text-2xl font-black text-indigo-700 dark:text-indigo-300 tabular-nums"
              dir="ltr"
            >
              {{ formatNumber(livePresence.checked_out_today_count) }}
            </span>
            <span class="text-[10px] font-semibold text-text-muted">أنهوا ورديتهم</span>
          </div>
          <div
            class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-300"
          >
            <CheckBadgeIcon class="h-5 w-5" />
          </div>
        </div>

        <!-- 4. زوار متواجدون بالداخل -->
        <div
          class="vault-plate-card rounded-xl p-4 flex items-center justify-between gap-3"
          style="--plate-accent: 14, 165, 233"
        >
          <span class="vault-plate-rim"></span>
          <div class="relative z-10 min-w-0">
            <span class="block text-[11px] font-bold text-text-muted">زوار داخل المنشأة</span>
            <span
              class="mt-1 block text-2xl font-black text-sky-700 dark:text-sky-300 tabular-nums"
              dir="ltr"
            >
              {{ formatNumber(livePresence.visitors_inside_count) }}
            </span>
            <span class="text-[10px] font-semibold text-text-muted">زيارة نشطة حالياً</span>
          </div>
          <div
            class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300"
          >
            <IdentificationIcon class="h-5 w-5" />
          </div>
        </div>

        <!-- 5. زوار متوقعون اليوم -->
        <div
          class="vault-plate-card rounded-xl p-4 flex items-center justify-between gap-3"
          style="--plate-accent: 168, 85, 247"
        >
          <span class="vault-plate-rim"></span>
          <div class="relative z-10 min-w-0">
            <span class="block text-[11px] font-bold text-text-muted">زوار بانتظار الدخول</span>
            <span
              class="mt-1 block text-2xl font-black text-purple-700 dark:text-purple-300 tabular-nums"
              dir="ltr"
            >
              {{ formatNumber(livePresence.visitors_expected_today_count) }}
            </span>
            <span class="text-[10px] font-semibold text-text-muted">مواعيد زيارة اليوم</span>
          </div>
          <div
            class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-300"
          >
            <CalendarDaysIcon class="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>

    <!-- =========================================================
           2. الاعتمادات المعلقة (إجازات وسلف) + أحدث مسيرات الرواتب المعتمدة
           ========================================================= -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <!-- أ. أحدث الطلبات المعلقة بانتظار الاعتماد (5 أعمدة) -->
      <div
        class="xl:col-span-5 dashboard-enter dashboard-luminous-card rounded-xl p-5 flex flex-col justify-between gap-4"
        style="--stagger-index: 8; --accent-rgb: 245, 158, 11"
      >
        <div class="relative z-10 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3.5">
            <div
              class="dashboard-icon-gem flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            >
              <ClipboardDocumentCheckIcon class="h-5 w-5 drop-shadow-sm" stroke-width="2" />
            </div>
            <div>
              <h3 class="text-base font-extrabold text-text-primary">طلبات بانتظار الاعتماد</h3>
              <p class="text-xs font-medium text-text-muted">
                أحدث طلبات الإجازات والسلف المرفوعة للمراجعة
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              @click="$emit('view-leaves')"
              class="rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-[11px] font-extrabold text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
            >
              الإجازات
            </button>
            <button
              type="button"
              @click="$emit('view-loans')"
              class="rounded-lg border border-indigo-500/40 bg-indigo-500/15 px-2.5 py-1 text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500 hover:text-white transition-all cursor-pointer"
            >
              السلف
            </button>
          </div>
        </div>

        <!-- قائمة الاعتمادات المعلقة -->
        <div v-if="pendingApprovals.length > 0" class="relative z-10 space-y-2.5 flex-1">
          <div
            v-for="item in pendingApprovals"
            :key="`${item.type}-${item.id}`"
            @click="$emit('open-approval', item)"
            class="activity-beam-row group flex items-center justify-between gap-3 rounded-xl p-3 cursor-pointer"
          >
            <div class="flex items-start gap-2.5 min-w-0">
              <div
                class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full group-hover:scale-125 transition-transform"
                :class="
                  item.type === 'leave'
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.85)]'
                    : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.85)]'
                "
              ></div>

              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span
                    class="rounded-md px-2 py-0.5 text-[10px] font-extrabold"
                    :class="
                      item.type === 'leave'
                        ? 'bg-amber-500/15 border border-amber-500/35 text-amber-700 dark:text-amber-300'
                        : 'bg-indigo-500/15 border border-indigo-500/35 text-indigo-700 dark:text-indigo-300'
                    "
                  >
                    {{ item.type_label }}
                  </span>

                  <span
                    v-if="item.department_name"
                    class="rounded-md bg-surface-card border border-surface-border px-2 py-0.5 text-[10px] font-bold text-text-secondary"
                  >
                    {{ item.department_name }}
                  </span>
                </div>

                <p
                  class="mt-1 text-xs sm:text-sm font-extrabold text-text-primary truncate group-hover:text-primary transition-colors"
                >
                  {{ item.employee_name || 'موظف غير محدد' }}
                </p>

                <p class="text-[11px] font-medium text-text-muted truncate">
                  {{ item.title }}
                  <span v-if="item.target_date" class="mx-1">•</span>
                  <span v-if="item.target_date" dir="ltr">{{ item.target_date }}</span>
                </p>
              </div>
            </div>

            <div class="text-left shrink-0">
              <span
                class="block text-sm font-black tabular-nums"
                :class="
                  item.type === 'leave'
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-indigo-700 dark:text-indigo-300'
                "
                dir="ltr"
              >
                {{ formatNumber(item.value) }}
              </span>
              <span class="block text-[10px] font-extrabold text-text-muted">
                {{ item.unit === 'يوم' ? 'يوم إجازة' : baseCurrencyCode }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-else
          class="relative z-10 flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-10 text-center text-xs font-semibold text-text-muted"
        >
          لا توجد طلبات إجازات أو سلف معلقة بانتظار الاعتماد حالياً.
        </div>
      </div>

      <!-- ب. أحدث 5 مسيرات رواتب معتمدة (7 أعمدة) -->
      <div
        class="xl:col-span-7 dashboard-enter dashboard-luminous-card rounded-xl p-5 flex flex-col justify-between gap-4"
        style="--stagger-index: 9; --accent-rgb: 16, 185, 129"
      >
        <div class="relative z-10 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3.5">
            <div
              class="dashboard-icon-gem flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            >
              <BanknotesIcon class="h-5 w-5 drop-shadow-sm" stroke-width="2" />
            </div>
            <div>
              <h3 class="text-base font-extrabold text-text-primary">
                أحدث مسيرات الرواتب المعتمدة
              </h3>
              <p class="text-xs font-medium text-text-muted">
                آخر 5 دفعات رواتب مرحّلة (Posted) وتفاصيل الأساسي والبدلات والاستقطاعات والصافي
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="$emit('view-payroll-batches')"
            class="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm shrink-0"
          >
            <span>سجل المسيرات</span>
            <ArrowLeftIcon class="h-3.5 w-3.5" />
          </button>
        </div>

        <!-- جدول مسيرات الرواتب -->
        <div
          v-if="recentPayrollBatches.length > 0"
          class="relative z-10 overflow-x-auto rounded-xl border border-surface-border shadow-md flex-1"
        >
          <table class="min-w-full divide-y divide-surface-border text-sm">
            <thead class="invoice-thead-3d">
              <tr>
                <th class="px-3.5 py-3 text-right text-xs font-extrabold">المسير / الفترة</th>
                <th class="px-3.5 py-3 text-center text-xs font-extrabold">الموظفين</th>
                <th class="px-3.5 py-3 text-left text-xs font-extrabold">الأساسي والبدلات</th>
                <th class="px-3.5 py-3 text-left text-xs font-extrabold">الاستقطاعات</th>
                <th class="px-3.5 py-3 text-left text-xs font-extrabold">صافي المسير</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-border/70 bg-surface-section">
              <tr
                v-for="batch in recentPayrollBatches"
                :key="batch.id"
                @click="$emit('view-payroll-batches')"
                class="transition-colors duration-150 hover:bg-emerald-500/[0.05] cursor-pointer"
              >
                <td class="px-3.5 py-3">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span
                      class="rounded-md bg-emerald-500/15 border border-emerald-500/35 px-2 py-0.5 text-[11px] font-black text-emerald-700 dark:text-emerald-300 font-mono"
                      dir="ltr"
                    >
                      {{ batch.number }}
                    </span>
                    <span
                      class="rounded-md bg-surface-card border border-surface-border px-1.5 py-0.5 text-[10px] font-bold text-text-secondary"
                    >
                      {{ batch.run_type_label }}
                    </span>
                  </div>
                  <div class="mt-1 text-xs font-extrabold text-text-primary truncate max-w-[190px]">
                    {{ batch.name }}
                  </div>
                  <div class="text-[10px] font-semibold text-text-muted">
                    {{ batch.period_name || '—' }}
                    <span v-if="batch.approved_at" class="mx-1">•</span>
                    <span v-if="batch.approved_at" dir="ltr">{{ batch.approved_at }}</span>
                  </div>
                </td>

                <td class="px-3.5 py-3 text-center">
                  <span
                    class="inline-flex items-center justify-center rounded-lg bg-sky-500/15 border border-sky-500/35 px-2.5 py-0.5 text-xs font-black text-sky-700 dark:text-sky-300 tabular-nums"
                  >
                    {{ batch.employees_count }}
                  </span>
                </td>

                <td class="px-3.5 py-3 text-left tabular-nums" dir="ltr">
                  <div class="text-xs font-bold text-text-primary">
                    {{ formatNumber(batch.total_basic) }}
                  </div>
                  <div
                    v-if="Number(batch.total_allowances) > 0"
                    class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
                  >
                    +{{ formatNumber(batch.total_allowances) }} بدلات
                  </div>
                </td>

                <td
                  class="px-3.5 py-3 text-left text-xs font-extrabold text-rose-600 dark:text-rose-400 tabular-nums"
                  dir="ltr"
                >
                  {{
                    Number(batch.total_deductions) > 0
                      ? `-${formatNumber(batch.total_deductions)}`
                      : '0'
                  }}
                </td>

                <td
                  class="px-3.5 py-3 text-left font-black text-emerald-700 dark:text-emerald-300 tabular-nums"
                  dir="ltr"
                >
                  {{ formatNumber(batch.total_net) }}
                  <span class="block text-[10px] font-bold text-text-muted">
                    {{ baseCurrencyCode }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-else
          class="relative z-10 flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-10 text-center text-xs font-semibold text-text-muted"
        >
          لا توجد مسيرات رواتب معتمدة لعرضها ضمن النطاق المحدد.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import {
  ShieldCheckIcon,
  ArrowLeftIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  CheckBadgeIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  livePresence: {
    type: Object,
    default: () => ({
      date: '',
      inside_duty_count: 0,
      temporary_out_count: 0,
      checked_out_today_count: 0,
      visitors_inside_count: 0,
      visitors_expected_today_count: 0,
    }),
  },
  pendingApprovals: {
    type: Array,
    default: () => [],
  },
  recentPayrollBatches: {
    type: Array,
    default: () => [],
  },
  baseCurrency: {
    type: Object,
    default: () => ({ code: 'SDG', symbol: '' }),
  },
})

defineEmits([
  'view-emergency-muster',
  'view-visitors',
  'view-leaves',
  'view-loans',
  'open-approval',
  'view-payroll-batches',
])

const baseCurrencyCode = computed(() => props.baseCurrency?.code || 'SDG')

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
    rgba(var(--plate-accent, 16, 185, 129), 0.95),
    transparent
  );
  pointer-events: none;
}
</style>
