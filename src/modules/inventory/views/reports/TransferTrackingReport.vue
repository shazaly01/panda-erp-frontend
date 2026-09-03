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
          <span>تقرير متابعة التحويلات المخزنية</span>
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          تتبع حركة التحويلات بين المستودعات، مطابقة الكميات الصادرة والواردة، وتكاليف النقل
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
        <!-- المستودع المصدر -->
        <div>
          <WarehouseDropdown
            id="from-warehouse-filter"
            v-model="filters.from_warehouse_id"
            label="المستودع المصدر (من)"
          />
        </div>

        <!-- المستودع الوجهة -->
        <div>
          <WarehouseDropdown
            id="to-warehouse-filter"
            v-model="filters.to_warehouse_id"
            label="المستودع الوجهة (إلى)"
          />
        </div>

        <!-- حالة التحويل -->
        <div>
          <AppDropdown
            id="transfer-status-filter"
            v-model="filters.status"
            label="حالة التحويل"
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
    <div v-if="reportData" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Total Transfers Count -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm"
      >
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400"
          >إجمالي أوامر التحويل</span
        >
        <p class="text-3xl font-extrabold text-gray-900 dark:text-white mt-3 font-mono">
          {{ reportData.summary?.total_transfers_count || 0 }}
        </p>
      </div>

      <!-- Total Transferred Quantity -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-sm bg-gradient-to-br from-white to-blue-50/40 dark:from-gray-900 dark:to-sky-950/20"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider">
            إجمالي الكميات المنقولة
          </span>
          <span class="flex h-2.5 w-2.5 rounded-full bg-blue-500"></span>
        </div>
        <p class="text-3xl font-extrabold text-blue-600 dark:text-sky-400 mt-3 font-mono">
          {{ formatNumber(reportData.summary?.total_transferred_quantity) }}
        </p>
      </div>

      <!-- Total Transferred Cost -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 shadow-sm bg-gradient-to-br from-white to-indigo-50/40 dark:from-gray-900 dark:to-indigo-950/20"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider"
          >
            إجمالي تكلفة البضائع المحولة
          </span>
          <span class="flex h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
        </div>
        <p class="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-3 font-mono">
          {{ formatNumber(reportData.summary?.total_transferred_cost) }}
        </p>
      </div>
    </div>

    <!-- Transfers Detailed List -->
    <div v-if="reportData" class="space-y-5">
      <div
        v-if="!reportData.transfers || reportData.transfers.length === 0"
        class="bg-white dark:bg-gray-900 p-12 text-center text-gray-400 dark:text-gray-500 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm font-medium"
      >
        لا توجد أوامر تحويل مخزني مطابقة لمعايير البحث
      </div>

      <div
        v-for="tr in reportData.transfers"
        :key="tr.id"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <!-- Transfer Header -->
        <div
          class="p-4 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200/80 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3"
        >
          <div class="flex flex-wrap items-center gap-3">
            <span class="font-bold text-gray-900 dark:text-white text-sm font-mono">{{
              tr.transfer_number
            }}</span>
            <span
              :class="[
                'px-2.5 py-1 rounded-lg text-2xs font-bold uppercase',
                tr.status === 'completed' || tr.status === 'approved'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : tr.status === 'in_transit'
                    ? 'bg-blue-100 dark:bg-sky-950/60 text-blue-800 dark:text-sky-300 border border-blue-200 dark:border-sky-800'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
              ]"
            >
              {{ tr.status }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span
              >من:
              <strong class="text-gray-800 dark:text-gray-200">{{
                tr.from_warehouse?.name
              }}</strong></span
            >
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <span
              >إلى:
              <strong class="text-gray-800 dark:text-gray-200">{{
                tr.to_warehouse?.name
              }}</strong></span
            >
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <span
              >التاريخ:
              <strong class="text-gray-800 dark:text-gray-200 font-mono">{{
                tr.transfer_date
              }}</strong></span
            >
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <span
              >المنشئ:
              <strong class="text-gray-800 dark:text-gray-200">{{
                tr.created_by || '-'
              }}</strong></span
            >
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <span
              >المعتمد:
              <strong class="text-gray-800 dark:text-gray-200">{{
                tr.approved_by || '-'
              }}</strong></span
            >
          </div>
        </div>

        <!-- Transfer Items Table -->
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
                <th class="p-3.5">من رف</th>
                <th class="p-3.5">إلى رف</th>
                <th class="p-3.5 text-blue-700 dark:text-sky-400 font-bold">الكمية المحولة</th>
                <th class="p-3.5">تكلفة الوحدة</th>
                <th class="p-3.5">إجمالي التكلفة</th>
                <th class="p-3.5">ملاحظات</th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300"
            >
              <tr
                v-for="(item, itemIdx) in tr.items"
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
                <td class="p-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono">
                  {{ item.from_location || '-' }}
                </td>
                <td class="p-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono">
                  {{ item.to_location || '-' }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-bold text-blue-700 dark:text-sky-400 font-mono"
                >
                  {{ formatNumber(item.quantity) }}
                </td>
                <td class="p-3.5 whitespace-nowrap font-mono">
                  {{ formatNumber(item.unit_cost) }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-semibold font-mono text-gray-900 dark:text-white"
                >
                  {{ formatNumber(item.total_cost) }}
                </td>
                <td class="p-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {{ item.notes || '-' }}
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

const statusOptions = [
  { id: '', name: 'كل الحالات' },
  { id: 'completed', name: 'مكتمل (Completed)' },
  { id: 'in_transit', name: 'قيد النقل (In Transit)' },
  { id: 'approved', name: 'معتمد (Approved)' },
  { id: 'pending', name: 'معلق (Pending)' },
  { id: 'cancelled', name: 'ملغي (Cancelled)' },
]

const filters = reactive({
  from_warehouse_id: null,
  to_warehouse_id: null,
  status: '',
  start_date: '',
  end_date: '',
})

function resetFilters() {
  filters.from_warehouse_id = null
  filters.to_warehouse_id = null
  filters.status = ''
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
    const response = await inventoryReportService.getTransfersTracking({
      from_warehouse_id: filters.from_warehouse_id || undefined,
      to_warehouse_id: filters.to_warehouse_id || undefined,
      status: filters.status || undefined,
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
    })
    reportData.value = response.data?.data || response.data
  } catch (error) {
    console.error('Error fetching transfers report:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReport()
})
</script>
