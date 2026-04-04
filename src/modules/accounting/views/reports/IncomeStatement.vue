<template>
  <div class="p-6 space-y-6 rtl text-right" dir="rtl">
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl"
    >
      <div>
        <h1 class="text-2xl font-black text-white flex items-center gap-2">
          <PresentationChartLineIcon class="w-8 h-8 text-primary" />
          قائمة الدخل (الأرباح والخسائر)
        </h1>
        <p class="text-sm text-slate-400 mt-1 font-medium">
          قياس الأداء المالي للشركة عبر مقارنة الإيرادات بالمصروفات خلال فترة محددة
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
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div class="col-span-1 md:col-span-2">
            <label class="block text-sm font-bold text-slate-400 mb-2">من تاريخ</label>
            <input
              type="date"
              v-model="filters.from_date"
              class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div class="col-span-1 md:col-span-2">
            <label class="block text-sm font-bold text-slate-400 mb-2">إلى تاريخ</label>
            <input
              type="date"
              v-model="filters.to_date"
              class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div class="col-span-1">
            <button
              @click="loadReport"
              :disabled="loading"
              class="w-full bg-primary text-slate-900 py-2.5 rounded-lg font-black hover:bg-primary/90 transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <ArrowPathIcon v-if="loading" class="w-5 h-5 animate-spin" />
              <DocumentChartBarIcon v-else class="w-5 h-5" />
              تحديث التقرير
            </button>
          </div>

          <div class="col-span-1 md:col-span-5 flex justify-end mt-2">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                v-model="filters.include_drafts"
                class="w-5 h-5 text-primary bg-slate-800 border-slate-600 rounded focus:ring-primary focus:ring-2 cursor-pointer"
              />
              <span
                class="text-sm font-bold text-slate-300 group-hover:text-white transition-colors"
              >
                تضمين القيود المسودة (غير المرحلة)
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <template v-if="reportData">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          class="bg-slate-900 p-6 rounded-2xl border border-emerald-500/20 shadow-lg flex flex-col relative overflow-hidden"
        >
          <div class="absolute inset-y-0 right-0 w-1 bg-emerald-500"></div>
          <span class="text-slate-400 font-bold text-sm mb-2">إجمالي الإيرادات</span>
          <span class="text-3xl font-black text-emerald-400 font-mono" dir="ltr">
            {{ formatNumber(reportData.summary.total_revenues) }}
          </span>
        </div>

        <div
          class="bg-slate-900 p-6 rounded-2xl border border-rose-500/20 shadow-lg flex flex-col relative overflow-hidden"
        >
          <div class="absolute inset-y-0 right-0 w-1 bg-rose-500"></div>
          <span class="text-slate-400 font-bold text-sm mb-2">إجمالي المصروفات</span>
          <span class="text-3xl font-black text-rose-400 font-mono" dir="ltr">
            {{ formatNumber(reportData.summary.total_expenses) }}
          </span>
        </div>

        <div
          class="p-6 rounded-2xl border shadow-lg flex items-center justify-between"
          :class="
            reportData.summary.net_profit >= 0
              ? 'bg-primary/10 border-primary/30'
              : 'bg-red-500/10 border-red-500/30'
          "
        >
          <div class="flex flex-col">
            <span
              class="font-bold text-sm mb-1"
              :class="reportData.summary.net_profit >= 0 ? 'text-primary' : 'text-red-400'"
            >
              النتيجة النهائية (صافي الربح / الخسارة)
            </span>
            <span
              class="text-3xl font-black font-mono"
              dir="ltr"
              :class="reportData.summary.net_profit >= 0 ? 'text-white' : 'text-red-500'"
            >
              {{ formatNumber(reportData.summary.net_profit) }}
            </span>
          </div>
          <ArrowTrendingUpIcon
            v-if="reportData.summary.net_profit >= 0"
            class="w-12 h-12 text-primary opacity-80"
          />
          <ArrowTrendingDownIcon v-else class="w-12 h-12 text-red-500 opacity-80" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
          <div class="bg-emerald-500/10 border-b border-emerald-500/20 p-4">
            <h2 class="text-lg font-black text-emerald-400 flex items-center gap-2">
              <PlusCircleIcon class="w-6 h-6" />
              الإيرادات (Revenues)
            </h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-right">
              <thead class="bg-slate-800/80 border-b border-slate-700">
                <tr>
                  <th class="p-3 text-sm font-black text-slate-300 w-24">الرمز</th>
                  <th class="p-3 text-sm font-black text-slate-300">اسم الحساب</th>
                  <th class="p-3 text-sm font-black text-slate-300 text-left">الرصيد</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50">
                <tr
                  v-for="acc in reportData.revenues"
                  :key="acc.id"
                  class="transition-colors"
                  :class="
                    acc.is_transactional
                      ? 'hover:bg-slate-800/40 bg-transparent'
                      : 'bg-slate-800/30'
                  "
                >
                  <td
                    class="p-3 font-mono text-xs"
                    :class="acc.is_transactional ? 'text-slate-400' : 'text-emerald-400 font-bold'"
                  >
                    {{ acc.code }}
                  </td>
                  <td
                    class="p-3 text-sm"
                    :class="[
                      acc.is_transactional ? 'text-slate-300 pr-6' : 'text-white font-black',
                    ]"
                  >
                    {{ acc.name }}
                  </td>
                  <td
                    class="p-3 text-sm text-left font-mono"
                    :class="
                      acc.is_transactional ? 'text-white font-bold' : 'text-emerald-400 font-black'
                    "
                  >
                    {{ formatNumber(acc.balance) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
          <div class="bg-rose-500/10 border-b border-rose-500/20 p-4">
            <h2 class="text-lg font-black text-rose-400 flex items-center gap-2">
              <MinusCircleIcon class="w-6 h-6" />
              المصروفات (Expenses)
            </h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-right">
              <thead class="bg-slate-800/80 border-b border-slate-700">
                <tr>
                  <th class="p-3 text-sm font-black text-slate-300 w-24">الرمز</th>
                  <th class="p-3 text-sm font-black text-slate-300">اسم الحساب</th>
                  <th class="p-3 text-sm font-black text-slate-300 text-left">الرصيد</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50">
                <tr
                  v-for="acc in reportData.expenses"
                  :key="acc.id"
                  class="transition-colors"
                  :class="
                    acc.is_transactional
                      ? 'hover:bg-slate-800/40 bg-transparent'
                      : 'bg-slate-800/30'
                  "
                >
                  <td
                    class="p-3 font-mono text-xs"
                    :class="acc.is_transactional ? 'text-slate-400' : 'text-rose-400 font-bold'"
                  >
                    {{ acc.code }}
                  </td>
                  <td
                    class="p-3 text-sm"
                    :class="[
                      acc.is_transactional ? 'text-slate-300 pr-6' : 'text-white font-black',
                    ]"
                  >
                    {{ acc.name }}
                  </td>
                  <td
                    class="p-3 text-sm text-left font-mono"
                    :class="
                      acc.is_transactional ? 'text-white font-bold' : 'text-rose-400 font-black'
                    "
                  >
                    {{ formatNumber(acc.balance) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <div
      v-else-if="!loading"
      class="py-32 flex flex-col items-center justify-center bg-slate-900 rounded-3xl border-2 border-dashed border-slate-800"
    >
      <div class="p-6 bg-slate-800 rounded-full mb-4">
        <PresentationChartLineIcon class="w-12 h-12 text-slate-600" />
      </div>
      <p class="text-slate-500 font-bold text-lg">
        حدد الفترة الزمنية واضغط على "تحديث التقرير" لاستخراج قائمة الدخل
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  PrinterIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusCircleIcon,
  MinusCircleIcon,
} from '@heroicons/vue/24/outline'

import reportingService from '@/modules/accounting/services/reporting.service'

const loading = ref(false)
const reportData = ref(null)

// الفلاتر الافتراضية (من بداية الشهر الحالي إلى اليوم)
const filters = reactive({
  from_date: new Date().toISOString().substr(0, 7) + '-01',
  to_date: new Date().toISOString().substr(0, 10),
  include_drafts: false,
})

const loadReport = async () => {
  loading.value = true
  try {
    const params = {
      from_date: filters.from_date,
      to_date: filters.to_date,
      include_drafts: filters.include_drafts ? 1 : 0,
    }
    const response = await reportingService.getIncomeStatement(params)
    reportData.value = response.data.data
  } catch (err) {
    alert(err.response?.data?.message || 'حدث خطأ أثناء استخراج التقرير')
  } finally {
    loading.value = false
  }
}

const formatNumber = (num) =>
  Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// تحميل تلقائي عند فتح الصفحة
onMounted(() => {
  loadReport()
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: white;
  }
  * {
    color: black !important;
  }
  table {
    border-collapse: collapse;
  }
  th,
  td {
    border: 1px solid #ddd;
  }
}
</style>
