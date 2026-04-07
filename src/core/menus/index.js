// src/core/menus/index.js
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'

import accountingMenu from '@/modules/accounting/menu'
import hrMenu from '@/modules/hr/menu' // ✅ تم استيرادها بنجاح هنا

// عناصر مشتركة نريد إظهارها في جميع القوائم الجانبية
const commonDashboard = {
  name: 'لوحة التحكم',
  routeName: 'Dashboard',
  icon: HomeIcon,
  permission: 'dashboard.view',
}

const systemSettings = {
  name: 'إدارة النظام',
  icon: Cog6ToothIcon,
  permission: 'user.view',
  children: [
    { name: 'المستخدمين', routeName: 'UsersList', icon: UsersIcon, permission: 'user.view' },
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

// 🌟 هيكلة جديدة: كائن يحتوي على الأنظمة
export const appMenus = {
  accounting: [commonDashboard, ...accountingMenu, systemSettings],
  hr: [
    commonDashboard,
    ...hrMenu, // ✅ إزالة التعليق هنا لتظهر القائمة!
    systemSettings,
  ],
}
