<!--src/modules/accounting/views/budgets/components/BudgetMatrixGrid.vue-->
<template>
  <div class="p-0 bg-transparent space-y-4 text-right font-sans" dir="rtl">
    <!-- 1. أزرار التبديل الذكية وشريط البحث -->
    <div class="space-y-3 bg-[#23252e] p-3.5 rounded-xl border-2 border-[#5d6170] shadow-xl">
      <!-- سويتش التبديل بين الأنماط -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-1.5 p-1 bg-[#16171b] rounded-lg border border-[#3e414c]">
          <button
            type="button"
            @click="entryMode = 'account'"
            :class="[
              'px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2',
              entryMode === 'account'
                ? 'bg-[#e05e2b] text-white shadow-[0_0_10px_rgba(224,94,43,0.35)]'
                : 'text-gray-400 hover:text-white',
            ]"
          >
            <span>📊 موازنة تفصيلية بالحسابات</span>
          </button>

          <button
            type="button"
            @click="entryMode = 'cost_center'"
            :class="[
              'px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2',
              entryMode === 'cost_center'
                ? 'bg-[#e05e2b] text-white shadow-[0_0_10px_rgba(224,94,43,0.35)]'
                : 'text-gray-400 hover:text-white',
            ]"
          >
            <span>🏢 موازنة مجمعة لمراكز التكلفة</span>
          </button>
        </div>

        <span class="text-[11px] text-gray-400 font-medium">
          {{
            entryMode === 'account'
              ? 'تحديد سقوف مالية دقيقة لكل حساب مالي على حدة'
              : 'تحديد سقف مالي إجمالي للقسم أو الإدارة لكافة مصروفاتها'
          }}
        </span>
      </div>

      <!-- واجهة الإضافة حسب النمط المحدد -->
      <div>
        <!-- نمط الحسابات: شريط البحث الذكي في شجرة الحسابات -->
        <div
          v-if="entryMode === 'account'"
          class="w-full text-xs bg-[#e05e2b] p-1 rounded-lg shadow-[0_0_15px_rgba(224,94,43,0.25)] border border-[#e05e2b]"
        >
          <AccountPartySearchGrid
            placeholder="ابحث باسم أو كود الحساب المالي لإضافته فوراً للمصفوفة..."
            @select="handleAddAccountRow"
          />
        </div>

        <!-- نمط مراكز التكلفة: قائمة اختيار الإدارات والمراكز -->
        <div v-else class="flex flex-col sm:flex-row items-center gap-3">
          <div class="relative flex-1 w-full">
            <select
              v-model="selectedCostCenterId"
              style="color-scheme: dark"
              class="w-full h-11 px-4 bg-[#16171b] border border-[#3e414c] hover:border-[#e05e2b] focus:border-[#e05e2b] text-white text-xs font-bold rounded-lg outline-none transition-all cursor-pointer"
            >
              <option :value="null" class="bg-[#16171b] text-gray-400">
                -- اختر مركز التكلفة / الإدارة للإضافة إلى الموازنة --
              </option>
              <option
                v-for="cc in costCenters"
                :key="cc.id"
                :value="cc.id"
                class="bg-[#16171b] text-white"
              >
                {{ cc.code ? `[${cc.code}] ` : '' }}{{ cc.name }}
              </option>
            </select>
          </div>

          <button
            type="button"
            @click="handleAddCostCenterRow"
            :disabled="!selectedCostCenterId"
            class="w-full sm:w-auto h-11 px-6 bg-[#e05e2b] hover:bg-[#e05e2b]/90 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>إضافة القسم للمصفوفة</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. شبكة المصفوفة التفاعلية (Matrix Grid Table) -->
    <div class="overflow-hidden rounded-xl border-2 border-[#5d6170] shadow-2xl bg-[#2d303a]">
      <div class="overflow-x-auto max-h-[620px]">
        <table class="w-full text-right border-collapse text-xs bg-[#2d303a]">
          <!-- ترويسة الأعمدة -->
          <thead
            class="sticky top-0 z-20 bg-[#16171b] border-b border-[#5d6170]/70 text-gray-300 font-sans select-none"
          >
            <tr>
              <th
                class="p-3 font-black text-white min-w-[240px] sticky right-0 bg-[#16171b] z-30 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.5)] border-l border-[#5d6170]/40"
              >
                البند المعتمد (حساب / مركز تكلفة)
              </th>
              <th class="p-3 font-black text-white min-w-[170px] border-l border-[#5d6170]/40">
                نطاق التخصيص
              </th>
              <th
                v-for="period in periods"
                :key="period.key"
                class="p-2 font-black text-white text-center min-w-[110px] border-l border-[#5d6170]/40"
              >
                <div class="truncate text-xs">{{ period.label }}</div>
                <div class="text-[10px] text-gray-400 font-mono font-normal mt-0.5">
                  {{ period.shortDate }}
                </div>
              </th>
              <th
                class="p-3 font-black text-[#e05e2b] text-center min-w-[125px] bg-[#16171b] border-l border-[#5d6170]/40"
              >
                الإجمالي السنوي
              </th>
              <th
                class="p-3 font-black text-white text-center min-w-[100px] border-l border-[#5d6170]/40"
              >
                أدوات التوزيع
              </th>
              <th class="p-3 font-black text-white text-center w-12">حذف</th>
            </tr>
          </thead>

          <!-- صفوف البيانات -->
          <tbody class="divide-y divide-gray-700/30 bg-[#2d303a]">
            <tr v-if="rows.length === 0">
              <td :colspan="periods.length + 5" class="py-16 text-center text-gray-400">
                <div class="flex flex-col items-center justify-center gap-2">
                  <span class="text-3xl text-[#e05e2b] mb-1">📊</span>
                  <p class="font-bold text-white text-sm">المصفوفة فارغة حالياً</p>
                  <p class="text-xs text-gray-400">
                    اختر النمط المناسب بالأعلى ثم أضف الحسابات أو مراكز التكلفة لتوزيع مبالغ
                    الموازنة.
                  </p>
                </div>
              </td>
            </tr>

            <tr
              v-for="(row, rowIndex) in rows"
              :key="row._key"
              class="hover:bg-[#353945] transition-all duration-150 group"
            >
              <!-- البند المعتمد -->
              <td
                class="p-2.5 sticky right-0 bg-[#2d303a] group-hover:bg-[#353945] transition-colors z-10 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.5)] border-l border-[#5d6170]/40"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="flex flex-col min-w-0 pr-1">
                    <span class="font-mono font-black text-[#e05e2b] text-xs">
                      {{ row.account_code }}
                    </span>
                    <span
                      class="font-bold truncate max-w-[170px] text-xs mt-0.5"
                      :class="row.account_id ? 'text-white' : 'text-amber-300 font-black'"
                      :title="row.account_name"
                    >
                      {{ row.account_name }}
                    </span>
                  </div>

                  <!-- شارة نوع البند -->
                  <span
                    v-if="row.account_id"
                    :class="[
                      'text-[9px] px-2 py-0.5 rounded font-bold shrink-0 border',
                      row.account_type === 'expense'
                        ? 'bg-rose-950/50 text-rose-400 border-rose-800/60'
                        : 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60',
                    ]"
                  >
                    {{ row.account_type === 'expense' ? 'حساب مصروف' : 'حساب إيراد' }}
                  </span>
                  <span
                    v-else
                    class="text-[9px] px-2 py-0.5 rounded font-bold shrink-0 border bg-amber-950/50 text-amber-400 border-amber-800/60"
                  >
                    مجمع للإدارة
                  </span>
                </div>
              </td>

              <!-- نطاق التخصيص ومركز التكلفة -->
              <td class="p-2 border-l border-[#5d6170]/40">
                <!-- إذا كان البند حساباً مالياً: إتاحة ربطه بمركز تكلفة اختياري -->
                <select
                  v-if="row.account_id"
                  v-model="row.cost_center_id"
                  style="color-scheme: dark"
                  class="w-full h-8 px-2 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] text-white text-xs font-bold rounded-md outline-none transition-all cursor-pointer"
                >
                  <option :value="null" class="bg-[#16171b] text-gray-400">
                    -- عام للمنشأة --
                  </option>
                  <option
                    v-for="cc in costCenters"
                    :key="cc.id"
                    :value="cc.id"
                    class="bg-[#16171b] text-white"
                  >
                    {{ cc.name }}
                  </option>
                </select>

                <!-- إذا كان البند موازنة مركز تكلفة مجمعة: عرض النص التوضيحي -->
                <div
                  v-else
                  class="flex items-center gap-1.5 px-2 py-1 bg-[#16171b]/60 rounded border border-[#3e414c] text-[11px] text-amber-400 font-bold"
                >
                  <span>🏢</span>
                  <span class="truncate">لكافة منصرفات القسم</span>
                </div>
              </td>

              <!-- خلايا الشهور / الفترات -->
              <td
                v-for="period in periods"
                :key="period.key"
                class="p-1 border-l border-[#5d6170]/40"
              >
                <input
                  type="number"
                  v-model.number="row.periods[period.key]"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  @focus="$event.target.select()"
                  class="w-full p-1.5 bg-transparent border border-transparent hover:border-gray-600 focus:border-[#e05e2b] focus:bg-[#16171b] rounded text-center font-mono font-bold text-xs text-white outline-none transition-all"
                />
              </td>

              <!-- الإجمالي السنوي المحسوب للبند -->
              <td
                class="p-2.5 text-center bg-[#16171b]/60 border-l border-[#5d6170]/40 font-mono font-black text-[#e05e2b] text-xs"
              >
                {{ formatNumber(calculateRowTotal(row)) }}
              </td>

              <!-- أزرار التوزيع الذكي السريع -->
              <td class="p-2 text-center border-l border-[#5d6170]/40">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- زر التوزيع بالتساوي -->
                  <button
                    type="button"
                    @click="distributeEvenly(row)"
                    class="p-1.5 rounded-md bg-[#16171b] border border-[#3e414c] hover:border-[#e05e2b] text-gray-300 hover:text-[#e05e2b] transition-all shadow-sm"
                    title="توزيع الإجمالي بالتساوي على كل الفترات"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>

                  <!-- زر النسخ المتطابق لباقي الشهور -->
                  <button
                    type="button"
                    @click="copyFirstPeriodToAll(row)"
                    class="p-1.5 rounded-md bg-[#16171b] border border-[#3e414c] hover:border-emerald-500 text-gray-300 hover:text-emerald-400 transition-all shadow-sm"
                    title="نسخ مبلغ الشهر الأول لكافة الشهور"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                      />
                    </svg>
                  </button>
                </div>
              </td>

              <!-- حذف الصف -->
              <td class="p-1 text-center">
                <button
                  type="button"
                  @click="removeRow(rowIndex)"
                  class="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all opacity-70 group-hover:opacity-100"
                  title="حذف هذا البند"
                >
                  <svg
                    class="w-4 h-4 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>

          <!-- صف الإجماليات العمودية لكافة الشهور (Footer) -->
          <tfoot
            class="sticky bottom-0 z-20 bg-[#16171b] border-t-2 border-[#5d6170] text-white font-bold"
          >
            <tr>
              <td
                class="p-3 sticky right-0 bg-[#16171b] z-30 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.5)] text-white font-black text-xs border-l border-[#5d6170]/40"
              >
                إجمالي المعتمد الشهري
              </td>
              <td class="p-3 text-gray-500 text-center border-l border-[#5d6170]/40">---</td>
              <td
                v-for="period in periods"
                :key="period.key"
                class="p-2 text-center font-mono text-[#e05e2b] text-xs font-bold border-l border-[#5d6170]/40"
              >
                {{ formatNumber(calculatePeriodTotal(period.key)) }}
              </td>
              <td
                class="p-3 text-center bg-[#e05e2b]/15 border-l border-[#5d6170]/40 font-mono text-[#e05e2b] font-black text-sm shadow-inner"
              >
                {{ formatNumber(grandTotal) }}
              </td>
              <td colspan="2" class="p-3 text-center text-gray-500">---</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import AccountPartySearchGrid from '@/components/ui/AccountPartySearchGrid.vue'

