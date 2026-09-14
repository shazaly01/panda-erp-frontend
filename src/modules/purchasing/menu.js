import {
  ShoppingCartIcon,
  ClipboardDocumentCheckIcon,
  DocumentCheckIcon,
  TruckIcon,
  ArrowUturnLeftIcon,
  ChartPieIcon,
  UserGroupIcon,
  Cog8ToothIcon,
} from '@heroicons/vue/24/outline'

export default [
  // --- 1. العمليات اليومية وإدارة التوريد والصرف ---
  {
    name: 'عمليات المشتريات',
    icon: ShoppingCartIcon,
    permission: 'purchasing.bills.view',
    children: [
      {
        name: 'طلبات الشراء الداخلية',
        routeName: 'purchasing.requisitions.index',
        permission: 'purchasing.requisitions.view',
      },
      {
        name: 'أذونات الصرف المخزني',
        routeName: 'purchasing.issues.index',
        permission: 'purchasing.issues.view',
      },
      {
        name: 'أوامر الشراء والتوريد',
        routeName: 'purchasing.orders.index',
        permission: 'purchasing.orders.view',
      },
      {
        name: 'سندات الاستلام المخزني',
        routeName: 'purchasing.receipts.index',
        permission: 'purchasing.receipts.view',
      },
      {
        name: 'فواتير الشراء المباشر',
        routeName: 'purchasing.bills.index',
        permission: 'purchasing.bills.view',
      },
      /*
      {
        name: 'مردودات المشتريات',
        routeName: 'purchasing.returns.index',
        permission: 'purchasing.returns.view',
      },
      */
    ],
  },

  /*
  // --- 2. تقارير المشتريات والموردين ---
  {
    name: 'تقارير المشتريات',
    icon: ChartPieIcon,
    permission: 'purchasing.bills.view',
    children: [
      {
        name: 'سجل فواتير المشتريات',
        routeName: 'purchasing.reports.bills',
        permission: 'purchasing.bills.view',
      },
      {
        name: 'تقرير مشتريات الأصناف',
        routeName: 'purchasing.reports.items',
        permission: 'purchasing.bills.view',
      },
      {
        name: 'كشف مطابقة استلام وفواتير',
        routeName: 'purchasing.reports.matching',
        permission: 'purchasing.bills.view',
      },
    ],
  },
  */

  // --- 3. البيانات الأساسية للشركاء ---
  {
    name: 'بيانات الموردين',
    icon: UserGroupIcon,
    permission: 'core.partners.view',
    children: [
      {
        name: 'سجل الموردين المعتمدين',
        routeName: 'purchasing.suppliers.index',
        permission: 'core.partners.view',
      },
    ],
  },
]
