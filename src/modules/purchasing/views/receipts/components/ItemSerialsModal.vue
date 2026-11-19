<!-- src/modules/purchasing/views/receipts/components/ItemSerialsModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="handleClose"
    size="4xl"
    border-color="border-primary"
  >
    <template #title>
      <div
        class="flex flex-wrap items-center justify-between gap-3 w-full pl-2 text-right"
        dir="rtl"
      >
        <div class="flex flex-col gap-0.5">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm sm:text-base font-black text-text-primary">
              توثيق ومطابقة سيريالات وأوزان:
            </span>
            <span class="text-sm sm:text-base font-black text-primary">
              {{ item?.product_name || 'أسطوانة الكلور' }}
            </span>
          </div>
          <span class="text-[11px] font-medium text-text-muted">
            مسح الباركود، قراءة أوزان الميزان (فارغ، قائم، صافي)، وجلب أسطوانات عهدة المورد تلقائياً
          </span>
        </div>

        <!-- شارة حالة الاستيفاء التكيفية -->
        <div
          class="px-3 py-1 rounded-full border text-xs font-mono font-bold flex items-center gap-2 shrink-0"
          :class="
            isQuantityMatched
              ? 'bg-success/12 text-success border-success/35 shadow-2xs'
              : 'bg-warning/12 text-warning border-warning/35'
          "
        >
          <span
            class="w-2 h-2 rounded-full"
            :class="isQuantityMatched ? 'bg-success' : 'bg-warning animate-pulse'"
          ></span>
          <span v-if="isWeightSerial">
            المسجل: {{ serialsList.length }} أسطوانة • {{ formatDecimal(totalNetGasWeight) }} كجم
            غاز
          </span>
          <span v-else> المستوفى: {{ serialsList.length }} / {{ targetQuantity }} </span>
        </div>
      </div>
    </template>

    <!-- محتوى النافذة -->
    <div class="-m-3 space-y-3.5 text-right font-sans" dir="rtl">
      <!-- شريط مسح الباركود والإضافة السريعة -->
      <div
        class="p-3.5 bg-surface-header/60 border border-surface-border border-t-4 border-t-primary rounded-xl space-y-2.5 shadow-2xs"
      >
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div
            class="relative flex-1 h-10 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
          >
            <span
              class="absolute right-3 inset-y-0 flex items-center text-primary pointer-events-none"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </span>

            <input
              ref="scanInputRef"
              type="text"
              v-model="scannedInput"
              @keydown.enter.prevent="handleQuickAdd"
              placeholder="امسح باركود الأسطوانة هنا أو اكتب الرقم التسلسلي واضغط Enter..."
              class="w-full h-full pr-9 pl-3 bg-transparent text-text-primary text-xs font-mono font-bold outline-none placeholder:font-sans placeholder:font-normal placeholder:text-text-muted"
            />
          </div>

          <AppButton type="button" size="sm" class="h-10 px-4 shrink-0" @click="handleQuickAdd">
            + إضافة الأسطوانة
          </AppButton>
        </div>

        <!-- شريط تنبيه فوري لعهد الأسطوانات المعلقة لدى المورد -->
        <div
          v-if="pendingSerialsLoading"
          class="text-[11px] text-text-muted flex items-center gap-2 font-semibold"
        >
          <span
            class="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"
          ></span>
          <span>جاري فحص سجلات الأسطوانات المسجلة للمورد...</span>
        </div>

        <div
          v-else-if="supplierPendingSerials.length > 0"
          class="text-[11px] text-info bg-info/10 border border-info/30 px-3 py-1.5 rounded-lg flex flex-wrap items-center justify-between gap-2 font-semibold"
        >
          <span>
            يوجد عدد ({{ supplierPendingSerials.length }}) أسطوانة مسجلة للتعبئة أو فارغة جاهزة
            للاستلام. عند مسح أي منها سيتم التعرف عليها وجلب وزنها الفارغ تلقائياً.
          </span>
          <span
            class="text-text-secondary font-mono text-[10px] bg-surface-card px-2 py-0.5 rounded border border-surface-border"
          >
            المورد: #{{ supplierId }}
          </span>
        </div>
      </div>

      <!-- قائمة الأسطوانات المسجلة وقراءات الميزان -->
      <div class="space-y-2.5">
        <div
          v-if="serialsList.length === 0"
          class="py-12 text-center bg-surface-section border border-surface-border rounded-xl space-y-2"
        >
          <div
            class="w-11 h-11 mx-auto rounded-xl bg-surface-ground border border-surface-border flex items-center justify-center text-text-muted"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <p class="text-xs font-black text-text-secondary">لم يتم إدراج أي أسطوانة بعد</p>
          <p class="text-[11px] text-text-muted">
            استخدم قارئ الباركود لمسح أرقام الأسطوانات تباعاً وتسجيل قراءات الميزان.
          </p>
        </div>

        <div
          v-for="(row, index) in serialsList"
          :key="row.uid || index"
          class="p-3.5 bg-surface-card border border-surface-border hover:border-primary/45 rounded-xl shadow-2xs transition-all space-y-3"
        >
          <!-- السطر الأول: إدخال/تعديل كود الأسطوانة وشارة الحالة وإجراء الحذف -->
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2 flex-1 min-w-[240px] max-w-lg">
              <span
                class="w-6 h-6 rounded-md bg-primary text-white text-[11px] font-mono font-black flex items-center justify-center shrink-0 shadow-2xs"
              >
                {{ index + 1 }}
              </span>

              <!-- حقل إدخال وتعديل كود الأسطوانة مباشرة -->
              <div class="relative flex-1">
                <input
                  type="text"
                  v-model="row.serial_number"
                  @change="onSerialNumberChange(row)"
                  placeholder="رقم الأسطوانة..."
                  title="انقر لتعديل كود الأسطوانة في حال وجود خطأ"
                  class="w-full h-8 px-3 bg-surface-ground focus:bg-surface-section border border-surface-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg text-text-primary font-mono text-xs font-black outline-none transition-all"
                />
              </div>

              <!-- شارة نوع الأسطوانة -->
              <AppBadge
                v-if="row.matched_status === 'with_vendor'"
                variant="success"
                size="xs"
                class="whitespace-nowrap"
              >
                ✓ معادة من التعبئة
              </AppBadge>
              <AppBadge
                v-else-if="row.matched_status === 'empty'"
                variant="info"
                size="xs"
                class="whitespace-nowrap"
              >
                ✓ مسجلة كفارغة بالمستودع
              </AppBadge>
              <AppBadge
                v-else-if="row.replaced_serial_id"
                variant="warning"
                size="xs"
                class="whitespace-nowrap"
              >
                ⟲ أسطوانة بديلة
              </AppBadge>
              <AppBadge v-else variant="primary" size="xs" class="whitespace-nowrap">
                + وارد جديد
              </AppBadge>
            </div>

            <!-- زر حذف الأسطوانة لإعادة مسحها -->
            <button
              type="button"
              @click="removeSerial(index)"
              class="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
              title="حذف هذا السيريال لإعادة مسحه"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          <!-- السطر الثاني: قراءات الميزان (فارغ - قائم - صافي) وخيار الاستبدال -->
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-end pt-2 border-t border-surface-border/70"
          >
            <!-- 1. الوزن الفارغ (Tare Weight) -->
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-text-secondary pr-1">
                الوزن الفارغ للحديد (Tare) <span class="text-danger">*</span>
              </label>
              <div class="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  v-model.number="row.tare_weight"
                  @input="recalculateNet(row)"
                  placeholder="450.00"
                  class="w-full h-8 pr-2.5 pl-9 bg-surface-ground focus:bg-surface-section border border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg text-text-primary font-mono text-xs font-bold outline-none transition-all"
                />
                <span
                  class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-muted font-bold pointer-events-none"
                >
                  كجم
                </span>
              </div>
            </div>

            <!-- 2. الوزن القائم الإجمالي بالميزان (Gross Weight) -->
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-text-secondary pr-1">
                قراءة الميزان القائم (Gross) <span class="text-danger">*</span>
              </label>
              <div class="relative">
                <input
                  :ref="(el) => setGrossInputRef(el, index)"
                  type="number"
                  step="0.01"
                  min="0"
                  v-model.number="row.gross_weight"
                  @input="recalculateNet(row)"
                  @keydown.enter.prevent="handleGrossWeightEnter(index)"
                  placeholder="1350.00"
                  class="w-full h-8 pr-2.5 pl-9 bg-surface-ground focus:bg-surface-section border border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg text-info font-mono text-xs font-black outline-none transition-all"
                />
                <span
                  class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-muted font-bold pointer-events-none"
                >
                  كجم
                </span>
              </div>
            </div>

            <!-- 3. صافي وزن غاز الكلور المحسوب آلياً (Net Weight) -->
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-success pr-1">
                صافي وزن الغاز المحسوب
              </label>
              <div
                class="h-8 px-2.5 bg-success/12 border border-success/35 rounded-lg flex items-center justify-between text-success font-mono text-xs font-black"
              >
                <span>{{ formatDecimal(row.net_weight) }}</span>
                <span class="text-[10px] font-sans font-bold">كجم كلور</span>
              </div>
            </div>

            <!-- 4. خيار الاستبدال الذكي -->
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-warning pr-1">
                بديلة عن أسطوانة لدى المورد (اختياري)
              </label>
              <div class="relative">
                <select
                  v-model="row.replaced_serial_id"
                  class="w-full h-8 pr-2.5 pl-6 bg-surface-ground focus:bg-surface-section border border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg text-text-primary text-xs font-bold outline-none appearance-none cursor-pointer transition-all"
                >
                  <option :value="null" class="bg-surface-section text-text-muted">
                    -- لا يوجد استبدال (توريد عادي) --
                  </option>
                  <option
                    v-for="pending in availablePendingForReplacement(row.replaced_serial_id)"
                    :key="pending.id"
                    :value="pending.id"
                    class="bg-surface-section text-text-primary font-bold"
                  >
                    بديلة عن: {{ pending.serial_number }} (فارغ:
                    {{ pending.tare_weight || '؟' }} كجم)
                  </option>
                </select>
                <span
                  class="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-[8px]"
                >
                  ▼
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- تذييل النافذة والإجماليات الوزنية وأزرار الاعتماد -->
    <template #footer>
      <div
        class="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-right font-sans"
        dir="rtl"
      >
        <!-- ملخص الأوزان الإجمالية للشحنة -->
        <div class="flex items-center gap-3 text-xs font-mono flex-wrap">
          <div
            class="flex items-center gap-2 px-3 py-1 rounded-lg bg-success/10 border border-success/30"
          >
            <span class="text-[11px] text-text-secondary font-sans font-bold">
              إجمالي وزن الغاز الصافي:
            </span>
            <span class="text-sm font-black text-success">
              {{ formatDecimal(totalNetGasWeight) }}
              <span class="text-[10px] font-sans">كجم كلور</span>
            </span>
          </div>

          <div
            class="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-ground border border-surface-border"
          >
            <span class="text-[11px] text-text-secondary font-sans font-bold">
              إجمالي الوزن القائم:
            </span>
            <span class="text-xs font-black text-text-primary">
              {{ formatDecimal(totalGrossWeight) }}
              <span class="text-[10px] font-sans text-text-muted">كجم</span>
            </span>
          </div>
        </div>

        <!-- أزرار الإجراءات -->
        <div class="flex items-center gap-2 justify-end">
          <AppButton type="button" variant="secondary" size="sm" @click="handleClose">
            إلغاء
          </AppButton>

          <AppButton
            type="button"
            size="sm"
            :disabled="!isQuantityMatched"
            @click="handleConfirmAndSave"
          >
            <span v-if="isWeightSerial">
              اعتماد وتثبيت الأسطوانات ({{ serialsList.length }} أسطوانة •
              {{ formatDecimal(totalNetGasWeight) }} كجم)
            </span>
            <span v-else>
              اعتماد وتثبيت السيريالات ({{ serialsList.length }} / {{ targetQuantity }})
            </span>
          </AppButton>
        </div>
      </div>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import apiClient from '@/services/apiClient'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  item: { type: Object, default: () => null },
  supplierId: { type: [Number, String], default: null },
})

