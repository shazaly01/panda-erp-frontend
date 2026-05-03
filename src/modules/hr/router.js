// src/modules/hr/router.js

// ==========================================
// 1. إعدادات الموارد البشرية (الهيكل والورديات)
// ==========================================
const DepartmentsList = () => import('./views/departments/DepartmentsList.vue')
const PositionsList = () => import('./views/positions/PositionsList.vue')
const ShiftsList = () => import('./views/shifts/ShiftsList.vue')

// 🌟 إضافات الجدولة الذكية (قوالب دورات العمل)
const WorkingSchedulesList = () => import('./views/working-schedules/WorkingSchedulesList.vue')
const WorkingScheduleFormPage = () =>
  import('./views/working-schedules/WorkingScheduleFormPage.vue')

// ==========================================
// 2. شؤون الموظفين والعقود
// ==========================================
const EmployeesList = () => import('./views/employees/EmployeesList.vue')
const EmployeeFormPage = () => import('./views/employees/EmployeeFormPage.vue')
const EmployeeProfile = () => import('./views/employees/EmployeeProfile.vue')

const ContractsList = () => import('./views/contracts/ContractsList.vue')
const ContractFormPage = () => import('./views/contracts/ContractFormPage.vue')

// ==========================================
// 3. الحضور والطلبات والعمليات
// ==========================================
const AttendanceList = () => import('./views/attendance/AttendanceLogList.vue')
const LeavesList = () => import('./views/leaves/LeavesList.vue')
const LoansList = () => import('./views/loans/LoansList.vue')

// 🌟 إضافات الجدولة الذكية (التجاوزات الفردية والطوارئ)
// 🌟 إضافات الجدولة الذكية (التجاوزات الفردية والطوارئ)
const ShiftOverridesList = () => import('./views/schedules/ShiftOverridesList.vue')
const CalendarExceptionsList = () => import('./views/schedules/CalendarExceptionsList.vue')

// 🌟 إضافة شاشة أكواد الإنترنت
const InternetVouchersList = () => import('./views/internet_vouchers/InternetVouchersList.vue')

// ==========================================
// 4. الرواتب والأجور

// ==========================================
// 4. الرواتب والأجور
// ==========================================
const SalaryRulesList = () => import('./views/payroll/SalaryRulesList.vue')
const SalaryStructuresList = () => import('./views/payroll/SalaryStructuresList.vue')
const SalaryStructureForm = () => import('./views/payroll/SalaryStructureFormPage.vue')

const PayGroupsList = () => import('./views/pay-groups/PayGroupsList.vue')
const PayPeriodsList = () => import('./views/pay-periods/PayPeriodsList.vue')

const OvertimePoliciesList = () => import('./views/overtime-policies/OvertimePoliciesList.vue')
const OvertimePolicyFormPage = () => import('./views/overtime-policies/OvertimePolicyFormPage.vue')

const PayrollInputsList = () => import('./views/payroll/PayrollInputsList.vue')
const PayrollBatchesList = () => import('./views/payroll/batches/PayrollBatchesList.vue')

