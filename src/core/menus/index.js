import { HomeIcon } from '@heroicons/vue/24/outline'
import accountingMenu from '@/modules/accounting/menu'
// import hrMenu from '@/modules/hr/menu' // مستقبلاً

export const appMenus = [
  // لوحة التحكم الأساسية (دائماً في الأعلى)
  {
    name: 'لوحة التحكم',
    routeName: 'Dashboard',
    icon: HomeIcon,
    permission: 'dashboard.view',
  },

  // دمج قوائم الموديولات
  accountingMenu,
  // hrMenu,
]