const emit = defineEmits(['update:modelValue', 'save'])

const toast = useToast()

const scanInputRef = ref(null)
const grossInputRefs = ref({})
const scannedInput = ref('')
const serialsList = ref([])
const supplierPendingSerials = ref([])
const pendingSerialsLoading = ref(false)

const isWeightSerial = computed(() => {
  return props.item?.tracking_type === 'by_weight_serial'
})

const targetQuantity = computed(() => {
  if (isWeightSerial.value) {
    return 0
  }
  return Math.max(
    0,
    parseInt(props.item?.quantity_accepted ?? props.item?.quantity_received ?? 0, 10),
  )
})

const isQuantityMatched = computed(() => {
  if (isWeightSerial.value) {
    return serialsList.value.length > 0 && totalNetGasWeight.value > 0.0
  }
  return targetQuantity.value > 0 && serialsList.value.length === targetQuantity.value
})

const totalNetGasWeight = computed(() => {
  return serialsList.value.reduce((sum, row) => sum + (parseFloat(row.net_weight) || 0), 0)
})

const totalGrossWeight = computed(() => {
  return serialsList.value.reduce((sum, row) => sum + (parseFloat(row.gross_weight) || 0), 0)
})

const setGrossInputRef = (el, index) => {
  if (el) {
    grossInputRefs.value[index] = el
  }
}

