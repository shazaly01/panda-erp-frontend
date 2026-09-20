<!-- src/modules/purchasing/views/requisitions/components/TriageRequisitionModal.vue -->
<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
    dir="rtl"
  >
    <div
      class="bg-[#1e2027] border border-[#3b3e4f] rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-sans text-right"
    >
      <!-- ترويسة النافذة المنظمة -->
      <div
        class="px-5 py-4 bg-[#23252e] border-b border-[#3b3e4f] flex justify-between items-center"
      >
        <div class="flex items-center gap-3">
          <span class="w-2 h-6 bg-[#e05e2b] rounded-full inline-block"></span>
          <div>
            <h2 class="text-sm font-black text-white flex items-center gap-2">
              <span>فرز وتوجيه بنود طلب الاحتياج</span>
              <span
                class="text-xs px-2.5 py-0.5 rounded-lg bg-[#e05e2b]/20 text-[#e05e2b] font-mono font-bold"
              >
                {{ requisition?.requisition_number || `#${requisition?.id}` }}
              </span>
            </h2>
            <p class="text-[11px] text-gray-400 mt-0.5">
              توجيه آلي للأرصدة المتوفرة، مطابقة البنود الحرة، وإدارة التجزئة عند العجز الجزئي
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

      <!-- جسم النافذة وشريط التحكم الذكي -->
      <div class="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
        <!-- شريط العمليات: تحديد المستودع + زر الفرز الذكي -->
        <div
          class="bg-[#181a20] border border-[#383c4b] p-3.5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 w-full md:w-auto">
            <div
              class="w-9 h-9 rounded-xl bg-[#e05e2b]/15 text-[#e05e2b] flex items-center justify-center shrink-0"
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
            <div class="flex-1">
              <span class="text-xs font-bold text-gray-200 block">مستودع الفحص والصرف</span>
              <span class="text-[10px] text-gray-400">تحديث أرصدة الأصناف ومسارات التوجيه</span>
            </div>

            <div class="w-56">
              <select
                v-model="selectedWarehouseId"
                @change="handleWarehouseChange"
                :disabled="loadingWarehouses || requisitionStore.triageLoading"
                class="w-full bg-[#121418] border border-[#3b3e4f] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#e05e2b] focus:outline-none disabled:opacity-50 font-bold cursor-pointer"
              >
                <option value="" disabled>-- اختر المستودع --</option>
                <option v-for="wh in warehousesList" :key="wh.id" :value="wh.id">
                  {{ wh.name }} {{ wh.code ? `(${wh.code})` : '' }}
                </option>
              </select>
            </div>
          </div>

          <!-- زر إعادة التوجيه الذكي بنقرة واحدة -->
          <button
            type="button"
            @click="applySmartAutoAllocation"
            :disabled="requisitionStore.triageLoading || triageRows.length === 0"
            class="h-9 px-3.5 bg-[#232630] hover:bg-[#2c303d] border border-[#e05e2b]/50 hover:border-[#e05e2b] text-[#e05e2b] text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 self-end md:self-auto shrink-0 shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>توزيع تلقائي ذكي</span>
          </button>
        </div>

        <!-- مؤشر التحميل أثناء قراءة الأرصدة -->
        <div
          v-if="requisitionStore.triageLoading"
          class="py-16 flex flex-col items-center justify-center space-y-3"
        >
          <div
            class="w-8 h-8 border-2 border-[#e05e2b] border-t-transparent rounded-full animate-spin"
          ></div>
          <span class="text-xs font-bold text-gray-400"
            >جاري قراءة الأرصدة اللحظية للمستودع المختار...</span
          >
        </div>

        <!-- جدول التوجيه بعد الفرز الآلي -->
        <div
          v-else-if="triageRows.length > 0"
          class="border border-[#383c4b] rounded-xl overflow-hidden bg-[#181a20]"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-right text-xs text-gray-300">
              <thead class="bg-[#23252e] text-gray-400 font-bold border-b border-[#383c4b]">
                <tr>
                  <th class="p-3 text-center w-12">#</th>
                  <th class="p-3 min-w-[260px]">بيان الصنف أو الخدمة</th>
                  <th class="p-3 text-center w-28">المطلوب / المتبقي</th>
                  <th class="p-3 text-center w-28">الرصيد بالمستودع</th>
                  <th class="p-3 text-center min-w-[190px]">مسار التنفيذ</th>
                  <th class="p-3 text-center w-24">الكمية الموجهة</th>
                  <th class="p-3 text-center min-w-[130px]">إجراءات ومعالجة</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-[#2a2d3a]">
                <tr
                  v-for="(row, idx) in triageRows"
                  :key="row.unique_row_id || row.requisition_item_id + '-' + idx"
                  class="hover:bg-[#1e2028] transition-colors"
                  :class="row.is_split_child ? 'bg-[#15171d]/60' : ''"
                >
                  <!-- الرقم التسلسلي والتمييز -->
                  <td class="p-3 font-mono text-center text-gray-500 align-middle">
                    <span v-if="!row.is_split_child">{{ idx + 1 }}</span>
                    <span v-else class="text-[#e05e2b] text-[10px] font-bold">&rdquor;</span>
                  </td>

                  <!-- تفاصيل الصنف وشارات التمييز -->
                  <td class="p-3 align-middle">
                    <div class="flex flex-col gap-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span
                          class="text-[9px] px-1.5 py-0.2 rounded font-bold"
                          :class="
                            row.is_free_text
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                              : row.is_manually_matched
                                ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30'
                                : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
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

                        <span
                          v-if="row.is_split_parent"
                          class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/20"
                        >
                          تجزئة: صرف المخزون
                        </span>

                        <span
                          v-if="row.is_split_child"
                          class="text-[9px] px-1.5 py-0.2 rounded bg-sky-950/40 text-sky-300 border border-sky-500/20"
                        >
                          تجزئة: استكمال بالشراء
                        </span>
                      </div>

                      <div
                        v-if="row.specifications"
                        class="text-[10px] text-gray-400 truncate max-w-xs"
                      >
                        {{ row.specifications }}
                      </div>
                    </div>
                  </td>

                  <!-- الكمية المطلوبة والمتبقية -->
                  <td class="p-3 text-center font-mono align-middle">
                    <span class="text-white font-bold">{{ row.remaining_quantity }}</span>
                    <span class="text-[10px] text-gray-500 block">
                      من {{ row.quantity_requested }}
                    </span>
                  </td>

                  <!-- الرصيد المتاح بالمستودع -->
                  <td class="p-3 text-center align-middle">
                    <div v-if="row.is_free_text" class="text-gray-500 text-[10px]">
                      غير مسجل بالمستودع
                    </div>
                    <div v-else>
                      <span
                        class="inline-block px-2 py-0.5 rounded-full text-xs font-mono font-bold border"
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

                  <!-- مسار التنفيذ -->
                  <td class="p-3 text-center align-middle">
                    <div
                      class="inline-flex bg-[#121418] p-1 rounded-lg border border-[#333644] gap-1"
                    >
                      <button
                        type="button"
                        @click="row.action = 'issue'"
                        :disabled="!row.can_issue_from_warehouse || row.remaining_quantity <= 0"
                        class="px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed"
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
                        class="px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed"
                        :class="
                          row.action === 'purchase'
                            ? 'bg-sky-600 text-white shadow-sm'
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
                  <td class="p-3 text-center align-middle">
                    <input
                      type="number"
                      v-model.number="row.quantity"
                      :max="row.remaining_quantity"
                      min="0.0001"
                      step="any"
                      class="w-20 bg-[#121418] border border-[#3b3e4f] rounded px-2 py-1 text-center font-mono text-xs text-white focus:border-[#e05e2b] focus:outline-none font-bold"
                    />
                  </td>

                  <!-- معالجة الصنف: المطابقة والتجزئة الذكية -->
                  <td class="p-3 text-center align-middle">
                    <div class="flex items-center justify-center gap-2">
                      <!-- 1. زر التجزئة التلقائية عند العجز الجزئي -->
                      <button
                        v-if="canSplitRow(row)"
                        type="button"
                        @click="handleSplitRow(row, idx)"
                        class="px-2 py-1 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"
                        title="صرف المتوفر بالمستودع وشراء المتبقي آلياً"
                      >
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          />
                        </svg>
                        <span>تجزئة تلقائية</span>
                      </button>

                      <!-- 2. زر التراجع عن التجزئة -->
                      <button
                        v-if="row.is_split_parent"
                        type="button"
                        @click="handleRevertSplit(row, idx)"
                        class="text-[10px] text-gray-400 hover:text-white underline font-semibold"
                        title="إلغاء التجزئة ودمج السطرين"
                      >
                        دمج السطرين
                      </button>

                      <!-- 3. زر مطابقة الصنف المخصص (يفتح نافذة منبثقة سريعة) -->
                      <button
                        v-if="row.is_free_text"
                        type="button"
                        @click="openMatchingDialog(row)"
                        class="px-2 py-1 bg-[#282b36] hover:bg-[#343846] text-[#e05e2b] border border-[#e05e2b]/30 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"
                      >
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        <span>ربط بالدليل</span>
                      </button>

                      <!-- 4. زر التراجع عن المطابقة اليدوية -->
                      <button
                        v-if="row.is_manually_matched"
                        type="button"
                        @click="handleRevertMatch(row)"
                        class="text-[10px] text-rose-400 hover:text-rose-300 underline font-semibold"
                        title="إلغاء المطابقة والعودة للاسم الحر"
                      >
                        إلغاء الربط
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="py-16 text-center text-gray-400 text-xs font-medium">
          يرجى اختيار المستودع من القائمة أعلاه لعرض أرصدة وتوجيه الأصناف.
        </div>
      </div>

      <!-- تذييل النافذة والأزرار -->
      <div
        class="px-5 py-4 bg-[#23252e] border-t border-[#3b3e4f] flex flex-col sm:flex-row justify-between items-center gap-3"
      >
        <div class="flex items-center gap-4 text-xs font-bold">
          <span class="flex items-center gap-1.5 text-gray-300">
            <span class="w-2 h-2 rounded-full bg-[#e05e2b]"></span>
            <span
              >صرف مخزني: <strong class="font-mono text-white">{{ issueCount }}</strong> بند</span
            >
          </span>
          <span class="flex items-center gap-1.5 text-gray-300">
            <span class="w-2 h-2 rounded-full bg-sky-500"></span>
            <span
              >شراء خارجي:
              <strong class="font-mono text-white">{{ purchaseCount }}</strong> بند</span
            >
          </span>
        </div>

        <div class="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            @click="handleClose"
            :disabled="isSubmitting"
            class="px-4 py-2 text-xs font-bold text-gray-300 bg-[#343746] hover:bg-[#3f4354] rounded-xl transition-all w-full sm:w-auto"
          >
            إلغاء وتراجع
          </button>

          <button
            type="button"
            @click="handleExecuteTriage"
            :disabled="isSubmitting || !selectedWarehouseId || triageRows.length === 0"
            class="px-5 py-2 text-xs font-bold text-white bg-[#e05e2b] hover:bg-[#d04f1e] rounded-xl transition-all shadow-[0_0_15px_rgba(224,94,43,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span
              v-if="isSubmitting"
              class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
            <span>اعتماد التوجيه وتنفيذ الإجراءات</span>
          </button>
        </div>
      </div>
    </div>

    <!-- نافذة مطابقة الصنف المنبثقة الخفيفة (بدون تشويه الجدول) -->
    <div
      v-if="activeMatchingRow"
      class="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
    >
      <div
        class="bg-[#1e2027] border border-[#484c60] rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4 text-right"
      >
        <div class="flex items-center justify-between border-b border-[#3b3e4f] pb-3">
          <div>
            <h3 class="text-xs font-bold text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#e05e2b]"></span>
              <span>مطابقة البند مع دليل الأصناف</span>
            </h3>
            <span class="text-[11px] text-gray-400 font-mono block mt-0.5">
              البند الحالي: "{{
                activeMatchingRow.original_item_name || activeMatchingRow.item_name
              }}"
            </span>
          </div>

          <button
            type="button"
            @click="closeMatchingDialog"
            class="text-gray-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <!-- حقل البحث اللحظي من السيرفر -->
        <div class="relative">
          <input
            type="text"
            v-model="matchSearchQuery"
            @input="onMatchSearchInput"
            placeholder="اكتب اسم الصنف، الكود، أو الباركود..."
            class="w-full h-10 px-3 bg-[#121418] border border-[#3b3e4f] focus:border-[#e05e2b] rounded-xl text-white text-xs font-semibold outline-none transition-all"
            autofocus
          />
        </div>

        <!-- مؤشر التحميل وقائمة النتائج -->
        <div
          class="min-h-[160px] max-h-[220px] overflow-y-auto divide-y divide-[#2a2d3a] border border-[#2e3240] rounded-xl bg-[#14161c]"
        >
          <div
            v-if="isSearchingMatch"
            class="p-6 text-center text-gray-400 text-xs flex items-center justify-center gap-2"
          >
            <span
              class="w-3.5 h-3.5 border-2 border-[#e05e2b] border-t-transparent rounded-full animate-spin"
            ></span>
            <span>جاري البحث في دليل الأصناف...</span>
          </div>

          <div v-else-if="matchResults.length === 0" class="p-6 text-center text-gray-500 text-xs">
            {{
              matchSearchQuery.trim().length < 2
                ? 'اكتب حرفين على الأقل للبحث...'
                : 'لا توجد نتائج مطابقة.'
            }}
          </div>

          <template v-else>
            <div
              v-for="prod in matchResults"
              :key="prod.id"
              @click="handleSelectMatch(prod)"
              class="p-2.5 hover:bg-[#222530] cursor-pointer flex items-center justify-between transition-colors"
            >
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-bold text-white">{{ prod.name }}</span>
                <span class="text-[10px] text-gray-400 font-mono">كود: PRD-{{ prod.id }}</span>
              </div>
              <span
                class="text-[10px] font-bold text-[#e05e2b] bg-[#e05e2b]/10 px-2 py-0.5 rounded"
              >
                ربط بالبند ↵
              </span>
            </div>
          </template>
        </div>

        <div class="flex justify-end pt-1">
          <button
            type="button"
            @click="closeMatchingDialog"
            class="px-4 py-1.5 text-xs font-bold text-gray-300 bg-[#2b2e3a] hover:bg-[#343846] rounded-xl transition-all"
          >
            إلغاء
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
import apiClient from '@/services/apiClient'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  requisition: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'close', 'triage-completed'])

