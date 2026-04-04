<template>
  <div class="p-6 space-y-6 rtl text-right" dir="rtl">
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl"
    >
      <div>
        <h1 class="text-2xl font-black text-white flex items-center gap-2">
          <CalculatorIcon class="w-8 h-8 text-primary" />
          كشف حساب تفصيلي
        </h1>
        <p class="text-sm text-slate-400 mt-1 font-medium">
          عرض وتحليل حركات الأستاذ العام والأرصدة التراكمية
        </p>
      </div>
      <div v-if="reportData" class="no-print">
        <button
          @click="window.print()"
          class="px-6 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-bold border border-slate-700 flex items-center gap-2"
        >
          <PrinterIcon class="w-5 h-5" />
          طباعة التقرير
        </button>
      </div>
    </div>

    <div
      class="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden no-print"
    >
      <div class="bg-primary/5 border-b border-primary/20 p-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div class="lg:col-span-4">
            <label class="block text-sm font-bold text-primary mb-2 flex items-center gap-2">
              <MagnifyingGlassIcon class="w-5 h-5" />
              البحث عن الحساب المالي
            </label>
            <AutoComplete
              v-model="selectedAccount"
              :suggestions="filteredAccounts"
              @complete="searchAccounts"
              @item-select="onAccountSelected"
              optionLabel="name"
              placeholder="ابحث باسم أو رقم الحساب..."
              class="w-full block"
              inputClass="w-full"
              :pt="autoCompleteStyles"
            >
              <template #option="slotProps">
                <div class="flex items-center gap-3">
                  <span
                    class="text-xs font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded"
                  >
                    {{ slotProps.option.code }}
                  </span>
                  <span class="text-sm font-semibold text-white">{{ slotProps.option.name }}</span>
                </div>
              </template>
            </AutoComplete>
          </div>

          <div class="lg:col-span-2">
            <label class="block text-sm font-bold text-slate-400 mb-2">من تاريخ</label>
            <input
              type="date"
              v-model="filters.from_date"
              @change="loadIfAccountSelected"
              class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div class="lg:col-span-2">
            <label class="block text-sm font-bold text-slate-400 mb-2">إلى تاريخ</label>
            <input
              type="date"
              v-model="filters.to_date"
              @change="loadIfAccountSelected"
              class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div class="lg:col-span-2">
            <button
              @click="loadReport"
              :disabled="loading || !selectedAccount"
              class="w-full bg-primary text-slate-900 py-2.5 rounded-lg font-black hover:bg-primary/90 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            >
              <ArrowPathIcon v-if="loading" class="w-5 h-5 animate-spin" />
              <ChartBarIcon v-else class="w-5 h-5" />
              تحديث الكشف
            </button>
          </div>

          <div class="lg:col-span-2 flex flex-col justify-end pb-1">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                v-model="filters.include_drafts"
                @change="loadIfAccountSelected"
                class="w-5 h-5 text-primary bg-slate-800 border-slate-600 rounded focus:ring-primary focus:ring-2 cursor-pointer"
              />
              <span
                class="text-xs font-bold text-slate-300 group-hover:text-white transition-colors leading-tight"
              >
                تضمين المسودات<br />
                <span class="text-[10px] text-slate-500 font-normal">لأغراض المراجعة</span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <template v-if="reportData">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="الرصيد الافتتاحي"
          :value="reportData.summary.opening_balance"
          color="text-blue-400"
          bg="bg-blue-500/5"
          border="border-blue-500/20"
        />
        <SummaryCard
          title="حركات المدين"
          :value="reportData.summary.total_debit"
          color="text-emerald-400"
          bg="bg-emerald-500/5"
          border="border-emerald-500/20"
        />
        <SummaryCard
          title="حركات الدائن"
          :value="reportData.summary.total_credit"
          color="text-rose-400"
          bg="bg-rose-500/5"
          border="border-rose-500/20"
        />
        <SummaryCard
          title="الرصيد الختامي"
          :value="reportData.summary.closing_balance"
          color="text-white"
          bg="bg-primary"
          border="border-primary"
          is-dark
        />
      </div>

      <div class="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-right">
            <thead class="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th class="p-4 text-xs font-bold text-slate-400">التاريخ</th>
                <th class="p-4 text-xs font-bold text-slate-400">رقم القيد</th>
                <th class="p-4 text-xs font-bold text-slate-400">البيان والشرح</th>
                <th class="p-4 text-xs font-bold text-slate-400">الحساب المقابل</th>
                <th class="p-4 text-xs font-bold text-slate-400 text-left">مدين</th>
                <th class="p-4 text-xs font-bold text-slate-400 text-left">دائن</th>
                <th class="p-4 text-xs font-bold text-slate-400 text-left">الرصيد التراكمي</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr class="bg-slate-800/20 italic">
                <td colspan="4" class="p-4 text-sm text-slate-500 font-bold">رصيد أول المدة...</td>
                <td colspan="2"></td>
                <td class="p-4 text-sm font-black text-slate-300 text-left" dir="ltr">
                  {{ formatNumber(reportData.summary.opening_balance) }}
                </td>
              </tr>
              <tr
                v-for="(tx, i) in reportData.transactions"
                :key="i"
                class="hover:bg-slate-800/40 transition-colors"
                :class="{ 'opacity-75': tx.status === 'draft' }"
              >
                <td class="p-4 text-sm text-slate-400 font-mono">{{ tx.date }}</td>
                <td class="p-4 text-sm font-bold">
                  <div class="flex items-center gap-2">
                    <button
                      @click="navigateToEntry(tx)"
                      class="text-primary hover:text-white hover:bg-primary/20 px-2 py-1 rounded transition-all flex items-center gap-1 group"
                      title="انقر للانتقال لشاشة التعديل"
                    >
                      <span class="font-mono">#{{ tx.entry_number }}</span>
                      <ArrowTopRightOnSquareIcon
                        class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </button>

                    <span
                      v-if="tx.status === 'draft'"
                      class="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded whitespace-nowrap"
                    >
                      مسودة
                    </span>
                  </div>
                </td>
                <td class="p-4 text-sm text-slate-200">{{ tx.description }}</td>
                <td class="p-4 text-sm text-slate-500">{{ tx.opposite_account }}</td>
                <td class="p-4 text-sm font-bold text-emerald-400 text-left">
                  {{ tx.debit > 0 ? formatNumber(tx.debit) : '-' }}
                </td>
                <td class="p-4 text-sm font-bold text-rose-400 text-left">
                  {{ tx.credit > 0 ? formatNumber(tx.credit) : '-' }}
                </td>
                <td class="p-4 text-sm font-black text-white text-left bg-primary/5" dir="ltr">
                  {{ formatNumber(tx.balance) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div
      v-else-if="!loading"
      class="py-32 flex flex-col items-center justify-center bg-slate-900 rounded-3xl border-2 border-dashed border-slate-800"
    >
      <div class="p-6 bg-slate-800 rounded-full mb-4">
        <DocumentMagnifyingGlassIcon class="w-12 h-12 text-slate-600" />
      </div>
      <p class="text-slate-500 font-bold">ابحث عن حساب مالي لعرض كشف الحساب التلقائي</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AutoComplete from 'primevue/autocomplete'
import reportingService from '@/modules/accounting/services/reporting.service'
// [جديد] استدعاء المتجر لجلب قائمة الحسابات
import { useAccountStore } from '@/modules/accounting/stores/accountStore'
import SummaryCard from './components/SummaryCard.vue'
import {
  PrinterIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  CalculatorIcon,
  ChartBarIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const accountStore = useAccountStore()

// 1. Data State
const loading = ref(false)
const reportData = ref(null)
const accountsList = ref([])
const selectedAccount = ref(null)

const filters = reactive({
  from_date: route.query.from_date || new Date().toISOString().substr(0, 7) + '-01',
  to_date: route.query.to_date || new Date().toISOString().substr(0, 10),
  include_drafts: route.query.include_drafts === 'true', // [جديد] قراءة الفلتر من الرابط
})

// 2. Search Logic (محسنة لتطابق القيود اليومية)
const filteredAccounts = ref([])
let searchTimeout = null

const searchAccounts = (event) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (!event.query.trim().length) {
      filteredAccounts.value = [...accountsList.value]
    } else {
      filteredAccounts.value = accountsList.value.filter((acc) => {
        return acc.name.includes(event.query) || acc.code.includes(event.query)
      })
    }
  }, 50)
}

