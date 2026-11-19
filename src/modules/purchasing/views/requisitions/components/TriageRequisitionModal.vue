<!-- src/modules/purchasing/views/requisitions/components/TriageRequisitionModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="handleClose"
    size="5xl"
    border-color="border-primary"
    :loading="isSubmitting"
  >
    <template #title>
      <div class="flex flex-col gap-0.5 text-right" dir="rtl">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm sm:text-base font-black text-text-primary">
            فرز وتوجيه بنود طلب الاحتياج
          </span>
          <AppBadge variant="primary" size="sm" class="font-mono">
            {{ requisition?.requisition_number || `#${requisition?.id}` }}
          </AppBadge>
        </div>
        <span class="text-[11px] font-medium text-text-muted">
          توجيه آلي للأرصدة المتوفرة، مطابقة البنود الحرة، وإدارة التجزئة عند العجز الجزئي
        </span>
      </div>
    </template>

    <!-- جسم النافذة وشريط التحكم الذكي -->
    <div class="-m-3 space-y-3.5 font-sans text-right" dir="rtl">
      <!-- شريط العمليات: تحديد المستودع + زر الفرز الذكي -->
      <div
        class="p-3 bg-surface-header/60 border border-surface-border border-t-4 border-t-primary rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs"
      >
        <div class="flex flex-wrap items-center gap-3 flex-1">
          <div
            class="w-9 h-9 rounded-lg bg-primary/12 text-primary border border-primary/25 flex items-center justify-center shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>

          <div class="min-w-[150px]">
            <span class="text-xs font-black text-text-primary block">مستودع الفحص والصرف</span>
            <span class="text-[10px] text-text-muted">تحديث أرصدة الأصناف ومسارات التوجيه</span>
          </div>

          <div
            class="relative w-full sm:w-64 h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
          >
            <select
              v-model="selectedWarehouseId"
              @change="handleWarehouseChange"
              :disabled="loadingWarehouses || requisitionStore.triageLoading"
              class="block w-full h-full pr-3 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="" disabled class="bg-surface-section text-text-muted">
                -- اختر المستودع --
              </option>
              <option
                v-for="wh in warehousesList"
                :key="wh.id"
                :value="wh.id"
                class="bg-surface-section text-text-primary font-bold"
              >
                {{ wh.name }} {{ wh.code ? `(${wh.code})` : '' }}
              </option>
            </select>
            <span
              class="absolute left-3 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
            >
              ▼
            </span>
          </div>
        </div>

        <!-- زر إعادة التوجيه الذكي بنقرة واحدة -->
        <button
          type="button"
          @click="applySmartAutoAllocation"
          :disabled="requisitionStore.triageLoading || triageRows.length === 0"
          class="h-9 px-3.5 bg-surface-card hover:bg-primary hover:text-white text-primary border border-primary/45 hover:border-primary text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
        class="py-14 flex flex-col items-center justify-center space-y-3 bg-surface-section rounded-2xl border border-surface-border"
      >
        <div
          class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"
        ></div>
        <span class="text-xs font-bold text-text-secondary">
          جاري قراءة الأرصدة اللحظية للمستودع المختار...
        </span>
      </div>

      <!-- منصة جدول التوجيه المجسّمة بعد الفرز الآلي -->
      <div
        v-else-if="triageRows.length > 0"
        class="invoice-stage-3d rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-right border-collapse text-xs">
            <thead class="invoice-thead-3d select-none h-11 tracking-tight">
              <tr>
                <th
                  class="px-3 py-2.5 text-center w-12 text-slate-400 dark:text-slate-600 font-mono"
                >
                  #
                </th>
                <th
                  class="px-3 py-2.5 min-w-[240px] text-right font-black text-white dark:text-slate-900 text-[13px]"
                >
                  <span class="inline-flex items-center gap-2">
                    <span
                      class="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/25 inline-block"
                    ></span>
                    بيان الصنف أو الخدمة
                  </span>
                </th>
                <th
                  class="px-2.5 py-2.5 text-center w-28 font-bold text-slate-200 dark:text-slate-800"
                >
                  المطلوب / المتبقي
                </th>
                <th class="px-2.5 py-2.5 text-center w-28 font-bold text-sky-300 dark:text-sky-700">
                  الرصيد بالمستودع
                </th>
                <th
                  class="px-2.5 py-2.5 text-center min-w-[195px] font-bold text-slate-200 dark:text-slate-800"
                >
                  مسار التنفيذ
                </th>
                <th
                  class="px-2.5 py-2.5 text-center w-24 font-bold text-slate-200 dark:text-slate-800"
                >
                  الكمية الموجهة
                </th>
                <th
                  class="px-2.5 py-2.5 text-center min-w-[135px] font-bold text-slate-300 dark:text-slate-700"
                >
                  إجراءات ومعالجة
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-surface-border/70">
              <tr
                v-for="(row, idx) in triageRows"
                :key="row.unique_row_id || row.requisition_item_id + '-' + idx"
                class="invoice-row-3d h-13"
                :class="row.is_split_child ? 'invoice-row-empty' : 'invoice-row-filled'"
              >
                <!-- الرقم التسلسلي والتمييز -->
                <td class="px-2.5 py-2 font-mono text-center align-middle">
                  <span
                    v-if="!row.is_split_child"
                    class="w-5 h-5 rounded-md inline-flex items-center justify-center font-black text-[11px] bg-primary text-white shadow-2xs"
                  >
                    {{ idx + 1 }}
                  </span>
                  <span v-else class="text-primary text-xs font-black">”</span>
                </td>

                <!-- تفاصيل الصنف وشارات التمييز -->
                <td class="px-3 py-2 align-middle">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <AppBadge
                        :variant="
                          row.is_free_text
                            ? 'warning'
                            : row.is_manually_matched
                              ? 'info'
                              : 'success'
                        "
                        size="xs"
                      >
                        {{
                          row.is_free_text
                            ? 'مخصص'
                            : row.is_manually_matched
                              ? 'تمت المطابقة'
                              : 'مخزني'
                        }}
                      </AppBadge>

                      <span class="font-bold text-text-primary text-xs">{{ row.item_name }}</span>

                      <AppBadge v-if="row.is_split_parent" variant="success" size="xs">
                        تجزئة: صرف المخزون
                      </AppBadge>

                      <AppBadge v-if="row.is_split_child" variant="info" size="xs">
                        تجزئة: استكمال بالشراء
                      </AppBadge>
                    </div>

                    <div
                      v-if="row.specifications"
                      class="text-[10px] text-text-muted truncate max-w-xs"
                    >
                      {{ row.specifications }}
                    </div>
                  </div>
                </td>

                <!-- الكمية المطلوبة والمتبقية -->
                <td class="px-2.5 py-2 text-center font-mono align-middle">
                  <span class="text-text-primary font-black text-xs">
                    {{ row.remaining_quantity }}
                  </span>
                  <span class="text-[10px] text-text-muted block">
                    من {{ row.quantity_requested }}
                  </span>
                </td>

                <!-- الرصيد المتاح بالمستودع -->
                <td class="px-2.5 py-2 text-center align-middle">
                  <div v-if="row.is_free_text" class="text-text-muted text-[10px] font-medium">
                    غير مسجل بالمستودع
                  </div>
                  <div v-else class="flex justify-center">
                    <AppBadge
                      :variant="
                        row.available_stock >= row.remaining_quantity
                          ? 'success'
                          : row.available_stock > 0
                            ? 'warning'
                            : 'danger'
                      "
                      size="xs"
                      pill
                      class="font-mono font-bold"
                    >
                      {{ row.available_stock }}
                    </AppBadge>
                  </div>
                </td>

                <!-- مسار التنفيذ -->
                <td class="px-2.5 py-2 text-center align-middle">
                  <div
                    class="inline-flex bg-surface-ground p-1 rounded-xl border border-surface-border gap-1 shadow-2xs"
                  >
                    <button
                      type="button"
                      @click="row.action = 'issue'"
                      :disabled="!row.can_issue_from_warehouse || row.remaining_quantity <= 0"
                      class="px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      :class="
                        row.action === 'issue'
                          ? 'bg-primary text-white shadow-2xs'
                          : 'text-text-secondary hover:text-text-primary'
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
                      class="px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      :class="
                        row.action === 'purchase'
                          ? 'bg-info text-white shadow-2xs'
                          : 'text-text-secondary hover:text-text-primary'
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
                <td class="px-2.5 py-2 text-center align-middle">
                  <input
                    type="number"
                    v-model.number="row.quantity"
                    :max="row.remaining_quantity"
                    min="0.0001"
                    step="any"
                    class="invoice-pill-editable w-20 h-8 px-2 border rounded-xl text-center font-mono text-xs text-text-primary outline-none font-black transition-all"
                  />
                </td>

                <!-- معالجة الصنف: المطابقة والتجزئة الذكية -->
                <td class="px-2.5 py-2 text-center align-middle">
                  <div class="flex items-center justify-center gap-2">
                    <!-- 1. زر التجزئة التلقائية عند العجز الجزئي -->
                    <button
                      v-if="canSplitRow(row)"
                      type="button"
                      @click="handleSplitRow(row, idx)"
                      class="px-2.5 py-1 bg-warning/12 hover:bg-warning hover:text-white text-warning border border-warning/35 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
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
                      class="text-[10px] text-text-secondary hover:text-primary underline font-bold cursor-pointer"
                      title="إلغاء التجزئة ودمج السطرين"
                    >
                      دمج السطرين
                    </button>

                    <!-- 3. زر مطابقة الصنف المخصص -->
                    <button
                      v-if="row.is_free_text"
                      type="button"
                      @click="openMatchingDialog(row)"
                      class="px-2.5 py-1 bg-primary/10 hover:bg-primary hover:text-white text-primary border border-primary/30 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
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
                      class="text-[10px] text-danger hover:underline font-bold cursor-pointer"
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

      <div
        v-else
        class="py-14 text-center text-text-muted text-xs font-medium bg-surface-section rounded-2xl border border-surface-border"
      >
        يرجى اختيار المستودع من القائمة أعلاه لعرض أرصدة وتوجيه الأصناف.
      </div>
    </div>

    <!-- تذييل النافذة والأزرار -->
    <template #footer>
      <div
        class="w-full flex flex-col sm:flex-row justify-between items-center gap-3 text-right font-sans"
        dir="rtl"
      >
        <div class="flex items-center gap-2.5 text-xs font-bold flex-wrap">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/25 text-text-primary"
          >
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span>صرف مخزني:</span>
            <strong class="font-mono text-primary font-black">{{ issueCount }}</strong>
            <span>بند</span>
          </span>

          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-info/10 border border-info/25 text-text-primary"
          >
            <span class="w-2 h-2 rounded-full bg-info"></span>
            <span>شراء خارجي:</span>
            <strong class="font-mono text-info font-black">{{ purchaseCount }}</strong>
            <span>بند</span>
          </span>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            :disabled="isSubmitting"
            @click="handleClose"
          >
            إلغاء وتراجع
          </AppButton>

          <AppButton
            type="button"
            size="sm"
            :disabled="isSubmitting || !selectedWarehouseId || triageRows.length === 0"
            @click="handleExecuteTriage"
          >
            <span v-if="isSubmitting">جاري الاعتماد والتنفيذ...</span>
            <span v-else>اعتماد التوجيه وتنفيذ الإجراءات</span>
          </AppButton>
        </div>
      </div>
    </template>

    <!-- نافذة مطابقة الصنف المنبثقة الخفيفة -->
    <Teleport to="body">
      <div
        v-if="activeMatchingRow"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        dir="rtl"
        @click.self="closeMatchingDialog"
      >
        <div
          class="bg-surface-section border border-surface-border border-t-4 border-t-primary rounded-xl w-full max-w-lg shadow-2xl overflow-hidden text-right font-sans"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface-card/40"
          >
            <div>
              <h3 class="text-xs font-black text-text-primary flex items-center gap-1.5">
                <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
                <span>مطابقة البند مع دليل الأصناف</span>
              </h3>
              <span class="text-[11px] text-text-muted font-mono block mt-0.5">
                البند الحالي: "{{
                  activeMatchingRow.original_item_name || activeMatchingRow.item_name
                }}"
              </span>
            </div>

            <button
              type="button"
              @click="closeMatchingDialog"
              class="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-ground transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div class="p-4 space-y-3 bg-surface-header/40">
            <!-- حقل البحث اللحظي من السيرفر -->
            <div
              class="relative w-full h-10 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
            >
              <span class="absolute right-3 text-text-muted pointer-events-none">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                v-model="matchSearchQuery"
                @input="onMatchSearchInput"
                placeholder="اكتب اسم الصنف، الكود، أو الباركود..."
                class="w-full h-full pr-9 pl-3 bg-transparent text-text-primary placeholder:text-text-muted text-xs font-semibold outline-none"
                autofocus
              />
            </div>

            <!-- مؤشر التحميل وقائمة النتائج -->
            <div
              class="min-h-[160px] max-h-[220px] overflow-y-auto divide-y divide-surface-border/60 border border-surface-border rounded-xl bg-surface-card shadow-2xs"
            >
              <div
                v-if="isSearchingMatch"
                class="p-6 text-center text-text-muted text-xs flex items-center justify-center gap-2 font-semibold"
              >
                <span
                  class="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"
                ></span>
                <span>جاري البحث في دليل الأصناف...</span>
              </div>

              <div
                v-else-if="matchResults.length === 0"
                class="p-6 text-center text-text-muted text-xs font-medium"
              >
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
                  class="p-2.5 hover:bg-primary/10 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-bold text-text-primary">{{ prod.name }}</span>
                    <span class="text-[10px] text-text-muted font-mono">
                      كود: PRD-{{ prod.id }}
                    </span>
                  </div>
                  <span
                    class="text-[10px] font-bold text-primary bg-primary/10 border border-primary/25 px-2.5 py-0.5 rounded-lg"
                  >
                    ربط بالبند ↵
                  </span>
                </div>
              </template>
            </div>
          </div>

          <div class="px-4 py-3 border-t border-surface-border bg-surface-card/20 flex justify-end">
            <AppButton type="button" variant="secondary" size="sm" @click="closeMatchingDialog">
              إلغاء
            </AppButton>
          </div>
        </div>
      </div>
    </Teleport>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { usePurchaseRequisitionStore } from '@/modules/purchasing/stores/purchaseRequisitionStore'
import apiClient from '@/services/apiClient'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'

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
const handleRevertSplit = (parentRow) => {
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
  if (isSubmitting.value) return
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
