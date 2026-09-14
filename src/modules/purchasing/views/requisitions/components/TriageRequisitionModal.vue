<!-- src/modules/purchasing/views/requisitions/components/TriageRequisitionModal.vue -->
<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
    dir="rtl"
  >
    <div
      class="bg-[#1e2027] border border-[#3b3e4f] rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
    >
      <!-- ترويسة النافذة -->
      <div
        class="px-6 py-4 bg-[#262833] border-b border-[#3b3e4f] flex justify-between items-center"
      >
        <div class="flex items-center gap-3">
          <span class="w-2.5 h-6 bg-[#e05e2b] rounded-full inline-block"></span>
          <div>
            <h2 class="text-sm font-black text-white flex items-center gap-2">
              <span>فرز وتوجيه بنود طلب الشراء</span>
              <span
                class="text-xs px-2 py-0.5 rounded bg-[#e05e2b]/20 text-[#e05e2b] font-mono font-bold"
              >
                {{ requisition?.requisition_number || `#${requisition?.id}` }}
              </span>
            </h2>
            <p class="text-xs text-gray-400 mt-0.5">
              فحص الأرصدة اللحظية، مطابقة الأصناف الحرة مع المخزن، وتوزيع مسارات التنفيذ
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="handleClose"
          class="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#343746] transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- جسم النافذة ومحتوى الفرز -->
      <div class="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
        <!-- شريط اختيار مستودع الفحص -->
        <div
          class="bg-[#262833] border border-[#3b3e4f] p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-[#e05e2b]/15 text-[#e05e2b] flex items-center justify-center"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                />
              </svg>
            </div>
            <div>
              <span class="text-xs font-bold text-gray-200 block"
                >المستودع المعتمد للفحص والصرف</span
              >
              <span class="text-[11px] text-gray-400"
                >حدد المستودع لقراءة أرصدته اللحظية وتحديث مسارات الصرف</span
              >
            </div>
          </div>

          <div class="w-full sm:w-72">
            <select
              v-model="selectedWarehouseId"
              @change="handleWarehouseChange"
              :disabled="loadingWarehouses || requisitionStore.triageLoading"
              class="w-full bg-[#181a20] border border-[#3b3e4f] rounded-lg px-3 py-2 text-xs text-white focus:border-[#e05e2b] focus:outline-none disabled:opacity-50 font-bold cursor-pointer"
            >
              <option value="" disabled>-- اختر المستودع --</option>
              <option v-for="wh in warehousesList" :key="wh.id" :value="wh.id">
                {{ wh.name }} {{ wh.code ? `(${wh.code})` : '' }}
              </option>
            </select>
          </div>
        </div>

        <!-- مؤشر تحميل الأرصدة اللحظية -->
        <div
          v-if="requisitionStore.triageLoading"
          class="py-12 flex flex-col items-center justify-center space-y-3"
        >
          <div
            class="w-8 h-8 border-2 border-[#e05e2b] border-t-transparent rounded-full animate-spin"
          ></div>
          <span class="text-xs font-bold text-gray-400"
            >جاري فحص الأرصدة اللحظية للمستودع المختار...</span
          >
        </div>

        <!-- جدول بنود الفرز -->
        <div
          v-else-if="triageRows.length > 0"
          class="border border-[#3b3e4f] rounded-xl overflow-hidden bg-[#181a20]"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-right text-xs text-gray-300">
              <thead class="bg-[#262833] text-gray-400 font-bold border-b border-[#3b3e4f]">
                <tr>
                  <th class="p-3 text-center w-12">#</th>
                  <th class="p-3 min-w-[280px]">بيان الصنف أو البند</th>
                  <th class="p-3 text-center">المطلوب / المتبقي</th>
                  <th class="p-3 text-center">الرصيد المتاح بالمستودع</th>
                  <th class="p-3 text-center min-w-[200px]">مسار التنفيذ (القرار)</th>
                  <th class="p-3 text-center w-28">الكمية المنفذة</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#2e3140]">
                <template v-for="(row, idx) in triageRows" :key="row.requisition_item_id">
                  <tr class="hover:bg-[#20222b] transition-colors">
                    <td class="p-3 font-mono text-center text-gray-500">{{ idx + 1 }}</td>

                    <!-- تفاصيل الصنف وزر المطابقة -->
                    <td class="p-3">
                      <div class="space-y-1.5">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span
                            class="text-[9px] px-1.5 py-0.5 rounded font-bold"
                            :class="
                              row.is_free_text
                                ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                                : row.is_manually_matched
                                  ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30'
                                  : 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                            "
                          >
                            {{
                              row.is_free_text
                                ? 'مخصص'
                                : row.is_manually_matched
                                  ? 'تمت المطابقة'
                                  : 'مخزني'
                            }}
                          </span>
                          <span class="font-bold text-white">{{ row.item_name }}</span>

                          <!-- زر التراجع عن المطابقة إن تمت يدوياً -->
                          <button
                            v-if="row.is_manually_matched"
                            type="button"
                            @click="handleRevertMatch(row)"
                            class="text-[10px] text-rose-400 hover:text-rose-300 underline font-semibold mr-1"
                            title="إلغاء المطابقة والعودة للاسم الحر"
                          >
                            (إلغاء المطابقة)
                          </button>
                        </div>

                        <!-- إمكانية فتح البحث السريع للصنف الحر -->
                        <div v-if="row.is_free_text" class="pt-1">
                          <button
                            type="button"
                            @click="row.is_matching_open = !row.is_matching_open"
                            class="text-[10px] text-[#e05e2b] hover:text-[#f06e3b] font-bold flex items-center gap-1 bg-[#e05e2b]/10 hover:bg-[#e05e2b]/20 px-2 py-0.5 rounded transition-all w-fit"
                          >
                            <svg
                              class="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                            <span>{{
                              row.is_matching_open ? 'إغلاق البحث' : '🔗 مطابقة مع صنف مسجل بالمخزن'
                            }}</span>
                          </button>
                        </div>
                      </div>
                    </td>

                    <!-- الكمية المطلوبة والمتبقية -->
                    <td class="p-3 text-center font-mono">
                      <span class="text-white font-bold">{{ row.remaining_quantity }}</span>
                      <span class="text-[10px] text-gray-500 block"
                        >من إجمالي {{ row.quantity_requested }}</span
                      >
                    </td>

                    <!-- الرصيد المتاح -->
                    <td class="p-3 text-center">
                      <div v-if="row.is_free_text" class="text-gray-500 text-[11px]">
                        غير مدرج بالمخزن
                      </div>
                      <div v-else>
                        <span
                          class="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border"
                          :class="
                            row.available_stock >= row.remaining_quantity
                              ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
                              : row.available_stock > 0
                                ? 'bg-amber-950/50 text-amber-400 border-amber-500/30'
                                : 'bg-rose-950/50 text-rose-400 border-rose-500/30'
                          "
                        >
                          {{ row.available_stock }}
                        </span>
                      </div>
                    </td>

                    <!-- اختيار مسار التنفيذ -->
                    <td class="p-3 text-center">
                      <div
                        class="inline-flex bg-[#121418] p-1 rounded-lg border border-[#333644] gap-1"
                      >
                        <button
                          type="button"
                          @click="row.action = 'issue'"
                          :disabled="!row.can_issue_from_warehouse || row.remaining_quantity <= 0"
                          class="px-3 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1.5 disabled:opacity-20 disabled:cursor-not-allowed"
                          :class="
                            row.action === 'issue'
                              ? 'bg-[#e05e2b] text-white shadow-sm'
                              : 'text-gray-400 hover:text-white'
                          "
                        >
                          <svg
                            class="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>صرف مخزني</span>
                        </button>

                        <button
                          type="button"
                          @click="row.action = 'purchase'"
                          :disabled="row.remaining_quantity <= 0"
                          class="px-3 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1.5 disabled:opacity-20 disabled:cursor-not-allowed"
                          :class="
                            row.action === 'purchase'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-400 hover:text-white'
                          "
                        >
                          <svg
                            class="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                          <span>شراء خارجي</span>
                        </button>
                      </div>
                    </td>

                    <!-- الكمية الموجهة -->
                    <td class="p-3 text-center">
                      <input
                        type="number"
                        v-model.number="row.quantity"
                        :max="row.remaining_quantity"
                        min="0.0001"
                        step="any"
                        class="w-20 bg-[#121418] border border-[#3b3e4f] rounded px-2 py-1 text-center font-mono text-xs text-white focus:border-[#e05e2b] focus:outline-none font-bold"
                      />
                    </td>
                  </tr>

                  <!-- سطر فرعي منبثق للبحث ومطابقة الصنف المخصص -->
                  <tr v-if="row.is_matching_open" class="bg-[#15171d]">
                    <td colspan="6" class="p-3 border-t border-b border-[#3b3e4f]/80">
                      <div
                        class="bg-[#1a1d24] p-2.5 rounded-xl border border-[#e05e2b]/40 space-y-2"
                      >
                        <div
                          class="flex items-center justify-between text-xs font-bold text-gray-300"
                        >
                          <span class="text-[#e05e2b] flex items-center gap-1">
                            <span>🔍 اختر الصنف المطابق من دليل المنتجات للبند:</span>
                            <span class="text-white underline"
                              >"{{ row.original_item_name || row.item_name }}"</span
                            >
                          </span>
                          <button
                            type="button"
                            @click="row.is_matching_open = false"
                            class="text-gray-400 hover:text-white text-[11px]"
                          >
                            إلغاء ✕
                          </button>
                        </div>

                        <!-- شريط البحث الذكي المعتمد في جدول البنود -->
                        <div class="w-full bg-[#e05e2b] p-0.5 rounded-lg">
                          <SmartSearchGrid
                            :data="searchableProducts"
                            :columns="[
                              { key: 'id_display', label: 'كود الصنف', class: 'text-right' },
                              {
                                key: 'name',
                                label: 'اسم الصنف التجاري',
                                class: 'text-right font-bold',
                              },
                              {
                                key: 'cost_display',
                                label: 'التكلفة التقديرية',
                                class: 'text-center',
                              },
                              { key: 'stock_display', label: 'الرصيد الكلي', class: 'text-center' },
                            ]"
                            :search-keys="['id', 'name', 'code', 'all_barcodes']"
                            placeholder="ابحث بالاسم، كود الصنف، أو امسح الباركود لمطابقة هذا البند مباشرة..."
                            @select="(selectedProduct) => handleMatchProduct(row, selectedProduct)"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="py-12 text-center text-gray-400 text-xs">
          يرجى اختيار المستودع من القائمة أعلاه لعرض أرصدة الأصناف.
        </div>
      </div>

      <!-- تذييل النافذة والأزرار -->
      <div
        class="px-6 py-4 bg-[#262833] border-t border-[#3b3e4f] flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <div class="flex items-center gap-4 text-xs font-bold">
          <span class="flex items-center gap-1.5 text-gray-300">
            <span class="w-2 h-2 rounded-full bg-[#e05e2b]"></span>
            <span
              >صرف مخزني: <span class="font-mono text-white">{{ issueCount }}</span> بند</span
            >
          </span>
          <span class="flex items-center gap-1.5 text-gray-300">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            <span
              >شراء خارجي: <span class="font-mono text-white">{{ purchaseCount }}</span> بند</span
            >
          </span>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            @click="handleClose"
            class="px-4 py-2 text-xs font-bold text-gray-300 bg-[#343746] hover:bg-[#3f4354] rounded-xl transition-all w-full sm:w-auto"
          >
            إلغاء
          </button>

          <button
            type="button"
            @click="handleExecuteTriage"
            :disabled="isSubmitting || !selectedWarehouseId || triageRows.length === 0"
            class="px-5 py-2 text-xs font-bold text-white bg-[#e05e2b] hover:bg-[#d04f1e] rounded-xl transition-all shadow-[0_0_15px_rgba(224,94,43,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span
              v-if="isSubmitting"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
            <span>اعتماد التوجيه وتوليد إذن الصرف</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { usePurchaseRequisitionStore } from '@/modules/purchasing/stores/purchaseRequisitionStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'