const loadExistingSerials = () => {
  if (Array.isArray(props.item?.serials) && props.item.serials.length > 0) {
    serialsList.value = props.item.serials.map((s) => {
      const serialNum = String(s.serial_number || s.serial?.serial_number || '').trim()
      const tare =
        s.tare_weight !== null && s.tare_weight !== undefined
          ? parseFloat(s.tare_weight)
          : s.serial?.tare_weight !== null && s.serial?.tare_weight !== undefined
            ? parseFloat(s.serial.tare_weight)
            : null

      const gross =
        s.gross_weight !== null && s.gross_weight !== undefined ? parseFloat(s.gross_weight) : null

      const net =
        s.net_weight !== null && s.net_weight !== undefined
          ? parseFloat(s.net_weight)
          : gross !== null && tare !== null
            ? Math.max(0, parseFloat((gross - tare).toFixed(4)))
            : 0

      return {
        uid: s.id ? `db_${s.id}` : Date.now() + Math.random(),
        serial_id: s.serial_id ?? null,
        serial_number: serialNum,
        matched_status: s.serial?.status || null,
        replaced_serial_id: s.replaced_serial_id || null,
        tare_weight: tare,
        gross_weight: gross,
        net_weight: net,
        notes: s.notes || '',
      }
    })
  } else {
    serialsList.value = []
  }
}

