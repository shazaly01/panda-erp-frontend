// src/modules/sales/menu.js
import { BanknotesIcon, ComputerDesktopIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'

export default [
  // --- 1. عمليات المبيعات ونقاط البيع ---
  {
    name: 'عمليات المبيعات',
    icon: BanknotesIcon,
    permission: 'sales.invoices.view',
    children: [
      {
        name: 'فواتير المبيعات',
        routeName: 'sales.invoices.index',
        icon: DocumentTextIcon,
        permission: 'sales.invoices.view',
      },
      {
        name: 'نقطة البيع السريعة (POS)',
        routeName: 'sales.pos.standalone',
        icon: ComputerDesktopIcon,
        permission: 'sales.pos.access',
      },
    ],
  },
]