const toast = useToast()
const requisitionStore = usePurchaseRequisitionStore()

const warehousesList = ref([])
const loadingWarehouses = ref(false)
const selectedWarehouseId = ref('')
const triageRows = ref([])
const isSubmitting = ref(false)

// متغيرات نافذة المطابقة المنبثقة الخفيفة
const activeMatchingRow = ref(null)
const matchSearchQuery = ref('')
const matchResults = ref([])
const isSearchingMatch = ref(false)
let matchDebounceTimer = null

// جلب قائمة المستودعات
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

// جلب بيانات التوجيه وتطبيق التوجيه الآلي الافتراضي
const fetchTriageData = async () => {
  if (!props.requisition?.id || !selectedWarehouseId.value) return

  try {
    const data = await requisitionStore.fetchTriageOverview(
      props.requisition.id,
      selectedWarehouseId.value,
    )

    triageRows.value = (data.items || []).map((item, index) => {
      const avail = parseFloat(item.available_stock) || 0
      const rem = parseFloat(item.remaining_quantity) || 0
      const isFree = Boolean(item.is_free_text)

      // القاعدة الافتراضية الذكية: إذا كان مسجلاً والرصيد كافٍ -> صرف، غير ذلك -> شراء
      const canCoverFully = !isFree && avail >= rem && rem > 0
      const defaultAction = canCoverFully ? 'issue' : 'purchase'

      return {
        unique_row_id: `row-${item.requisition_item_id}-${index}`,
        requisition_item_id: item.requisition_item_id,
        item_name: item.item_name,
        original_item_name: item.item_name,
        specifications: item.specifications || '',
        is_free_text: isFree,
        original_is_free_text: isFree,
        is_manually_matched: false,
        is_split_parent: false,
        is_split_child: false,
        split_parent_id: null,
        product_id: item.product_id || null,
        product_unit_id: item.product_unit_id || null,
        quantity_requested: parseFloat(item.quantity_requested) || 0,
        remaining_quantity: rem,
        available_stock: avail,
        can_issue_from_warehouse: !isFree && avail > 0,
        action: defaultAction,
        quantity: rem > 0 ? rem : parseFloat(item.quantity_requested) || 0,
        unit_cost: 0,
        notes: '',
      }
    })
  } catch {
    toast.error('تعذر قراءة أرصدة المستودع للفرز والتوجيه.')
  }
}

