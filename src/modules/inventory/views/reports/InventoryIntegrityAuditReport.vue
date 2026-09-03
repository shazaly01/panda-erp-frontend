<template>
  <div
    class="p-6 space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen text-right transition-colors duration-200"
    dir="rtl"
  >
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>تقرير تدقيق المطابقة وسلامة البيانات المخزنية</span>
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          فحص التوافق الحسابي بين سجل الحركات التاريخية والأرصدة اللحظية وكشف الأرصدة السالبة
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="resetFilters"
          class="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-all duration-150"
        >
          إعادة تعيين
        </button>
        <button
          type="button"
          @click="fetchReport"
          :disabled="loading"
          class="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150"
        >
          <svg
            v-if="loading"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>{{ loading ? 'جاري الفحص والتدقيق...' : 'بدء الفحص الآن' }}</span>
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div
      class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
        <div>
          <WarehouseDropdown
            id="audit-warehouse-filter"
            v-model="filters.warehouse_id"
            label="المستودع المستهدف بالفحص"
          />
        </div>
      </div>
    </div>

    <!-- Status Banner & Summary -->
    <div v-if="reportData" class="space-y-6">
      <!-- Health Banner -->
      <div
        :class="[
          'p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-all duration-200',
          reportData.summary.is_system_healthy
            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
            : 'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200',
        ]"
      >
        <div class="flex items-center gap-4">
          <div
            :class="[
              'w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 shadow-inner',
              reportData.summary.is_system_healthy
                ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                : 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200',
            ]"
          >
            {{ reportData.summary.is_system_healthy ? '✓' : '!' }}
          </div>
          <div>
            <h2 class="text-base font-bold">
              {{
                reportData.summary.is_system_healthy
                  ? 'البيانات المخزنية متطابقة وسليمة بنسبة 100%'
                  : 'تنبيه: تم اكتشاف فروقات أو أرصدة سالبة تحتاج للمراجعة'
              }}
            </h2>
            <p class="text-xs mt-1 opacity-80 leading-relaxed">
              {{
                reportData.summary.is_system_healthy
                  ? 'تمت مطابقة كافة الأرصدة اللحظية مع مجموع حركات دفتر الأستاذ بنجاح.'
                  : 'يرجى مراجعة تفاصيل البنود غير المتطابقة أدناه ومعالجة أسباب الانحراف.'
              }}
            </p>
          </div>
        </div>
        <span
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider self-start md:self-center shadow-sm',
            reportData.summary.is_system_healthy
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white',
          ]"
        >
          {{ reportData.audit_status }}
        </span>
      </div>

      <!-- Summary KPI Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Matched Positions Card -->
        <div
          class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm bg-gradient-to-br from-white to-emerald-50/40 dark:from-gray-900 dark:to-emerald-950/20"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider"
            >
              المواقع والبنود المتطابقة تماماً
            </span>
            <span class="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <p class="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-3 font-mono">
            {{ reportData.summary.total_matched_positions }}
          </p>
        </div>

        <!-- Discrepancies Card -->
        <div
          class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-red-200 dark:border-red-900/40 shadow-sm bg-gradient-to-br from-white to-red-50/40 dark:from-gray-900 dark:to-red-950/20"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
              عدد الفروقات والانحرافات الحسابية
            </span>
            <span class="flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
          </div>
          <p class="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-3 font-mono">
            {{ reportData.summary.discrepancy_count }}
          </p>
        </div>

        <!-- Negative Stock Card -->
        <div
          class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm bg-gradient-to-br from-white to-amber-50/40 dark:from-gray-900 dark:to-amber-950/20"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider"
            >
              عدد الأرصدة السالبة المكتشفة
            </span>
            <span class="flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          </div>
          <p class="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-3 font-mono">
            {{ reportData.summary.negative_stock_count }}
          </p>
        </div>
      </div>

      <!-- Discrepancies Table -->
      <div
        v-if="reportData.discrepancies && reportData.discrepancies.length > 0"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900/40 shadow-sm overflow-hidden"
      >
        <div
          class="p-4 bg-red-50/70 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/40 flex items-center justify-between"
        >
          <h3 class="font-bold text-red-900 dark:text-red-300 text-sm flex items-center gap-2">
            <span>البنود غير المتطابقة</span>
            <span
              class="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold"
            >
              {{ reportData.discrepancies.length }}
            </span>
          </h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead
              class="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700/80"
            >
              <tr>
                <th class="p-3.5">#</th>
                <th class="p-3.5">الصنف / الرمز</th>
                <th class="p-3.5">المستودع</th>
                <th class="p-3.5">الرف / الباتش</th>
                <th class="p-3.5">رصيد جدول الأرصدة (Stock Table)</th>
                <th class="p-3.5">مجموع الحركات (Movements Sum)</th>
                <th class="p-3.5 text-red-600 dark:text-red-400 font-bold">الفارق الحسابي</th>
                <th class="p-3.5 text-center">مستوى الخطورة</th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300"
            >
              <tr
                v-for="(disc, idx) in reportData.discrepancies"
                :key="idx"
                class="hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-colors"
              >
                <td class="p-3.5 text-gray-400 dark:text-gray-500">{{ idx + 1 }}</td>
                <td class="p-3.5 whitespace-nowrap">
                  <div class="font-bold text-gray-900 dark:text-white">
                    {{ disc.product_name || 'صنف #' + disc.product_id }}
                  </div>
                  <div class="text-2xs text-gray-500 dark:text-gray-400 font-mono">
                    {{ disc.sku }}
                  </div>
                </td>
                <td class="p-3.5 whitespace-nowrap font-medium">
                  {{ disc.warehouse_name || disc.warehouse_id }}
                </td>
                <td class="p-3.5 whitespace-nowrap font-mono text-gray-500 dark:text-gray-400">
                  رف: {{ disc.location_id || '-' }} | باتش: {{ disc.batch_id || '-' }}
                </td>
                <td class="p-3.5 whitespace-nowrap font-semibold font-mono">
                  {{ formatNumber(disc.stock_table_quantity) }}
                </td>
                <td class="p-3.5 whitespace-nowrap font-semibold font-mono">
                  {{ formatNumber(disc.movements_calculated_quantity) }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-bold text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-950/40 font-mono"
                >
                  {{ formatNumber(disc.difference) }}
                </td>
                <td class="p-3.5 text-center whitespace-nowrap">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-lg text-2xs font-bold uppercase tracking-wider',
                      disc.severity === 'CRITICAL'
                        ? 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                        : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
                    ]"
                  >
                    {{ disc.severity }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Negative Stocks Table -->
      <div
        v-if="reportData.negative_stocks && reportData.negative_stocks.length > 0"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm overflow-hidden"
      >
        <div
          class="p-4 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/40 flex items-center justify-between"
        >
          <h3 class="font-bold text-amber-900 dark:text-amber-300 text-sm flex items-center gap-2">
            <span>سجل الأرصدة السالبة المكتشفة</span>
            <span
              class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-bold"
            >
              {{ reportData.negative_stocks.length }}
            </span>
          </h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead
              class="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700/80"
            >
              <tr>
                <th class="p-3.5">#</th>
                <th class="p-3.5">الصنف / الرمز</th>
                <th class="p-3.5">المستودع / الرف</th>
                <th class="p-3.5">رقم الباتش</th>
                <th class="p-3.5 text-red-600 dark:text-red-400 font-bold">الرصيد السالب</th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300"
            >
              <tr
                v-for="(neg, idx) in reportData.negative_stocks"
                :key="idx"
                class="hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-colors"
              >
                <td class="p-3.5 text-gray-400 dark:text-gray-500">{{ idx + 1 }}</td>
                <td class="p-3.5 whitespace-nowrap">
                  <div class="font-bold text-gray-900 dark:text-white">{{ neg.product_name }}</div>
                  <div class="text-2xs text-gray-500 dark:text-gray-400 font-mono">
                    {{ neg.sku }}
                  </div>
                </td>
                <td class="p-3.5 whitespace-nowrap">
                  <span class="font-medium text-gray-900 dark:text-white">{{
                    neg.warehouse_name
                  }}</span>
                  <span
                    v-if="neg.location_name"
                    class="text-gray-400 dark:text-gray-500 block text-2xs font-mono"
                    >رف: {{ neg.location_name }}</span
                  >
                </td>
                <td class="p-3.5 whitespace-nowrap font-mono text-gray-600 dark:text-gray-400">
                  {{ neg.batch_number || '-' }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-bold text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-950/40 font-mono"
                >
                  {{ formatNumber(neg.quantity) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import inventoryReportService from '@/modules/inventory/services/inventory-report.service'
import WarehouseDropdown from '@/modules/inventory/forms/WarehouseDropdown.vue'

const loading = ref(false)
const reportData = ref(null)

const filters = reactive({
  warehouse_id: null,
})

function resetFilters() {
  filters.warehouse_id = null
  fetchReport()
}

function formatNumber(value) {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

async function fetchReport() {
  loading.value = true
  try {
    const response = await inventoryReportService.getIntegrityAudit({
      warehouse_id: filters.warehouse_id || undefined,
    })
    reportData.value = response.data?.data || response.data
  } catch (error) {
    console.error('Error running integrity audit:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReport()
})
</script>
