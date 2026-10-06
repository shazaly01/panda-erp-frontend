<!--src/modules/accounting/views/vouchers/components/VoucherPrintModal.vue-->
<template>
  <div
    class="print-page-wrapper bg-gray-100 min-h-screen p-4 sm:p-6 print:p-0 print:bg-white print:min-h-0"
  >
    <!-- شريط إجراءات علوي (يختفي بالكامل أثناء الطباعة) -->
    <div
      class="max-w-[1100px] mx-auto mb-4 bg-white border border-gray-200 p-3 sm:p-4 rounded-xl shadow-sm flex items-center justify-between print:hidden"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-gray-500">نوع السند:</span>
        <span
          class="px-2.5 py-1 text-xs font-bold rounded-lg border"
          :class="
            isReceipt
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          "
        >
          {{
            isReceipt
              ? isBank
                ? 'سند قبض بنكي'
                : 'سند قبض نقدي'
              : isBank
                ? 'سند صرف بنكي'
                : 'سند صرف نقدي'
          }}
        </span>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="closeWindow"
          class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
        >
          إغلاق النافذة
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
          طباعة السند
        </button>
      </div>
    </div>

    <!-- ورقة السند الرسمية (وضع عرضي) -->
    <div id="voucher-official-sheet" class="voucher-paper" dir="ltr">
      <!-- 1. الترويسة العليا مع كود النموذج أعلى اليسار والشعار أعلى اليمين -->
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
          <div class="voucher-title">
            {{ voucherTitle }}
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

      <!-- 2. بيانات السند الأساسية مع مربعات السند المطابقة لعرض عمود المبلغ -->
      <div class="voucher-info-bar">
        <div class="voucher-meta-info">
          <div class="meta-item">
            <span class="meta-label">DATE:</span>
            <span class="meta-val">{{ formatDate(voucherData?.date) }}</span>
          </div>

          <template v-if="isBank">
            <div class="meta-item">
              <span class="meta-label">BANK:</span>
              <span class="meta-val">{{ bankName }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">CHQ.NO:</span>
              <span class="meta-val">{{ chequeNumber }}</span>
            </div>
          </template>

          <div class="meta-item payee-item">
            <span class="meta-label">{{ payeeLabel }}</span>
            <span class="meta-val">{{ payeeName }}</span>
          </div>
        </div>

        <!-- مربعات المرجع ورقم السند مطابقة لعرض عمود AMOUNT (20%) -->
        <div class="voucher-number-container">
          <div class="voucher-ref-badge">
            <span class="ref-text">{{ voucherPrefix }}: __________________</span>
          </div>
          <div class="voucher-number-badge">
            <span class="number-value">{{ voucherData?.number || '---' }}</span>
          </div>
        </div>
      </div>

      <!-- 3. جدول بنود السند شاملاً سطر الإجمالي وسطر التفقيط بالكلمات -->
      <div class="table-wrapper">
        <table class="voucher-table">
          <thead>
            <tr>
              <th class="col-code">A/C CODE</th>
              <th class="col-desc">DESCRIPTION</th>
              <th class="col-amount">AMOUNT - {{ currencyCode }}</th>
            </tr>
          </thead>
          <tbody>
            <!-- الأسطر المسجلة -->
            <tr v-for="(detail, idx) in normalizedDetails" :key="'item-' + idx">
              <td class="col-code">{{ detail.description || '---' }}</td>
              <td class="col-desc">{{ detail.account_name || '---' }}</td>
              <td class="col-amount">{{ formatAmount(detail.amount) }}</td>
            </tr>

            <!-- أسطر فارغة تكميلية لمطابقة الدفتر الورقي -->
            <tr v-for="emptyIdx in emptyRowsCount" :key="'empty-' + emptyIdx" class="empty-row">
              <td class="col-code">&nbsp;</td>
              <td class="col-desc">&nbsp;</td>
              <td class="col-amount">&nbsp;</td>
            </tr>

            <!-- سطر الإجمالي -->
            <tr class="total-row">
              <td class="col-code border-none">&nbsp;</td>
              <td class="col-desc total-label">Total</td>
              <td class="col-amount total-val">{{ formatAmount(totalAmount) }}</td>
            </tr>

            <!-- سطر تفقيط المبلغ داخل الجدول مباشرة محاطاً بنفس الإطار -->
            <tr class="words-row">
              <td colspan="3" class="words-td">
                <span class="words-title">TOTAL AMOUNT IN WORDS: </span>
                <span class="words-content">{{ amountInWords }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 4. منطقة التوقيعات والاعتمادات الرسمية -->
      <div class="signatures-section" :class="{ 'four-signers': !isBank, 'three-signers': isBank }">
        <div class="sig-block">
          <span class="sig-label">{{ isBank ? 'Prepared By:' : 'Prepared by:' }}</span>
          <div class="sig-space"></div>
          <div class="sig-user-name">{{ preparedByName }}</div>
        </div>

        <div v-if="!isBank" class="sig-block">
          <span class="sig-label">Checked by:</span>
          <div class="sig-space"></div>
          <div class="sig-user-name">&nbsp;</div>
        </div>

        <div class="sig-block">
          <span class="sig-label">{{ isBank ? 'Approved By:' : 'Approved by:' }}</span>
          <div class="sig-space"></div>
          <div class="sig-user-name">&nbsp;</div>
        </div>

        <div class="sig-block">
          <span class="sig-label">{{
            isReceipt ? 'Received By / Cashier:' : isBank ? 'Received By:' : 'Received BY:'
          }}</span>
          <div class="sig-space"></div>
          <div class="sig-user-name">&nbsp;</div>
        </div>
      </div>

      <!-- 5. فوتر السند أسفل الصفحة لعرض رابط السند وتاريخ الطباعة -->
      <div class="voucher-footer">
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
import { useVoucherStore } from '@/modules/accounting/stores/voucherStore'

const props = defineProps({
  voucher: { type: Object, default: () => null },
})

const route = useRoute()
const brandingStore = useBrandingStore()
const voucherStore = useVoucherStore()

const voucherData = ref(props.voucher || null)

const executePrint = () => {
  const originalTitle = document.title
  document.title = ''
  window.print()
  setTimeout(() => {
    document.title = originalTitle
  }, 1000)
}

onMounted(async () => {
  if (!brandingStore.isLoaded && brandingStore.fetchBranding) {
    brandingStore.fetchBranding()
  }

  const voucherId = route.params?.id || props.voucher?.id
  if (voucherId) {
    try {
      await voucherStore.fetchVoucher(voucherId)
      if (voucherStore.currentVoucher) {
        voucherData.value = voucherStore.currentVoucher
      }

      setTimeout(() => {
        executePrint()
      }, 500)
    } catch (error) {
      console.error('فشل جلب بيانات السند للطباعة:', error)
    }
  }
})

const isReceipt = computed(() => {
  return voucherData.value?.type === 'receipt'
})

const isBank = computed(() => {
  const v = voucherData.value
  if (!v) return false
  if (v.payment_method?.type === 'bank') return true
  if (v.bank_account_id) return true
  return false
})

const formCode = computed(() => {
  if (isReceipt.value) {
    return isBank.value ? 'F.F 04' : 'F.F 03'
  }
  return isBank.value ? 'F.F 02' : 'F.F 01'
})

const voucherPrefix = computed(() => {
  if (isReceipt.value) {
    return isBank.value ? 'BRV#' : 'CRV#'
  }
  return isBank.value ? 'BPV#' : 'PCV#'
})

const voucherTitle = computed(() => {
  if (isReceipt.value) {
    return isBank.value ? 'BANK RECEIPT VOUCHER' : 'CASH RECEIPT VOUCHER'
  }
  return isBank.value ? 'BANK PAYMENT VOUCHER' : 'PETTY CASH VOUCHER'
})

const payeeLabel = computed(() => {
  return isReceipt.value ? 'RECEIVED FROM:' : 'PAYEE:'
})

const payeeName = computed(() => {
  return voucherData.value?.payee_name || voucherData.value?.received_from || '---'
})

const currencyCode = computed(() => {
  return voucherData.value?.currency?.code || 'SDG'
})

const bankName = computed(() => {
  if (!isBank.value) return ''
  return (
    voucherData.value?.payment_method?.name || voucherData.value?.bank_account?.bank_name || 'NBADS'
  )
})

const chequeNumber = computed(() => {
  return (
    voucherData.value?.bank_ref_number ||
    voucherData.value?.payment_method?.bank_ref_number ||
    voucherData.value?.cheque_number ||
    voucherData.value?.reference_number ||
    '---'
  )
})

const totalAmount = computed(() => {
  const v = voucherData.value
  if (!v) return 0
  if (v.amount) return Number(v.amount)
  if (Array.isArray(v.details)) {
    return v.details.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
  }
  return 0
})

const normalizedDetails = computed(() => {
  const details = voucherData.value?.details
  if (!details || !Array.isArray(details)) return []
  return details.map((d) => ({
    account_code: d.account?.code || d.account_code || '',
    account_name: d.account?.name || d.account?.full_name || '',
    description: d.description || '',
    amount: Number(d.amount) || 0,
  }))
})

// إظهار اسم منشئ السند
const preparedByName = computed(() => {
  return voucherData.value?.creator?.username || voucherData.value?.creator?.full_name || ''
})

const currentUrl = computed(() => {
  return typeof window !== 'undefined' ? window.location.href : ''
})

const currentPrintDate = computed(() => {
  const now = new Date()
  return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
})

const emptyRowsCount = computed(() => {
  const currentCount = normalizedDetails.value.length
  const minimumRows = 7
  return currentCount < minimumRows ? minimumRows - currentCount : 0
})

const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
]
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function convertBelowThousand(num) {
  let result = ''
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred '
    num %= 100
  }
  if (num > 0) {
    if (num < 20) {
      result += ones[num] + ' '
    } else {
      const ten = tens[Math.floor(num / 10)]
      const one = ones[num % 10]
      result += ten + (one ? ' ' + one : '') + ' '
    }
  }
  return result.trim()
}

