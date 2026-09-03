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
          <span>تقرير تسويات وفروقات الجرد</span>
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          مقارنة الجرد الدفتري مع الفعلي، احتساب الانحرافات (عجز / زيادة)، ومتابعة القيود المحاسبية
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
          <span>{{ loading ? 'جاري التحميل...' : 'تحديث التقرير' }}</span>
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div
      class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm"
    >
      <div class="grid grid-cols-1 md:grid-cols-5 gap-5 items-end">
        <!-- فلتر المستودع الجاهز -->
        <div>
          <WarehouseDropdown
            id="discrepancy-warehouse-filter"
            v-model="filters.warehouse_id"
            label="المستودع (اختياري)"
          />
        </div>

        <!-- نوع التسوية -->
        <div>
          <AppDropdown
            id="adjustment-type-filter"
            v-model="filters.type"
            label="نوع التسوية"
            :options="typeOptions"
            placeholder="كل الأنواع"
          />
        </div>

        <!-- الحالة -->
        <div>
          <AppDropdown
            id="adjustment-status-filter"
            v-model="filters.status"
            label="الحالة"
            :options="statusOptions"
            placeholder="كل الحالات"
          />
        </div>

        <!-- من تاريخ -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">من تاريخ</label>
          <input
            v-model="filters.start_date"
            type="date"
            class="w-full p-2.5 text-sm bg-gray-50 dark:bg-surface-ground border-2 border-gray-300 dark:border-blue-500/40 rounded-xl text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-sky-400/20 outline-none transition-all"
          />
        </div>

        <!-- إلى تاريخ -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >إلى تاريخ</label
          >
          <input
            v-model="filters.end_date"
            type="date"
            class="w-full p-2.5 text-sm bg-gray-50 dark:bg-surface-ground border-2 border-gray-300 dark:border-blue-500/40 rounded-xl text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-sky-400/20 outline-none transition-all"
          />
        </div>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div v-if="reportData" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Total Adjustments Count -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm"
      >
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400"
          >إجمالي طلبات التسوية</span
        >
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2 font-mono">
          {{ reportData.summary?.total_adjustments_count || 0 }}
        </p>
      </div>

      <!-- Surplus Cost -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm bg-gradient-to-br from-white to-emerald-50/40 dark:from-gray-900 dark:to-emerald-950/20"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider"
          >
            إجمالي قيمة الزيادة (Surplus)
          </span>
          <span class="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        </div>
        <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
          +{{ formatNumber(reportData.summary?.total_surplus_cost) }}
        </p>
      </div>

      <!-- Deficit Cost -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-red-200 dark:border-red-900/40 shadow-sm bg-gradient-to-br from-white to-red-50/40 dark:from-gray-900 dark:to-red-950/20"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
            إجمالي قيمة العجز (Deficit)
          </span>
          <span class="flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
        </div>
        <p class="text-2xl font-bold text-red-600 dark:text-red-400 mt-2 font-mono">
          -{{ formatNumber(reportData.summary?.total_deficit_cost) }}
        </p>
      </div>

      <!-- Net Variance Cost -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-sm bg-gradient-to-br from-white to-blue-50/40 dark:from-gray-900 dark:to-sky-950/20"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider"
            >صافي فارق التسويات</span
          >
          <span
            :class="[
              'flex h-2.5 w-2.5 rounded-full',
              (reportData.summary?.net_variance_cost || 0) >= 0 ? 'bg-blue-500' : 'bg-red-500',
            ]"
          ></span>
        </div>
        <p
          :class="[
            'text-2xl font-bold mt-2 font-mono',
            (reportData.summary?.net_variance_cost || 0) >= 0
              ? 'text-blue-600 dark:text-sky-400'
              : 'text-red-600 dark:text-red-400',
          ]"
        >
          {{ formatNumber(reportData.summary?.net_variance_cost) }}
        </p>
      </div>
    </div>

    <!-- Adjustments Detailed List -->
    <div v-if="reportData" class="space-y-5">
      <div
        v-if="!reportData.adjustments || reportData.adjustments.length === 0"
        class="bg-white dark:bg-gray-900 p-12 text-center text-gray-400 dark:text-gray-500 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm font-medium"
      >
        لا توجد وثائق تسوية أو جرد مطابقة لمعايير البحث
      </div>

      <div
        v-for="adj in reportData.adjustments"
        :key="adj.id"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <!-- Card Header -->
        <div
          class="p-4 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200/80 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3"
        >
          <div class="flex flex-wrap items-center gap-3">
            <span class="font-bold text-gray-900 dark:text-white text-sm font-mono">{{
              adj.adjustment_number
            }}</span>
            <span
              class="px-2.5 py-1 rounded-lg text-2xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            >
              {{ adj.type }}
            </span>
            <span
              :class="[
                'px-2.5 py-1 rounded-lg text-2xs font-bold uppercase',
                adj.status === 'approved'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
              ]"
            >
              {{ adj.status }}
            </span>
            <span
              v-if="adj.has_journal_entry"
              class="text-2xs bg-blue-50 dark:bg-sky-950/40 text-blue-700 dark:text-sky-400 border border-blue-200 dark:border-sky-800/40 px-2.5 py-1 rounded-lg font-mono font-medium"
            >
              قيد محاسبي #{{ adj.journal_entry_id }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span
              >المستودع:
              <strong class="text-gray-800 dark:text-gray-200">{{
                adj.warehouse?.name
              }}</strong></span
            >
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <span
              >التاريخ:
              <strong class="text-gray-800 dark:text-gray-200 font-mono">{{
                adj.adjustment_date
              }}</strong></span
            >
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <span
              >بواسطة:
              <strong class="text-gray-800 dark:text-gray-200">{{
                adj.created_by || '-'
              }}</strong></span
            >
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <span
              >معتمد:
              <strong class="text-gray-800 dark:text-gray-200">{{
                adj.approved_by || '-'
              }}</strong></span
            >
          </div>
        </div>

        <!-- Items Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead
              class="bg-gray-50/60 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200/60 dark:border-gray-800"
            >
              <tr>
                <th class="p-3.5">#</th>
                <th class="p-3.5">الصنف / الرمز</th>
                <th class="p-3.5">الوحدة</th>
                <th class="p-3.5">رقم الباتش</th>
                <th class="p-3.5">الرصيد الدفتري</th>
                <th class="p-3.5">الرصيد الفعلي</th>
                <th class="p-3.5">فارق الكمية</th>
                <th class="p-3.5">تكلفة الوحدة</th>
                <th class="p-3.5">إجمالي القيمة</th>
                <th class="p-3.5 text-center">نوع الفارق</th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300"
            >
              <tr
                v-for="(item, itemIdx) in adj.items"
                :key="item.id || itemIdx"
                class="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td class="p-3.5 text-gray-400 dark:text-gray-500">{{ itemIdx + 1 }}</td>
                <td class="p-3.5 whitespace-nowrap">
                  <div class="font-bold text-gray-900 dark:text-white">{{ item.product_name }}</div>
                  <div class="text-2xs text-gray-500 dark:text-gray-400 font-mono">
                    {{ item.sku }}
                  </div>
                </td>
                <td class="p-3.5 whitespace-nowrap text-gray-600 dark:text-gray-400">
                  {{ item.unit || '-' }}
                </td>
                <td class="p-3.5 whitespace-nowrap font-mono text-gray-600 dark:text-gray-400">
                  {{ item.batch_number || '-' }}
                </td>
                <td class="p-3.5 whitespace-nowrap font-mono">
                  {{ formatNumber(item.current_quantity) }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-semibold font-mono text-gray-900 dark:text-white"
                >
                  {{ formatNumber(item.actual_quantity) }}
                </td>
                <td class="p-3.5 whitespace-nowrap font-bold font-mono">
                  <span
                    :class="
                      item.quantity_difference >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    "
                  >
                    {{ item.quantity_difference > 0 ? '+' : ''
                    }}{{ formatNumber(item.quantity_difference) }}
                  </span>
                </td>
                <td class="p-3.5 whitespace-nowrap font-mono">
                  {{ formatNumber(item.unit_cost) }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-semibold font-mono text-gray-900 dark:text-white"
                >
                  {{ formatNumber(item.total_cost) }}
                </td>
                <td class="p-3.5 text-center whitespace-nowrap">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-lg text-2xs font-bold uppercase',
                      item.variance_type === 'SURPLUS'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800',
                    ]"
                  >
                    {{ item.variance_type === 'SURPLUS' ? 'زيادة' : 'عجز' }}
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
import { ref, reactive, onMounted } from 'vue'
import inventoryReportService from '@/modules/inventory/services/inventory-report.service'
import WarehouseDropdown from '@/modules/inventory/forms/WarehouseDropdown.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const loading = ref(false)
const reportData = ref(null)

const typeOptions = [
  { id: '', name: 'كل الأنواع' },
  { id: 'physical_count', name: 'جرد فعلي دوري' },
  { id: 'opening_balance', name: 'رصيد افتتاحي' },
  { id: 'damage_adjustment', name: 'تسوية تالف ومفقود' },
  { id: 'general_adjustment', name: 'تسوية عامة' },
]

const statusOptions = [
  { id: '', name: 'كل الحالات' },
  { id: 'approved', name: 'معتمد (Approved)' },
  { id: 'draft', name: 'مسودة (Draft)' },
  { id: 'pending', name: 'قيد المراجعة (Pending)' },
  { id: 'cancelled', name: 'ملغي (Cancelled)' },
]

const filters = reactive({
  warehouse_id: null,
  status: '',
  type: '',
  start_date: '',
  end_date: '',
})

function resetFilters() {
  filters.warehouse_id = null
  filters.status = ''
  filters.type = ''
  filters.start_date = ''
  filters.end_date = ''
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
    const response = await inventoryReportService.getStockDiscrepancies({
      warehouse_id: filters.warehouse_id || undefined,
      status: filters.status || undefined,
      type: filters.type || undefined,
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
    })
    reportData.value = response.data?.data || response.data
  } catch (error) {
    console.error('Error fetching discrepancies report:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReport()
})
</script>
