import {
  CubeIcon,
  ScaleIcon,
  FolderIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  TagIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  ArrowsRightLeftIcon,
  ChartBarSquareIcon,
  DocumentChartBarIcon,
  ArchiveBoxIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  QrCodeIcon,
  BellAlertIcon,
  Cog6ToothIcon,
  TrashIcon,
  MinusCircleIcon,
  PlusCircleIcon,
} from '@heroicons/vue/24/outline'

const inventoryMenu = [
  // ==========================================
  // 1. البيانات الأساسية والتهيئة للمخزون
  // ==========================================
  {
    name: 'البيانات الأساسية',
    icon: CubeIcon,
    permission: 'inventory.view',
    children: [
      {
        name: 'وحدات القياس',
        routeName: 'InventoryUnitsList',
        icon: ScaleIcon,
        permission: 'inventory.units.view',
      },
      {
        name: 'التصنيفات',
        routeName: 'InventoryCategoriesList',
        icon: FolderIcon,
        permission: 'inventory.categories.view',
      },
      {
        name: 'المستودعات',
        routeName: 'InventoryWarehousesList',
        icon: BuildingOfficeIcon,
        permission: 'inventory.warehouses.view',
      },
      {
        name: 'مواقع المستودعات',
        routeName: 'InventoryWarehouseLocationsList',
        icon: MapPinIcon,
        permission: 'inventory.warehouse_locations.view',
      },
      {
        name: 'الأصناف والمنتجات',
        routeName: 'InventoryProductsList',
        icon: TagIcon,
        permission: 'inventory.products.view',
      },
      {
        name: 'قوائم الأسعار',
        routeName: 'InventoryPriceListsList',
        icon: CurrencyDollarIcon,
        permission: 'inventory.price_lists.view',
      },
    ],
  },

  // ==========================================
  // 2. الحركات والعمليات التشغيلية للمخزون
  // ==========================================
  {
    name: 'العمليات المخزنية',
    icon: ArrowsRightLeftIcon,
    permission: 'inventory.view',
    children: [
      {
        name: 'التحويل بين المستودعات',
        routeName: 'InventoryTransfersList',
        icon: ArrowsRightLeftIcon,
        permission: 'inventory.transfers.view',
      },
      {
        name: 'جرد دوري وفعلي',
        routeName: 'InventoryPhysicalCountList',
        icon: ClipboardDocumentCheckIcon,
        permission: 'inventory.adjustments.view',
      },
      {
        name: 'تسوية بضاعة تالفة',
        routeName: 'InventoryDamageList',
        icon: TrashIcon,
        permission: 'inventory.adjustments.view',
      },
      {
        name: 'تسوية فاقد وعجز',
        routeName: 'InventoryLossList',
        icon: MinusCircleIcon,
        permission: 'inventory.adjustments.view',
      },
      {
        name: 'رصيد افتتاحي للمخزون',
        routeName: 'InventoryOpeningBalanceList',
        icon: PlusCircleIcon,
        permission: 'inventory.adjustments.view',
      },
      {
        name: 'تسويات عامة واستثنائية',
        routeName: 'InventoryGeneralAdjustmentList',
        icon: ArrowsRightLeftIcon,
        permission: 'inventory.adjustments.view',
      },
      {
        name: 'سجل كافة التسويات',
        routeName: 'InventoryAdjustmentsList',
        icon: DocumentChartBarIcon,
        permission: 'inventory.adjustments.view',
      },
    ],
  },

  // ==========================================
  // 3. تقارير والرقابة على المخزون
  // ==========================================
  {
    name: 'تقارير ورقابة المخزون',
    icon: ChartBarSquareIcon,
    permission: 'inventory.view',
    children: [
      {
        name: 'كارت الصنف التفصيلي',
        routeName: 'InventoryReportStockCard',
        icon: DocumentChartBarIcon,
        permission: 'inventory.reports.stock_card',
      },
      {
        name: 'أرصدة وتقييم المخزون',
        routeName: 'InventoryReportStockBalance',
        icon: ArchiveBoxIcon,
        permission: 'inventory.reports.stock_balance',
      },
      {
        name: 'فحص وتدقيق المطابقة (Audit)',
        routeName: 'InventoryReportIntegrityAudit',
        icon: ShieldCheckIcon,
        permission: 'inventory.reports.integrity_audit',
      },
      {
        name: 'تسويات وفروقات الجرد',
        routeName: 'InventoryReportDiscrepancies',
        icon: ExclamationTriangleIcon,
        permission: 'inventory.reports.discrepancies',
      },
      {
        name: 'تتبع التحويلات المخزنية',
        routeName: 'InventoryReportTransfersTracking',
        icon: ArrowsRightLeftIcon,
        permission: 'inventory.reports.transfers_tracking',
      },
      {
        name: 'صلاحيات ودفعات التشغيل',
        routeName: 'InventoryReportBatchExpiry',
        icon: ClockIcon,
        permission: 'inventory.reports.batch_expiry',
      },
      {
        name: 'تتبع الأرقام التسلسلية',
        routeName: 'InventoryReportSerialTracking',
        icon: QrCodeIcon,
        permission: 'inventory.reports.serial_tracking',
      },
      {
        name: 'نواقص وحدود إعادة الطلب',
        routeName: 'InventoryReportReorderAlerts',
        icon: BellAlertIcon,
        permission: 'inventory.reports.reorder_alerts',
      },
      {
        name: 'انحرافات وتكاليف الإنتاج',
        routeName: 'InventoryReportProductionVariance',
        icon: Cog6ToothIcon,
        permission: 'inventory.reports.production_variance',
      },
    ],
  },
]

export default inventoryMenu
