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
          <span>تقرير كارت الصنف التفصيلي</span>
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          تتبع الحركات الزمنية، الوارد والمنصرف، والرصيد التراكمي اللحظي
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
          :disabled="loading || !filters.product_id"
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
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
        <!-- فلتر الصنف باستخدام البحث الذكي -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            الصنف المستهدف <span class="text-red-500">*</span>
          </label>
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
            id="card-warehouse-filter"
            v-model="filters.warehouse_id"
            label="المستودع (اختياري)"
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

    <!-- Report Details & Stats -->
    <div v-if="reportData" class="space-y-6">
      <!-- Product Info Card -->
      <div
        class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm flex flex-wrap items-center justify-between gap-4"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 bg-blue-50 dark:bg-sky-950/40 text-blue-600 dark:text-sky-400 border border-blue-100 dark:border-sky-800/40 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner"
          >
            {{ reportData.product?.sku ? reportData.product.sku.substring(0, 2) : 'PR' }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ reportData.product?.name }}
            </h2>
            <div
              class="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1.5"
            >
              <span>
                رمز الصنف:
                <strong class="text-gray-800 dark:text-gray-200 font-mono">{{
                  reportData.product?.sku
                }}</strong>
              </span>
              <span class="text-gray-300 dark:text-gray-700">•</span>
              <span>
                التصنيف:
                <strong class="text-gray-800 dark:text-gray-200">{{
                  reportData.product?.category || 'عام'
                }}</strong>
              </span>
              <span class="text-gray-300 dark:text-gray-700">•</span>
              <span>
                طريقة التقييم:
                <strong class="text-gray-800 dark:text-gray-200">{{
                  reportData.product?.valuation_method
                }}</strong>
              </span>
            </div>
          </div>
        </div>
        <div class="text-left">
          <span class="text-xs text-gray-500 dark:text-gray-400 block font-medium"
            >سعر التكلفة الحالي</span
          >
          <span class="text-2xl font-bold text-gray-900 dark:text-white font-mono mt-1 block">
            {{ formatNumber(reportData.product?.current_cost_price) }}
          </span>
        </div>
      </div>

      <!-- Summary KPI Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Opening Balance -->
        <div
          class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm"
        >
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400"
            >الرصيد الافتتاحي</span
          >
          <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2 font-mono">
            {{ formatNumber(reportData.summary?.opening_balance) }}
          </p>
          <span class="text-xs text-gray-400 dark:text-gray-500 mt-1 block font-mono">
            القيمة: {{ formatNumber(reportData.summary?.opening_cost) }}
          </span>
        </div>

        <!-- Total In -->
        <div
          class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm bg-gradient-to-br from-white to-emerald-50/40 dark:from-gray-900 dark:to-emerald-950/20"
        >
          <span
            class="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider"
            >إجمالي الوارد</span
          >
          <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            +{{ formatNumber(reportData.summary?.total_in_quantity) }}
          </p>
          <span class="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1 block font-mono">
            التكلفة: {{ formatNumber(reportData.summary?.total_in_cost) }}
          </span>
        </div>

        <!-- Total Out -->
        <div
          class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-red-200 dark:border-red-900/40 shadow-sm bg-gradient-to-br from-white to-red-50/40 dark:from-gray-900 dark:to-red-950/20"
        >
          <span class="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider"
            >إجمالي المنصرف</span
          >
          <p class="text-2xl font-bold text-red-600 dark:text-red-400 mt-2 font-mono">
            -{{ formatNumber(reportData.summary?.total_out_quantity) }}
          </p>
          <span class="text-xs text-red-600/80 dark:text-red-400/80 mt-1 block font-mono">
            التكلفة: {{ formatNumber(reportData.summary?.total_out_cost) }}
          </span>
        </div>

        <!-- Closing Balance -->
        <div
          class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-sm bg-gradient-to-br from-white to-blue-50/40 dark:from-gray-900 dark:to-sky-950/20"
        >
          <span class="text-xs font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider"
            >رصيد الإغلاق اللحظي</span
          >
          <p class="text-2xl font-bold text-blue-600 dark:text-sky-400 mt-2 font-mono">
            {{ formatNumber(reportData.summary?.closing_balance) }}
          </p>
          <span class="text-xs text-blue-600/80 dark:text-sky-400/80 mt-1 block font-mono">
            إجمالي القيمة: {{ formatNumber(reportData.summary?.closing_cost) }}
          </span>
        </div>
      </div>

      <!-- Movements Table -->
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div
          class="p-4 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between"
        >
          <h3 class="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
            <span>سجل الحركات المخزنية</span>
            <span
              class="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold font-mono"
            >
              {{ reportData.movements?.length || 0 }}
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
                <th class="p-3.5">التاريخ والوقت</th>
                <th class="p-3.5">نوع الحركة</th>
                <th class="p-3.5">المستودع / الرف</th>
                <th class="p-3.5">المرجع</th>
                <th class="p-3.5 text-emerald-600 dark:text-emerald-400">وارد</th>
                <th class="p-3.5 text-red-600 dark:text-red-400">منصرف</th>
                <th class="p-3.5">تكلفة الوحدة</th>
                <th class="p-3.5">إجمالي التكلفة</th>
                <th class="p-3.5 text-blue-700 dark:text-sky-400 font-bold">الرصيد التراكمي</th>
                <th class="p-3.5 text-center">المطابقة</th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300"
            >
              <tr v-if="!reportData.movements || reportData.movements.length === 0">
                <td
                  colspan="11"
                  class="p-8 text-center text-gray-400 dark:text-gray-500 font-medium"
                >
                  لا توجد حركات مسجلة لهذا الصنف خلال الفترة المحددة
                </td>
              </tr>
              <tr
                v-for="(m, idx) in reportData.movements"
                :key="m.id || idx"
                class="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td class="p-3.5 text-gray-400 dark:text-gray-500">{{ idx + 1 }}</td>
                <td class="p-3.5 whitespace-nowrap font-mono text-gray-600 dark:text-gray-400">
                  {{ m.created_at }}
                </td>
                <td class="p-3.5 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-lg text-2xs font-bold uppercase',
                      isInMovement(m.movement_type)
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800',
                    ]"
                  >
                    {{ m.movement_type }}
                  </span>
                </td>
                <td class="p-3.5 whitespace-nowrap">
                  <span class="font-medium text-gray-900 dark:text-white">{{
                    m.warehouse?.name
                  }}</span>
                  <span
                    v-if="m.location"
                    class="text-gray-400 dark:text-gray-500 block text-2xs font-mono"
                  >
                    رف: {{ m.location.name }}
                  </span>
                </td>
                <td class="p-3.5 whitespace-nowrap">
                  <span
                    v-if="m.reference"
                    class="text-blue-700 dark:text-sky-400 bg-blue-50 dark:bg-sky-950/40 border border-blue-100 dark:border-sky-800/40 px-2 py-0.5 rounded-lg text-2xs font-mono"
                  >
                    {{ m.reference.type }}: {{ m.reference.document_number }}
                  </span>
                  <span v-else class="text-gray-400 dark:text-gray-500">-</span>
                </td>
                <td
                  class="p-3.5 text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap font-mono"
                >
                  {{ m.in_quantity > 0 ? '+' + formatNumber(m.in_quantity) : '-' }}
                </td>
                <td
                  class="p-3.5 text-red-600 dark:text-red-400 font-semibold whitespace-nowrap font-mono"
                >
                  {{ m.out_quantity > 0 ? '-' + formatNumber(m.out_quantity) : '-' }}
                </td>
                <td class="p-3.5 whitespace-nowrap font-mono">{{ formatNumber(m.unit_cost) }}</td>
                <td class="p-3.5 whitespace-nowrap font-mono">{{ formatNumber(m.total_cost) }}</td>
                <td
                  class="p-3.5 font-bold text-gray-900 dark:text-white bg-gray-50/60 dark:bg-gray-800/40 whitespace-nowrap font-mono"
                >
                  {{ formatNumber(m.running_balance) }}
                  <span class="text-xs font-normal text-gray-500">{{ m.unit || '' }}</span>
                </td>
                <td class="p-3.5 text-center whitespace-nowrap">
                  <span
                    v-if="m.is_balance_aligned"
                    class="inline-flex items-center px-2.5 py-1 rounded-lg text-2xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    title="الرصيد التراكمي مطابق للرصيد المسجل لحظة الحركة"
                  >
                    متطابق ✓
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2.5 py-1 rounded-lg text-2xs font-medium bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                    title="يوجد انحراف بين الرصيد التراكمي والرصيد المسجل"
                  >
                    غير متطابق ✕
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
  start_date: '',
  end_date: '',
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

const inTypes = ['in', 'transfer_in', 'adjustment_in', 'production_in']

function isInMovement(type) {
  return inTypes.includes(type)
}

function onProductSelect(product) {
  selectedProduct.value = product
  filters.product_id = product.id
  fetchReport()
}

function clearSelectedProduct() {
  selectedProduct.value = null
  filters.product_id = null
  reportData.value = null
}

function resetFilters() {
  filters.product_id = null
  filters.warehouse_id = null
  filters.start_date = ''
  filters.end_date = ''
  selectedProduct.value = null
  reportData.value = null
}

function formatNumber(value) {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

async function fetchReport() {
  if (!filters.product_id) return

  loading.value = true
  try {
    const response = await inventoryReportService.getItemStockCard({
      product_id: filters.product_id,
      warehouse_id: filters.warehouse_id || undefined,
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
    })
    reportData.value = response.data?.data || response.data
  } catch (error) {
    console.error('Error fetching stock card report:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await productStore.fetchProducts({ is_active: 1, all: true })
})
</script>