const fetchSupplierPendingSerials = async () => {
  pendingSerialsLoading.value = true
  try {
    const params = {
      all: 1,
    }
    if (props.item?.product_id) {
      params.product_id = props.item.product_id
    }

    const response = await apiClient.get('/inventory/serials', { params })
    const records = response.data?.data || response.data || []

    // جلب الأسطوانات القابلة للاستلام (سواء كانت لدى المورد للتعبئة أو فارغة بالمستودع)
    supplierPendingSerials.value = Array.isArray(records)
      ? records.filter((r) => ['with_vendor', 'empty'].includes(r.status))
      : []

    serialsList.value.forEach((row) => {
      const cleanNum = String(row.serial_number || '')
        .trim()
        .toLowerCase()
      if (cleanNum) {
        const matched = supplierPendingSerials.value.find(
          (p) =>
            String(p.serial_number || '')
              .trim()
              .toLowerCase() === cleanNum,
        )
        if (matched) {
          row.matched_status = matched.status
          if (!row.serial_id) row.serial_id = matched.id
          if (row.tare_weight === null && matched.tare_weight) {
            row.tare_weight = parseFloat(matched.tare_weight)
            recalculateNet(row)
          }
        }
      }
    })
  } catch (error) {
    console.error('فشل في جلب أسطوانات عهدة المورد:', error)
    supplierPendingSerials.value = []
  } finally {
    pendingSerialsLoading.value = false
  }
}

