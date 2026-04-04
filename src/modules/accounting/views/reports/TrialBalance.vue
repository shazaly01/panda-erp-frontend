<template>
  <div class="p-6 space-y-6 rtl text-right" dir="rtl">
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl"
    >
      <div>
        <h1 class="text-2xl font-black text-white flex items-center gap-2">
          <ScaleIcon class="w-8 h-8 text-primary" />
          ميزان المراجعة
        </h1>
        <p class="text-sm text-slate-400 mt-1 font-medium">
          عرض أرصدة ومجاميع الحسابات للتأكد من توازن العمليات المالية
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
              ميزان المراجعة حتى تاريخ (As of Date)
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
                تضمين القيود المسودة (غير المرحلة)
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
              تحديث الميزان
            </button>
          </div>
        </div>
      </div>
    </div>

    <template v-if="reportData">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col">
          <span class="text-slate-400 font-bold text-sm mb-2">إجمالي المجاميع (مدين)</span>
          <span class="text-3xl font-black text-emerald-400 font-mono" dir="ltr">
            {{ formatNumber(reportData.summary.total_debit) }}
          </span>
        </div>

        <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col">
          <span class="text-slate-400 font-bold text-sm mb-2">إجمالي المجاميع (دائن)</span>
          <span class="text-3xl font-black text-rose-400 font-mono" dir="ltr">
            {{ formatNumber(reportData.summary.total_credit) }}
          </span>
        </div>

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
              حالة الميزان
            </span>
            <span
              class="text-xl font-black"
              :class="reportData.summary.is_balanced ? 'text-white' : 'text-red-500'"
            >
              {{ reportData.summary.is_balanced ? 'متوازن ومطابق' : 'غير متوازن! يرجى المراجعة' }}
            </span>
          </div>
          <CheckCircleIcon
            v-if="reportData.summary.is_balanced"
            class="w-12 h-12 text-primary opacity-80"
          />
          <ExclamationTriangleIcon v-else class="w-12 h-12 text-red-500 opacity-80" />
        </div>
      </div>

      <div class="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-right">
            <thead class="bg-slate-800/80 border-b border-slate-700">
              <tr>
                <th class="p-4 text-sm font-black text-slate-300 w-24">رمز الحساب</th>
                <th class="p-4 text-sm font-black text-slate-300">اسم الحساب</th>
                <th class="p-4 text-sm font-black text-slate-300">التصنيف</th>
                <th class="p-4 text-sm font-black text-slate-300 text-left">مجموع المدين</th>
                <th class="p-4 text-sm font-black text-slate-300 text-left">مجموع الدائن</th>
                <th class="p-4 text-sm font-black text-slate-300 text-left bg-slate-800">
                  الرصيد الصافي
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
              <tr
                v-for="acc in reportData.accounts"
                :key="acc.id"
                class="transition-colors"
                :class="[
                  acc.is_transactional
                    ? 'hover:bg-slate-800/40 bg-transparent'
                    : 'bg-slate-800/30 border-y border-slate-700/50',
                ]"
              >
                <td
                  class="p-4 font-mono text-sm"
                  :class="acc.is_transactional ? 'text-slate-400' : 'text-primary font-bold'"
                >
                  {{ acc.code }}
                </td>

                <td
                  class="p-4 text-sm"
                  :class="[acc.is_transactional ? 'text-slate-300 pr-8' : 'text-white font-black']"
                >
                  {{ acc.name }}
                </td>

                <td class="p-4 text-xs text-slate-500">
                  <span v-if="!acc.is_transactional" class="bg-slate-800 px-2 py-1 rounded">{{
                    acc.type
                  }}</span>
                </td>

                <td
                  class="p-4 text-sm text-left"
                  :class="
                    acc.is_transactional
                      ? 'text-emerald-400 font-bold'
                      : 'text-emerald-500 font-black'
                  "
                >
                  {{ acc.debit > 0 ? formatNumber(acc.debit) : '-' }}
                </td>

                <td
                  class="p-4 text-sm text-left"
                  :class="
                    acc.is_transactional ? 'text-rose-400 font-bold' : 'text-rose-500 font-black'
                  "
                >
                  {{ acc.credit > 0 ? formatNumber(acc.credit) : '-' }}
                </td>

                <td
                  class="p-4 text-sm text-left"
                  :class="[
                    acc.is_transactional
                      ? 'text-white font-bold bg-slate-800/20'
                      : 'text-white font-black bg-slate-800/50',
                    acc.balance < 0 ? 'text-red-400' : '',
                  ]"
                  dir="ltr"
                >
                  {{ formatNumber(Math.abs(acc.balance)) }}
                  <span v-if="acc.balance !== 0" class="text-[10px] text-slate-500 ml-1">{{
                    acc.balance > 0
                      ? acc.nature === 'debit'
                        ? 'مدين'
                        : 'دائن'
                      : acc.nature === 'debit'
                        ? 'دائن'
                        : 'مدين'
                  }}</span>
                  <span v-else class="text-[10px] text-slate-500 ml-1">-</span>
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
        <ScaleIcon class="w-12 h-12 text-slate-600" />
      </div>
      <p class="text-slate-500 font-bold text-lg">
        حدد التاريخ واضغط على "تحديث الميزان" لاستخراج التقرير
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
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

// استيراد أيقونة الميزان من نوع solid لتبدو أجمل في العناوين
import { ScaleIcon } from '@heroicons/vue/24/solid'

import reportingService from '@/modules/accounting/services/reporting.service'

const loading = ref(false)
const reportData = ref(null)

// الفلاتر الافتراضية (تاريخ اليوم)
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
    const response = await reportingService.getTrialBalance(params)
    reportData.value = response.data.data
  } catch (err) {
    alert(err.response?.data?.message || 'حدث خطأ أثناء استخراج الميزان')
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