// دالة التوزيع التلقائي الذكي لكافة البنود بضغطة زر واحدة
const applySmartAutoAllocation = () => {
  triageRows.value.forEach((row) => {
    if (row.is_split_child) return
    const avail = parseFloat(row.available_stock) || 0
    const rem = parseFloat(row.remaining_quantity) || 0

    if (!row.is_free_text && avail >= rem && rem > 0) {
      row.action = 'issue'
      row.quantity = rem
    } else {
      row.action = 'purchase'
      row.quantity = rem
    }
  })
  toast.success('تمت إعادة التوزيع الآلي الذكي للبنود بناءً على أرصدة المستودع.')
}

// إمكانية التجزئة التلقائية: إذا كان الرصيد متاحاً جزئياً (أقل من المطلوب وأكبر من صفر)
const canSplitRow = (row) => {
  if (row.is_free_text || row.is_split_parent || row.is_split_child) return false
  const avail = parseFloat(row.available_stock) || 0
  const rem = parseFloat(row.remaining_quantity) || 0
  return avail > 0 && avail < rem
}

// تنفيذ التجزئة التلقائية الذكية (Auto-Split)
const handleSplitRow = (row, index) => {
  const avail = parseFloat(row.available_stock) || 0
  const totalRemaining = parseFloat(row.remaining_quantity) || 0
  const purchasePart = totalRemaining - avail

  // تحديث السطر الأصلي ليصبح صرفاً مخزنياً للكمية المتاحة فقط
  row.is_split_parent = true
  row.action = 'issue'
  row.quantity = avail

  // إنشاء سطر فرعي مرافق لشراء الكمية المتبقية
  const childRow = {
    ...JSON.parse(JSON.stringify(row)),
    unique_row_id: `split-child-${row.requisition_item_id}-${Date.now()}`,
    action: 'purchase',
    quantity: purchasePart,
    is_split_parent: false,
    is_split_child: true,
    split_parent_id: row.requisition_item_id,
  }

  triageRows.value.splice(index + 1, 0, childRow)
  toast.info(`تم تجزئة البند إلى: (${avail} صرف مخزني) + (${purchasePart} شراء خارجي).`)
}

