import {
  ShieldCheckIcon,
  UserGroupIcon,
  Cog8ToothIcon,
  ClockIcon,
  CurrencyDollarIcon,
  WifiIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/vue/24/outline'

export default [
  {
    name: 'بوابة الأمن والاستقبال',
    icon: ShieldCheckIcon, // أيقونة حماية مخصصة للأمن
    permission: 'hr_leave_passes.gate_check', // تظهر فقط لمن يملك صلاحية الحراسة
    children: [
      {
        name: 'شاشة استقبال البوابة',
        routeName: 'GateDashboard',
        permission: 'hr_leave_passes.gate_check',
      },
      {
        name: 'سجل وحركات الزوار',
        routeName: 'VisitorsList',
        permission: 'hr_visitors.view',
      },
      // مستقبلاً يمكنك إضافة (شاشة مسح الـ QR المؤتمتة) هنا تحت نفس القسم
    ],
  },
  // =========================================================
  // 1. شؤون الموظفين (استخدام يومي / أسبوعي)
  // =========================================================
  {
    name: 'شؤون الموظفين',
    icon: UserGroupIcon,
    permission: 'hr.employees.view',
    children: [
      { name: 'قائمة الموظفين', routeName: 'EmployeesList', permission: 'hr.employees.view' },
      { name: 'العقود والتوظيف', routeName: 'ContractsList', permission: 'hr.contracts.view' },
    ],
  },

  // =========================================================
  // 2. الحضور والعمليات (استخدام يومي)
  // =========================================================
  {
    name: 'الحضور والعمليات',
    icon: ClockIcon,
    permission: 'hr.attendance.view',
    children: [
      { name: 'سجلات الحضور', routeName: 'AttendanceList', permission: 'hr.attendance.view' },
      { name: 'طلبات الإجازات', routeName: 'LeavesList', permission: 'hr.leaves.view' },
      {
        name: 'تبديل الورديات (تجاوزات)',
        routeName: 'ShiftOverridesList',
        permission: 'hr.shift_overrides.view',
      },
      {
        name: 'العطلات والطوارئ',
        routeName: 'CalendarExceptionsList',
        permission: 'hr.calendar_exceptions.view',
      },
      {
        name: 'أكواد الإنترنت',
        routeName: 'InternetVouchersList',
        icon: WifiIcon,
        permission: 'internet_vouchers.view',
      },
    ],
  },

  // =========================================================
  // 4. بوابة المشرفين (الخدمة الذاتية للمدير)
  // =========================================================
  {
    name: 'بوابة المشرفين',
    icon: ClipboardDocumentCheckIcon,
    permission: 'hr.team_attendance.manage',
    children: [
      {
        name: 'حضور فريقي',
        routeName: 'TeamAttendance',
        permission: 'hr.team_attendance.manage',
      },
      {
        name: 'أذونات الخروج المؤقت',
        routeName: 'LeavePassesList',
        permission: 'hr_leave_passes.view',
      },
      {
        name: 'لوحة الطوارئ والسلامة',
        routeName: 'EmergencyMuster',
        permission: 'hr_leave_passes.view',
      },
    ],
  },

  // =========================================================
  // 3. الرواتب والأجور (استخدام شهري)
  // =========================================================
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
      { name: 'السلف والعهد', routeName: 'LoansList', permission: 'hr.loans.view' },
      { name: 'مسيرات الرواتب', routeName: 'PayrollBatchesList', permission: 'hr.payroll.view' },
    ],
  },

  // =========================================================
  // 4. إعدادات النظام (تُضبط لمرة واحدة - مرتبة منطقياً)
  // =========================================================
  {
    name: 'إعدادات النظام',
    icon: Cog8ToothIcon,
    permission: 'hr.settings.manage',
    children: [
      // -- التنظيم الإداري --
      {
        name: 'الهيكل التنظيمي (أقسام)',
        routeName: 'DepartmentsList',
        permission: 'hr.departments.view',
      },
      { name: 'المسميات الوظيفية', routeName: 'PositionsList', permission: 'hr.positions.view' },

      // -- إعدادات الجدولة والوقت --
      { name: 'الورديات الأساسية', routeName: 'ShiftsList', permission: 'hr.shifts.view' },
      {
        name: 'قوالب الجدولة (دورة العمل)',
        routeName: 'WorkingSchedulesList',
        permission: 'hr.working_schedules.view',
      },

      // -- إعدادات السياسات والرواتب --
      { name: 'مجموعات الدفع', routeName: 'PayGroupsList', permission: 'hr.pay_groups.view' },
      { name: 'الفترات المالية', routeName: 'PayPeriodsList', permission: 'hr.pay_periods.view' },
      {
        name: 'سياسات العمل الإضافي',
        routeName: 'OvertimePoliciesList',
        permission: 'hr.overtime_policies.view',
      },
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
    ],
  },
]
