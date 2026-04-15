// src/modules/hr/router.js

// ==========================================
// 1. إعدادات الموارد البشرية (الهيكل والورديات)
// ==========================================
const DepartmentsList = () => import('./views/departments/DepartmentsList.vue')
const PositionsList = () => import('./views/positions/PositionsList.vue')
const ShiftsList = () => import('./views/shifts/ShiftsList.vue')

// ==========================================
// 2. شؤون الموظفين والعقود
// ==========================================
const EmployeesList = () => import('./views/employees/EmployeesList.vue')
const EmployeeFormPage = () => import('./views/employees/EmployeeFormPage.vue')
const EmployeeProfile = () => import('./views/employees/EmployeeProfile.vue')

const ContractsList = () => import('./views/contracts/ContractsList.vue')
const ContractFormPage = () => import('./views/contracts/ContractFormPage.vue')

// ==========================================
// 3. الحضور والطلبات
// ==========================================
const AttendanceList = () => import('./views/attendance/AttendanceLogList.vue')
const LeavesList = () => import('./views/leaves/LeavesList.vue')
const LoansList = () => import('./views/loans/LoansList.vue')

// ==========================================
// 4. الرواتب والأجور
// ==========================================
const SalaryRulesList = () => import('./views/payroll/SalaryRulesList.vue')
const SalaryStructuresList = () => import('./views/payroll/SalaryStructuresList.vue')
// 💡 استيراد شاشة الفورم الجديدة للهياكل
const SalaryStructureForm = () => import('./views/payroll/SalaryStructureFormPage.vue')

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

      // --- الحضور والطلبات ---
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

      // --- الرواتب والأجور ---
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
      // 🚀 إضافة مسارات إنشاء وتعديل هياكل الرواتب المفقودة
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

      // --- الإعدادات والهيكل التنظيمي ---
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
      {
        path: 'shifts',
        name: 'ShiftsList',
        component: ShiftsList,
        meta: { permission: 'hr.shifts.view' },
      },
    ],
  },
]