// إلغاء التجزئة ودمج السطرين
const handleRevertSplit = (parentRow, parentIndex) => {
  const childIndex = triageRows.value.findIndex(
    (r) => r.is_split_child && r.split_parent_id === parentRow.requisition_item_id,
  )

  if (childIndex !== -1) {
    triageRows.value.splice(childIndex, 1)
  }

  parentRow.is_split_parent = false
  parentRow.quantity = parentRow.remaining_quantity
  parentRow.action =
    parentRow.available_stock >= parentRow.remaining_quantity ? 'issue' : 'purchase'
  toast.info('تم إلغاء التجزئة ودمج كميات البند.')
}

// نافذة المطابقة المنبثقة الخفيفة
const openMatchingDialog = (row) => {
  activeMatchingRow.value = row
  matchSearchQuery.value = row.original_item_name || row.item_name || ''
  fetchMatchResults(matchSearchQuery.value)
}

const closeMatchingDialog = () => {
  activeMatchingRow.value = null
  matchSearchQuery.value = ''
  matchResults.value = []
}

const onMatchSearchInput = () => {
  fetchMatchResults(matchSearchQuery.value)
}

const fetchMatchResults = (query) => {
  clearTimeout(matchDebounceTimer)
  if (!query || query.trim().length < 2) {
    matchResults.value = []
    isSearchingMatch.value = false
    return
  }

  isSearchingMatch.value = true
  matchDebounceTimer = setTimeout(async () => {
    try {
      const res = await apiClient.get('/inventory/products', {
        params: { search: query.trim(), per_page: 8, is_active: 1 },
      })
      matchResults.value = res.data?.data || res.data || []
    } catch (err) {
      console.error(err)
      matchResults.value = []
    } finally {
      isSearchingMatch.value = false
    }
  }, 300)
}

