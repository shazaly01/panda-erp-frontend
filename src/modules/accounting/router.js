//src\modules\accounting\router.js
// --- استيراد شاشات المحاسبة (Lazy Loading) ---
// تأكد أن المسارات هنا تطابق تماماً أسماء المجلدات التي أنشأتها على جهازك
const AccountsList = () => import('./views/accounts/AccountsList.vue')
const CostCentersList = () => import('./views/cost-centers/CostCentersList.vue')
const BoxesList = () => import('./views/boxes/BoxesList.vue')
const BankAccountsList = () => import('./views/bank-accounts/BankAccountsList.vue')
const CurrenciesList = () => import('./views/currencies/CurrenciesList.vue')
const FiscalYearsList = () => import('./views/fiscal-years/FiscalYearsList.vue')

// --- استيراد شاشات السندات ---
const VouchersList = () => import('./views/vouchers/VouchersList.vue')
const VoucherFormPage = () => import('./views/vouchers/VoucherFormPage.vue')

// --- استيراد شاشات القيود اليومية ---
const JournalEntriesList = () => import('./views/journal-entries/JournalEntriesList.vue')
const JournalEntryFormPage = () => import('./views/journal-entries/JournalEntryFormPage.vue')

// --- استيراد شاشات التقارير ---
const AccountStatement = () => import('./views/reports/AccountStatement.vue')
const TrialBalance = () => import('./views/reports/TrialBalance.vue')
const IncomeStatement = () => import('./views/reports/IncomeStatement.vue')
const BalanceSheet = () => import('./views/reports/BalanceSheet.vue')

export default [
  {
    path: 'accounting',
    children: [
      {
        path: 'accounts',
        name: 'AccountsList',
        component: AccountsList,
        meta: { permission: 'account.view' },
      },
      {
        path: 'cost-centers',
        name: 'CostCentersList',
        component: CostCentersList,
        meta: { permission: 'cost_center.view' },
      },
      {
        path: 'boxes',
        name: 'BoxesList',
        component: BoxesList,
        meta: { permission: 'box.view' },
      },
      {
        path: 'bank-accounts',
        name: 'BankAccountsList',
        component: BankAccountsList,
        meta: { permission: 'bank_account.view' },
      },
      {
        path: 'currencies',
        name: 'CurrenciesList',
        component: CurrenciesList,
        meta: { permission: 'currency.view' },
      },
      {
        path: 'fiscal-years',
        name: 'FiscalYearsList',
        component: FiscalYearsList,
        meta: { permission: 'fiscal_year.view' },
      },

      // ==========================================
      // مسارات التقارير (Reports)
      // ==========================================
      {
        path: 'reports/account-statement',
        name: 'account-statement.index',
        component: AccountStatement,
        meta: { permission: 'report.statement.view' },
        // ملاحظة: لن نستخدم props هنا، لأن الشاشة ستقرأ الفلاتر مباشرة من route.query
      },

      {
        path: 'reports/trial-balance',
        name: 'trial-balance.index',
        component: TrialBalance,
        meta: { permission: 'report.trial_balance.view' },
      },
      {
        path: 'reports/income-statement',
        name: 'income-statement.index',
        component: IncomeStatement,
        meta: { permission: 'report.income_statement.view' },
      },

      {
        path: 'reports/balance-sheet',
        name: 'balance-sheet.index',
        component: BalanceSheet,
        meta: { permission: 'report.balance_sheet.view' },
      },
      // ==========================================
      // مسارات سندات القبض (Receipts)
      // ==========================================
      {
        path: 'receipts',
        name: 'receipts.index',
        component: VouchersList,
        props: { type: 'receipt' }, // إرسال النوع للشاشة
        meta: { permission: 'receipt.view' },
      },
      {
        path: 'receipts/create',
        name: 'receipts.create',
        component: VoucherFormPage,
        props: { type: 'receipt' },
        meta: { permission: 'receipt.create' },
      },
      {
        path: 'receipts/:id/edit',
        name: 'receipts.edit',
        component: VoucherFormPage,
        props: { type: 'receipt' },
        meta: { permission: 'receipt.update' },
      },

      // ==========================================
      // مسارات سندات الصرف (Payments)
      // ==========================================
      {
        path: 'payments',
        name: 'payments.index',
        component: VouchersList,
        props: { type: 'payment' }, // إرسال النوع للشاشة
        meta: { permission: 'payment.view' },
      },
      {
        path: 'payments/create',
        name: 'payments.create',
        component: VoucherFormPage,
        props: { type: 'payment' },
        meta: { permission: 'payment.create' },
      },
      {
        path: 'payments/:id/edit',
        name: 'payments.edit',
        component: VoucherFormPage,
        props: { type: 'payment' },
        meta: { permission: 'payment.update' },
      },

      // ==========================================
      // مسارات القيود اليومية (عرض، إضافة، تعديل)
      // ==========================================
      {
        path: 'journal-entries',
        name: 'journal-entries.index',
        component: JournalEntriesList,
        meta: { permission: 'journal_entry.view' },
      },
      {
        path: 'journal-entries/create',
        name: 'journal-entries.create',
        component: JournalEntryFormPage,
        meta: { permission: 'journal_entry.create' },
      },
      {
        path: 'journal-entries/:id/edit',
        name: 'journal-entries.edit',
        component: JournalEntryFormPage,
        meta: { permission: 'journal_entry.update' },
      },
    ],
  },
]
