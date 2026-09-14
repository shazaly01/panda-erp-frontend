// --- استيراد شاشات طلبات الشراء الداخلية (Lazy Loading) ---
const PurchaseRequisitionsList = () => import('./views/requisitions/PurchaseRequisitionsList.vue')
const PurchaseRequisitionFormPage = () =>
  import('./views/requisitions/PurchaseRequisitionFormPage.vue')

// --- استيراد شاشات أذونات الصرف المخزني (Lazy Loading) ---
const PurchaseIssuesList = () => import('./views/issues/PurchaseIssuesList.vue')
const PurchaseIssueFormPage = () => import('./views/issues/PurchaseIssueFormPage.vue')

// --- استيراد شاشات أوامر الشراء (Lazy Loading) ---
const PurchaseOrdersList = () => import('./views/orders/PurchaseOrdersList.vue')
const PurchaseOrderFormPage = () => import('./views/orders/PurchaseOrderFormPage.vue')

// --- استيراد شاشات سندات الاستلام المخزني (Lazy Loading) ---
const PurchaseReceiptsList = () => import('./views/receipts/PurchaseReceiptsList.vue')
const PurchaseReceiptFormPage = () => import('./views/receipts/PurchaseReceiptFormPage.vue')

// --- استيراد شاشات فواتير المشتريات والشراء المباشر (Lazy Loading) ---
const PurchaseBillsList = () => import('./views/bills/PurchaseBillsList.vue')
const PurchaseBillFormPage = () => import('./views/bills/PurchaseBillFormPage.vue')

// --- استيراد شاشات إدارة الموردين (Lazy Loading) ---
const SuppliersList = () => import('./views/suppliers/SuppliersList.vue')