// ربط الصنف المسجل بالبند المخصص
const handleSelectMatch = (product) => {
  if (!activeMatchingRow.value || !product) return
  const row = activeMatchingRow.value

  const defaultUnit = product.units?.[0] || null
  const defaultCost = defaultUnit
    ? parseFloat(defaultUnit.cost_price || defaultUnit.price || 0)
    : parseFloat(product.cost_price || 0)

  let availableStock = 0
  if (product.stocks && Array.isArray(product.stocks)) {
    const whStock = product.stocks.find(
      (s) => Number(s.warehouse_id) === Number(selectedWarehouseId.value),
    )
    availableStock = whStock ? parseFloat(whStock.available_stock ?? whStock.quantity ?? 0) : 0
  } else {
    availableStock = parseFloat(product.current_stock ?? product.stock ?? 0)
  }

  row.product_id = product.id
  row.product_unit_id = defaultUnit?.id || null
  row.item_name = product.name
  row.unit_cost = defaultCost
  row.available_stock = availableStock
  row.is_free_text = false
  row.is_manually_matched = true
  row.can_issue_from_warehouse = availableStock > 0

  if (availableStock >= row.remaining_quantity && row.remaining_quantity > 0) {
    row.action = 'issue'
  } else {
    row.action = 'purchase'
  }

  toast.success(`تمت مطابقة البند مع (${product.name}) بنجاح.`)
  closeMatchingDialog()
}

// التراجع عن المطابقة
const handleRevertMatch = (row) => {
  row.product_id = null
  row.product_unit_id = null
  row.item_name = row.original_item_name
  row.is_free_text = true
  row.is_manually_matched = false
  row.available_stock = 0
  row.can_issue_from_warehouse = false
  row.action = 'purchase'
  toast.info('تم إلغاء المطابقة والعودة للبند المخصص.')
}

const handleWarehouseChange = async () => {
  await fetchTriageData()
}

const issueCount = computed(() => triageRows.value.filter((r) => r.action === 'issue').length)
const purchaseCount = computed(() => triageRows.value.filter((r) => r.action === 'purchase').length)

// تنفيذ واعتماد التوجيه
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

    const issueNumber = response?.draft_issue?.issue_number
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

// مراقبة فتح النافذة
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen && props.requisition?.id) {
      await loadWarehouses()
    } else {
      triageRows.value = []
      activeMatchingRow.value = null
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
  background: #383c4b;
  border-radius: 3px;
}
</style>
