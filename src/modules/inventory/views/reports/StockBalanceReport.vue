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
          <span>تقرير أرصدة وتقييم المخزون</span>
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          عرض الأرصدة اللحظية، الكميات المحجوزة والمتاحة، والتقييم المالي الشامل
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
          <span>{{ loading ? 'جاري التحديث...' : 'تحديث التقرير' }}</span>
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div
      class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm"
    >
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
        <!-- بحث بالاسم أو الرمز -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            بحث بالاسم أو الرمز (SKU)
          </label>
          <div class="relative">
            <input
              v-model="filters.search"
              type="text"
              placeholder="بحث عن منتج أو باركود..."
              class="w-full p-2.5 pr-9 text-sm bg-gray-50 dark:bg-surface-ground border-2 border-gray-300 dark:border-blue-500/40 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-sky-400/20 outline-none transition-all"
            />
            <svg
              class="w-4 h-4 text-gray-400 dark:text-gray-500 absolute right-3 top-3.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>

        <!-- فلتر المستودع الجاهز -->
        <div>
          <WarehouseDropdown
            id="stock-balance-warehouse-filter"
            v-model="filters.warehouse_id"
            label="المستودع (اختياري)"
          />
        </div>

        <!-- التصنيف -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            معرف التصنيف (اختياري)
          </label>
          <input
            v-model.number="filters.category_id"
            type="number"
            placeholder="كل التصنيفات"
            class="w-full p-2.5 text-sm bg-gray-50 dark:bg-surface-ground border-2 border-gray-300 dark:border-blue-500/40 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-sky-400/20 outline-none transition-all"
          />
        </div>

        <!-- خيار الأصناف المتوفرة فقط -->
        <div
          class="flex items-center gap-3 p-3 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl h-[46px]"
        >
          <input
            id="onlyInStock"
            v-model="filters.only_in_stock"
            type="checkbox"
            class="w-4 h-4 text-blue-600 dark:text-sky-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-sky-400 bg-white dark:bg-gray-900"
          />
          <label
            for="onlyInStock"
            class="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none"
          >
            عرض الأصناف المتوفرة فقط
          </label>
        </div>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div v-if="reportData" class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <!-- Total Items -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm"
      >
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">إجمالي البنود</span>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2 font-mono">
          {{ reportData.summary?.total_items_count || 0 }}
        </p>
      </div>

      <!-- Total Quantity -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm"
      >
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">الكمية الإجمالية</span>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2 font-mono">
          {{ formatNumber(reportData.summary?.total_quantity) }}
        </p>
      </div>

      <!-- Reserved Quantity -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm bg-gradient-to-br from-white to-amber-50/40 dark:from-gray-900 dark:to-amber-950/20"
      >
        <span class="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider"
          >الكميات المحجوزة</span
        >
        <p class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2 font-mono">
          {{ formatNumber(reportData.summary?.total_reserved) }}
        </p>
      </div>

      <!-- Available Quantity -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm bg-gradient-to-br from-white to-emerald-50/40 dark:from-gray-900 dark:to-emerald-950/20"
      >
        <span
          class="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider"
          >الكمية المتاحة للبيع</span
        >
        <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
          {{ formatNumber(reportData.summary?.total_available) }}
        </p>
      </div>

      <!-- Total Valuation -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-sm bg-gradient-to-br from-white to-blue-50/40 dark:from-gray-900 dark:to-sky-950/20 col-span-2 md:col-span-1"
      >
        <span class="text-xs font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider"
          >إجمالي التقييم المالي</span
        >
        <p class="text-2xl font-bold text-blue-600 dark:text-sky-400 mt-2 font-mono">
          {{ formatNumber(reportData.summary?.total_valuation) }}
        </p>
      </div>
    </div>

    <!-- Stock Balance Table -->
    <div
      v-if="reportData"
      class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden"
    >
      <div
        class="p-4 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between"
      >
        <h3 class="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
          <span>تفاصيل الأرصدة المخزنية</span>
          <span
            class="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold font-mono"
          >
            {{ reportData.items?.length || 0 }}
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
              <th class="p-3.5">التصنيف</th>
              <th class="p-3.5">المستودع / الرف</th>
              <th class="p-3.5">التشغيلة / الانتهاء</th>
              <th class="p-3.5">سعر التكلفة</th>
              <th class="p-3.5">الرصيد الفعلي</th>
              <th class="p-3.5 text-amber-600 dark:text-amber-400">المحجوز</th>
              <th class="p-3.5 text-emerald-600 dark:text-emerald-400 font-bold">المتاح</th>
              <th class="p-3.5 text-blue-700 dark:text-sky-400 font-bold">إجمالي القيمة</th>
            </tr>
          </thead>
          <tbody
            class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300"
          >
            <tr v-if="!reportData.items || reportData.items.length === 0">
              <td
                colspan="10"
                class="p-12 text-center text-gray-400 dark:text-gray-500 font-medium"
              >
                لا توجد بيانات مطابقة لمعايير البحث
              </td>
            </tr>
            <tr
              v-for="(item, idx) in reportData.items"
              :key="item.stock_id || idx"
              :class="[
                'hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors',
                item.has_negative_stock ? 'bg-red-50/40 dark:bg-red-950/20' : '',
              ]"
            >
              <td class="p-3.5 text-gray-400 dark:text-gray-500">{{ idx + 1 }}</td>
              <td class="p-3.5 whitespace-nowrap">
                <div class="font-bold text-gray-900 dark:text-white">{{ item.product?.name }}</div>
                <div class="text-2xs text-gray-500 dark:text-gray-400 font-mono">
                  {{ item.product?.sku }}
                </div>
              </td>
              <td class="p-3.5 whitespace-nowrap text-gray-600 dark:text-gray-400">
                {{ item.product?.category || 'عام' }}
              </td>
              <td class="p-3.5 whitespace-nowrap">
                <span class="font-medium text-gray-900 dark:text-white">{{
                  item.warehouse?.name
                }}</span>
                <span
                  v-if="item.location"
                  class="text-gray-400 dark:text-gray-500 block text-2xs font-mono"
                >
                  رف: {{ item.location.name }}
                </span>
              </td>
              <td class="p-3.5 whitespace-nowrap">
                <div v-if="item.batch">
                  <span class="font-mono text-gray-800 dark:text-gray-200 font-bold">{{
                    item.batch.batch_number
                  }}</span>
                  <span
                    v-if="item.batch.expiry_date"
                    class="block text-2xs text-gray-400 dark:text-gray-500 font-mono"
                  >
                    انتهاء: {{ item.batch.expiry_date }}
                  </span>
                </div>
                <span v-else class="text-gray-400 dark:text-gray-500">-</span>
              </td>
              <td class="p-3.5 whitespace-nowrap font-mono">
                {{ formatNumber(item.product?.cost_price) }}
              </td>
              <td class="p-3.5 whitespace-nowrap font-semibold">
                <span
                  :class="
                    item.quantity < 0
                      ? 'text-red-600 dark:text-red-400 font-bold font-mono'
                      : 'text-gray-900 dark:text-white font-mono'
                  "
                >
                  {{ formatNumber(item.quantity) }}
                </span>
                <span
                  v-if="item.has_negative_stock"
                  class="mr-1.5 inline-flex items-center px-2 py-0.5 rounded-lg text-2xs font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                >
                  سالب !
                </span>
              </td>
              <td class="p-3.5 whitespace-nowrap text-amber-600 dark:text-amber-400 font-mono">
                {{ formatNumber(item.reserved_quantity) }}
              </td>
              <td
                class="p-3.5 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400 font-mono"
              >
                {{ formatNumber(item.available_quantity) }}
              </td>
              <td
                class="p-3.5 font-bold text-blue-700 dark:text-sky-400 bg-blue-50/40 dark:bg-sky-950/20 whitespace-nowrap font-mono"
              >
                {{ formatNumber(item.total_valuation) }}
              </td>
            </tr>
          </tbody>
        </table>
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
  search: '',
  warehouse_id: null,
  category_id: null,
  only_in_stock: false,
})

function resetFilters() {
  filters.search = ''
  filters.warehouse_id = null
  filters.category_id = null
  filters.only_in_stock = false
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
    const response = await inventoryReportService.getStockBalance({
      search: filters.search || undefined,
      warehouse_id: filters.warehouse_id || undefined,
      category_id: filters.category_id || undefined,
      only_in_stock: filters.only_in_stock || undefined,
    })
    reportData.value = response.data?.data || response.data
  } catch (error) {
    console.error('Error fetching stock balance report:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReport()
})
</script>
