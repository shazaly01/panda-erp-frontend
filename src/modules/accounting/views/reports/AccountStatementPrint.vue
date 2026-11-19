<!-- src/modules/accounting/views/reports/AccountStatementPrint.vue -->
<template>
  <div
    class="print-page-wrapper min-h-screen bg-slate-100 text-slate-900 py-6 px-4 font-sans print:bg-white print:p-0 print:min-h-0"
    :dir="currentDir"
  >
    <!-- شريط التحكم العلوي (يختفي تماماً عند الطباعة) -->
    <div
      class="print:hidden max-w-[210mm] mx-auto mb-5 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm flex flex-wrap justify-between items-center gap-3"
    >
      <div class="flex items-center gap-2 text-xs text-slate-600">
        <span class="inline-block w-2 h-2 rounded-full bg-blue-700"></span>
        <span>{{ t.printHint }}</span>
      </div>

      <div class="flex items-center gap-3">
        <!-- أزرار تبديل اللغة مع الحفظ التلقائي في المتصفح -->
        <div
          class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200"
          role="group"
          :aria-label="t.languageLabel"
        >
          <button
            type="button"
            @click="setLanguage('ar')"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            :class="
              lang === 'ar'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            "
          >
            العربية
          </button>
          <button
            type="button"
            @click="setLanguage('en')"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all font-mono"
            :class="
              lang === 'en'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            "
          >
            English
          </button>
        </div>

        <!-- زر الطباعة -->
        <button
          v-if="hasData"
          type="button"
          @click="printReport"
          class="bg-gradient-to-r from-blue-700 to-indigo-900 hover:from-blue-800 hover:to-indigo-950 text-white font-bold py-2 px-5 rounded-xl flex items-center gap-2 transition-all text-xs shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h6z"
            />
          </svg>
          <span>{{ t.printBtn }}</span>
        </button>
      </div>
    </div>

    <!-- حالة عدم وجود بيانات مخزنة (مثلاً عند فتح الرابط مباشرة) -->
    <div
      v-if="!hasData"
      class="max-w-[210mm] mx-auto bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm print:hidden"
    >
      <div
        class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center"
      >
        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 class="text-base font-black text-slate-900 mb-1">{{ t.noDataTitle }}</h2>
      <p class="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
        {{ t.noDataDesc }}
      </p>
      <button
        type="button"
        @click="goBackToStatement"
        class="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
      >
        {{ t.backBtn }}
      </button>
    </div>

    <!-- ورقة التقرير الرسمية بمقاس A4 طولي -->
    <div
      v-else
      class="a4-sheet max-w-[210mm] mx-auto bg-white border border-slate-200 shadow-xl rounded-xl p-7 print:max-w-none print:w-full print:border-none print:shadow-none print:rounded-none print:p-0"
    >
      <!-- 1. الترويسة الرسمية -->
      <header
        class="artistic-header-banner bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 rounded-xl mb-4 flex justify-between items-center gap-4 border border-slate-800"
      >
        <!-- بيانات المؤسسة والشعار -->
        <div class="flex items-center gap-3">
          <div
            class="logo-holder w-14 h-14 bg-white rounded-xl border border-white/20 flex-shrink-0 flex items-center justify-center p-1 shadow-sm"
          >
            <img
              :src="brandingStore.logoMiniUrl || brandingStore.logoFullUrl || '/MainLogo2.png'"
              :alt="brandingStore.appName"
              class="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 class="header-title text-base font-black tracking-tight text-white leading-snug">
              {{ brandingStore.appName || 'Panda ERP' }}
            </h1>
            <p class="header-subtitle text-[10px] text-blue-200/80 mt-0.5">
              {{ t.systemSubtitle }}
            </p>
          </div>
        </div>

        <!-- عنوان المستند في المنتصف -->
        <div class="header-center-divider text-center px-4 border-x border-white/15">
          <h2 class="header-doc-title text-base font-black text-white tracking-tight">
            {{ t.docTitle }}
          </h2>
          <p class="header-doc-desc text-[10px] text-blue-200/80 mt-0.5">
            {{ t.docSubtitle }}
          </p>
        </div>

        <!-- بيانات النطاق وتاريخ الطباعة -->
        <div class="flex flex-col gap-1 items-end text-[10px] whitespace-nowrap">
          <div
            class="filter-badge flex items-center gap-1.5 bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-md"
          >
            <span class="badge-label text-blue-200">{{ t.periodLabel }}</span>
            <span class="badge-value font-mono font-bold text-amber-300" dir="ltr">
              {{ filters.from_date }} → {{ filters.to_date }}
            </span>
          </div>

          <div
            class="filter-badge flex items-center gap-1.5 bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-md"
          >
            <span class="badge-label text-blue-200">{{ t.statusLabel }}</span>
            <span class="badge-value font-bold text-white">
              {{ filters.include_drafts ? t.draftsIncluded : t.postedOnly }}
            </span>
          </div>

          <div
            class="export-time-badge flex items-center gap-1.5 bg-slate-950/40 border border-white/10 px-2 py-0.5 rounded text-[9px] text-slate-300"
          >
            <span>{{ t.exportDateLabel }}</span>
            <span class="font-mono font-bold text-white" dir="ltr">{{ printedAt }}</span>
          </div>
        </div>
      </header>

      <!-- 2. بطاقة تعريف الحساب المالي -->
      <section
        class="account-info-box bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 mb-3.5 flex flex-wrap items-center justify-between gap-4"
      >
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-bold text-slate-500">{{ t.accountLabel }}</span>
          <span class="text-sm font-black text-slate-900">{{ account?.name }}</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[11px] font-bold text-slate-500">{{ t.accountCodeLabel }}</span>
          <span
            class="text-xs font-mono font-black text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded"
            dir="ltr"
          >
            {{ account?.code }}
          </span>
        </div>
      </section>

      <!-- 3. ملخص الأرصدة (4 بطاقات مضغوطة) -->
      <section class="grid grid-cols-4 gap-2.5 mb-4">
        <div class="summary-box border border-slate-300 rounded-lg p-2.5 bg-slate-50/70">
          <div class="text-[10px] font-bold text-slate-500 mb-0.5">{{ t.openingBalance }}</div>
          <div class="text-xs font-mono font-black text-slate-900 tabular-nums" dir="ltr">
            {{ formatNumber(reportData.summary?.opening_balance) }}
          </div>
        </div>

        <div class="summary-box border border-slate-300 rounded-lg p-2.5 bg-emerald-50/30">
          <div class="text-[10px] font-bold text-slate-500 mb-0.5">{{ t.totalDebit }}</div>
          <div class="text-xs font-mono font-black text-emerald-800 tabular-nums" dir="ltr">
            {{ formatNumber(reportData.summary?.total_debit) }}
          </div>
        </div>

        <div class="summary-box border border-slate-300 rounded-lg p-2.5 bg-rose-50/30">
          <div class="text-[10px] font-bold text-slate-500 mb-0.5">{{ t.totalCredit }}</div>
          <div class="text-xs font-mono font-black text-rose-800 tabular-nums" dir="ltr">
            {{ formatNumber(reportData.summary?.total_credit) }}
          </div>
        </div>

        <div
          class="summary-box closing-box border-2 border-slate-900 rounded-lg p-2.5 bg-slate-900 text-white"
        >
          <div class="closing-label text-[10px] font-bold text-slate-300 mb-0.5">
            {{ t.closingBalance }}
          </div>
          <div class="closing-value text-xs font-mono font-black text-white tabular-nums" dir="ltr">
            {{ formatNumber(reportData.summary?.closing_balance) }}
          </div>
        </div>
      </section>

      <!-- 4. جدول الحركات التفصيلية -->
      <section class="mb-5 rounded-lg overflow-hidden border border-slate-300">
        <table class="w-full border-collapse text-[11px] print-table">
          <thead>
            <tr class="table-head-row bg-slate-900 text-white font-bold text-[10px]">
              <th class="py-2 px-2 text-start border-e border-slate-700 w-20 whitespace-nowrap">
                {{ t.colDate }}
              </th>
              <th class="py-2 px-2 text-start border-e border-slate-700 w-24 whitespace-nowrap">
                {{ t.colEntryNo }}
              </th>
              <th class="py-2 px-2 text-start border-e border-slate-700">
                {{ t.colDescription }}
              </th>
              <th class="py-2 px-2 text-end border-e border-slate-700 w-24 whitespace-nowrap">
                {{ t.colDebit }}
              </th>
              <th class="py-2 px-2 text-end border-e border-slate-700 w-24 whitespace-nowrap">
                {{ t.colCredit }}
              </th>
              <th class="py-2 px-2 text-end w-28 whitespace-nowrap">
                {{ t.colBalance }}
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <!-- صف رصيد أول المدة -->
            <tr class="bg-slate-100/80 font-bold text-slate-700 italic">
              <td colspan="3" class="py-1.5 px-2 text-start border-e border-slate-200">
                {{ t.openingRowText }}
              </td>
              <td colspan="2" class="py-1.5 px-2 border-e border-slate-200"></td>
              <td
                class="py-1.5 px-2 text-end font-mono font-black text-slate-900 tabular-nums"
                dir="ltr"
              >
                {{ formatNumber(reportData.summary?.opening_balance) }}
              </td>
            </tr>

            <!-- صفوف الحركات -->
            <tr
              v-for="(tx, idx) in reportData.transactions"
              :key="idx"
              class="odd:bg-white even:bg-slate-50/40 break-inside-avoid"
              :class="{ 'opacity-80': tx.status === 'draft' }"
            >
              <td
                class="py-1.5 px-2 text-start font-mono text-[10px] text-slate-600 border-e border-slate-200 whitespace-nowrap"
                dir="ltr"
              >
                {{ tx.date }}
              </td>

              <td
                class="py-1.5 px-2 text-start font-mono font-bold text-slate-800 border-e border-slate-200 whitespace-nowrap"
              >
                <div class="flex items-center gap-1">
                  <span dir="ltr">#{{ tx.entry_number }}</span>
                  <span
                    v-if="tx.status === 'draft'"
                    class="text-[8.5px] font-sans font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1 rounded"
                  >
                    {{ t.draftBadge }}
                  </span>
                </div>
              </td>

              <td class="py-1.5 px-2 text-start text-slate-900 border-e border-slate-200">
                {{ tx.description || '-' }}
              </td>

              <td
                class="py-1.5 px-2 text-end font-mono font-bold text-emerald-800 border-e border-slate-200 tabular-nums whitespace-nowrap"
                dir="ltr"
              >
                {{ Number(tx.debit) > 0 ? formatNumber(tx.debit) : '-' }}
              </td>

              <td
                class="py-1.5 px-2 text-end font-mono font-bold text-rose-800 border-e border-slate-200 tabular-nums whitespace-nowrap"
                dir="ltr"
              >
                {{ Number(tx.credit) > 0 ? formatNumber(tx.credit) : '-' }}
              </td>

              <td
                class="py-1.5 px-2 text-end font-mono font-black text-slate-900 bg-slate-50/80 tabular-nums whitespace-nowrap"
                dir="ltr"
              >
                {{ formatNumber(tx.balance) }}
              </td>
            </tr>

            <!-- في حال عدم وجود حركات -->
            <tr v-if="!reportData.transactions || reportData.transactions.length === 0">
              <td colspan="6" class="py-6 text-center text-slate-400 font-medium">
                {{ t.noTransactions }}
              </td>
            </tr>
          </tbody>

          <!-- تذييل الإجماليات والرصيد الختامي -->
          <tfoot>
            <tr class="bg-slate-100 border-t-2 border-slate-400 font-black text-slate-900">
              <td colspan="3" class="py-2 px-2 text-start border-e border-slate-300">
                {{ t.totalsRowText }}
              </td>
              <td
                class="py-2 px-2 text-end font-mono text-emerald-900 border-e border-slate-300 tabular-nums whitespace-nowrap"
                dir="ltr"
              >
                {{ formatNumber(reportData.summary?.total_debit) }}
              </td>
              <td
                class="py-2 px-2 text-end font-mono text-rose-900 border-e border-slate-300 tabular-nums whitespace-nowrap"
                dir="ltr"
              >
                {{ formatNumber(reportData.summary?.total_credit) }}
              </td>
              <td
                class="py-2 px-2 text-end font-mono text-slate-950 bg-slate-200/70 tabular-nums whitespace-nowrap"
                dir="ltr"
              >
                {{ formatNumber(reportData.summary?.closing_balance) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <!-- 5. التوقيعات والاعتمادات الثلاثية -->
      <footer
        class="mt-8 pt-4 border-t border-slate-300 grid grid-cols-3 gap-6 text-center break-inside-avoid"
      >
        <div class="space-y-7">
          <p class="font-bold text-slate-800 text-[11px]">{{ t.sigPrepared }}</p>
          <div class="space-y-1 text-[10px] text-slate-400">
            <div class="border-b border-slate-400 w-36 mx-auto"></div>
            <p>{{ t.sigLine }}</p>
          </div>
        </div>

        <div class="space-y-7">
          <p class="font-bold text-slate-800 text-[11px]">{{ t.sigReviewed }}</p>
          <div class="space-y-1 text-[10px] text-slate-400">
            <div class="border-b border-slate-400 w-36 mx-auto"></div>
            <p>{{ t.sigLine }}</p>
          </div>
        </div>

        <div class="space-y-7">
          <p class="font-bold text-slate-800 text-[11px]">{{ t.sigApproved }}</p>
          <div class="space-y-1 text-[10px] text-slate-400">
            <div class="border-b border-slate-400 w-36 mx-auto"></div>
            <p>{{ t.sigLine }}</p>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBrandingStore } from '@/stores/brandingStore'

const STORAGE_LANG_KEY = 'panda_account_statement_print_lang'
const SESSION_DATA_KEY = 'printAccountStatementPayload'

const router = useRouter()
const brandingStore = useBrandingStore()

// اللغة المحفوظة في المتصفح (الافتراضي العربية)
const savedLang = localStorage.getItem(STORAGE_LANG_KEY)
const lang = ref(savedLang === 'en' ? 'en' : 'ar')

const setLanguage = (newLang) => {
  lang.value = newLang
  localStorage.setItem(STORAGE_LANG_KEY, newLang)
}

const currentDir = computed(() => (lang.value === 'ar' ? 'rtl' : 'ltr'))

// قاموس التسميات الثابتة للغتين العربية والإنجليزية
const dictionary = {
  ar: {
    printHint: 'معاينة الطباعة: تم تنسيق الكشف بمقاس A4 طولي موفر للحبر.',
    languageLabel: 'لغة التقرير',
    printBtn: 'طباعة التقرير',
    backBtn: 'العودة إلى كشف الحساب',
    noDataTitle: 'لا توجد بيانات كشف حساب جاهزة للطباعة',
    noDataDesc:
      'يرجى فتح شاشة كشف الحساب، تحديد الحساب المالي وعرض التقرير أولاً ثم الضغط على زر طباعة التقرير.',
    systemSubtitle: 'نظام الإدارة المالية والمحاسبة العامة',
    docTitle: 'كشف حساب تفصيلي',
    docSubtitle: 'حركات الأستاذ العام والأرصدة التراكمية',
    periodLabel: 'الفترة:',
    statusLabel: 'الحالة:',
    draftsIncluded: 'شامل المسودات',
    postedOnly: 'القيود المرحلة فقط',
    exportDateLabel: 'تاريخ الطباعة:',
    accountLabel: 'اسم الحساب:',
    accountCodeLabel: 'رقم الحساب:',
    openingBalance: 'الرصيد الافتتاحي',
    totalDebit: 'إجمالي المدين',
    totalCredit: 'إجمالي الدائن',
    closingBalance: 'الرصيد الختامي',
    colDate: 'التاريخ',
    colEntryNo: 'رقم القيد',
    colDescription: 'البيان والشرح',
    colDebit: 'مدين',
    colCredit: 'دائن',
    colBalance: 'الرصيد',
    openingRowText: 'رصيد أول المدة',
    totalsRowText: 'الإجمالي والرصيد الختامي',
    draftBadge: 'مسودة',
    noTransactions: 'لا توجد حركات مالية مسجلة خلال الفترة المحددة.',
    sigPrepared: 'إعداد (المحاسب)',
    sigReviewed: 'مراجعة (رئيس الحسابات)',
    sigApproved: 'اعتماد (المدير المالي)',
    sigLine: 'التوقيع: ........................',
  },
  en: {
    printHint: 'Print Preview: Formatted for ink-saving A4 Portrait layout.',
    languageLabel: 'Report Language',
    printBtn: 'Print Statement',
    backBtn: 'Back to Account Statement',
    noDataTitle: 'No Account Statement Data Available',
    noDataDesc:
      'Please open the Account Statement screen, select a financial account, load the report, and then click Print.',
    systemSubtitle: 'Financial Management & General Ledger System',
    docTitle: 'Detailed Account Statement',
    docSubtitle: 'General Ledger Transactions & Running Balances',
    periodLabel: 'Period:',
    statusLabel: 'Status:',
    draftsIncluded: 'Includes Drafts',
    postedOnly: 'Posted Entries Only',
    exportDateLabel: 'Printed On:',
    accountLabel: 'Account Name:',
    accountCodeLabel: 'Account Code:',
    openingBalance: 'Opening Balance',
    totalDebit: 'Total Debit',
    totalCredit: 'Total Credit',
    closingBalance: 'Closing Balance',
    colDate: 'Date',
    colEntryNo: 'Entry #',
    colDescription: 'Description',
    colDebit: 'Debit',
    colCredit: 'Credit',
    colBalance: 'Balance',
    openingRowText: 'Opening Balance',
    totalsRowText: 'Totals & Closing Balance',
    draftBadge: 'Draft',
    noTransactions: 'No financial transactions recorded during the selected period.',
    sigPrepared: 'Prepared By',
    sigReviewed: 'Reviewed By',
    sigApproved: 'Approved By',
    sigLine: 'Signature: ........................',
  },
}

const t = computed(() => dictionary[lang.value])

// بيانات التقرير المستلمة من شاشة كشف الحساب
const account = ref(null)
const filters = ref({
  from_date: '',
  to_date: '',
  include_drafts: false,
})
const reportData = ref(null)

const hasData = computed(() => Boolean(account.value && reportData.value))

const printedAt = computed(() => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
})