import apiClient from '@/services/apiClient'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  requisition: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'close', 'triage-completed'])

const toast = useToast()
const requisitionStore = usePurchaseRequisitionStore()
const productStore = useProductStore()

const warehousesList = ref([])
const loadingWarehouses = ref(false)
const selectedWarehouseId = ref('')
const triageRows = ref([])
const isSubmitting = ref(false)

// تجهيز مصفوفة البحث السريع المتطابقة مع شاشة البنود
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
      cost_display: item.units?.[0]
        ? `${parseFloat(item.units[0].cost_price || item.cost_price || 0).toFixed(2)}`
        : '0.00',
      stock_display:
        item.current_stock !== undefined
          ? `${item.current_stock}`
          : item.stock !== undefined
            ? `${item.stock}`
            : '0',
      all_barcodes: allBarcodes,
    }
  })
})

const loadWarehouses = async () => {
  loadingWarehouses.value = true
  try {
    const res = await apiClient.get('/inventory/warehouses')
    warehousesList.value = res.data.data || res.data || []
    if (warehousesList.value.length > 0 && !selectedWarehouseId.value) {
      selectedWarehouseId.value = warehousesList.value[0].id
      await fetchTriageData()
    }
  } catch (err) {
    console.error('فشل في جلب قائمة المستودعات:', err)
  } finally {
    loadingWarehouses.value = false
  }
}

