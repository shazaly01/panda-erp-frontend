<!--src/modules/accounting/views/vouchers/ExpensesReportPrintView.vue-->
<template>
  <div
    class="print-page-wrapper bg-slate-50 min-h-screen p-4 sm:p-6 print:p-0 print:bg-white print:min-h-0 font-sans"
    dir="rtl"
  >
    <!-- شريط الإجراءات العلوي (يختفي كلياً بالطباعة) -->
    <div
      class="max-w-6xl mx-auto mb-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between print:hidden"
    >
      <div class="flex items-center gap-2 text-xs text-slate-600">
        <span class="font-bold text-slate-800">تقرير المصروفات:</span>
        <span> يتم تجهيز كافة سندات الصرف المحددة تلقائياً للطباعة الرسمية. </span>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="closeWindow"
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
        >
          إغلاق النافذة
        </button>

        <button
          type="button"
          @click="triggerPrint"
          class="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition-all text-xs shadow-md shadow-blue-500/10 active:scale-95"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h6z"
            />
          </svg>
          طباعة الكشف الآن
        </button>
      </div>
    </div>

    <!-- ورقة التقرير الرسمية -->
    <div
      class="report-paper max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none"
    >
      <!-- 1. الترويسة الرسمية المتناسقة -->
      <div
        class="header-banner flex justify-between items-center pb-4 mb-4 border-b-2 border-slate-800"
      >
        <!-- اليمين: الشعار واسم المنشأة -->
        <div class="flex items-center gap-4">
          <div class="logo-box w-20 h-16 flex items-center justify-center">
            <img
              :src="brandingStore.logoMiniUrl || brandingStore.logoUrl || '/MainLogo2.png'"
              :alt="brandingStore.appName || 'Logo'"
              class="max-w-full max-h-full object-contain"
            />
          </div>
          <div>
            <h1 class="text-lg font-black text-slate-900 tracking-tight">
              {{ brandingStore.appName || 'محطة مياه المنارة' }}
            </h1>
            <p class="text-[11px] text-slate-500 font-semibold mt-0.5">
              الإدارة المالية - قسم الحسابات العامة
            </p>
          </div>
        </div>

        <!-- المنتصف: عنوان التقرير -->
        <div class="text-center px-4">
          <h2 class="text-xl font-black text-slate-900 tracking-wide underline underline-offset-8">
            كشف المصروفات التحليلي
          </h2>
          <span class="text-xs font-mono font-bold text-slate-600 block mt-1">
            EXPENSES STATEMENT REPORT
          </span>
        </div>

        <!-- اليسار: بيانات الفترة وتاريخ الاستخراج -->
        <div class="flex flex-col gap-1 text-xs items-end min-w-[200px]">
          <div
            class="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200"
          >
            <span class="text-slate-500 font-bold">الفترة:</span>
            <span class="font-bold text-slate-900 font-mono">{{ periodLabel }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mt-1">
            <span>تاريخ الطباعة:</span>
            <span class="font-mono font-bold text-slate-700">{{ currentDate }}</span>
            <span>|</span>
            <span class="font-mono font-bold text-slate-700">{{ currentTime }}</span>
          </div>
        </div>
      </div>

      <!-- 2. بطاقات الإحصائيات الموجزة -->
      <div class="grid grid-cols-3 gap-3 mb-4 text-center">
        <div class="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
          <span class="text-[10px] text-slate-500 font-bold block">إجمالي عدد السندات</span>
          <span class="text-base font-black text-slate-800 font-mono">{{
            vouchersList.length
          }}</span>
        </div>
        <div class="bg-rose-50/70 border border-rose-200 p-2.5 rounded-lg">
          <span class="text-[10px] text-rose-700 font-bold block">إجمالي مبالغ المصروفات</span>
          <span class="text-base font-black text-rose-700 font-mono">
            {{ formatAmount(totalExpenses) }} {{ defaultCurrency }}
          </span>
        </div>
        <div class="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
          <span class="text-[10px] text-slate-500 font-bold block">حالة السندات المشمولة</span>
          <span class="text-xs font-black text-slate-800">{{ statusLabel }}</span>
        </div>
      </div>

      <!-- 3. جدول بنود المصروفات -->
      <div class="table-container mb-6">
        <table class="w-full text-right border-collapse border border-slate-300 text-xs">
          <thead>
            <tr
              class="bg-slate-100 text-slate-800 font-black border-b border-slate-300 text-[11px]"
            >
              <th class="p-2 border border-slate-300 w-12 text-center">#</th>
              <th class="p-2 border border-slate-300 w-28 text-center font-mono">رقم السند</th>
              <th class="p-2 border border-slate-300 w-24 text-center font-mono">التاريخ</th>
              <th class="p-2 border border-slate-300 min-w-[140px]">المستفيد / المدفوع لأمره</th>
              <th class="p-2 border border-slate-300 min-w-[180px]">البيان / الوصف</th>
              <th class="p-2 border border-slate-300 w-36">وسيلة الدفع / الخزينة</th>
              <th class="p-2 border border-slate-300 w-24 text-center">الحالة</th>
              <th class="p-2 border border-slate-300 w-32 text-left font-mono">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(voucher, index) in vouchersList"
              :key="voucher.id"
              class="border-b border-slate-200 text-slate-800 odd:bg-white even:bg-slate-50/50"
            >
              <td class="p-2 border border-slate-300 text-center font-mono font-bold">
                {{ index + 1 }}
              </td>
              <td class="p-2 border border-slate-300 text-center font-mono font-bold">
                {{ voucher.number }}
              </td>
              <td class="p-2 border border-slate-300 text-center font-mono">
                {{ formatDate(voucher.date) }}
              </td>
              <td class="p-2 border border-slate-300 font-semibold">
                {{ voucher.payee_name || '---' }}
              </td>
              <td class="p-2 border border-slate-300 text-[11px] text-slate-600 leading-snug">
                {{ voucher.description || '---' }}
              </td>
              <td class="p-2 border border-slate-300 text-[11px]">
                {{
                  voucher.payment_method?.name ||
                  voucher.bank_account?.bank_name ||
                  voucher.box?.name ||
                  '---'
                }}
              </td>
              <td class="p-2 border border-slate-300 text-center text-[10px] font-bold">
                {{ formatStatus(voucher.status) }}
              </td>
              <td
                class="p-2 border border-slate-300 text-left font-mono font-bold text-rose-700"
                dir="ltr"
              >
                {{ formatAmount(voucher.amount) }}
              </td>
            </tr>

            <tr v-if="!loading && vouchersList.length === 0">
              <td colspan="8" class="p-6 text-center text-slate-400 font-bold">
                لا توجد سندات صرف مسجلة ضمن معايير البحث والفترة المحددة.
              </td>
            </tr>

            <!-- سطر الإجمالي العام -->
            <tr class="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400">
              <td colspan="7" class="p-2.5 text-left border border-slate-300 text-xs">
                الإجمالي العام للمصروفات (Grand Total):
              </td>
              <td
                class="p-2.5 border border-slate-300 text-left font-mono text-sm font-black text-rose-800"
                dir="ltr"
              >
                {{ formatAmount(totalExpenses) }} {{ defaultCurrency }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 4. قسم التوقيعات والاعتمادات الرسمية الثلاثية -->
      <div
        class="signatures-grid grid grid-cols-3 gap-6 text-center pt-4 border-t-2 border-slate-300"
      >
        <div class="space-y-4">
          <p class="font-bold text-slate-800 text-xs">إعداد / المحاسب المسؤول</p>
          <div class="border-b border-dotted border-slate-400 w-36 mx-auto pt-4"></div>
          <p class="text-[10px] text-slate-400">التوقيع: .....................</p>
        </div>

        <div class="space-y-4">
          <p class="font-bold text-slate-800 text-xs">المراجعة والتدقيق المالي</p>
          <div class="border-b border-dotted border-slate-400 w-36 mx-auto pt-4"></div>
          <p class="text-[10px] text-slate-400">التوقيع: .....................</p>
        </div>

        <div class="space-y-4">
          <p class="font-bold text-slate-800 text-xs">اعتماد المدير المالي / العام</p>
          <div class="border-b border-dotted border-slate-400 w-36 mx-auto pt-4"></div>
          <p class="text-[10px] text-slate-400">الختم والاعتماد: .....................</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBrandingStore } from '@/stores/brandingStore'
import voucherService from '@/modules/accounting/services/voucher.service'

const route = useRoute()
const brandingStore = useBrandingStore()

const vouchersList = ref([])
const loading = ref(false)

const currentDate = new Date().toLocaleDateString('ar-EG', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const currentTime = new Date().toLocaleTimeString('ar-EG', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
})

const periodLabel = computed(() => {
  const from = route.query.date_from
  const to = route.query.date_to
  if (from && to) return `${from} إلى ${to}`
  if (from) return `من ${from}`
  if (to) return `حتى ${to}`
  return 'كافة الفترات'
})

const statusLabel = computed(() => {
  const st = route.query.status
  if (st === 'posted') return 'السندات المرحلة فقط'
  if (st === 'approved') return 'السندات المعتمدة'
  if (st === 'draft') return 'المسودات'
  return 'جميع الحالات'
})

const defaultCurrency = computed(() => {
  return vouchersList.value[0]?.currency?.code || 'SDG'
})

const totalExpenses = computed(() => {
  return vouchersList.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
})

const formatAmount = (num) => {
  if (!num && num !== 0) return '0.00'
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatDate = (dateStr) => {
  if (!dateStr) return '---'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

const formatStatus = (status) => {
  switch (status) {
    case 'posted':
      return 'مُرحل'
    case 'approved':
      return 'معتمد'
    case 'draft':
      return 'مسودة'
    default:
      return status || '---'
  }
}

const fetchReportData = async () => {
  loading.value = true
  try {
    const params = {
      type: 'payment',
      date_from: route.query.date_from || undefined,
      date_to: route.query.date_to || undefined,
      status: route.query.status || undefined,
      search: route.query.search || undefined,
      per_page: 1000,
    }

    const res = await voucherService.get(params)
    vouchersList.value = res.data?.data || []

    setTimeout(() => {
      window.print()
    }, 500)
  } catch (error) {
    console.error('فشل جلب بيانات كشف المصروفات:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!brandingStore.isLoaded && brandingStore.fetchBranding) {
    brandingStore.fetchBranding()
  }
  fetchReportData()
})

const triggerPrint = () => {
  window.print()
}

const closeWindow = () => {
  window.close()
}
</script>

<style>
@media print {
  @page {
    size: A4 portrait;
    margin: 8mm 10mm;
  }

  html,
  body {
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #000000 !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
  }

  nav,
  aside,
  header,
  footer,
  [class*='sidebar'],
  [class*='navbar'] {
    display: none !important;
  }
}
</style>

<style scoped>
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .print-page-wrapper {
    padding: 0 !important;
    margin: 0 !important;
    background: #ffffff !important;
  }

  .report-paper {
    padding: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    border: none !important;
    box-shadow: none !important;
  }

  .signatures-grid {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
}
</style>
