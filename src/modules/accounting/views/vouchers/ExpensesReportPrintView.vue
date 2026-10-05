<!--src/modules/accounting/views/vouchers/ExpensesReportPrintView.vue-->
<template>
  <div
    class="print-page-wrapper bg-gray-100 min-h-screen p-4 sm:p-6 print:p-0 print:bg-white print:min-h-0"
    dir="ltr"
  >
    <!-- شريط الإجراءات العلوي (يختفي بالكامل أثناء الطباعة) -->
    <div
      class="max-w-[1100px] mx-auto mb-4 bg-white border border-gray-200 p-3 sm:p-4 rounded-xl shadow-sm flex items-center justify-between print:hidden"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-gray-500">Report Type:</span>
        <span
          class="px-2.5 py-1 text-xs font-bold rounded-lg border"
          :class="
            isReceipt
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          "
        >
          {{ isReceipt ? 'Revenues Statement Report' : 'Expenses Statement Report' }}
        </span>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="closeWindow"
          class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
        >
          Close Window
        </button>

        <button
          type="button"
          @click="triggerPrint"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2 text-xs transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print Statement
        </button>
      </div>
    </div>

    <!-- ورقة التقرير الرسمية الأفقية (Landscape) -->
    <div id="report-official-sheet" class="report-paper" dir="ltr">
      <!-- 1. الترويسة الرسمية المتطابقة مع ترويسة السند -->
      <div class="header-section">
        <!-- كود النموذج أعلى اليسار -->
        <div class="header-left">
          <div class="form-code-badge">
            {{ formCode }}
          </div>
        </div>

        <!-- اسم المنشأة والعنوان الرسمي بالمنتصف -->
        <div class="company-branding">
          <div class="company-name">{{ brandingStore.appName || 'محطة مياه المنارة' }}</div>
          <div class="report-title">
            {{ reportTitle }}
          </div>
        </div>

        <!-- الشعار الرسمي أعلى اليمين -->
        <div class="header-right">
          <div class="logo-box">
            <img
              :src="brandingStore.logoMiniUrl || brandingStore.logoUrl || '/MainLogo2.png'"
              :alt="brandingStore.appName || 'Logo'"
              class="logo-img"
            />
          </div>
        </div>
      </div>

      <!-- 2. شريط بيانات التقرير والبطاقات الإحصائية الموجزة -->
      <div class="report-meta-bar">
        <div class="meta-item">
          <span class="meta-label">PERIOD:</span>
          <span class="meta-val">{{ periodLabel }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">DATE PRINTED:</span>
          <span class="meta-val">{{ currentPrintDate }}</span>
        </div>
      </div>

      <div class="summary-cards-grid">
        <div class="summary-card">
          <span class="summary-title">TOTAL VOUCHERS</span>
          <span class="summary-val">{{ vouchersList.length }}</span>
        </div>
        <div class="summary-card highlight-card">
          <span class="summary-title">{{ isReceipt ? 'TOTAL REVENUES' : 'TOTAL EXPENSES' }}</span>
          <span class="summary-val">{{ formatAmount(totalExpenses) }} {{ defaultCurrency }}</span>
        </div>
        <div class="summary-card">
          <span class="summary-title">CURRENCY</span>
          <span class="summary-val">{{ defaultCurrency }}</span>
        </div>
      </div>

      <!-- 3. جدول بنود السندات بعد إزالة عمود الحالة وتوسيع الأعمدة النصية -->
      <div class="table-wrapper">
        <table class="report-table">
          <thead>
            <tr>
              <th class="col-idx">#</th>
              <th class="col-num">VOUCHER #</th>
              <th class="col-date">DATE</th>
              <th class="col-payee">{{ isReceipt ? 'RECEIVED FROM' : 'PAYEE / BENEFICIARY' }}</th>
              <th class="col-desc">DESCRIPTION</th>
              <th class="col-method">METHOD / ACCOUNT</th>
              <th class="col-amount">AMOUNT ({{ defaultCurrency }})</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(voucher, index) in vouchersList" :key="voucher.id">
              <td class="col-idx">{{ index + 1 }}</td>
              <td class="col-num">{{ voucher.number }}</td>
              <td class="col-date">{{ formatDate(voucher.date) }}</td>
              <td class="col-payee">{{ voucher.payee_name || '---' }}</td>
              <td class="col-desc">{{ voucher.description || '---' }}</td>
              <td class="col-method">
                {{
                  voucher.payment_method?.name ||
                  voucher.bank_account?.bank_name ||
                  voucher.box?.name ||
                  '---'
                }}
              </td>
              <td class="col-amount">{{ formatAmount(voucher.amount) }}</td>
            </tr>

            <tr v-if="!loading && vouchersList.length === 0">
              <td colspan="7" class="empty-state-cell">
                No posted vouchers recorded within the selected criteria and period.
              </td>
            </tr>

            <!-- سطر الإجمالي العام -->
            <tr class="total-row">
              <td colspan="6" class="total-label">
                {{ isReceipt ? 'Grand Total Revenues:' : 'Grand Total Expenses:' }}
              </td>
              <td class="col-amount total-val">
                {{ formatAmount(totalExpenses) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 4. منطقة التوقيعات والاعتمادات الرسمية الثلاثية -->
      <div class="signatures-section">
        <div class="sig-block">
          <span class="sig-label">Prepared by / Accountant:</span>
          <div class="sig-space"></div>
        </div>

        <div class="sig-block">
          <span class="sig-label">Checked by / Auditor:</span>
          <div class="sig-space"></div>
        </div>

        <div class="sig-block">
          <span class="sig-label">Approved by / Manager:</span>
          <div class="sig-space"></div>
        </div>
      </div>

      <!-- 5. فوتر التقرير أسفل الصفحة -->
      <div class="report-footer">
        <span class="footer-url">{{ currentUrl }}</span>
        <span class="footer-date">{{ currentPrintDate }}</span>
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

const isReceipt = computed(() => {
  return route.query.type === 'receipt'
})

const formCode = computed(() => {
  return isReceipt.value ? 'R.F 01' : 'E.F 01'
})

const reportTitle = computed(() => {
  return isReceipt.value ? 'REVENUES STATEMENT REPORT' : 'EXPENSES STATEMENT REPORT'
})

const periodLabel = computed(() => {
  const from = route.query.date_from
  const to = route.query.date_to
  if (from && to) return `${from} to ${to}`
  if (from) return `From ${from}`
  if (to) return `Up to ${to}`
  return 'All Periods'
})

const defaultCurrency = computed(() => {
  return vouchersList.value[0]?.currency?.code || 'SDG'
})

const totalExpenses = computed(() => {
  return vouchersList.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
})

const currentUrl = computed(() => {
  return typeof window !== 'undefined' ? window.location.href : ''
})

const currentPrintDate = computed(() => {
  const now = new Date()
  return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
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

const fetchReportData = async () => {
  loading.value = true
  try {
    const params = {
      type: isReceipt.value ? 'receipt' : 'payment',
      date_from: route.query.date_from || undefined,
      date_to: route.query.date_to || undefined,
      status: 'posted', // قصر التقرير على السندات المرحلة فقط
      search: route.query.search || undefined,
      per_page: 1000,
    }

    const res = await voucherService.get(params)
    vouchersList.value = res.data?.data || []

    setTimeout(() => {
      window.print()
    }, 500)
  } catch (error) {
    console.error('Failed to load statement report data:', error)
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
    size: A4 landscape;
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
.report-paper {
  background-color: #ffffff;
  color: #000000;
  font-family: Arial, Helvetica, sans-serif;
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
  box-sizing: border-box;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

/* 1. الترويسة العليا المطابقة لترويسة السند */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  min-height: 80px;
}

.header-left {
  width: 140px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

.form-code-badge {
  border: 1.5px solid #000;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 0.5px;
  font-family: Arial, Helvetica, sans-serif;
}

.company-branding {
  text-align: center;
  flex: 1;
  padding: 0 10px;
}

.company-name {
  font-size: 20px;
  font-weight: bold;
  text-decoration: underline;
  text-underline-offset: 4px;
  margin-bottom: 6px;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
}

.report-title {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 0.8px;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
}

.header-right {
  width: 140px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.logo-box {
  width: 105px;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.logo-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* 2. شريط بيانات التقرير والبطاقات */
.report-meta-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background-color: #f9fafb;
  border: 1px solid #000;
  margin-bottom: 10px;
  font-size: 11px;
  font-weight: bold;
  font-family: Arial, Helvetica, sans-serif;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-label {
  color: #374151;
}

.meta-val {
  color: #000;
}

.summary-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.summary-card {
  border: 1px solid #000;
  padding: 6px 10px;
  text-align: center;
  background-color: #ffffff;
}

.highlight-card {
  background-color: #fef2f2;
}

.summary-title {
  display: block;
  font-size: 10px;
  font-weight: bold;
  color: #4b5563;
  margin-bottom: 2px;
}

.summary-val {
  font-size: 13px;
  font-weight: bold;
  color: #000;
}

/* 3. جدول البنود والبيانات */
.table-wrapper {
  margin-bottom: 12px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  border: 1.5px solid #000;
  font-size: 11px;
  font-family: Arial, Helvetica, sans-serif;
}

.report-table th,
.report-table td {
  border: 1px solid #000;
  padding: 6px 8px;
  font-family: Arial, Helvetica, sans-serif;
}

.report-table th {
  background-color: #f8f8f8;
  font-weight: bold;
  text-align: left;
}

.col-idx {
  width: 4%;
  text-align: center;
  font-weight: bold;
}

.col-num {
  width: 10%;
  text-align: center;
  font-weight: bold;
}

.col-date {
  width: 10%;
  text-align: center;
  font-weight: bold;
}

.col-payee {
  width: 24%;
  text-align: left;
  font-weight: bold;
}

.col-desc {
  width: 27%;
  text-align: left;
  font-size: 10.5px;
}

.col-method {
  width: 13%;
  text-align: left;
  font-size: 10.5px;
}

.col-amount {
  width: 12%;
  text-align: right;
  font-weight: bold;
}

.empty-state-cell {
  text-align: center;
  padding: 20px;
  font-weight: bold;
  color: #6b7280;
}

.total-row {
  font-weight: bold;
  background-color: #f8f8f8;
}

.total-label {
  text-align: right;
  font-weight: bold;
  font-size: 11px;
}

.total-val {
  font-size: 12px;
  font-weight: bold;
}

/* 4. التوقيعات */
.signatures-section {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 8px;
}

.sig-block {
  width: 30%;
  display: flex;
  flex-direction: column;
}

.sig-label {
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 35px;
  font-family: Arial, Helvetica, sans-serif;
}

.sig-space {
  border-bottom: 1px dotted #555;
  width: 100%;
  height: 1px;
}

/* 5. الفوتر */
.report-footer {
  margin-top: 24px;
  padding-top: 6px;
  border-top: 1px solid #d1d5db;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: #374151;
  font-family: Arial, Helvetica, sans-serif;
}

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
    margin: 0 auto !important;
    max-width: 100% !important;
    width: 100% !important;
    box-shadow: none !important;
    border: none !important;
    background: #fff !important;
  }

  .signatures-section {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
}
</style>