const fetchTriageData = async () => {
  if (!props.requisition?.id || !selectedWarehouseId.value) return

  try {
    const data = await requisitionStore.fetchTriageOverview(
      props.requisition.id,
      selectedWarehouseId.value,
    )

    triageRows.value = (data.items || []).map((item) => ({
      requisition_item_id: item.requisition_item_id,
      item_name: item.item_name,
      original_item_name: item.item_name,
      is_free_text: item.is_free_text,
      original_is_free_text: item.is_free_text,
      is_manually_matched: false,
      is_matching_open: false,
      product_id: item.product_id,
      product_unit_id: item.product_unit_id,
      quantity_requested: item.quantity_requested,
      remaining_quantity: item.remaining_quantity,
      available_stock: item.available_stock,
      can_issue_from_warehouse: item.can_issue_from_warehouse,
      action: item.suggested_action === 'fulfilled' ? 'purchase' : item.suggested_action,
      quantity: item.remaining_quantity > 0 ? item.remaining_quantity : item.quantity_requested,
      unit_cost: 0,
      notes: '',
    }))
  } catch {
    toast.error('تعذر قراءة أرصدة المستودع للفرز.')
  }
}

// تنفيذ المطابقة مع صنف مسجل
const handleMatchProduct = (row, selectedProduct) => {
  if (!selectedProduct) return

  const defaultUnit = selectedProduct.units?.[0] || null
  const defaultCost = defaultUnit
    ? parseFloat(defaultUnit.cost_price || defaultUnit.price || 0)
    : parseFloat(selectedProduct.cost_price || 0)

  // قراءة الرصيد المتاح لهذا الصنف في المستودع المختار إن وُجد
  const warehouseStockItem = selectedProduct.stocks?.find(
    (s) => Number(s.warehouse_id) === Number(selectedWarehouseId.value),
  )
  const availableStock = warehouseStockItem
    ? parseFloat(warehouseStockItem.available_stock ?? warehouseStockItem.quantity ?? 0)
    : parseFloat(selectedProduct.current_stock ?? selectedProduct.stock ?? 0)

  row.product_id = selectedProduct.id
  row.product_unit_id = defaultUnit?.id || null
  row.item_name = selectedProduct.name
  row.unit_cost = defaultCost
  row.available_stock = roundToFour(availableStock)
  row.is_free_text = false
  row.is_manually_matched = true
  row.is_matching_open = false

  // تحديث إمكانية الصرف والاقتراح التلقائي
  row.can_issue_from_warehouse =
    availableStock >= row.remaining_quantity && row.remaining_quantity > 0
  row.action = row.can_issue_from_warehouse ? 'issue' : 'purchase'

  toast.success(`تمت مطابقة البند مع (${selectedProduct.name}) بنجاح.`)
}

