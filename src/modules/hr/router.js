// src/modules/hr/router.js

// ==========================================
// 1. استيراد شاشات إعدادات الموارد البشرية (الهيكل التنظيمي)
// ==========================================
const DepartmentsList = () => import('./views/departments/DepartmentsList.vue')
const PositionsList = () => import('./views/positions/PositionsList.vue')

// ==========================================
// 2. استيراد شاشات شؤون الموظفين والعقود
// ==========================================
const EmployeesList = () => import('./views/employees/EmployeesList.vue')
const EmployeeFormPage = () => import('./views/employees/EmployeeFormPage.vue')

const ContractsList = () => import('./views/contracts/ContractsList.vue')
const ContractFormPage = () => import('./views/contracts/ContractFormPage.vue')

// ==========================================
// 3. استيراد شاشات الحضور والطلبات (الخدمة الذاتية والإدارة)
// ==========================================
const AttendanceList = () => import('./views/attendance/AttendanceList.vue')
const LeavesList = () => import('./views/leaves/LeavesList.vue')
const LoansList = () => import('./views/loans/LoansList.vue')

// ==========================================
// 4. استيراد شاشات الرواتب والأجور
// ==========================================
const SalaryRulesList = () => import('./views/payroll/SalaryRulesList.vue')
const SalaryStructuresList = () => import('./views/payroll/SalaryStructuresList.vue')
const PayrollInputsList = () => import('./views/payroll/PayrollInputsList.vue')
const PayrollBatchesList = () => import('./views/payroll/PayrollBatchesList.vue') // شاشة توليد وترحيل الرواتب

export default [
  {
    path: 'hr',
    children: [
      // --- إعدادات الموارد (الإدارات والوظائف) ---
      {
        path: 'departments',
        name: 'DepartmentsList',
        component: DepartmentsList,
        meta: { permission: 'department.view' },
      },
      {
        path: 'positions',
        name: 'PositionsList',
        component: PositionsList,
        meta: { permission: 'position.view' },
      },

      // --- شؤون الموظفين ---
      {
        path: 'employees',
        name: 'EmployeesList',
        component: EmployeesList,
        meta: { permission: 'employee.view' },
      },
      {
        path: 'employees/create',
        name: 'employees.create',
        component: EmployeeFormPage,
        meta: { permission: 'employee.create' },
      },
      {
        path: 'employees/:id/edit',
        name: 'employees.edit',
        component: EmployeeFormPage,
        meta: { permission: 'employee.update' },
      },

      // --- العقود ---
      {
        path: 'contracts',
        name: 'ContractsList',
        component: ContractsList,
        meta: { permission: 'contract.view' },
      },
      {
        path: 'contracts/create',
        name: 'contracts.create',
        component: ContractFormPage,
        meta: { permission: 'contract.create' },
      },
      {
        path: 'contracts/:id/edit',
        name: 'contracts.edit',
        component: ContractFormPage,
        meta: { permission: 'contract.update' },
      },

      // --- الحضور والطلبات ---
      {
        path: 'attendance',
        name: 'AttendanceList',
        component: AttendanceList,
        meta: { permission: 'attendance.view' },
      },
      {
        path: 'leaves',
        name: 'LeavesList',
        component: LeavesList,
        meta: { permission: 'leave.view' },
      },
      {
        path: 'loans',
        name: 'LoansList',
        component: LoansList,
        meta: { permission: 'loan.view' },
      },

      // --- الرواتب والأجور ---
      {
        path: 'salary-rules',
        name: 'SalaryRulesList',
        component: SalaryRulesList,
        meta: { permission: 'salary_rule.view' },
      },
      {
        path: 'salary-structures',
        name: 'SalaryStructuresList',
        component: SalaryStructuresList,
        meta: { permission: 'salary_structure.view' },
      },
      {
        path: 'payroll-inputs',
        name: 'PayrollInputsList',
        component: PayrollInputsList,
        meta: { permission: 'payroll_input.view' },
      },
      {
        path: 'payroll-batches',
        name: 'PayrollBatchesList',
        component: PayrollBatchesList,
        meta: { permission: 'payroll.view' },
      },
    ],
  },
]
