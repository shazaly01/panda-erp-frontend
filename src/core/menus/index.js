// src/core/menus/index.js
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'
import accountingMenu from '@/modules/accounting/menu'

export const appMenus = [
  // 1. لوحة التحكم
  {
    name: 'لوحة التحكم',
    routeName: 'Dashboard',
    icon: HomeIcon,
    permission: 'dashboard.view',
  },

  // 2. موديول المحاسبة (نثر المصفوفة)
  ...accountingMenu,

  // 3. 🌟 قسم إدارة النظام (الجديد)
  {
    name: 'إدارة النظام',
    icon: Cog6ToothIcon,
    permission: 'user.view', // تظهر إذا كان يملك صلاحية عرض المستخدمين
    children: [
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
  },
]