// التراجع عن المطابقة اليدوية
const handleRevertMatch = (row) => {
  row.product_id = null
  row.product_unit_id = null
  row.item_name = row.original_item_name
  row.is_free_text = true
  row.is_manually_matched = false
  row.available_stock = 0
  row.can_issue_from_warehouse = false
  row.action = 'purchase'
  toast.info('تم إلغاء المطابقة وإعادة البند كصنف مخصص.')
}

const handleWarehouseChange = async () => {
  await fetchTriageData()
}

const roundToFour = (num) => Math.round((num + Number.EPSILON) * 10000) / 10000

const issueCount = computed(() => triageRows.value.filter((r) => r.action === 'issue').length)
const purchaseCount = computed(() => triageRows.value.filter((r) => r.action === 'purchase').length)

const handleExecuteTriage = async () => {
  if (!selectedWarehouseId.value) {
    toast.warning('يرجى اختيار المستودع أولاً.')
    return
  }

  const payloadItems = triageRows.value
    .filter((row) => row.quantity > 0)
    .map((row) => ({
      requisition_item_id: row.requisition_item_id,
      action: row.action,
      product_id: row.product_id || null,
      product_unit_id: row.product_unit_id || null,
      quantity: row.quantity,
      unit_cost: row.unit_cost || 0,
      notes: row.notes || null,
    }))

  if (payloadItems.length === 0) {
    toast.warning('لا توجد بنود قابلة للتنفيذ.')
    return
  }

  isSubmitting.value = true

  try {
    const response = await requisitionStore.executeTriage(props.requisition.id, {
      warehouse_id: selectedWarehouseId.value,
      items: payloadItems,
    })

    const issueNumber = response.draft_issue?.issue_number
    if (issueNumber) {
      toast.success(`تم إنشاء مسودة إذن الصرف رقم: ${issueNumber}`)
    } else {
      toast.success('تم فرز وتوجيه البنود بنجاح.')
    }

    emit('triage-completed')
    handleClose()
  } catch {
    toast.error(requisitionStore.error || 'فشلت عملية فرز وتوجيه الطلب.')
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen && props.requisition?.id) {
      await Promise.all([
        loadWarehouses(),
        productStore.products?.length
          ? Promise.resolve()
          : productStore.fetchProducts({ is_active: 1, all: true }),
      ])
    } else {
      triageRows.value = []
    }
  },
)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #181a20;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3b3e4f;
  border-radius: 3px;
}
</style>
