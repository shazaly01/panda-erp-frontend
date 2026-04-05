//src\modules\accounting\menu.js
import {
  ClipboardDocumentListIcon,
  ChartPieIcon,
  FolderOpenIcon,
  Cog8ToothIcon,
  DocumentTextIcon,
  TableCellsIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from '@heroicons/vue/24/outline'

export default [
  // --- 1. مجموعة العمليات اليومية ---
  {
    name: 'العمليات المالية',
    icon: ClipboardDocumentListIcon,
    permission: 'accounting.view',
    children: [
      {
        name: 'سندات القبض',
        routeName: 'receipts.index',
        permission: 'receipt.view',
      },
      {
        name: 'سندات الصرف',
        routeName: 'payments.index',
        permission: 'payment.view',
      },
      {
        name: 'قيود اليومية',
        routeName: 'journal-entries.index',
        permission: 'journal_entry.view',
      },
    ],
  },

  // --- 2. مجموعة التقارير ---
  {
    name: 'التقارير المالية',
    icon: ChartPieIcon,
    permission: 'accounting.view',
    children: [
      {
        name: 'كشف حساب',
        routeName: 'account-statement.index',
        permission: 'report.statement.view',
      },
      {
        name: 'ميزان المراجعة',
        routeName: 'trial-balance.index',
        permission: 'report.trial_balance.view',
      },
      {
        name: 'قائمة الدخل',
        routeName: 'income-statement.index',
        permission: 'report.income_statement.view',
      },
      {
        name: 'الميزانية العمومية',
        routeName: 'balance-sheet.index',
        permission: 'report.balance_sheet.view',
      },
    ],
  },

  // --- 3. مجموعة البيانات الأساسية ---
  {
    name: 'البيانات المحاسبية',
    icon: FolderOpenIcon,
    permission: 'accounting.view',
    children: [
      {
        name: 'شجرة الحسابات',
        routeName: 'AccountsList',
        permission: 'account.view',
      },
      {
        name: 'مراكز التكلفة',
        routeName: 'CostCentersList',
        permission: 'cost_center.view',
      },
    ],
  },

  // --- 4. مجموعة إعدادات النظام المالي ---
  {
    name: 'إعدادات النظام المالي',
    icon: Cog8ToothIcon,
    permission: 'accounting.view',
    children: [
      {
        name: 'الحسابات البنكية',
        routeName: 'BankAccountsList',
        permission: 'bank_account.view',
      },
      {
        name: 'الخزائن',
        routeName: 'BoxesList',
        permission: 'box.view',
      },
      {
        name: 'العملات',
        routeName: 'CurrenciesList',
        permission: 'currency.view',
      },
      {
        name: 'السنوات المالية',
        routeName: 'FiscalYearsList',
        permission: 'fiscal_year.view',
      },
    ],
  },
]
