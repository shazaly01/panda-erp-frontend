// src/modules/hr/menu.js
import {
  UserGroupIcon,
  BriefcaseIcon,
  ClockIcon,
  CurrencyDollarIcon,
  Cog8ToothIcon,
} from '@heroicons/vue/24/outline'

export default [
  {
    name: 'شؤون الموظفين',
    icon: UserGroupIcon,
    permission: 'hr.view', // عدل الصلاحيات حسب نظامك
    children: [
      { name: 'الموظفون', routeName: 'EmployeesList', permission: 'employee.view' },
      { name: 'العقود', routeName: 'ContractsList', permission: 'contract.view' },
    ],
  },
  {
    name: 'الحضور والطلبات',
    icon: ClockIcon,
    permission: 'hr.view',
    children: [
      { name: 'سجلات الحضور', routeName: 'AttendanceList', permission: 'attendance.view' },
      { name: 'طلبات الإجازات', routeName: 'LeavesList', permission: 'leave.view' },
      { name: 'السلف والعهد', routeName: 'LoansList', permission: 'loan.view' },
    ],
  },
  {
    name: 'الرواتب والأجور',
    icon: CurrencyDollarIcon,
    permission: 'hr.view',
    children: [
      { name: 'المدخلات المالية', routeName: 'PayrollInputsList', permission: 'payroll.view' },
      { name: 'مسيرات الرواتب', routeName: 'PayrollBatchesList', permission: 'payroll.view' },
    ],
  },
  {
    name: 'إعدادات الموارد',
    icon: Cog8ToothIcon,
    permission: 'hr.view',
    children: [
      { name: 'الإدارات', routeName: 'DepartmentsList', permission: 'department.view' },
      { name: 'الوظائف', routeName: 'PositionsList', permission: 'position.view' },
    ],
  },
]
