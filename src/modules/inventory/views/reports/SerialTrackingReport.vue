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
          <span>تقرير تتبع الأرقام التسلسلية (Serials Tracking)</span>
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          تتبع مسار الأجهزة والمنتجات ذات الرقم التسلسلي الفردي ومواقع تواجدها وسجل حركاتها
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
        <!-- بحث برقم السيريال -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            رقم السيريال (Serial Number)
          </label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="SN-123456..."
            class="w-full p-2.5 text-sm bg-gray-50 dark:bg-surface-ground border-2 border-gray-300 dark:border-blue-500/40 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-sky-400/20 outline-none transition-all font-mono"
          />
        </div>

        <!-- فلتر الصنف باستخدام البحث الذكي -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            الصنف (اختياري)
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

        <!-- فلتر المستودع الجاهز -->
        <div>
          <WarehouseDropdown
            id="serials-warehouse-filter"
            v-model="filters.warehouse_id"
            label="المستودع (اختياري)"
          />
        </div>

        <!-- فلتر الحالة -->
        <div>
          <AppDropdown
            id="serials-status-filter"
            v-model="filters.status"
            label="الحالة"
            :options="statusOptions"
            placeholder="كل الحالات"
          />
        </div>
      </div>
    </div>

    <!-- Summary Card -->
    <div v-if="reportData" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-sm bg-gradient-to-br from-white to-blue-50/40 dark:from-gray-900 dark:to-sky-950/20"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider">
            إجمالي الأرقام التسلسلية
          </span>
          <span class="flex h-2.5 w-2.5 rounded-full bg-blue-500"></span>
        </div>
        <p class="text-3xl font-extrabold text-blue-600 dark:text-sky-400 mt-3 font-mono">
          {{ reportData.summary?.total_serials_count || 0 }}
        </p>
      </div>
    </div>

    <!-- Serials Table -->
    <div
      v-if="reportData"
      class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden"
    >
      <div
        class="p-4 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between"
      >
        <h3 class="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
          <span>سجل الأرقام التسلسلية</span>
          <span
            class="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold font-mono"
          >
            {{ reportData.serials?.length || 0 }}
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
              <th class="p-3.5">الرقم التسلسلي (SN)</th>
              <th class="p-3.5">الصنف / الرمز</th>
              <th class="p-3.5">المستودع / الرف</th>
              <th class="p-3.5">رقم الباتش</th>
              <th class="p-3.5">الحالة</th>
              <th class="p-3.5 text-center">عدد الحركات</th>
              <th class="p-3.5">ملاحظات</th>
            </tr>
          </thead>
          <tbody
            class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300"
          >
            <tr v-if="!reportData.serials || reportData.serials.length === 0">
              <td colspan="8" class="p-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                لا توجد أرقام تسلسلية مطابقة لمعايير البحث
              </td>
            </tr>
            <tr
              v-for="(serial, idx) in reportData.serials"
              :key="serial.id || idx"
              class="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
            >
              <td class="p-3.5 text-gray-400 dark:text-gray-500">{{ idx + 1 }}</td>
              <td
                class="p-3.5 whitespace-nowrap font-mono font-bold text-blue-700 dark:text-sky-400 bg-blue-50/50 dark:bg-sky-950/30"
              >
                {{ serial.serial_number }}
              </td>
              <td class="p-3.5 whitespace-nowrap">
                <div class="font-bold text-gray-900 dark:text-white">
                  {{ serial.product?.name }}
                </div>
                <div class="text-2xs text-gray-500 dark:text-gray-400 font-mono">
                  {{ serial.product?.sku }}
                </div>
              </td>
              <td class="p-3.5 whitespace-nowrap">
                <span class="font-medium text-gray-900 dark:text-white">{{
                  serial.warehouse?.name
                }}</span>
                <span
                  v-if="serial.location"
                  class="text-gray-400 dark:text-gray-500 block text-2xs font-mono"
                >
                  رف: {{ serial.location.name }}
                </span>
              </td>
              <td class="p-3.5 whitespace-nowrap font-mono text-gray-600 dark:text-gray-400">
                {{ serial.batch?.batch_number || '-' }}
              </td>
              <td class="p-3.5 whitespace-nowrap">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-lg text-2xs font-bold uppercase',
                    serial.status === 'available'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : serial.status === 'sold'
                        ? 'bg-blue-100 dark:bg-sky-950/60 text-blue-800 dark:text-sky-300 border border-blue-200 dark:border-sky-800'
                        : serial.status === 'damaged'
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
                  ]"
                >
                  {{ serial.status }}
                </span>
              </td>
              <td class="p-3.5 text-center whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-mono"
                >
                  {{ serial.movements_count || 0 }} حركة
                </span>
              </td>
              <td class="p-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400">
                {{ serial.notes || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import inventoryReportService from '@/modules/inventory/services/inventory-report.service'
import WarehouseDropdown from '@/modules/inventory/forms/WarehouseDropdown.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'
import { useProductStore } from '@/modules/inventory/stores/productStore'

const loading = ref(false)
const reportData = ref(null)
const selectedProduct = ref(null)
const productStore = useProductStore()

const statusOptions = [
  { id: '', name: 'كل الحالات' },
  { id: 'available', name: 'متاح (Available)' },
  { id: 'sold', name: 'مباع (Sold)' },
  { id: 'damaged', name: 'تالف (Damaged)' },
  { id: 'reserved', name: 'محجوز (Reserved)' },
  { id: 'transferred', name: 'منقول (Transferred)' },
]

const productSearchColumns = [
  { key: 'id_display', label: 'الرقم', widthClass: 'w-24' },
  { key: 'name', label: 'اسم الصنف' },
  { key: 'code', label: 'الرمز', widthClass: 'w-28' },
]

const filters = reactive({
  search: '',
  product_id: null,
  warehouse_id: null,
  status: '',
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
  filters.search = ''
  filters.product_id = null
  filters.warehouse_id = null
  filters.status = ''
  selectedProduct.value = null
  fetchReport()
}

async function fetchReport() {
  loading.value = true
  try {
    const response = await inventoryReportService.getSerialTracking({
      search: filters.search || undefined,
      product_id: filters.product_id || undefined,
      warehouse_id: filters.warehouse_id || undefined,
      status: filters.status || undefined,
    })
    reportData.value = response.data?.data || response.data
  } catch (error) {
    console.error('Error fetching serial tracking report:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchReport(), productStore.fetchProducts({ is_active: 1, all: true })])
})
</script>