const availablePendingForReplacement = (currentReplacedId) => {
  const chosenIds = serialsList.value
    .map((s) => s.replaced_serial_id)
    .filter((id) => id && id !== currentReplacedId)

  return supplierPendingSerials.value.filter((p) => !chosenIds.includes(p.id))
}

const recalculateNet = (row) => {
  const gross = parseFloat(row.gross_weight) || 0
  const tare = parseFloat(row.tare_weight) || 0
  if (gross > tare && tare > 0) {
    row.net_weight = Math.max(0, parseFloat((gross - tare).toFixed(4)))
  } else {
    row.net_weight = 0
  }
}

const onSerialNumberChange = async (row) => {
  row.serial_id = null
  row.matched_status = null

  const clean = String(row.serial_number || '')
    .trim()
    .toLowerCase()
  if (!clean) return

  // 1. البحث في أسطوانات عهدة المورد أو الفارغة الجاهزة
  const matchedPending = supplierPendingSerials.value.find(
    (p) =>
      String(p.serial_number || '')
        .trim()
        .toLowerCase() === clean,
  )

  if (matchedPending) {
    row.matched_status = matchedPending.status
    row.serial_id = matchedPending.id
    if (!row.tare_weight && matchedPending.tare_weight) {
      row.tare_weight = parseFloat(matchedPending.tare_weight)
      recalculateNet(row)
    }
    return
  }

  // 2. البحث في الأرقام المسجلة مسبقاً بالنظام لاسترجاع الوزن الفارغ المسجل
  try {
    const res = await apiClient.get('/inventory/serials', {
      params: { search: clean, all: 1 },
    })

    if (
      String(row.serial_number || '')
        .trim()
        .toLowerCase() !== clean
    ) {
      return
    }

    const records = res.data?.data || res.data || []
    const matched = records.find(
      (s) =>
        String(s.serial_number || '')
          .trim()
          .toLowerCase() === clean,
    )
    if (matched) {
      row.serial_id = matched.id
      row.matched_status = matched.status
      if (!row.tare_weight && matched.tare_weight) {
        row.tare_weight = parseFloat(matched.tare_weight)
        recalculateNet(row)
      }
    }
  } catch (err) {
    console.error('فشل استرجاع بيانات الأسطوانة:', err)
  }
}