// 3. Load Data Functions
const onAccountSelected = () => {
  // بمجرد اختيار الحساب، استدعاء الدالة لجلب التقرير
  loadReport()
}

const loadIfAccountSelected = () => {
  // في حال تغيير التواريخ أو مربع المسودات، يتم التحديث إن كان هناك حساب محدد مسبقاً
  if (selectedAccount.value) {
    loadReport()
  }
}

const loadReport = async () => {
  if (!selectedAccount.value) return

  loading.value = true
  router.push({
    query: {
      ...filters,
      target_id: selectedAccount.value.id,
      target_type: 'account',
      include_drafts: filters.include_drafts,
    },
  })

  try {
    // --- التعديل هنا ---
    const params = {
      ...filters,
      target_type: 'account',
      target_id: selectedAccount.value.id,
      // التحويل الصريح لرقم 1 أو 0 ليتوافق مع لارافل
      include_drafts: filters.include_drafts ? 1 : 0,
    }

    const response = await reportingService.getAccountStatement(params)
    reportData.value = response.data.data
  } catch (err) {
    alert(err.response?.data?.message || 'حدث خطأ أثناء استخراج البيانات')
  } finally {
    loading.value = false
  }
}

// [جديد] جلب قائمة الحسابات عند التشغيل لتمكين البحث
onMounted(async () => {
  // استخدام دالة الجلب من المتجر (Pinia) كما يتم في صفحة القيود
  if (accountStore.flatAccounts?.length === 0 || !accountStore.transactionalAccounts) {
    await accountStore.fetchAccounts()
  }

  // نملأ المصفوفة بالحسابات التي تقبل الحركات فقط
  accountsList.value = accountStore.transactionalAccounts || []

  // التحقق مما إذا كان هناك حساب مرسل عبر الـ URL لتحديده وتوليد التقرير تلقائياً عند فتح الصفحة
  if (route.query.target_id && route.query.target_type === 'account') {
    const preSelected = accountsList.value.find((a) => a.id == route.query.target_id)
    if (preSelected) {
      selectedAccount.value = preSelected
      loadReport()
    }
  }
})