export default [
  {
    path: 'hr',
    children: [
      // --- شؤون الموظفين ---
      {
        path: 'employees',
        name: 'EmployeesList',
        component: EmployeesList,
        meta: { permission: 'hr.employees.view' },
      },
      {
        path: 'employees/create',
        name: 'employees.create',
        component: EmployeeFormPage,
        meta: { permission: 'hr.employees.create' },
      },
      {
        path: 'employees/:id',
        name: 'EmployeeProfile',
        component: EmployeeProfile,
        meta: { permission: 'hr.employees.view' },
      },
      {
        path: 'employees/:id/edit',
        name: 'employees.edit',
        component: EmployeeFormPage,
        meta: { permission: 'hr.employees.update' },
      },

      // --- العقود ---
      {
        path: 'contracts',
        name: 'ContractsList',
        component: ContractsList,
        meta: { permission: 'hr.contracts.view' },
      },
      {
        path: 'contracts/create',
        name: 'contracts.create',
        component: ContractFormPage,
        meta: { permission: 'hr.contracts.manage' },
      },
      {
        path: 'contracts/:id/edit',
        name: 'contracts.edit',
        component: ContractFormPage,
        meta: { permission: 'hr.contracts.manage' },
      },

      // --- الحضور والعمليات والجدولة الذكية ---
      {
        path: 'attendance',
        name: 'AttendanceList',
        component: AttendanceList,
        meta: { permission: 'hr.attendance.view' },
      },
      {
        path: '/hr/attendance/kiosk',
        name: 'attendance.kiosk',
        component: () => import('@/modules/hr/views/attendance/AttendanceKiosk.vue'),
        meta: {
          title: 'شاشة الاستقبال - الباركود',
          // layout: 'blank' // قم بتفعيلها إذا كان نظامك يدعم تخطيطاً فارغاً للشاشات الكاملة
        },
      },
      {
        path: 'leaves',
        name: 'LeavesList',
        component: LeavesList,
        meta: { permission: 'hr.leaves.view' },
      },
      {
        path: 'loans',
        name: 'LoansList',
        component: LoansList,
        meta: { permission: 'hr.loans.view' },
      },

      {
        path: 'shift-overrides',
        name: 'ShiftOverridesList',
        component: ShiftOverridesList,
        meta: { permission: 'hr.shift_overrides.view' },
      },
      {
        path: 'calendar-exceptions',
        name: 'CalendarExceptionsList',
        component: CalendarExceptionsList,
        meta: { permission: 'hr.calendar_exceptions.view' },
      },

      {
        path: 'internet-vouchers',
        name: 'InternetVouchersList',
        component: InternetVouchersList,
        meta: { permission: 'internet_vouchers.view' },
      },
      // --- الرواتب والمدخلات ---
      {
        path: 'payroll-inputs',
        name: 'PayrollInputsList',
        component: PayrollInputsList,
        meta: { permission: 'hr.payroll_inputs.view' },
      },
      {
        path: 'payroll-batches',
        name: 'PayrollBatchesList',
        component: PayrollBatchesList,
        meta: { permission: 'hr.payroll.view' },
      },

      // --- الإعدادات (الهيكل التنظيمي) ---
      {
        path: 'departments',
        name: 'DepartmentsList',
        component: DepartmentsList,
        meta: { permission: 'hr.departments.view' },
      },
      {
        path: 'positions',
        name: 'PositionsList',
        component: PositionsList,
        meta: { permission: 'hr.positions.view' },
      },

      // --- الإعدادات (الجدولة والورديات) ---
      {
        path: 'shifts',
        name: 'ShiftsList',
        component: ShiftsList,
        meta: { permission: 'hr.shifts.view' },
      },
      // 🚀 مسارات قوالب الجدولة (Working Schedules)
      {
        path: 'working-schedules',
        name: 'WorkingSchedulesList',
        component: WorkingSchedulesList,
        meta: { permission: 'hr.working_schedules.view' },
      },
      {
        path: 'working-schedules/create',
        name: 'working-schedules.create',
        component: WorkingScheduleFormPage,
        meta: { permission: 'hr.working_schedules.create' },
      },
      {
        path: 'working-schedules/:id/edit',
        name: 'working-schedules.edit',
        component: WorkingScheduleFormPage,
        meta: { permission: 'hr.working_schedules.update' },
      },

      // --- الإعدادات (هياكل وقواعد الرواتب) ---
      {
        path: 'salary-rules',
        name: 'SalaryRulesList',
        component: SalaryRulesList,
        meta: { permission: 'hr.settings.manage' },
      },
      {
        path: 'salary-structures',
        name: 'SalaryStructuresList',
        component: SalaryStructuresList,
        meta: { permission: 'hr.settings.manage' },
      },
      {
        path: 'salary-structures/create',
        name: 'salary-structures.create',
        component: SalaryStructureForm,
        meta: { permission: 'hr.settings.manage' },
      },
      {
        path: 'salary-structures/:id/edit',
        name: 'salary-structures.edit',
        component: SalaryStructureForm,
        meta: { permission: 'hr.settings.manage' },
      },
      {
        path: 'pay-groups',
        name: 'PayGroupsList',
        component: PayGroupsList,
        meta: { permission: 'hr.pay_groups.view' },
      },
      {
        path: 'pay-periods',
        name: 'PayPeriodsList',
        component: PayPeriodsList,
        meta: { permission: 'hr.pay_periods.view' },
      },
      {
        path: 'overtime-policies',
        name: 'OvertimePoliciesList',
        component: OvertimePoliciesList,
        meta: { permission: 'hr.overtime_policies.view' },
      },
      {
        path: 'overtime-policies/create',
        name: 'overtime-policies.create',
        component: OvertimePolicyFormPage,
        meta: { permission: 'hr.overtime_policies.manage' },
      },
      {
        path: 'overtime-policies/:id/edit',
        name: 'overtime-policies.edit',
        component: OvertimePolicyFormPage,
        meta: { permission: 'hr.overtime_policies.manage' },
      },
    ],
  },
]
