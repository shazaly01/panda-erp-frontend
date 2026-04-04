import accountingNav from '@/modules/accounting/menu'
import {
  HomeIcon,
  Cog6ToothIcon,
  UsersIcon,
  ShieldCheckIcon,
  CubeIcon,
  ShoppingCartIcon,
  BriefcaseIcon,
  UserGroupIcon,
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
  // 2. القطاع المالي (مستورد من الموديول)
  // ============================================
  { isModuleHeader: true, label: 'الإدارة المالية' },

  // دمج مصفوفة المحاسبة هنا
  ...accountingNav,

  // ============================================
  // 3. سلسلة الإمداد (عناصر نائبة)
  // ============================================
  { isModuleHeader: true, label: 'سلسلة الإمداد' },

  {
    name: 'المخزون',
    icon: CubeIcon,
    permission: 'inventory.view',
    children: [
      { name: 'تعريف الأصناف', to: { path: '#' } },
      { name: 'حركات مخزنية', to: { path: '#' } },
    ],
  },
  {
    name: 'المشتريات',
    icon: ShoppingCartIcon,
    permission: 'purchase.view',
    children: [
      { name: 'أوامر الشراء', to: { path: '#' } },
      { name: 'الموردين', to: { path: '#' } },
    ],
  },
  {
    name: 'المبيعات',
    icon: BriefcaseIcon,
    permission: 'sales.view',
    children: [
      { name: 'فواتير المبيعات', to: { path: '#' } },
      { name: 'العملاء', to: { path: '#' } },
    ],
  },

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
    permission: 'system.manage',
    children: [
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