// 4. Styling (تحديث التصميم ليطابق شكل القيود)
const autoCompleteStyles = {
  root: { class: 'w-full block' },
  input: {
    class:
      'w-full px-4 py-2.5 text-sm font-bold text-white bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all placeholder-slate-500',
  },
  panel: {
    class:
      'bg-slate-800 border border-slate-700 shadow-2xl rounded-xl z-[9999] max-h-60 overflow-y-auto mt-1',
  },
  item: ({ context }) => ({
    class: [
      'px-4 py-3 cursor-pointer transition-all duration-200 border-b border-slate-700/50 last:border-0 outline-none',
      context.focused || context.selected
        ? 'bg-primary/10 text-primary border-r-4 border-r-primary font-bold'
        : 'hover:bg-slate-700/50 text-slate-300',
    ],
  }),
}

// دالة الانتقال الذكي لشاشة التعديل حسب المصدر
const navigateToEntry = (tx) => {
  // 1. إذا كان قيد يدوي
  if (tx.source === 'manual') {
    router.push({ name: 'journal-entries.edit', params: { id: tx.id } })
  }
  // 2. إذا كان سند صرف (Payment)
  else if (tx.source === 'payment') {
    router.push({ name: 'payments.edit', params: { id: tx.source_id } })
  }
  // 3. إذا كان سند قبض (Receipt)
  else if (tx.source === 'receipt') {
    router.push({ name: 'receipts.edit', params: { id: tx.source_id } })
  }
}

const formatNumber = (num) =>
  Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>
