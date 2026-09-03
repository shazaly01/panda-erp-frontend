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
          <span>تقرير صلاحيات ودفعات التشغيل (Batches & Expiry)</span>
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          مراقبة تواريخ الصلاحية، تنبيهات المنتجات المنتهية أو القريبة من الانتهاء، وتوزيع الأرصدة
          بالمستودعات
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
        <!-- فلتر الأصناف باستخدام البحث الذكي -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"> الصنف </label>
          <div
            v-if="selectedProduct"
            class="flex items-center justify-between p-2.5 bg-blue-50/50 dark:bg-sky-950/30 border border-blue-200 dark:border-sky-500/30 rounded-xl"
          >
            <div class="truncate">
              <span class="font-bold text-sm text-blue-700 dark:text-sky-400">{{
                selectedProduct.name
              }}</span>
              <span
                v-if="selectedProduct.code || selectedProduct.sku"
                class="text-xs text-gray-500 dark:text-gray-400 mr-2 font-mono"
              >
                ({{ selectedProduct.code || selectedProduct.sku }})
              </span>
            </div>
            <button
              type="button"
              @click="clearSelectedProduct"
              class="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-lg transition-colors"
              title="إلغاء التحديد"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <SmartSearchGrid
            v-else
            :data="searchableProducts"
            :columns="productSearchColumns"
            :search-keys="['id', 'name', 'code', 'sku', 'all_barcodes']"
            placeholder="ابحث باسم الصنف أو الباركود..."
            @select="onProductSelect"
          />
        </div>

        <!-- فلتر المستودعات الجاهز -->
        <div>
          <WarehouseDropdown
            id="report-warehouse-filter"
            v-model="filters.warehouse_id"
            label="المستودع"
          />
        </div>

        <!-- حد التنبيه بالأيام -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            حد التنبيه قبل الانتهاء (بالأيام)
          </label>
          <input
            v-model.number="filters.days_threshold"
            type="number"
            min="1"
            placeholder="60"
            class="w-full p-2.5 text-sm bg-gray-50 dark:bg-surface-ground border-2 border-gray-300 dark:border-blue-500/40 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-sky-400/20 outline-none transition-all"
          />
        </div>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div v-if="reportData" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Expired Card -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-red-200 dark:border-red-900/40 shadow-sm bg-gradient-to-br from-white to-red-50/40 dark:from-gray-900 dark:to-red-950/20"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider"
            >دفعات منتهية الصلاحية (Expired)</span
          >
          <span class="flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
        </div>
        <p class="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-3 font-mono">
          {{ reportData.summary?.expired_count || 0 }}
        </p>
      </div>

      <!-- Near Expiry Card -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm bg-gradient-to-br from-white to-amber-50/40 dark:from-gray-900 dark:to-amber-950/20"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider"
          >
            دفعات قريبة من الانتهاء (&le;
            {{ reportData.summary?.days_threshold || filters.days_threshold }} يوم)
          </span>
          <span class="flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
        </div>
        <p class="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-3 font-mono">
          {{ reportData.summary?.near_expiry_count || 0 }}
        </p>
      </div>

      <!-- Valid Card -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm bg-gradient-to-br from-white to-emerald-50/40 dark:from-gray-900 dark:to-emerald-950/20"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider"
            >دفعات سارية وصالحة</span
          >
          <span class="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        </div>
        <p class="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-3 font-mono">
          {{ reportData.summary?.valid_count || 0 }}
        </p>
      </div>
    </div>

    <!-- Tables Sections -->
    <div v-if="reportData" class="space-y-6">
      <!-- 1. Expired Batches Table -->
      <div
        v-if="reportData.expired && reportData.expired.length > 0"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900/40 shadow-sm overflow-hidden"
      >
        <div
          class="p-4 bg-red-50/70 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/40 flex items-center justify-between"
        >
          <h3 class="font-bold text-red-900 dark:text-red-300 text-sm flex items-center gap-2">
            <span>التشغيلات منتهية الصلاحية</span>
            <span
              class="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold"
            >
              {{ reportData.expired.length }}
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
                <th class="p-3.5">رقم الباتش</th>
                <th class="p-3.5">الصنف / الرمز</th>
                <th class="p-3.5">تاريخ الإنتاج</th>
                <th class="p-3.5">تاريخ الانتهاء</th>
                <th class="p-3.5 text-red-600 dark:text-red-400 font-bold">منتهي منذ</th>
                <th class="p-3.5">إجمالي الرصيد</th>
                <th class="p-3.5">توزيع المستودعات والرفوف</th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300"
            >
              <tr
                v-for="(batch, idx) in reportData.expired"
                :key="batch.id || idx"
                class="hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-colors"
              >
                <td class="p-3.5 text-gray-400 dark:text-gray-500">{{ idx + 1 }}</td>
                <td class="p-3.5 font-mono font-bold text-gray-900 dark:text-gray-100">
                  {{ batch.batch_number }}
                </td>
                <td class="p-3.5 whitespace-nowrap">
                  <div class="font-bold text-gray-900 dark:text-white">
                    {{ batch.product?.name }}
                  </div>
                  <div class="text-2xs text-gray-500 dark:text-gray-400 font-mono">
                    {{ batch.product?.sku || batch.product?.code }}
                  </div>
                </td>
                <td class="p-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {{ batch.manufacturing_date || '-' }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-bold text-red-600 dark:text-red-400 font-mono"
                >
                  {{ batch.expiry_date }}
                </td>
                <td class="p-3.5 whitespace-nowrap font-bold text-red-600 dark:text-red-400">
                  {{ Math.abs(batch.days_remaining) }} يوم
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-bold text-gray-900 dark:text-white font-mono"
                >
                  {{ formatNumber(batch.current_stock) }}
                </td>
                <td class="p-3.5 text-2xs">
                  <span
                    v-for="(wh, whIdx) in batch.warehouses_breakdown"
                    :key="whIdx"
                    class="inline-block bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-lg ml-1 mb-1"
                  >
                    {{ wh.warehouse }} ({{ wh.location || 'عام' }}):
                    <strong class="text-gray-900 dark:text-white font-mono">{{
                      formatNumber(wh.quantity)
                    }}</strong>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Near Expiry Batches Table -->
      <div
        v-if="reportData.near_expiry && reportData.near_expiry.length > 0"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm overflow-hidden"
      >
        <div
          class="p-4 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/40 flex items-center justify-between"
        >
          <h3 class="font-bold text-amber-900 dark:text-amber-300 text-sm flex items-center gap-2">
            <span>التشغيلات القريبة من الانتهاء</span>
            <span
              class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-bold"
            >
              {{ reportData.near_expiry.length }}
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
                <th class="p-3.5">رقم الباتش</th>
                <th class="p-3.5">الصنف / الرمز</th>
                <th class="p-3.5">تاريخ الإنتاج</th>
                <th class="p-3.5">تاريخ الانتهاء</th>
                <th class="p-3.5 text-amber-600 dark:text-amber-400 font-bold">
                  متبقي على الانتهاء
                </th>
                <th class="p-3.5">إجمالي الرصيد</th>
                <th class="p-3.5">توزيع المستودعات والرفوف</th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300"
            >
              <tr
                v-for="(batch, idx) in reportData.near_expiry"
                :key="batch.id || idx"
                class="hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-colors"
              >
                <td class="p-3.5 text-gray-400 dark:text-gray-500">{{ idx + 1 }}</td>
                <td class="p-3.5 font-mono font-bold text-gray-900 dark:text-gray-100">
                  {{ batch.batch_number }}
                </td>
                <td class="p-3.5 whitespace-nowrap">
                  <div class="font-bold text-gray-900 dark:text-white">
                    {{ batch.product?.name }}
                  </div>
                  <div class="text-2xs text-gray-500 dark:text-gray-400 font-mono">
                    {{ batch.product?.sku || batch.product?.code }}
                  </div>
                </td>
                <td class="p-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {{ batch.manufacturing_date || '-' }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-semibold text-amber-600 dark:text-amber-400 font-mono"
                >
                  {{ batch.expiry_date }}
                </td>
                <td class="p-3.5 whitespace-nowrap font-bold text-amber-600 dark:text-amber-400">
                  {{ batch.days_remaining }} يوم
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-bold text-gray-900 dark:text-white font-mono"
                >
                  {{ formatNumber(batch.current_stock) }}
                </td>
                <td class="p-3.5 text-2xs">
                  <span
                    v-for="(wh, whIdx) in batch.warehouses_breakdown"
                    :key="whIdx"
                    class="inline-block bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-lg ml-1 mb-1"
                  >
                    {{ wh.warehouse }} ({{ wh.location || 'عام' }}):
                    <strong class="text-gray-900 dark:text-white font-mono">{{
                      formatNumber(wh.quantity)
                    }}</strong>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. Valid Batches Table -->
      <div
        v-if="reportData.valid && reportData.valid.length > 0"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div
          class="p-4 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between"
        >
          <h3 class="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
            <span>التشغيلات الصالحة والسارية</span>
            <span
              class="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold"
            >
              {{ reportData.valid.length }}
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
                <th class="p-3.5">رقم الباتش</th>
                <th class="p-3.5">الصنف / الرمز</th>
                <th class="p-3.5">تاريخ الإنتاج</th>
                <th class="p-3.5">تاريخ الانتهاء</th>
                <th class="p-3.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  الأيام المتبقية
                </th>
                <th class="p-3.5">إجمالي الرصيد</th>
                <th class="p-3.5">توزيع المستودعات والرفوف</th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300"
            >
              <tr
                v-for="(batch, idx) in reportData.valid"
                :key="batch.id || idx"
                class="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td class="p-3.5 text-gray-400 dark:text-gray-500">{{ idx + 1 }}</td>
                <td class="p-3.5 font-mono font-bold text-gray-900 dark:text-gray-100">
                  {{ batch.batch_number }}
                </td>
                <td class="p-3.5 whitespace-nowrap">
                  <div class="font-bold text-gray-900 dark:text-white">
                    {{ batch.product?.name }}
                  </div>
                  <div class="text-2xs text-gray-500 dark:text-gray-400 font-mono">
                    {{ batch.product?.sku || batch.product?.code }}
                  </div>
                </td>
                <td class="p-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {{ batch.manufacturing_date || '-' }}
                </td>
                <td class="p-3.5 whitespace-nowrap text-gray-700 dark:text-gray-300 font-mono">
                  {{ batch.expiry_date || 'غير محدد' }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-medium text-emerald-600 dark:text-emerald-400"
                >
                  {{ batch.days_remaining !== null ? batch.days_remaining + ' يوم' : '-' }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-bold text-gray-900 dark:text-white font-mono"
                >
                  {{ formatNumber(batch.current_stock) }}
                </td>
                <td class="p-3.5 text-2xs">
                  <span
                    v-for="(wh, whIdx) in batch.warehouses_breakdown"
                    :key="whIdx"
                    class="inline-block bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-lg ml-1 mb-1"
                  >
                    {{ wh.warehouse }} ({{ wh.location || 'عام' }}):
                    <strong class="text-gray-900 dark:text-white font-mono">{{
                      formatNumber(wh.quantity)
                    }}</strong>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- No Data Fallback -->
      <div
        v-if="
          reportData &&
          (!reportData.expired || reportData.expired.length === 0) &&
          (!reportData.near_expiry || reportData.near_expiry.length === 0) &&
          (!reportData.valid || reportData.valid.length === 0)
        "
        class="bg-white dark:bg-gray-900 p-12 text-center rounded-2xl border border-gray-200 dark:border-gray-800"
      >
        <p class="text-gray-500 dark:text-gray-400 font-medium">
          لا توجد بيانات مطابقة لمعايير الفلترة الحالية.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import inventoryReportService from '@/modules/inventory/services/inventory-report.service'
import WarehouseDropdown from '@/modules/inventory/forms/WarehouseDropdown.vue'
import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'
import { useProductStore } from '@/modules/inventory/stores/productStore'

const loading = ref(false)
const reportData = ref(null)
const selectedProduct = ref(null)
const productStore = useProductStore()

const productSearchColumns = [
  { key: 'id_display', label: 'الرقم', widthClass: 'w-24' },
  { key: 'name', label: 'اسم الصنف' },
  { key: 'code', label: 'الرمز', widthClass: 'w-28' },
]

const filters = reactive({
  product_id: null,
  warehouse_id: null,
  days_threshold: 60,
})

const searchableProducts = computed(() => {
  if (!productStore.products) return []
  return productStore.products.map((item) => {
    const directBarcodes = Array.isArray(item.barcodes)
      ? item.barcodes.map((b) => (typeof b === 'object' ? b.barcode : b))
      : []

    const unitBarcodes = Array.isArray(item.units)
      ? item.units.flatMap((u) =>
          Array.isArray(u.barcodes)
            ? u.barcodes.map((b) => (typeof b === 'object' ? b.barcode : b))
            : [],
        )
      : []

    const allBarcodes = [...new Set([...directBarcodes, ...unitBarcodes])].filter(Boolean)

    return {
      ...item,
      id_display: `PRD-${item.id}`,
      name: item.name || '',
      code: item.code || item.sku || '',
      sku: item.sku || '',
      all_barcodes: allBarcodes,
    }
  })
})

function onProductSelect(product) {
  selectedProduct.value = product
  filters.product_id = product.id
  fetchReport()
}

function clearSelectedProduct() {
  selectedProduct.value = null
  filters.product_id = null
  fetchReport()
}

function resetFilters() {
  filters.product_id = null
  filters.warehouse_id = null
  filters.days_threshold = 60
  selectedProduct.value = null
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
    const response = await inventoryReportService.getBatchExpiry({
      product_id: filters.product_id || undefined,
      warehouse_id: filters.warehouse_id || undefined,
      days_threshold: filters.days_threshold || 60,
    })
    reportData.value = response.data?.data || response.data
  } catch (error) {
    console.error('Error fetching batch expiry report:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchReport(), productStore.fetchProducts({ is_active: 1, all: true })])
})
</script>