const handleQuickAdd = async () => {
  const raw = scannedInput.value ? scannedInput.value.trim() : ''
  if (!raw) return

  if (!isWeightSerial.value && serialsList.value.length >= targetQuantity.value) {
    toast.warning(`تم استيفاء كامل الكمية المطلوبة لهذا البند (${targetQuantity.value} قطع).`)
    return
  }

  const alreadyAdded = serialsList.value.some(
    (s) =>
      String(s.serial_number || '')
        .trim()
        .toLowerCase() === raw.toLowerCase(),
  )
  if (alreadyAdded) {
    toast.error(`الأسطوانة رقم (${raw}) مضافة بالفعل في القائمة.`)
    scannedInput.value = ''
    return
  }

  const matchedPending = supplierPendingSerials.value.find(
    (p) =>
      String(p.serial_number || '')
        .trim()
        .toLowerCase() === raw.toLowerCase(),
  )

  let matchedExisting = null
  if (!matchedPending) {
    try {
      const res = await apiClient.get('/inventory/serials', {
        params: { search: raw, all: 1 },
      })
      const records = res.data?.data || res.data || []
      matchedExisting = records.find(
        (s) =>
          String(s.serial_number || '')
            .trim()
            .toLowerCase() === raw.toLowerCase(),
      )
    } catch (err) {
      console.error(err)
    }
  }

  const detectedTare = matchedPending?.tare_weight
    ? parseFloat(matchedPending.tare_weight)
    : matchedExisting?.tare_weight
      ? parseFloat(matchedExisting.tare_weight)
      : null

  const resolvedStatus = matchedPending?.status || matchedExisting?.status || null

  const newEntry = {
    uid: Date.now() + Math.random(),
    serial_id: matchedPending?.id || matchedExisting?.id || null,
    serial_number: raw,
    matched_status: resolvedStatus,
    replaced_serial_id: null,
    tare_weight: detectedTare,
    gross_weight: null,
    net_weight: 0,
    notes: '',
  }

  serialsList.value.push(newEntry)
  scannedInput.value = ''

  const newIndex = serialsList.value.length - 1

  if (resolvedStatus === 'with_vendor') {
    toast.success(`تم التعرف على الأسطوانة (${raw}) كعهدة معادة من التعبئة.`)
  } else if (resolvedStatus === 'empty') {
    toast.info(`تم التعرف على الأسطوانة (${raw}) كفارغة سابقة بالمستودع.`)
  }

  await nextTick()
  const grossEl = grossInputRefs.value[newIndex]
  if (grossEl) {
    grossEl.focus()
    if (typeof grossEl.select === 'function') grossEl.select()
  }
}

const handleGrossWeightEnter = (index) => {
  const row = serialsList.value[index]
  if (row) {
    recalculateNet(row)
  }
  nextTick(() => {
    scanInputRef.value?.focus()
  })
}

const removeSerial = (index) => {
  serialsList.value.splice(index, 1)
  nextTick(() => {
    scanInputRef.value?.focus()
  })
}

const handleConfirmAndSave = () => {
  if (!isQuantityMatched.value) {
    if (isWeightSerial.value) {
      toast.error('يجب تسجيل أسطوانة واحدة على الأقل وإثبات قراءات الميزان الصافية قبل الاعتماد.')
    } else {
      toast.error(`يجب استيفاء جميع الأرقام التسلسلية (${targetQuantity.value}) قبل الاعتماد.`)
    }
    return
  }

  for (let i = 0; i < serialsList.value.length; i++) {
    const s = serialsList.value[i]
    if (!String(s.serial_number || '').trim()) {
      toast.error(`يرجى كتابة أو مسح الرقم التسلسلي للأسطوانة رقم (${i + 1}).`)
      return
    }
    if (!s.tare_weight || s.tare_weight <= 0) {
      toast.error(`الوزن الفارغ للأسطوانة (${s.serial_number}) مطلوب ويجب أن يكون أكبر من الصفر.`)
      return
    }
    if (!s.gross_weight || s.gross_weight <= 0) {
      toast.error(
        `الوزن القائم بالميزان للأسطوانة (${s.serial_number}) مطلوب ويجب أن يكون أكبر من الصفر.`,
      )
      return
    }
    if (s.gross_weight <= s.tare_weight) {
      toast.error(
        `الوزن القائم بالميزان للأسطوانة (${s.serial_number}) يجب أن يكون أكبر من وزنها الفارغ.`,
      )
      return
    }
  }

  const payload = serialsList.value.map((s) => ({
    serial_id: s.serial_id || null,
    serial_number: String(s.serial_number).trim(),
    replaced_serial_id: s.replaced_serial_id || null,
    tare_weight: parseFloat(s.tare_weight),
    gross_weight: parseFloat(s.gross_weight),
    net_weight: parseFloat(s.net_weight),
    notes: s.notes || null,
  }))

  emit('save', payload, totalNetGasWeight.value)
  emit('update:modelValue', false)
  toast.success('تم تثبيت أرقام وأوزان الأسطوانات بنجاح.')
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const formatDecimal = (val) => {
  const num = parseFloat(val) || 0
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      loadExistingSerials()
      await fetchSupplierPendingSerials()
      nextTick(() => {
        scanInputRef.value?.focus()
      })
    }
  },
  { immediate: true },
)
</script>
