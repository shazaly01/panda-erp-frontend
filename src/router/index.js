import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// --- استيراد التخطيطات الرئيسية (Layouts) ---
import AppLayout from '@/components/layout/AppLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'

// --- استيراد المكونات بشكل كسول (Lazy Loading) للموديولات ---
const UsersList = () => import('@/views/users/UsersList.vue')
const RolesList = () => import('@/views/roles/RolesList.vue')
const BackupsList = () => import('@/views/settings/BackupsList.vue')

// --- استيراد مكونات موديول طلبات الدعم والمنح ---
const GrantRequestsList = () => import('@/views/grantRequests/GrantRequestsListView.vue')
const GrantRequestFormView = () => import('@/views/grantRequests/GrantRequestFormView.vue')
const GrantRequestPrintView = () => import('@/views/grantRequests/GrantRequestPrintView.vue')

// --- استيراد مكونات التوثيق الجديدة المنفصلة مع الحفاظ على الهيكلية العالمية ---
const RegisterView = () => import('@/views/RegisterView.vue')
const ForgotPasswordView = () => import('@/views/ForgotPasswordView.vue')
const ResetPasswordView = () => import('@/views/ResetPasswordView.vue')

// --- استيراد الصفحات الأساسية الثابتة ---
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'

// ==============================================================
// 🌟 استيراد مسارات الموديولات (المحاسبة، الموارد البشرية، المخازن، المشتريات)
// ==============================================================
import accountingRoutes from '@/modules/accounting/router'
import { hrDashboardRoutes, hrPublicRoutes } from '@/modules/hr/router'
import inventoryRoutes from '@/modules/inventory/router'
import purchasingRoutes from '@/modules/purchasing/router'

const routes = [
  // --- المسارات العامة (لا تتطلب مصادقة) ---
  {
    path: '/',
    component: AuthLayout,
    meta: { requiresGuest: true },
    children: [
      { path: 'login', name: 'Login', component: LoginView },
      { path: 'register', name: 'Register', component: RegisterView },
      { path: 'forgot-password', name: 'ForgotPassword', component: ForgotPasswordView },
      { path: 'reset-password', name: 'ResetPassword', component: ResetPasswordView },
      { path: '', redirect: '/login' },
    ],
  },

  // --- مسار الطباعة المستقل (خارج AppLayout ليعمل كصفحة بيور تماماً بدون القوائم) ---
  {
    path: '/grant-requests/:id/print',
    name: 'GrantRequestPrint',
    component: GrantRequestPrintView,
    meta: { requiresAuth: true, permission: 'grant_request.print' },
  },

  // --- المسارات المحمية (تتطلب مصادقة وتعمل داخل AppLayout) ---
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { permission: 'dashboard.view' },
      },

      // ==============================================================
      // 🌟 دمج مسارات الموديولات هنا كأبناء لـ AppLayout
      // ==============================================================
      ...accountingRoutes,
      ...hrDashboardRoutes,
      ...inventoryRoutes,
      ...purchasingRoutes,

      // --- مسارات طلبات الدعم والمنح المؤسسية ---
      {
        path: 'grant-requests',
        name: 'GrantRequestsList',
        component: GrantRequestsList,
        meta: { permission: 'grant_request.view' },
      },
      {
        path: 'grant-requests/create',
        name: 'GrantRequestCreate',
        component: GrantRequestFormView,
        meta: { permission: 'grant_request.create' },
      },
      {
        path: 'grant-requests/:id/edit',
        name: 'GrantRequestEdit',
        component: GrantRequestFormView,
        meta: { permission: 'grant_request.update' },
      },

      {
        path: 'users',
        name: 'UsersList',
        component: UsersList,
        meta: { permission: 'user.view' },
      },
      {
        path: 'roles',
        name: 'RolesList',
        component: RolesList,
        meta: { permission: 'role.view' },
      },
      {
        path: 'settings/backups',
        name: 'BackupsList',
        component: BackupsList,
        meta: { permission: 'backup.view' },
      },
      { path: '', redirect: '/app/dashboard' },
    ],
  },

  ...hrPublicRoutes,
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --- حارس التنقل العام (Global Navigation Guard) ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      authStore.returnUrl = to.fullPath
      next({ name: 'Login' })
    } else {
      const requiredPermission = to.meta.permission
      if (requiredPermission && !authStore.can(requiredPermission)) {
        console.warn(
          `Access denied: route "${String(to.name)}" requires permission "${requiredPermission}"`,
        )
        next({ name: 'Dashboard' })
      } else {
        next()
      }
    }
  } else if (to.matched.some((record) => record.meta.requiresGuest) && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
