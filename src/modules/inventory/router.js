const PlaceholderView = () => import('@/views/PlaceholderView.vue')

const inventoryRoutes = [
  {
    path: 'inventory/units',
    name: 'InventoryUnitsList',
    component: () => import('@/modules/inventory/views/units/UnitsList.vue'),
    meta: { permission: 'inventory.units.view' },
  },
  {
    path: 'inventory/categories',
    name: 'InventoryCategoriesList',
    component: () => import('@/modules/inventory/views/categories/CategoriesList.vue'),
    meta: { permission: 'inventory.categories.view' },
  },
  {
    path: 'inventory/warehouses',
    name: 'InventoryWarehousesList',
    component: () => import('@/modules/inventory/views/warehouses/WarehousesList.vue'),
    meta: { permission: 'inventory.warehouses.view' },
  },
  {
    path: 'inventory/warehouse-locations',
    name: 'InventoryWarehouseLocationsList',
    component: () =>
      import('@/modules/inventory/views/warehouse-locations/WarehouseLocationsList.vue'),
    meta: { permission: 'inventory.warehouse_locations.view' },
  },
  {
    path: 'inventory/products',
    name: 'InventoryProductsList',
    component: () => import('@/modules/inventory/views/products/ProductsListView.vue'),
    meta: { permission: 'inventory.products.view' },
  },
  {
    path: 'inventory/products/create',
    name: 'InventoryProductsCreate',
    component: () => import('@/modules/inventory/views/products/ProductCreateView.vue'),
    meta: { permission: 'inventory.products.create' },
  },
  {
    path: 'inventory/products/:id/edit',
    name: 'InventoryProductsEdit',
    component: () => import('@/modules/inventory/views/products/ProductEditView.vue'),
    meta: { permission: 'inventory.products.update' },
  },
  {
    path: 'inventory/price-lists',
    name: 'InventoryPriceListsList',
    component: PlaceholderView,
    meta: { permission: 'inventory.price_lists.view' },
  },

  // ==========================================
  // مسارات إدارة التسويات الجردية والأرصدة الافتتاحية
  // ==========================================

  // 1. السجل العام والشامل لكافة التسويات
  {
    path: 'inventory/adjustments',
    name: 'InventoryAdjustmentsList',
    component: () => import('@/modules/inventory/views/adjustments/AdjustmentsList.vue'),
    meta: {
      permission: 'inventory.adjustments.view',
      pageTitle: 'سجل كافة التسويات المخزنية والأرصدة',
    },
  },

  // 2. مسارات الجرد الدوري والفعلي
  {
    path: 'inventory/adjustments/physical-count',
    name: 'InventoryPhysicalCountList',
    component: () => import('@/modules/inventory/views/adjustments/AdjustmentsList.vue'),
    meta: {
      permission: 'inventory.adjustments.view',
      defaultType: 'physical_count',
      pageTitle: 'محاضر الجرد الدوري والفعلي',
    },
  },
  {
    path: 'inventory/adjustments/physical-count/create',
    name: 'InventoryPhysicalCountCreate',
    component: () => import('@/modules/inventory/views/adjustments/AdjustmentForm.vue'),
    meta: {
      permission: 'inventory.adjustments.create',
      defaultType: 'physical_count',
      pageTitle: 'إصدار محضر جرد دوري / فعلي جديد',
    },
  },

  // 3. مسارات تسوية بضاعة تالفة
  {
    path: 'inventory/adjustments/damage',
    name: 'InventoryDamageList',
    component: () => import('@/modules/inventory/views/adjustments/AdjustmentsList.vue'),
    meta: {
      permission: 'inventory.adjustments.view',
      defaultType: 'damage',
      pageTitle: 'إدارة وتسويات البضاعة التالفة',
    },
  },
  {
    path: 'inventory/adjustments/damage/create',
    name: 'InventoryDamageCreate',
    component: () => import('@/modules/inventory/views/adjustments/AdjustmentForm.vue'),
    meta: {
      permission: 'inventory.adjustments.create',
      defaultType: 'damage',
      pageTitle: 'إصدار إذن إتلاف وتكهين بضاعة تالفة',
    },
  },

  // 4. مسارات تسوية فاقد وعجز
  {
    path: 'inventory/adjustments/loss',
    name: 'InventoryLossList',
    component: () => import('@/modules/inventory/views/adjustments/AdjustmentsList.vue'),
    meta: {
      permission: 'inventory.adjustments.view',
      defaultType: 'loss',
      pageTitle: 'إدارة وتسويات الفاقد والعجز المخزني',
    },
  },
  {
    path: 'inventory/adjustments/loss/create',
    name: 'InventoryLossCreate',
    component: () => import('@/modules/inventory/views/adjustments/AdjustmentForm.vue'),
    meta: {
      permission: 'inventory.adjustments.create',
      defaultType: 'loss',
      pageTitle: 'إصدار إذن تسوية فاقد وعجز مخزني',
    },
  },

  // 5. مسارات الأرصدة الافتتاحية
  {
    path: 'inventory/adjustments/opening-balance',
    name: 'InventoryOpeningBalanceList',
    component: () => import('@/modules/inventory/views/adjustments/AdjustmentsList.vue'),
    meta: {
      permission: 'inventory.adjustments.view',
      defaultType: 'opening_balance',
      pageTitle: 'أرصدة بضاعة أول المدة (افتتاحي)',
    },
  },
  {
    path: 'inventory/adjustments/opening-balance/create',
    name: 'InventoryOpeningBalanceCreate',
    component: () => import('@/modules/inventory/views/adjustments/AdjustmentForm.vue'),
    meta: {
      permission: 'inventory.adjustments.create',
      defaultType: 'opening_balance',
      pageTitle: 'إدخال رصيد افتتاحي لبضاعة أول المدة',
    },
  },

  // 6. مسارات التسويات العامة والاستثنائية
  {
    path: 'inventory/adjustments/general',
    name: 'InventoryGeneralAdjustmentList',
    component: () => import('@/modules/inventory/views/adjustments/AdjustmentsList.vue'),
    meta: {
      permission: 'inventory.adjustments.view',
      defaultType: 'general_adjustment',
      pageTitle: 'التسويات المخزنية العامة والاستثنائية',
    },
  },
  {
    path: 'inventory/adjustments/general/create',
    name: 'InventoryGeneralAdjustmentCreate',
    component: () => import('@/modules/inventory/views/adjustments/AdjustmentForm.vue'),
    meta: {
      permission: 'inventory.adjustments.create',
      defaultType: 'general_adjustment',
      pageTitle: 'إصدار تسوية مخزنية عامة',
    },
  },

  // مسار الإنشاء العام الافتراضي والتعديل والعرض بالمعرف
  {
    path: 'inventory/adjustments/create',
    name: 'InventoryAdjustmentsCreate',
    component: () => import('@/modules/inventory/views/adjustments/AdjustmentForm.vue'),
    meta: { permission: 'inventory.adjustments.create', pageTitle: 'إصدار تسوية جردية جديدة' },
  },
  {
    path: 'inventory/adjustments/:id/edit',
    name: 'InventoryAdjustmentsEdit',
    component: () => import('@/modules/inventory/views/adjustments/AdjustmentForm.vue'),
    meta: { permission: 'inventory.adjustments.update', pageTitle: 'تعديل مسودة وثيقة التسوية' },
  },
  {
    path: 'inventory/adjustments/:id',
    name: 'InventoryAdjustmentsShow',
    component: () => import('@/modules/inventory/views/adjustments/AdjustmentForm.vue'),
    meta: { permission: 'inventory.adjustments.view', pageTitle: 'عرض وثيقة التسوية الجردية' },
  },

  // ==========================================
  // مسارات إدارة أوامر التحويل بين المستودعات (Transfers)
  // ==========================================
  {
    path: 'inventory/transfers',
    name: 'InventoryTransfersList',
    component: () => import('@/modules/inventory/views/transfers/TransfersList.vue'),
    meta: {
      permission: 'inventory.transfers.view',
      pageTitle: 'إدارة أوامر التحويل بين المستودعات',
    },
  },
  {
    path: 'inventory/transfers/create',
    name: 'InventoryTransfersCreate',
    component: () => import('@/modules/inventory/views/transfers/TransferForm.vue'),
    meta: {
      permission: 'inventory.transfers.create',
      pageTitle: 'إصدار أمر تحويل مخزني جديد',
    },
  },
  {
    path: 'inventory/transfers/:id/edit',
    name: 'InventoryTransfersEdit',
    component: () => import('@/modules/inventory/views/transfers/TransferForm.vue'),
    meta: {
      permission: 'inventory.transfers.update',
      pageTitle: 'تعديل مسودة أمر التحويل',
    },
  },
  {
    path: 'inventory/transfers/:id',
    name: 'InventoryTransfersShow',
    component: () => import('@/modules/inventory/views/transfers/TransferForm.vue'),
    meta: {
      permission: 'inventory.transfers.view',
      pageTitle: 'عرض تفاصيل أمر التحويل المخزني',
    },
  },

  // ==========================================
  // مسارات تقارير والرقابة على المخزون (Reports)
  // ==========================================
  {
    path: 'inventory/reports/stock-card',
    name: 'InventoryReportStockCard',
    component: () => import('@/modules/inventory/views/reports/ItemStockCardReport.vue'),
    meta: { permission: 'inventory.reports.stock_card' },
  },
  {
    path: 'inventory/reports/stock-balance',
    name: 'InventoryReportStockBalance',
    component: () => import('@/modules/inventory/views/reports/StockBalanceReport.vue'),
    meta: { permission: 'inventory.reports.stock_balance' },
  },
  {
    path: 'inventory/reports/integrity-audit',
    name: 'InventoryReportIntegrityAudit',
    component: () => import('@/modules/inventory/views/reports/InventoryIntegrityAuditReport.vue'),
    meta: { permission: 'inventory.reports.integrity_audit' },
  },
  {
    path: 'inventory/reports/discrepancies',
    name: 'InventoryReportDiscrepancies',
    component: () => import('@/modules/inventory/views/reports/StockDiscrepancyReport.vue'),
    meta: { permission: 'inventory.reports.discrepancies' },
  },
  {
    path: 'inventory/reports/transfers-tracking',
    name: 'InventoryReportTransfersTracking',
    component: () => import('@/modules/inventory/views/reports/TransferTrackingReport.vue'),
    meta: { permission: 'inventory.reports.transfers_tracking' },
  },
  {
    path: 'inventory/reports/batch-expiry',
    name: 'InventoryReportBatchExpiry',
    component: () => import('@/modules/inventory/views/reports/BatchExpiryReport.vue'),
    meta: { permission: 'inventory.reports.batch_expiry' },
  },
  {
    path: 'inventory/reports/serial-tracking',
    name: 'InventoryReportSerialTracking',
    component: () => import('@/modules/inventory/views/reports/SerialTrackingReport.vue'),
    meta: { permission: 'inventory.reports.serial_tracking' },
  },
  {
    path: 'inventory/reports/reorder-alerts',
    name: 'InventoryReportReorderAlerts',
    component: () => import('@/modules/inventory/views/reports/ReorderAlertReport.vue'),
    meta: { permission: 'inventory.reports.reorder_alerts' },
  },
  {
    path: 'inventory/reports/production-variance',
    name: 'InventoryReportProductionVariance',
    component: () => import('@/modules/inventory/views/reports/ProductionVarianceReport.vue'),
    meta: { permission: 'inventory.reports.production_variance' },
  },
]

export default inventoryRoutes