function numberToWords(amount, code = 'SDG') {
  const num = Number(amount)
  if (isNaN(num) || num === 0) return `${code} Zero only`

  const [intStr, decStr] = num.toFixed(2).split('.')
  let intPart = parseInt(intStr, 10)
  const decPart = parseInt(decStr, 10)

  const scales = [
    { value: 1000000000, label: 'Billion' },
    { value: 1000000, label: 'Million' },
    { value: 1000, label: 'Thousand' },
  ]

  let words = ''
  for (const scale of scales) {
    if (intPart >= scale.value) {
      const count = Math.floor(intPart / scale.value)
      words += convertBelowThousand(count) + ' ' + scale.label + ' '
      intPart %= scale.value
    }
  }

  if (intPart > 0) words += convertBelowThousand(intPart) + ' '
  words = words.trim()

  if (decPart > 0) words += ` and ${decPart}/100`
  return `${code} ${words} only`
}

const amountInWords = computed(() => {
  return numberToWords(totalAmount.value, currencyCode.value)
})

const formatAmount = (num) => {
  if (!num && num !== 0) return ''
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

const triggerPrint = () => {
  executePrint()
}

const closeWindow = () => {
  window.close()
}
</script>

<style>
/* فرض إزالة هوامش ترويسة وتذييل المتصفح التلقائية بشكل قطعي */
@page {
  size: A4 landscape;
  margin: 0 !important;
}

@media print {
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
.voucher-paper {
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

/* الترويسة العليا */
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

.voucher-title {
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

/* شريط معلومات السند */
.voucher-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 12px;
}

.voucher-meta-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
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
  font-weight: bold;
}

.meta-val {
  font-weight: bold;
}

/* حاوية مربعات رقم السند والمرجع - مساوية تماماً لعمود AMOUNT (20%) */
.voucher-number-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  width: 20%;
  box-sizing: border-box;
}

.voucher-ref-badge,
.voucher-number-badge {
  border: 1.5px solid #000;
  padding: 5px 8px;
  font-weight: bold;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
  width: 100%;
  min-width: 0;
  font-family: Arial, Helvetica, sans-serif;
  box-sizing: border-box;
  text-align: center;
}

.voucher-table {
  width: 100%;
  border-collapse: collapse;
  border: 1.5px solid #000;
  font-size: 11px;
  font-family: Arial, Helvetica, sans-serif;
}

.voucher-table th,
.voucher-table td {
  border: 1px solid #000;
  padding: 6px 8px;
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
}

.voucher-table th {
  background-color: #f8f8f8;
  font-weight: bold;
  text-align: center;
}

.col-code {
  width: 24%;
  text-align: center;
  font-weight: bold;
  font-size: 11px;
}

.col-desc {
  width: 56%;
  text-align: center;
  font-weight: bold;
  font-size: 11px;
}

.col-amount {
  width: 20%;
  text-align: center;
  font-weight: bold;
  font-size: 11px;
}

.empty-row td {
  height: 22px;
}

.total-row {
  font-weight: bold;
}

.total-label {
  text-align: center;
  font-weight: bold;
  font-size: 11px;
}

.total-val {
  font-size: 12px;
  font-weight: bold;
  text-align: center;
}

.border-none {
  border-top: none !important;
  border-bottom: none !important;
}

/* تنسيق سطر تفقيط المبلغ المدمج داخل شبكة الجدول */
.words-td {
  text-align: left !important;
  padding: 6px 8px;
  font-weight: bold;
  font-size: 11px;
  font-family: Arial, Helvetica, sans-serif;
  border: 1px solid #000;
}

.words-title {
  font-weight: bold;
  margin-right: 4px;
}

.words-content {
  font-weight: bold;
}

/* منطقة التوقيعات */
.signatures-section {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 10px;
}

.three-signers .sig-block {
  width: 28%;
}

.four-signers .sig-block {
  width: 22%;
}

.sig-block {
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

.sig-user-name {
  font-size: 11px;
  font-weight: bold;
  min-height: 18px;
  margin-top: 4px;
  text-align: center;
  padding-left: 2px;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
}

/* الفوتر أسفل الصفحة */
.voucher-footer {
  margin-top: 36px;
  padding-top: 8px;
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

  .voucher-paper {
    padding: 8mm 10mm !important;
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

  .voucher-footer {
    position: relative;
    bottom: 0;
  }
}
</style>
