import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
} from '@heroicons/vue/24/outline'

import accountingMenu from '@/modules/accounting/menu'
import hrMenu from '@/modules/hr/menu'
import inventoryMenu from '@/modules/inventory/menu'

// عناصر مشتركة تظهر في جميع القوائم الجانبية
const commonDashboard = {
  name: 'لوحة التحكم',
  routeName: 'Dashboard',
  icon: HomeIcon,
  permission: 'dashboard.view',
}

const systemSettings = {
  name: 'إدارة النظام',
  icon: Cog6ToothIcon,
  children: [
    {
      name: 'طلبات الدعم والمنح',
      routeName: 'GrantRequestsList',
      icon: DocumentTextIcon,
      permission: 'grant_request.view',
    },
    {
      name: 'المستخدمين',
      routeName: 'UsersList',
      icon: UsersIcon,
      permission: 'user.view',
    },
    {
      name: 'الأدوار والصلاحيات',
      routeName: 'RolesList',
      icon: ShieldCheckIcon,
      permission: 'role.view',
    },
    {
      name: 'النسخ الاحتياطي',
      routeName: 'BackupsList',
      icon: CircleStackIcon,
      permission: 'backup.view',
    },
  ],
}

// كائن يحتوي على القوائم لكل نظام/موديول
export const appMenus = {
  accounting: [commonDashboard, ...accountingMenu, systemSettings],
  hr: [commonDashboard, ...hrMenu, systemSettings],
  inventory: [commonDashboard, ...inventoryMenu, systemSettings],
}
