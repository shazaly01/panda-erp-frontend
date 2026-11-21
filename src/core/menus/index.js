// src/core/menus/index.js
import {
  UsersIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
} from '@heroicons/vue/24/outline'

import accountingMenu from '@/modules/accounting/menu'
import hrMenu from '@/modules/hr/menu'
import inventoryMenu from '@/modules/inventory/menu'
import purchasingMenu from '@/modules/purchasing/menu'
import salesMenu from '@/modules/sales/menu'

// قائمة إدارة النظام المشتركة بين الموديولات
export const systemSettingsMenu = {
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
  accounting: [...accountingMenu, systemSettingsMenu],
  sales: [...salesMenu, systemSettingsMenu],
  hr: [...hrMenu, systemSettingsMenu],
  inventory: [...inventoryMenu, systemSettingsMenu],
  purchasing: [...purchasingMenu, systemSettingsMenu],
}
