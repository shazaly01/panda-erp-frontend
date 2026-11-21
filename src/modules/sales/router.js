// src/modules/sales/router.js

// --- استيراد لوحة تحكم المبيعات ونقاط البيع (Lazy Loading) ---
const SalesDashboardView = () => import('./views/dashboard/SalesDashboardView.vue')

// --- استيراد شاشات فواتير المبيعات ونقطة البيع (Lazy Loading) ---
const SalesInvoicesListView = () => import('./views/invoices/SalesInvoicesListView.vue')
const SalesInvoiceFormView = () => import('./views/invoices/SalesInvoiceFormView.vue')

// مسار شاشة الكاشير المستقلة (خارج AppLayout لتعمل بكامل مساحة الشاشة بدون القوائم الجانبية)
export const salesPosStandaloneRoutes = [
  {
    path: '/pos',
    name: 'sales.pos.standalone',
    component: SalesInvoiceFormView,
    meta: {
      requiresAuth: true,
      isPos: true,
      permission: 'sales.pos.access',
      pageTitle: 'نقطة البيع السريعة (POS)',
    },
  },
]

// مسارات موديول المبيعات داخل التطبيق (/app/sales/...)
export default [
  {
    path: 'sales',
    children: [
      // ==========================================
      // 0. لوحة تحكم المبيعات ونقاط البيع (Dashboard)
      // ==========================================
      {
        path: 'dashboard',
        name: 'sales.dashboard',
        component: SalesDashboardView,
        meta: {
          permission: 'sales.dashboard.view',
          pageTitle: 'لوحة تحكم المبيعات ونقاط البيع',
        },
      },

      // ==========================================
      // 1. فواتير المبيعات (Sales Invoices)
      // ==========================================
      {
        path: 'invoices',
        name: 'sales.invoices.index',
        component: SalesInvoicesListView,
        meta: {
          permission: 'sales.invoices.view',
          pageTitle: 'إدارة فواتير المبيعات',
        },
      },
      {
        path: 'invoices/create',
        name: 'sales.invoices.create',
        component: SalesInvoiceFormView,
        meta: {
          permission: 'sales.invoices.create',
          pageTitle: 'إصدار فاتورة مبيعات جديدة',
        },
      },
      {
        path: 'invoices/:id/edit',
        name: 'sales.invoices.edit',
        component: SalesInvoiceFormView,
        meta: {
          permission: 'sales.invoices.update',
          pageTitle: 'تعديل فاتورة مبيعات',
        },
      },
      {
        path: 'invoices/:id',
        name: 'sales.invoices.show',
        component: SalesInvoiceFormView,
        meta: {
          permission: 'sales.invoices.view',
          pageTitle: 'عرض تفاصيل فاتورة المبيعات',
        },
      },

      // ==========================================
      // 2. نقطة البيع السريعة (POS) داخل التطبيق
      // ==========================================
      {
        path: 'pos',
        name: 'sales.pos.index',
        component: SalesInvoiceFormView,
        meta: {
          isPos: true,
          permission: 'sales.pos.access',
          pageTitle: 'نقطة البيع السريعة (POS)',
        },
      },
    ],
  },
]
