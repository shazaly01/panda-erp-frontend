// src/modules/hr/menu.js
import {
  UserGroupIcon,
  Cog8ToothIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from '@heroicons/vue/24/outline'

export default [
  // 1. شؤون الموظفين
  {
    name: 'شؤون الموظفين',
    icon: UserGroupIcon,
    permission: 'hr.employees.view',
    children: [
      { name: 'قائمة الموظفين', routeName: 'EmployeesList', permission: 'hr.employees.view' },
      { name: 'العقود والتوظيف', routeName: 'ContractsList', permission: 'hr.contracts.view' },
    ],
  },

  // 2. الحضور والطلبات
  {
    name: 'الحضور والعمليات',
    icon: ClockIcon,
    permission: 'hr.attendance.view',
    children: [
      { name: 'سجلات الحضور', routeName: 'AttendanceList', permission: 'hr.attendance.view' },
      { name: 'طلبات الإجازات', routeName: 'LeavesList', permission: 'hr.leaves.view' },
      { name: 'السلف والعهد', routeName: 'LoansList', permission: 'hr.loans.view' },
    ],
  },

  // 3. الرواتب والأجور
  {
    name: 'الرواتب والأجور',
    icon: CurrencyDollarIcon,
    permission: 'hr.payroll.view',
    children: [
      {
        name: 'المدخلات المالية',
        routeName: 'PayrollInputsList',
        permission: 'hr.payroll_inputs.view',
      },
      { name: 'مسيرات الرواتب', routeName: 'PayrollBatchesList', permission: 'hr.payroll.view' },
    ],
  },

  // 4. إعدادات الموارد البشرية
  {
    name: 'إعدادات الموارد',
    icon: Cog8ToothIcon,
    permission: 'hr.settings.manage',
    children: [
      {
        name: 'الهيكل التنظيمي (أقسام)',
        routeName: 'DepartmentsList',
        permission: 'hr.departments.view',
      },
      { name: 'المسميات الوظيفية', routeName: 'PositionsList', permission: 'hr.positions.view' },
      { name: 'إعدادات الورديات', routeName: 'ShiftsList', permission: 'hr.shifts.view' },
      {
        name: 'تعريف قواعد الرواتب',
        routeName: 'SalaryRulesList',
        permission: 'hr.settings.manage',
      },
      {
        name: 'هياكل الرواتب المجمعة',
        routeName: 'SalaryStructuresList',
        permission: 'hr.settings.manage',
      },
      // 🚀 الإضافة الجديدة: سياسات العمل الإضافي
      {
        name: 'سياسات العمل الإضافي',
        routeName: 'OvertimePoliciesList',
        permission: 'hr.overtime_policies.view', // تأكد أن هذا التصريح متطابق مع جدول الصلاحيات لديك
      },
    ],
  },
]
