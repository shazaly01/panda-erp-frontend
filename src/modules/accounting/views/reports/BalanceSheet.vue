<template>
  <div class="p-6 space-y-6 rtl text-right" dir="rtl">
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl"
    >
      <div>
        <h1 class="text-2xl font-black text-white flex items-center gap-2">
          <BuildingLibraryIcon class="w-8 h-8 text-primary" />
          الميزانية العمومية (المركز المالي)
        </h1>
        <p class="text-sm text-slate-400 mt-1 font-medium">
          لقطة للمركز المالي للشركة توضح ما تملكه (الأصول) وما عليها من التزامات (الخصوم وحقوق
          الملكية)
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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div class="col-span-1 md:col-span-2">
            <label class="block text-sm font-bold text-slate-400 mb-2 flex items-center gap-2">
              <CalendarIcon class="w-5 h-5" />
              الميزانية حتى تاريخ (As of Date)
            </label>
            <input
              type="date"
              v-model="filters.as_of_date"
              class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div class="col-span-1 flex flex-col justify-end pb-2">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                v-model="filters.include_drafts"
                class="w-5 h-5 text-primary bg-slate-800 border-slate-600 rounded focus:ring-primary focus:ring-2 cursor-pointer"
              />
              <span
                class="text-sm font-bold text-slate-300 group-hover:text-white transition-colors"
              >
                تضمين القيود المسودة
              </span>
            </label>
          </div>

          <div class="col-span-1">
            <button
              @click="loadReport"
              :disabled="loading"
              class="w-full bg-primary text-slate-900 py-2.5 rounded-lg font-black hover:bg-primary/90 transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <ArrowPathIcon v-if="loading" class="w-5 h-5 animate-spin" />
              <DocumentChartBarIcon v-else class="w-5 h-5" />
              تحديث الميزانية
            </button>
          </div>
        </div>
      </div>
    </div>

    <template v-if="reportData">
      <div
        class="p-6 rounded-2xl border shadow-lg flex items-center justify-between"
        :class="
          reportData.summary.is_balanced
            ? 'bg-primary/10 border-primary/30'
            : 'bg-red-500/10 border-red-500/30'
        "
      >
        <div class="flex flex-col">
          <span
            class="font-bold text-sm mb-1"
            :class="reportData.summary.is_balanced ? 'text-primary' : 'text-red-400'"
          >
            حالة الميزانية (المعادلة المحاسبية)
          </span>
          <span
            class="text-xl font-black"
            :class="reportData.summary.is_balanced ? 'text-white' : 'text-red-500'"
          >
            {{
              reportData.summary.is_balanced
                ? 'الميزانية متوازنة تماماً (الأصول = الخصوم + حقوق الملكية)'
                : 'الميزانية غير متوازنة! يرجى مراجعة القيود.'
            }}
          </span>
        </div>
        <CheckBadgeIcon
          v-if="reportData.summary.is_balanced"
          class="w-12 h-12 text-primary opacity-80"
        />
        <ExclamationTriangleIcon v-else class="w-12 h-12 text-red-500 opacity-80" />
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div class="space-y-6 flex flex-col">
          <div
            class="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex-1"
          >
            <div
              class="bg-blue-500/10 border-b border-blue-500/20 p-4 flex justify-between items-center"
            >
              <h2 class="text-lg font-black text-blue-400 flex items-center gap-2">
                <BanknotesIcon class="w-6 h-6" />
                الأصول (Assets)
              </h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-right">
                <thead class="bg-slate-800/80 border-b border-slate-700">
                  <tr>
                    <th class="p-3 text-sm font-black text-slate-300 w-20">الرمز</th>
                    <th class="p-3 text-sm font-black text-slate-300">الحساب</th>
                    <th class="p-3 text-sm font-black text-slate-300 text-left">الرصيد</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/50">
                  <tr
                    v-for="acc in reportData.assets"
                    :key="acc.id"
                    class="transition-colors"
                    :class="
                      acc.is_transactional
                        ? 'hover:bg-slate-800/40 bg-transparent'
                        : 'bg-slate-800/30'
                    "
                  >
                    <td class="p-3 font-mono text-xs text-slate-400">{{ acc.code }}</td>
                    <td
                      class="p-3 text-sm"
                      :class="[
                        acc.is_transactional ? 'text-slate-300 pr-6' : 'text-blue-400 font-black',
                      ]"
                    >
                      {{ acc.name }}
                    </td>
                    <td
                      class="p-3 text-sm text-left font-mono"
                      :class="
                        acc.is_transactional ? 'text-white font-bold' : 'text-blue-400 font-black'
                      "
                    >
                      {{ formatNumber(acc.balance) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            class="bg-blue-500 p-6 rounded-2xl shadow-xl flex justify-between items-center text-white mt-auto"
          >
            <span class="text-lg font-black">إجمالي الأصول</span>
            <span class="text-2xl font-black font-mono" dir="ltr">{{
              formatNumber(reportData.summary.total_assets)
            }}</span>
          </div>
        </div>

        <div class="space-y-6 flex flex-col">
          <div class="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            <div class="bg-rose-500/10 border-b border-rose-500/20 p-4">
              <h2 class="text-lg font-black text-rose-400 flex items-center gap-2">
                <DocumentTextIcon class="w-6 h-6" />
                الخصوم (Liabilities)
              </h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-right">
                <thead class="bg-slate-800/80 border-b border-slate-700">
                  <tr>
                    <th class="p-3 text-sm font-black text-slate-300 w-20">الرمز</th>
                    <th class="p-3 text-sm font-black text-slate-300">الحساب</th>
                    <th class="p-3 text-sm font-black text-slate-300 text-left">الرصيد</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/50">
                  <tr
                    v-for="acc in reportData.liabilities"
                    :key="acc.id"
                    class="transition-colors"
                    :class="
                      acc.is_transactional
                        ? 'hover:bg-slate-800/40 bg-transparent'
                        : 'bg-slate-800/30'
                    "
                  >
                    <td class="p-3 font-mono text-xs text-slate-400">{{ acc.code }}</td>
                    <td
                      class="p-3 text-sm"
                      :class="[
                        acc.is_transactional ? 'text-slate-300 pr-6' : 'text-rose-400 font-black',
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

          <div class="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            <div class="bg-purple-500/10 border-b border-purple-500/20 p-4">
              <h2 class="text-lg font-black text-purple-400 flex items-center gap-2">
                <ScaleIcon class="w-6 h-6" />
                حقوق الملكية (Equity)
              </h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-right">
                <thead class="bg-slate-800/80 border-b border-slate-700">
                  <tr>
                    <th class="p-3 text-sm font-black text-slate-300 w-20">الرمز</th>
                    <th class="p-3 text-sm font-black text-slate-300">الحساب</th>
                    <th class="p-3 text-sm font-black text-slate-300 text-left">الرصيد</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/50">
                  <tr
                    v-for="acc in reportData.equity"
                    :key="acc.id"
                    class="transition-colors"
                    :class="
                      acc.is_transactional
                        ? 'hover:bg-slate-800/40 bg-transparent'
                        : 'bg-slate-800/30'
                    "
                  >
                    <td class="p-3 font-mono text-xs text-slate-400">{{ acc.code }}</td>
                    <td
                      class="p-3 text-sm"
                      :class="[
                        acc.is_transactional ? 'text-slate-300 pr-6' : 'text-purple-400 font-black',
                      ]"
                    >
                      {{ acc.name }}
                    </td>
                    <td
                      class="p-3 text-sm text-left font-mono"
                      :class="
                        acc.is_transactional ? 'text-white font-bold' : 'text-purple-400 font-black'
                      "
                    >
                      {{ formatNumber(acc.balance) }}
                    </td>
                  </tr>

                  <tr class="bg-emerald-500/10 border-t-2 border-emerald-500/30">
                    <td class="p-3 font-mono text-xs text-emerald-400">P&L</td>
                    <td class="p-3 text-sm text-emerald-400 font-black">
                      صافي الربح / الخسارة (للفترة)
                    </td>
                    <td
                      class="p-3 text-sm text-left font-mono text-emerald-400 font-black"
                      dir="ltr"
                    >
                      {{ formatNumber(reportData.summary.net_profit) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            class="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl flex justify-between items-center mt-auto"
          >
            <span class="text-lg font-black text-white">إجمالي الخصوم وحقوق الملكية</span>
            <span class="text-2xl font-black font-mono text-white" dir="ltr">
              {{ formatNumber(reportData.summary.total_liabilities_and_equity) }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <div
      v-else-if="!loading"
      class="py-32 flex flex-col items-center justify-center bg-slate-900 rounded-3xl border-2 border-dashed border-slate-800"
    >
      <div class="p-6 bg-slate-800 rounded-full mb-4">
        <BuildingLibraryIcon class="w-12 h-12 text-slate-600" />
      </div>
      <p class="text-slate-500 font-bold text-lg">
        حدد التاريخ واضغط التحديث لاستخراج المركز المالي
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
  CalendarIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ScaleIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

import reportingService from '@/modules/accounting/services/reporting.service'

const loading = ref(false)
const reportData = ref(null)

const filters = reactive({
  as_of_date: new Date().toISOString().substr(0, 10),
  include_drafts: false,
})

const loadReport = async () => {
  loading.value = true
  try {
    const params = {
      as_of_date: filters.as_of_date,
      include_drafts: filters.include_drafts ? 1 : 0,
    }
    const response = await reportingService.getBalanceSheet(params)
    reportData.value = response.data.data
  } catch (err) {
    alert(err.response?.data?.message || 'حدث خطأ أثناء استخراج التقرير')
  } finally {
    loading.value = false
  }
}

const formatNumber = (num) =>
  Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

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