export default [
  {
    path: 'purchasing',
    children: [
      // ==========================================
      // 1. مسارات طلبات الشراء الداخلية (Purchase Requisitions)
      // ==========================================
      {
        path: 'requisitions',
        name: 'purchasing.requisitions.index',
        component: PurchaseRequisitionsList,
        meta: {
          permission: 'purchasing.requisitions.view',
          pageTitle: 'طلبات الشراء الداخلية للموظفين',
        },
      },
      {
        path: 'requisitions/create',
        name: 'purchasing.requisitions.create',
        component: PurchaseRequisitionFormPage,
        meta: {
          permission: 'purchasing.requisitions.create',
          pageTitle: 'إنشاء طلب شراء داخلي جديد',
        },
      },
      {
        path: 'requisitions/:id/edit',
        name: 'purchasing.requisitions.edit',
        component: PurchaseRequisitionFormPage,
        meta: {
          permission: 'purchasing.requisitions.update',
          pageTitle: 'تعديل مسودة طلب شراء داخلي',
        },
      },
      {
        path: 'requisitions/:id',
        name: 'purchasing.requisitions.show',
        component: PurchaseRequisitionFormPage,
        meta: {
          permission: 'purchasing.requisitions.view',
          pageTitle: 'عرض تفاصيل طلب الشراء الداخلي',
        },
      },

      // ==========================================
      // 2. مسارات أذونات الصرف المخزني (Purchase Issues)
      // ==========================================
      {
        path: 'issues',
        name: 'purchasing.issues.index',
        component: PurchaseIssuesList,
        meta: {
          permission: 'purchasing.issues.view',
          pageTitle: 'أذونات صرف المواد والمستلزمات المخزنية',
        },
      },
      {
        path: 'issues/create',
        name: 'purchasing.issues.create',
        component: PurchaseIssueFormPage,
        meta: {
          permission: 'purchasing.issues.create',
          pageTitle: 'إصدار إذن صرف مخزني جديد',
        },
      },
      {
        path: 'issues/:id/edit',
        name: 'purchasing.issues.edit',
        component: PurchaseIssueFormPage,
        meta: {
          permission: 'purchasing.issues.update',
          pageTitle: 'تعديل مسودة إذن صرف مخزني',
        },
      },
      {
        path: 'issues/:id',
        name: 'purchasing.issues.show',
        component: PurchaseIssueFormPage,
        meta: {
          permission: 'purchasing.issues.view',
          pageTitle: 'عرض تفاصيل إذن الصرف المخزني',
        },
      },

      // ==========================================
      // 3. مسارات أوامر الشراء (Purchase Orders)
      // ==========================================
      {
        path: 'orders',
        name: 'purchasing.orders.index',
        component: PurchaseOrdersList,
        meta: {
          permission: 'purchasing.orders.view',
          pageTitle: 'أوامر الشراء والتوريد',
        },
      },
      {
        path: 'orders/create',
        name: 'purchasing.orders.create',
        component: PurchaseOrderFormPage,
        meta: {
          permission: 'purchasing.orders.create',
          pageTitle: 'إنشاء أمر شراء جديد',
        },
      },
      {
        path: 'orders/:id/edit',
        name: 'purchasing.orders.edit',
        component: PurchaseOrderFormPage,
        meta: {
          permission: 'purchasing.orders.update',
          pageTitle: 'تعديل مسودة أمر شراء',
        },
      },
      {
        path: 'orders/:id',
        name: 'purchasing.orders.show',
        component: PurchaseOrderFormPage,
        meta: {
          permission: 'purchasing.orders.view',
          pageTitle: 'عرض تفاصيل أمر الشراء',
        },
      },

      // ==========================================
      // 4. مسارات سندات الاستلام المخزني (Purchase Receipts)
      // ==========================================
      {
        path: 'receipts',
        name: 'purchasing.receipts.index',
        component: PurchaseReceiptsList,
        meta: {
          permission: 'purchasing.receipts.view',
          pageTitle: 'سندات استلام المخزون والواردات',
        },
      },
      {
        path: 'receipts/create',
        name: 'purchasing.receipts.create',
        component: PurchaseReceiptFormPage,
        meta: {
          permission: 'purchasing.receipts.create',
          pageTitle: 'إنشاء سند استلام مخزني جديد',
        },
      },
      {
        path: 'receipts/:id/edit',
        name: 'purchasing.receipts.edit',
        component: PurchaseReceiptFormPage,
        meta: {
          permission: 'purchasing.receipts.update',
          pageTitle: 'تعديل مسودة سند استلام مخزني',
        },
      },
      {
        path: 'receipts/:id',
        name: 'purchasing.receipts.show',
        component: PurchaseReceiptFormPage,
        meta: {
          permission: 'purchasing.receipts.view',
          pageTitle: 'عرض تفاصيل سند الاستلام المخزني',
        },
      },

      // ==========================================
      // 5. مسارات فواتير المشتريات (Purchase Bills)
      // ==========================================
      {
        path: 'bills',
        name: 'purchasing.bills.index',
        component: PurchaseBillsList,
        meta: {
          permission: 'purchasing.bills.view',
          pageTitle: 'فواتير المشتريات والشراء المباشر',
        },
      },
      {
        path: 'bills/create',
        name: 'purchasing.bills.create',
        component: PurchaseBillFormPage,
        meta: {
          permission: 'purchasing.bills.create',
          pageTitle: 'إصدار فاتورة شراء جديدة',
        },
      },
      {
        path: 'bills/:id/edit',
        name: 'purchasing.bills.edit',
        component: PurchaseBillFormPage,
        meta: {
          permission: 'purchasing.bills.update',
          pageTitle: 'تعديل مسودة فاتورة مشتريات',
        },
      },
      {
        path: 'bills/:id',
        name: 'purchasing.bills.show',
        component: PurchaseBillFormPage,
        meta: {
          permission: 'purchasing.bills.view',
          pageTitle: 'عرض تفاصيل فاتورة المشتريات',
        },
      },

      // ==========================================
      // 6. مسارات إدارة الموردين (Suppliers)
      // ==========================================
      {
        path: 'suppliers',
        name: 'purchasing.suppliers.index',
        component: SuppliersList,
        meta: {
          permission: 'core.partners.view',
          pageTitle: 'إدارة الموردين',
        },
      },
    ],
  },
]
