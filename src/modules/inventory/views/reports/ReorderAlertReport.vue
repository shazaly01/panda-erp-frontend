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
          <span>تقرير نواقص المخزون وحدود إعادة الطلب</span>
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          تنبيهات فورية بالأصناف التي وصلت أو تجاوزت الحد الأدنى، مع اقتراح كميات الشراء المطلوبة
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
          <span>{{ loading ? 'جاري التحقق...' : 'تحديث التقرير' }}</span>
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
            id="reorder-warehouse-filter"
            v-model="filters.warehouse_id"
            label="المستودع (اختياري)"
          />
        </div>
      </div>
    </div>

    <!-- Summary & Alerts List -->
    <div v-if="reportData" class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Reorder Alerts Count -->
        <div
          class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-red-200 dark:border-red-900/40 shadow-sm bg-gradient-to-br from-white to-red-50/40 dark:from-gray-900 dark:to-red-950/20"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
              عدد الأصناف التي بلغت حد الطلب
            </span>
            <span class="flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
          </div>
          <p class="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-3 font-mono">
            {{ reportData.summary?.total_alerts_count || 0 }}
          </p>
        </div>

        <!-- Total Shortage Quantity -->
        <div
          class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm bg-gradient-to-br from-white to-amber-50/40 dark:from-gray-900 dark:to-amber-950/20"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider"
            >
              إجمالي كميات النواقص
            </span>
            <span class="flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          </div>
          <p class="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-3 font-mono">
            {{ formatNumber(totalShortageQuantity) }}
          </p>
        </div>

        <!-- Total Suggested Purchase -->
        <div
          class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-sm bg-gradient-to-br from-white to-blue-50/40 dark:from-gray-900 dark:to-sky-950/20"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider"
            >
              إجمالي كميات الشراء المقترحة
            </span>
            <span class="flex h-2.5 w-2.5 rounded-full bg-blue-500"></span>
          </div>
          <p class="text-3xl font-extrabold text-blue-600 dark:text-sky-400 mt-3 font-mono">
            {{ formatNumber(totalSuggestedPurchase) }}
          </p>
        </div>
      </div>

      <!-- Alerts Table -->
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div
          class="p-4 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between"
        >
          <h3 class="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
            <span>قائمة الأصناف المحتاجة للطلب</span>
            <span
              class="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold font-mono"
            >
              {{ reportData.alerts?.length || 0 }}
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
                <th class="p-3.5 text-red-600 dark:text-red-400 font-bold">الرصيد المتاح حالياً</th>
                <th class="p-3.5">الحد الأدنى (نقطة الطلب)</th>
                <th class="p-3.5">الحد الأقصى</th>
                <th class="p-3.5">كمية إعادة الطلب الافتراضية</th>
                <th class="p-3.5 text-amber-600 dark:text-amber-400 font-bold">
                  كمية النقص الفعلي
                </th>
                <th class="p-3.5 text-blue-700 dark:text-sky-400 font-bold">
                  الكمية المقترح شراؤها
                </th>
                <th class="p-3.5 text-center">مستوى الأولوية</th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300"
            >
              <tr v-if="!reportData.alerts || reportData.alerts.length === 0">
                <td
                  colspan="10"
                  class="p-12 text-center text-emerald-600 dark:text-emerald-400 font-medium"
                >
                  المخزون في مستويات ممتازة، لا توجد أصناف وصلت إلى حد إعادة الطلب حالياً ✓
                </td>
              </tr>
              <tr
                v-for="(alert, idx) in reportData.alerts"
                :key="idx"
                class="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td class="p-3.5 text-gray-400 dark:text-gray-500">{{ idx + 1 }}</td>
                <td class="p-3.5 whitespace-nowrap">
                  <div class="font-bold text-gray-900 dark:text-white">
                    {{ alert.product_name }}
                  </div>
                  <div class="text-2xs text-gray-500 dark:text-gray-400 font-mono">
                    {{ alert.sku }}
                  </div>
                </td>
                <td class="p-3.5 whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                  {{ alert.warehouse?.name }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-bold text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-950/40 font-mono"
                >
                  {{ formatNumber(alert.available_stock) }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 font-mono"
                >
                  {{ formatNumber(alert.min_quantity) }}
                </td>
                <td class="p-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono">
                  {{ formatNumber(alert.max_quantity) }}
                </td>
                <td class="p-3.5 whitespace-nowrap text-gray-600 dark:text-gray-400 font-mono">
                  {{ formatNumber(alert.reorder_quantity) }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-bold text-amber-600 dark:text-amber-400 font-mono"
                >
                  {{ formatNumber(alert.shortage_quantity) }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-bold text-blue-700 dark:text-sky-400 bg-blue-50/60 dark:bg-sky-950/40 font-mono"
                >
                  {{ formatNumber(alert.suggested_purchase_quantity) }}
                </td>
                <td class="p-3.5 text-center whitespace-nowrap">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-lg text-2xs font-bold tracking-wider',
                      alert.available_stock <= 0
                        ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
                    ]"
                  >
                    {{ alert.available_stock <= 0 ? 'نفاد تام (عاجل)' : 'منخفض' }}
                  </span>
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
import { ref, reactive, computed, onMounted } from 'vue'
import inventoryReportService from '@/modules/inventory/services/inventory-report.service'
import WarehouseDropdown from '@/modules/inventory/forms/WarehouseDropdown.vue'

const loading = ref(false)
const reportData = ref(null)

const filters = reactive({
  warehouse_id: null,
})

const totalShortageQuantity = computed(() => {
  if (!reportData.value?.alerts) return 0
  return reportData.value.alerts.reduce((acc, curr) => acc + Number(curr.shortage_quantity || 0), 0)
})

const totalSuggestedPurchase = computed(() => {
  if (!reportData.value?.alerts) return 0
  return reportData.value.alerts.reduce(
    (acc, curr) => acc + Number(curr.suggested_purchase_quantity || 0),
    0,
  )
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
    const response = await inventoryReportService.getReorderAlerts({
      warehouse_id: filters.warehouse_id || undefined,
    })
    reportData.value = response.data?.data || response.data
  } catch (error) {
    console.error('Error fetching reorder alerts report:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReport()
})
</script>
