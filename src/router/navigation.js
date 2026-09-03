import accountingNav from '@/modules/accounting/menu'
import inventoryNav from '@/modules/inventory/menu'
import {
  HomeIcon,
  Cog6ToothIcon,
  UsersIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/vue/24/outline'

export const navigationMenu = [
  // ============================================
  // 1. الرئيسية
  // ============================================
  {
    name: 'الرئيسية',
    routeName: 'Dashboard',
    icon: HomeIcon,
    permission: 'dashboard.view',
  },

  // ============================================
  // 2. القطاع المالي
  // ============================================
  { isModuleHeader: true, label: 'الإدارة المالية' },
  ...accountingNav,

  // ============================================
  // 3. سلسلة الإمداد (المخزون)
  // ============================================
  { isModuleHeader: true, label: 'سلسلة الإمداد' },
  ...inventoryNav,

  // ============================================
  // 4. الموارد البشرية
  // ============================================
  { isModuleHeader: true, label: 'الموارد البشرية' },
  {
    name: 'شؤون الموظفين',
    icon: UserGroupIcon,
    permission: 'hr.view',
    children: [
      { name: 'ملفات الموظفين', to: { path: '#' } },
      { name: 'الهيكل التنظيمي', to: { path: '#' } },
    ],
  },

  // ============================================
  // 5. إدارة النظام
  // ============================================
  { isModuleHeader: true, label: 'إعدادات النظام' },
  {
    name: 'إدارة النظام',
    icon: Cog6ToothIcon,
    // تم حذف شرط system.manage من هنا ليتم فحص صلاحيات الأبناء مباشرة
    children: [
      {
        name: 'طلبات الدعم والمنح',
        routeName: 'GrantRequestsList',
        permission: 'grant_request.view',
        icon: DocumentTextIcon,
      },
      {
        name: 'المستخدمين',
        routeName: 'UsersList',
        permission: 'user.view',
        icon: UsersIcon,
      },
      {
        name: 'الصلاحيات',
        routeName: 'RolesList',
        permission: 'role.view',
        icon: ShieldCheckIcon,
      },
      {
        name: 'النسخ الاحتياطي',
        routeName: 'BackupsList',
        permission: 'backup.view',
      },
    ],
  },
]
