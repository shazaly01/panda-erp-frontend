import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// --- استيراد التخطيطات الرئيسية (Layouts) ---
import AppLayout from '@/components/layout/AppLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'

// --- استيراد المكونات بشكل كسول (Lazy Loading) للموديولات ---
const UsersList = () => import('@/views/users/UsersList.vue')
const RolesList = () => import('@/views/roles/RolesList.vue')
const BackupsList = () => import('@/views/settings/BackupsList.vue')

// --- استيراد مكونات التوثيق الجديدة المنفصلة مع الحفاظ على الهيكلية العالمية ---
const RegisterView = () => import('@/views/RegisterView.vue')
const ForgotPasswordView = () => import('@/views/ForgotPasswordView.vue')
const ResetPasswordView = () => import('@/views/ResetPasswordView.vue')

// --- استيراد الصفحات الأساسية الثابتة ---
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'

// ==============================================================
// 🌟 استيراد مسارات الموديولات (المحاسبة، الموارد البشرية، إلخ)
// ==============================================================
import accountingRoutes from '@/modules/accounting/router'
import { hrDashboardRoutes, hrPublicRoutes } from '@/modules/hr/router'

const routes = [
  // --- المسارات العامة (لا تتطلب مصادقة وشرطها أن يكون المستخدم ضيفاً لحمايتها) ---
  {
    path: '/',
    component: AuthLayout,
    meta: { requiresGuest: true }, // حماية مركزية تمنع المسجلين من رؤية هذه الشاشات
    children: [
      { path: 'login', name: 'Login', component: LoginView },
      { path: 'register', name: 'Register', component: RegisterView },
      { path: 'forgot-password', name: 'ForgotPassword', component: ForgotPasswordView },
      { path: 'reset-password', name: 'ResetPassword', component: ResetPasswordView },
      // إعادة توجيه المسار الجذري إلى صفحة تسجيل الدخول
      { path: '', redirect: '/login' },
    ],
  },

  // --- المسارات المحمية (تتطلب مصادقة تسجيل الدخول) ---
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
      // إعادة توجيه المسار الرئيسي للتطبيق إلى لوحة التحكم
      { path: '', redirect: '/app/dashboard' },
    ],
  },

  ...hrPublicRoutes,
  // مسار للتعامل مع الصفحات غير الموجودة (404 Fallback)
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --- حارس التنقل العام المحسن (Global Navigation Guard) ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 1. التحقق من المسارات المحمية التي تتطلب تسجيل الدخول
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // إذا انتهت الصلاحية أو لم يسجل دخوله، يتم حفظ المسار وطرده تلقائياً لشاشة الدخول
      authStore.returnUrl = to.fullPath
      next({ name: 'Login' })
    } else {
      const requiredPermission = to.meta.permission
      // التحقق من الصلاحيات والـ Permissions الممررة مع المسار
      if (requiredPermission && !authStore.can(requiredPermission)) {
        console.warn(
          `Access denied: route "${String(to.name)}" requires permission "${requiredPermission}"`,
        )
        // توجيه المستخدم للوحة التحكم إذا لم تكن لديه الصلاحية الخاصة بالشاشة
        next({ name: 'Dashboard' })
      } else {
        next() // السماح بالمرور للمسار المحمي
      }
    }
  }
  // 2. التحقق من صفحات الضيوف (دخول، تسجيل، استعادة)
  else if (to.matched.some((record) => record.meta.requiresGuest) && authStore.isAuthenticated) {
    // إذا كان المستخدم يمتلك توكن وجلسة نشطة مسبقاً، يحول تلقائياً للـ Dashboard لمنع التكرار
    next({ name: 'Dashboard' })
  }
  // 3. المسارات العامة المفتوحة بالكامل
  else {
    next()
  }
})

export default router