const props = defineProps({
  modelValue: { type: Array, required: true },
  periods: { type: Array, required: true },
  costCenters: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])
const toast = useToast()

const entryMode = ref('account') // 'account' | 'cost_center'
const selectedCostCenterId = ref(null)

const rows = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formatNumber = (num) =>
  Number(num || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const calculateRowTotal = (row) => {
  return Object.values(row.periods || {}).reduce((sum, val) => sum + (Number(val) || 0), 0)
}

const calculatePeriodTotal = (periodKey) => {
  return rows.value.reduce((sum, row) => sum + (Number(row.periods?.[periodKey]) || 0), 0)
}

const grandTotal = computed(() => {
  return rows.value.reduce((sum, row) => sum + calculateRowTotal(row), 0)
})

// إضافة حساب مالي للمصفوفة
const handleAddAccountRow = (account) => {
  const accountId = account.account_id || account.id
  const isDuplicate = rows.value.some(
    (r) => r.account_id === accountId && r.cost_center_id === null,
  )

  if (isDuplicate) {
    toast.warning('هذا الحساب مضاف مسبقاً بنفس مركز التكلفة.')
  }

  const initialPeriods = {}
  props.periods.forEach((p) => {
    initialPeriods[p.key] = ''
  })

  const newRow = {
    _key: Date.now() + Math.random(),
    account_id: accountId,
    account_code: account.code || '',
    account_name: account.name || '',
    account_type: account.type || 'expense',
    cost_center_id: null,
    periods: initialPeriods,
  }

  rows.value = [...rows.value, newRow]
}

// إضافة موازنة مجمعة لمركز تكلفة للمصفوفة
const handleAddCostCenterRow = () => {
  if (!selectedCostCenterId.value) {
    toast.warning('يرجى اختيار مركز التكلفة أولاً.')
    return
  }

  const costCenter = props.costCenters.find((c) => c.id === selectedCostCenterId.value)
  if (!costCenter) return

  const isDuplicate = rows.value.some((r) => !r.account_id && r.cost_center_id === costCenter.id)

  if (isDuplicate) {
    toast.warning('تمت إضافة موازنة مجمعة لهذا المركز مسبقاً.')
    return
  }

  const initialPeriods = {}
  props.periods.forEach((p) => {
    initialPeriods[p.key] = ''
  })

  const newRow = {
    _key: Date.now() + Math.random(),
    account_id: null,
    account_code: costCenter.code || 'مركز تكلفة',
    account_name: costCenter.name,
    account_type: 'expense',
    cost_center_id: costCenter.id,
    periods: initialPeriods,
  }

  rows.value = [...rows.value, newRow]
  selectedCostCenterId.value = null
  toast.success(`تمت إضافة (${costCenter.name}) كموازنة مجمعة بنجاح.`)
}

// حذف صف
const removeRow = (index) => {
  const updated = [...rows.value]
  updated.splice(index, 1)
  rows.value = updated
}

// أداة التوزيع بالتساوي
const distributeEvenly = (row) => {
  const currentTotal = calculateRowTotal(row)
  if (currentTotal <= 0) {
    toast.info('يرجى إدخال مبلغ أولاً في أي شهر لتوزيعه.')
    return
  }
  const count = props.periods.length
  if (count === 0) return

  const splitAmount = Math.round((currentTotal / count) * 100) / 100
  props.periods.forEach((p) => {
    row.periods[p.key] = splitAmount
  })
}

// أداة نسخ الشهر الأول لباقي الشهور
const copyFirstPeriodToAll = (row) => {
  if (props.periods.length === 0) return
  const firstKey = props.periods[0].key
  const baseAmount = Number(row.periods[firstKey]) || 0

  if (baseAmount <= 0) {
    toast.info('يرجى إدخال مبلغ في الشهر الأول ليتم نسخه.')
    return
  }

  props.periods.forEach((p) => {
    row.periods[p.key] = baseAmount
  })
}
</script>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
