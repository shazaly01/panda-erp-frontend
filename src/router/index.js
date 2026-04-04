// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// --- استيراد التخطيطات الرئيسية (Layouts) ---
import AppLayout from '@/components/layout/AppLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'

// 1. تأكد أولاً من استيراد المكونات في الأعلى (إذا لم تكن مستوردة)
const UsersList = () => import('@/views/users/UsersList.vue')
const RolesList = () => import('@/views/roles/RolesList.vue')
const BackupsList = () => import('@/views/settings/BackupsList.vue')

// --- استيراد الصفحات الأساسية ---
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'

// ==============================================================
// 🌟 استيراد مسارات الموديولات (المحاسبة، الموارد البشرية، إلخ)
// ==============================================================
import accountingRoutes from '@/modules/accounting/router'
// import hrRoutes from '@/modules/hr/router'
// import inventoryRoutes from '@/modules/inventory/router'

const routes = [
  // --- المسارات العامة (لا تتطلب مصادقة) ---
  {
    path: '/',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'Login', component: LoginView },
      // إعادة توجيه المسار الجذري إلى صفحة تسجيل الدخول
      { path: '', redirect: '/login' },
    ],
  },

  // --- المسارات المحمية (تتطلب مصادقة) ---
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
      // ...hrRoutes,
      // ...inventoryRoutes,

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

  // --- مسارات الطباعة المستقلة (خارج إطار AppLayout) ---
  // {
  //   path: '/print/voucher/:id',
  //   name: 'PrintVoucher',
  //   component: () => import('@/modules/accounting/views/print/PrintVoucher.vue'),
  //   meta: { requiresAuth: true, layout: 'empty' },
  // },

  // مسار للتعامل مع الصفحات غير الموجودة (404 Fallback)
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --- حارس التنقل العام (Global Navigation Guard) ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const { isAuthenticated, can } = authStore

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // حفظ المسار الذي حاول المستخدم الدخول إليه للعودة إليه بعد تسجيل الدخول
      authStore.returnUrl = to.fullPath
      next({ name: 'Login' })
    } else {
      const requiredPermission = to.meta.permission
      // التحقق من الصلاحيات إذا كان المسار يتطلب ذلك
      if (requiredPermission && !can(requiredPermission)) {
        console.warn(
          `Access denied: route "${String(to.name)}" requires permission "${requiredPermission}"`,
        )
        // توجيه المستخدم للوحة التحكم إذا لم تكن لديه الصلاحية
        next({ name: 'Dashboard' })
      } else {
        next() // السماح بالمرور
      }
    }
  } else {
    next() // المسارات العامة مسموحة دائماً
  }
})

export default router
