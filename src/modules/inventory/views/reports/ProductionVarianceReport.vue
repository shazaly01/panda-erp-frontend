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
          <span>تقرير انحرافات واستهلاك أوامر الإنتاج</span>
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          مقارنة الكميات المخططة والفعلية للمواد الخام والمنتجات التامة، واحتساب تكلفة وتفاوت
          التشغيل
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
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
        <!-- فلتر المنتج التام باستخدام البحث الذكي -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            المنتج التام (اختياري)
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
            placeholder="ابحث باسم المنتج أو الباركود..."
            @select="onProductSelect"
          />
        </div>

        <!-- حالة أمر الإنتاج -->
        <div>
          <AppDropdown
            id="order-status-filter"
            v-model="filters.status"
            label="حالة أمر الإنتاج"
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
      <!-- Total Orders Count -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm"
      >
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400"
          >إجمالي أوامر الإنتاج</span
        >
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2 font-mono">
          {{ reportData.summary?.total_orders_count || 0 }}
        </p>
      </div>

      <!-- Raw Materials Cost -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-sm bg-gradient-to-br from-white to-blue-50/40 dark:from-gray-900 dark:to-sky-950/20"
      >
        <span class="text-xs font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider"
          >إجمالي تكلفة الخامات المستهلكة</span
        >
        <p class="text-2xl font-bold text-blue-600 dark:text-sky-400 mt-2 font-mono">
          {{ formatNumber(totalRawMaterialsCost) }}
        </p>
      </div>

      <!-- Additional Costs -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm bg-gradient-to-br from-white to-amber-50/40 dark:from-gray-900 dark:to-amber-950/20"
      >
        <span class="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider"
          >إجمالي التكاليف الإضافية</span
        >
        <p class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2 font-mono">
          {{ formatNumber(totalAdditionalCosts) }}
        </p>
      </div>

      <!-- Total Overall Cost -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 shadow-sm bg-gradient-to-br from-white to-indigo-50/40 dark:from-gray-900 dark:to-indigo-950/20"
      >
        <span
          class="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider"
          >إجمالي تكلفة التصنيع الكلية</span
        >
        <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2 font-mono">
          {{ formatNumber(totalOverallCost) }}
        </p>
      </div>
    </div>

    <!-- Production Orders Detailed List -->
    <div v-if="reportData" class="space-y-5">
      <div
        v-if="!reportData.orders || reportData.orders.length === 0"
        class="bg-white dark:bg-gray-900 p-12 text-center text-gray-400 dark:text-gray-500 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm font-medium"
      >
        لا توجد أوامر إنتاج مسجلة مطابقة لمعايير البحث
      </div>

      <div
        v-for="order in reportData.orders"
        :key="order.id"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <!-- Order Header -->
        <div
          class="p-4 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200/80 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3"
        >
          <div class="flex flex-wrap items-center gap-3">
            <span class="font-bold text-gray-900 dark:text-white text-sm font-mono">{{
              order.order_number
            }}</span>
            <span
              :class="[
                'px-2.5 py-1 rounded-lg text-2xs font-bold uppercase',
                order.status === 'completed'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : order.status === 'in_progress'
                    ? 'bg-blue-100 dark:bg-sky-950/60 text-blue-800 dark:text-sky-300 border border-blue-200 dark:border-sky-800'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
              ]"
            >
              {{ order.status }}
            </span>
            <span
              class="text-xs font-bold text-blue-700 dark:text-sky-400 bg-blue-50 dark:bg-sky-950/40 border border-blue-100 dark:border-sky-800/40 px-3 py-1 rounded-xl"
            >
              المنتج: {{ order.product?.name }}
              <span class="font-mono text-2xs">({{ order.product?.sku }})</span>
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span
              >التاريخ:
              <strong class="text-gray-800 dark:text-gray-200 font-mono">{{
                order.production_date
              }}</strong></span
            >
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <span
              >مستودع الخام:
              <strong class="text-gray-800 dark:text-gray-200">{{
                order.raw_materials_warehouse || '-'
              }}</strong></span
            >
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <span
              >مستودع التام:
              <strong class="text-gray-800 dark:text-gray-200">{{
                order.finished_goods_warehouse || '-'
              }}</strong></span
            >
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <span
              >الباتش الناتج:
              <strong class="text-gray-800 dark:text-gray-200 font-mono">{{
                order.produced_batch || '-'
              }}</strong></span
            >
          </div>
        </div>

        <!-- Output Quantities and Costs Summary Bar -->
        <div
          class="px-5 py-3.5 bg-blue-50/30 dark:bg-gray-850/60 border-b border-gray-200/60 dark:border-gray-800 grid grid-cols-2 md:grid-cols-5 gap-4 text-xs"
        >
          <div>
            <span class="text-gray-500 dark:text-gray-400 block mb-0.5"
              >الكمية المخططة للمنتج التام:</span
            >
            <strong class="text-gray-900 dark:text-white font-semibold font-mono text-sm">
              {{ formatNumber(order.planned_quantity) }}
            </strong>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400 block mb-0.5"
              >الكمية المنتجة فعلياً:</span
            >
            <strong class="text-gray-900 dark:text-white font-semibold font-mono text-sm">
              {{ formatNumber(order.actual_quantity) }}
            </strong>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400 block mb-0.5">انحراف كمية الإنتاج:</span>
            <strong
              :class="[
                'font-bold font-mono text-sm',
                order.quantity_variance >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              ]"
            >
              {{ order.quantity_variance > 0 ? '+' : ''
              }}{{ formatNumber(order.quantity_variance) }}
            </strong>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400 block mb-0.5"
              >التكلفة الإجمالية للأمر:</span
            >
            <strong class="text-blue-700 dark:text-sky-400 font-bold font-mono text-sm">
              {{ formatNumber(order.total_order_cost) }}
            </strong>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400 block mb-0.5"
              >تكلفة إنتاج الوحدة الواحدة:</span
            >
            <strong class="text-emerald-700 dark:text-emerald-400 font-bold font-mono text-sm">
              {{ formatNumber(order.unit_produced_cost) }}
            </strong>
          </div>
        </div>

        <!-- Raw Material Consumption Items Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead
              class="bg-gray-50/60 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200/60 dark:border-gray-800"
            >
              <tr>
                <th class="p-3.5">#</th>
                <th class="p-3.5">المادة الخام المستهلكة</th>
                <th class="p-3.5">الوحدة</th>
                <th class="p-3.5">رقم الباتش المسحوب منه</th>
                <th class="p-3.5">الكمية المخططة (BOM)</th>
                <th class="p-3.5 text-gray-900 dark:text-white font-bold">
                  الكمية الفعلية المستهلكة
                </th>
                <th class="p-3.5">انحراف الاستهلاك</th>
                <th class="p-3.5">تكلفة الوحدة</th>
                <th class="p-3.5 text-gray-900 dark:text-white font-semibold">إجمالي التكلفة</th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300"
            >
              <tr
                v-for="(item, itemIdx) in order.items"
                :key="itemIdx"
                class="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td class="p-3.5 text-gray-400 dark:text-gray-500">{{ itemIdx + 1 }}</td>
                <td class="p-3.5 whitespace-nowrap">
                  <div class="font-bold text-gray-900 dark:text-white">
                    {{ item.raw_material_name }}
                  </div>
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
                  {{ formatNumber(item.planned_quantity) }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-bold text-gray-900 dark:text-white font-mono"
                >
                  {{ formatNumber(item.actual_quantity) }}
                </td>
                <td class="p-3.5 whitespace-nowrap font-semibold font-mono">
                  <span
                    :class="
                      item.quantity_variance <= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    "
                  >
                    {{ item.quantity_variance > 0 ? '+' : ''
                    }}{{ formatNumber(item.quantity_variance) }}
                  </span>
                </td>
                <td class="p-3.5 whitespace-nowrap font-mono">
                  {{ formatNumber(item.unit_cost) }}
                </td>
                <td
                  class="p-3.5 whitespace-nowrap font-bold text-gray-900 dark:text-white font-mono"
                >
                  {{ formatNumber(item.total_cost) }}
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
import AppDropdown from '@/components/ui/AppDropdown.vue'
import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'
import { useProductStore } from '@/modules/inventory/stores/productStore'

const loading = ref(false)
const reportData = ref(null)
const selectedProduct = ref(null)
const productStore = useProductStore()

const statusOptions = [
  { id: '', name: 'كل الحالات' },
  { id: 'completed', name: 'مكتمل (Completed)' },
  { id: 'in_progress', name: 'قيد التشغيل (In Progress)' },
  { id: 'pending', name: 'معلق (Pending)' },
  { id: 'cancelled', name: 'ملغي (Cancelled)' },
]

const productSearchColumns = [
  { key: 'id_display', label: 'الرقم', widthClass: 'w-24' },
  { key: 'name', label: 'اسم المنتج' },
  { key: 'code', label: 'الرمز', widthClass: 'w-28' },
]

const filters = reactive({
  product_id: null,
  status: '',
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

const totalRawMaterialsCost = computed(() => {
  if (!reportData.value?.orders) return 0
  return reportData.value.orders.reduce(
    (acc, curr) => acc + Number(curr.raw_materials_total_cost || 0),
    0,
  )
})

const totalAdditionalCosts = computed(() => {
  if (!reportData.value?.orders) return 0
  return reportData.value.orders.reduce((acc, curr) => acc + Number(curr.additional_costs || 0), 0)
})

const totalOverallCost = computed(() => {
  if (!reportData.value?.orders) return 0
  return reportData.value.orders.reduce((acc, curr) => acc + Number(curr.total_order_cost || 0), 0)
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
  filters.status = ''
  filters.start_date = ''
  filters.end_date = ''
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
    const response = await inventoryReportService.getProductionVariance({
      product_id: filters.product_id || undefined,
      status: filters.status || undefined,
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
    })
    reportData.value = response.data?.data || response.data
  } catch (error) {
    console.error('Error fetching production variance report:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchReport(), productStore.fetchProducts({ is_active: 1, all: true })])
})
</script>