// تنسيق الأرقام مع إخفاء أصفار الكسور إذا كان الرقم صحيحاً
const formatNumber = (num) => {
  const rounded = Number(Number(num || 0).toFixed(2))
  const isWhole = Number.isInteger(rounded)
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

const printReport = () => {
  window.print()
}

const goBackToStatement = () => {
  router.push({ name: 'account-statement.index' })
}

onMounted(async () => {
  if (!brandingStore.isLoaded) {
    await brandingStore.fetchBranding()
  }

  const rawPayload = sessionStorage.getItem(SESSION_DATA_KEY)
  if (rawPayload) {
    try {
      const parsed = JSON.parse(rawPayload)
      account.value = parsed.account || null
      filters.value = {
        from_date: parsed.filters?.from_date || '',
        to_date: parsed.filters?.to_date || '',
        include_drafts: Boolean(parsed.filters?.include_drafts),
      }
      reportData.value = parsed.reportData || null
    } catch (err) {
      console.error('فشل قراءة بيانات كشف الحساب للطباعة:', err)
    }
  }
})
</script>

<style scoped>
@media print {
  @page {
    size: A4 portrait;
    margin: 10mm 8mm 10mm 8mm;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  :global(html),
  :global(body),
  :global(#app) {
    background: #ffffff !important;
    color: #000000 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* تحويل الترويسة الداكنة إلى ترويسة رسمية بيضاء موفرة للحبر */
  .artistic-header-banner {
    background: #ffffff !important;
    color: #0f172a !important;
    border: 1.5px solid #94a3b8 !important;
    border-top: 4px solid #1e3a8a !important;
    padding: 8px 12px !important;
    margin-bottom: 10px !important;
  }

  .logo-holder {
    border: 1px solid #cbd5e1 !important;
    box-shadow: none !important;
    width: 44px !important;
    height: 44px !important;
  }

  .header-title,
  .header-doc-title {
    color: #0f172a !important;
  }

  .header-subtitle,
  .header-doc-desc {
    color: #475569 !important;
  }

  .header-center-divider {
    border-color: #cbd5e1 !important;
  }

  .filter-badge,
  .export-time-badge {
    background: #f8fafc !important;
    border: 1px solid #cbd5e1 !important;
    color: #0f172a !important;
  }

  .filter-badge .badge-label {
    color: #475569 !important;
  }

  .filter-badge .badge-value {
    color: #1e3a8a !important;
  }

  .export-time-badge span {
    color: #0f172a !important;
  }

  /* تحويل بطاقة الرصيد الختامي إلى إطار رسمي موفر للحبر */
  .closing-box {
    background: #f1f5f9 !important;
    color: #0f172a !important;
    border: 1.5px solid #0f172a !important;
  }

  .closing-label {
    color: #334155 !important;
  }

  .closing-value {
    color: #0f172a !important;
  }

  /* تنسيق جدول الطباعة المضغوط */
  .table-head-row {
    background: #f1f5f9 !important;
    color: #0f172a !important;
  }

  .print-table th {
    background: #f1f5f9 !important;
    color: #0f172a !important;
    border: 1px solid #94a3b8 !important;
    padding: 4px 5px !important;
    font-size: 9.5px !important;
  }

  .print-table td {
    border: 1px solid #cbd5e1 !important;
    padding: 3px 5px !important;
    font-size: 9.5px !important;
    line-height: 1.2 !important;
  }

  .print-table tfoot td {
    background: #f1f5f9 !important;
    border: 1px solid #94a3b8 !important;
    color: #0f172a !important;
  }
}

table {
  border-spacing: 0;
  width: 100%;
}

tr {
  break-inside: avoid;
  page-break-inside: avoid;
}

.break-inside-avoid {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
