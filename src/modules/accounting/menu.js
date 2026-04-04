import {
  CalculatorIcon,
  BanknotesIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from '@heroicons/vue/24/outline'

export default {
  name: 'المحاسبة المالية',
  icon: CalculatorIcon,
  permission: 'accounting.view',
  children: [
    // --- 1. العمليات اليومية (الأكثر استخداماً وإدخالاً) ---
    {
      name: 'سندات القبض',
      routeName: 'receipts.index',
      permission: 'receipt.view', // صلاحية منفصلة
      icon: DocumentTextIcon,
    },
    {
      name: 'سندات الصرف',
      routeName: 'payments.index',
      permission: 'payment.view', // صلاحية منفصلة
      icon: DocumentTextIcon,
    },
    {
      name: 'قيود اليومية',
      routeName: 'journal-entries.index',
      permission: 'journal_entry.view',
      icon: DocumentTextIcon,
    },

    // --- 2. التقارير ---
    {
      name: 'كشف حساب (الأستاذ)',
      routeName: 'account-statement.index', // تم توحيد نمط التسمية
      permission: 'report.statement.view', // صلاحية خاصة بالتقارير
      icon: DocumentTextIcon, // يمكنك استخدام ChartBarIcon إذا قمت باستيرادها
    },

    // --- 3. البيانات الأساسية (تُدخل وتُعدل على فترات متباعدة) ---
    {
      name: 'الدليل المحاسبي',
      routeName: 'AccountsList',
      permission: 'account.view',
      icon: TableCellsIcon,
    },
    {
      name: 'مراكز التكلفة (والفروع)',
      routeName: 'CostCentersList',
      permission: 'cost_center.view',
      icon: TableCellsIcon,
    },

    // --- 4. إعدادات النظام المالي (تُدخل مرة واحدة تقريباً) ---
    {
      name: 'الحسابات البنكية',
      routeName: 'BankAccountsList',
      permission: 'bank_account.view',
      icon: BanknotesIcon,
    },
    {
      name: 'الخزائن',
      routeName: 'BoxesList',
      permission: 'box.view',
      icon: BanknotesIcon,
    },
    {
      name: 'العملات',
      routeName: 'CurrenciesList',
      permission: 'currency.view',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'السنوات المالية',
      routeName: 'FiscalYearsList',
      permission: 'fiscal_year.view',
      icon: CalendarDaysIcon, // أدنى القائمة لأنها تُضاف مرة واحدة كل سنة
    },
  ],
}
