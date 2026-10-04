<!--src/modules/accounting/views/vouchers/components/VoucherPrintModal.vue-->
<template>
  <div
    class="print-page-wrapper bg-gray-100 min-h-screen p-4 sm:p-6 print:p-0 print:bg-white print:min-h-0"
  >
    <!-- شريط إجراءات علوي (يختفي بالكامل أثناء الطباعة) -->
    <div
      class="max-w-[820px] mx-auto mb-4 bg-white border border-gray-200 p-3 sm:p-4 rounded-xl shadow-sm flex items-center justify-between print:hidden"
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

    <!-- ورقة السند الرسمية -->
    <div id="voucher-official-sheet" class="voucher-paper" dir="ltr">
      <!-- 1. الترويسة العليا المتناسقة -->
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

      <!-- رقم السند في مربع مخصص أعلى اليمين محاذي للشعار -->
      <div class="voucher-number-row">
        <div class="voucher-number-badge">
          <span class="number-prefix">{{ voucherPrefix }}</span>
          <span class="number-value">{{ voucherData?.number || '---' }}</span>
        </div>
      </div>

      <!-- 2. بيانات السند الأساسية -->
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

      <!-- 3. جدول بنود السند -->
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
              <td class="col-code">{{ detail.account_code ? '*' + detail.account_code : '' }}</td>
              <td class="col-desc">{{ detail.description || voucherData?.description }}</td>
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
          </tbody>
        </table>
      </div>

      <!-- 4. تفقيط المبلغ بالكلمات الإنجليزية -->
      <div class="words-section">
        <span class="words-title">TOTAL AMOUNT IN WORDS</span>
        <span class="words-content">({{ amountInWords }})</span>
      </div>

      <!-- 5. منطقة التوقيعات والاعتمادات الرسمية -->
      <div class="signatures-section" :class="{ 'four-signers': !isBank, 'three-signers': isBank }">
        <div class="sig-block">
          <span class="sig-label">{{ isBank ? 'Prepared By:' : 'Prepared by:' }}</span>
          <div class="sig-space"></div>
        </div>

        <div v-if="!isBank" class="sig-block">
          <span class="sig-label">Checked by:</span>
          <div class="sig-space"></div>
        </div>

        <div class="sig-block">
          <span class="sig-label">{{ isBank ? 'Approved By:' : 'Approved by:' }}</span>
          <div class="sig-space"></div>
        </div>

        <div class="sig-block">
          <span class="sig-label">{{
            isReceipt ? 'Received By / Cashier:' : isBank ? 'Received By:' : 'Received BY:'
          }}</span>
          <div class="sig-space"></div>
        </div>
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
        window.print()
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
    description: d.description || '',
    amount: Number(d.amount) || 0,
  }))
})

const emptyRowsCount = computed(() => {
  const currentCount = normalizedDetails.value.length
  const minimumRows = 9
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
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

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
.voucher-paper {
  background-color: #ffffff;
  color: #000000;
  font-family: Arial, Helvetica, sans-serif;
  padding: 24px;
  max-width: 820px;
  margin: 0 auto;
  box-sizing: border-box;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

/* الترويسة العليا المتوازنة */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  min-height: 80px;
}

.header-left {
  width: 120px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

.form-code-badge {
  border: 1.5px solid #000;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.company-branding {
  text-align: center;
  flex: 1;
  padding: 0 10px;
}

.company-name {
  font-size: 21px;
  font-weight: 900;
  text-decoration: underline;
  text-underline-offset: 4px;
  margin-bottom: 6px;
  color: #000;
}

.voucher-title {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #000;
}

.header-right {
  width: 120px;
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

.voucher-number-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
}

.voucher-number-badge {
  border: 1.5px solid #000;
  padding: 4px 16px;
  font-weight: 800;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
}

.voucher-meta-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 12px;
  font-weight: bold;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  min-width: 65px;
}

.meta-val {
  font-weight: 600;
}

.table-wrapper {
  margin-bottom: 8px;
}

.voucher-table {
  width: 100%;
  border-collapse: collapse;
  border: 1.5px solid #000;
  font-size: 11px;
}

.voucher-table th,
.voucher-table td {
  border: 1px solid #000;
  padding: 6px 8px;
}

.voucher-table th {
  background-color: #f8f8f8;
  font-weight: bold;
  text-align: left;
}

.col-code {
  width: 16%;
  text-align: left;
  font-family: monospace;
  font-size: 12px;
}

.col-desc {
  width: 59%;
  text-align: left;
}

.col-amount {
  width: 25%;
  text-align: right;
  font-family: monospace;
  font-size: 12px;
  font-weight: bold;
}

.empty-row td {
  height: 22px;
}

.total-row {
  font-weight: bold;
}

.total-label {
  text-align: right;
  font-weight: bold;
  font-size: 12px;
}

.total-val {
  font-size: 13px;
  font-weight: bold;
}

.border-none {
  border-top: none !important;
  border-bottom: none !important;
}

.words-section {
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.signatures-section {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
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
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 40px;
}

.sig-space {
  border-bottom: 1px dotted #555;
  width: 100%;
  height: 1px;
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
    padding: 0 !important;
    margin: 0 auto !important;
    max-width: 100% !important;
    width: 100% !important;
    box-shadow: none !important;
    border: none !important;
    background: #fff !important;
  }
}
</style>
