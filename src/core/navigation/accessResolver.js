// src/core/navigation/accessResolver.js
import { appMenus, systemSettingsMenu } from '@/core/menus'

// الترتيب القياسي لموديولات النظام عند البحث عن أول موديول متاح للمستخدم
export const MODULE_ORDER = ['accounting', 'sales', 'purchasing', 'inventory', 'hr']

/**
 * التحقق مما إذا كان المستخدم يملك صلاحية الوصول إلى مسار معين (بما في ذلك المسارات الأب والابن)
 * @param {import('vue-router').RouteLocationNormalizedLoaded | import('vue-router').RouteLocation} route
 * @param {Object} authStore
 * @returns {boolean}
 */
export function canAccessRoute(route, authStore) {
  if (!route || !Array.isArray(route.matched) || route.matched.length === 0) {
    return false
  }

  return route.matched.every((record) => {
    const requiredPermission = record.meta?.permission
    if (!requiredPermission) return true
    return authStore.can(requiredPermission)
  })
}

/**
 * التحقق من وجود المسار بالاسم في الراوتر وأن المستخدم يملك صلاحية فتحه
 * @param {string} routeName
 * @param {Object} authStore
 * @param {import('vue-router').Router} router
 * @returns {boolean}
 */
function isRouteNavigableAndPermitted(routeName, authStore, router) {
  if (!routeName || !router || !router.hasRoute(routeName)) {
    return false
  }

  try {
    const resolved = router.resolve({ name: routeName })
    return canAccessRoute(resolved, authStore)
  } catch {
    return false
  }
}

/**
 * استخراج أسماء المسارات المتاحة للمستخدم من قائمة عناصر بالترتيب
 * @param {Array} menuItems
 * @param {Object} authStore
 * @param {import('vue-router').Router} router
 * @returns {string[]}
 */
function extractAccessibleRouteNames(menuItems, authStore, router) {
  if (!Array.isArray(menuItems)) return []

  const accessibleRoutes = []

  for (const item of menuItems) {
    if (!item || item.type === 'header') continue

    if (Array.isArray(item.children)) {
      for (const child of item.children) {
        if (!child || child.type === 'header' || !child.routeName) continue

        const hasMenuPermission = !child.permission || authStore.can(child.permission)
        if (hasMenuPermission && isRouteNavigableAndPermitted(child.routeName, authStore, router)) {
          accessibleRoutes.push(child.routeName)
        }
      }
    } else if (item.routeName) {
      const hasMenuPermission = !item.permission || authStore.can(item.permission)
      if (hasMenuPermission && isRouteNavigableAndPermitted(item.routeName, authStore, router)) {
        accessibleRoutes.push(item.routeName)
      }
    }
  }

  return [...new Set(accessibleRoutes)]
}

/**
 * جلب المسارات التشغيلية المتاحة للمستخدم داخل موديول محدد (باستثناء عناصر إدارة النظام المشتركة)
 * @param {string} moduleKey
 * @param {Object} authStore
 * @param {import('vue-router').Router} router
 * @returns {string[]}
 */
export function getModuleAccessibleRoutes(moduleKey, authStore, router) {
  const rawMenu = appMenus[moduleKey]
  if (!Array.isArray(rawMenu)) return []

  const moduleOnlyItems = rawMenu.filter((item) => item !== systemSettingsMenu)
  return extractAccessibleRouteNames(moduleOnlyItems, authStore, router)
}

/**
 * جلب قائمة مفاتيح الموديولات التي يملك المستخدم فيها شاشة واحدة متاحة على الأقل
 * @param {Object} authStore
 * @param {import('vue-router').Router} router
 * @returns {string[]}
 */
export function getAccessibleModules(authStore, router) {
  const allKeys = [...new Set([...MODULE_ORDER, ...Object.keys(appMenus)])]
  return allKeys.filter(
    (moduleKey) => getModuleAccessibleRoutes(moduleKey, authStore, router).length > 0,
  )
}

/**
 * جلب المسارات المتاحة للمستخدم ضمن قائمة إدارة النظام (المستخدمين، الأدوار، النسخ الاحتياطي...)
 * @param {Object} authStore
 * @param {import('vue-router').Router} router
 * @returns {string[]}
 */
export function getSystemAccessibleRoutes(authStore, router) {
  const systemChildren = systemSettingsMenu?.children || []
  return extractAccessibleRouteNames(systemChildren, authStore, router)
}

/**
 * استنتاج مفتاح الموديول التابع له مسار معين لمزامنة الشريط العلوي والقائمة الجانبية
 * @param {import('vue-router').RouteLocationNormalizedLoaded | import('vue-router').RouteLocation} route
 * @returns {string | null}
 */
export function detectModuleFromRoute(route) {
  if (!route) return null

  const routeName = route.name ? String(route.name) : null
  if (routeName) {
    for (const [moduleKey, menuItems] of Object.entries(appMenus)) {
      if (!Array.isArray(menuItems)) continue

      for (const item of menuItems) {
        if (!item || item === systemSettingsMenu || item.type === 'header') continue

        if (item.routeName === routeName) {
          return moduleKey
        }

        if (Array.isArray(item.children)) {
          const foundInChildren = item.children.some(
            (child) => child && child.type !== 'header' && child.routeName === routeName,
          )
          if (foundInChildren) {
            return moduleKey
          }
        }
      }
    }
  }

  const path = route.path || ''
  for (const moduleKey of MODULE_ORDER) {
    if (path === `/app/${moduleKey}` || path.startsWith(`/app/${moduleKey}/`)) {
      return moduleKey
    }
  }

  return null
}

/**
 * تحديد أول شاشة متاحة للمستخدم داخل موديول محدد (لوحة تحكم الموديول إن أمكن، أو أول شاشة مسموحة)
 * @param {string} moduleKey
 * @param {Object} authStore
 * @param {import('vue-router').Router} router
 * @returns {{ name: string } | null}
 */
export function resolveModuleLandingRoute(moduleKey, authStore, router) {
  const routes = getModuleAccessibleRoutes(moduleKey, authStore, router)
  return routes.length > 0 ? { name: routes[0] } : null
}

/**
 * المحرك الذكي لتحديد أفضل وجهة هبوط للمستخدم بعد تسجيل الدخول أو عند فتح النظام
 * @param {Object} authStore
 * @param {Object} appStore
 * @param {import('vue-router').Router} router
 * @param {string | null} preferredReturnUrl
 * @returns {string | { name: string }}
 */
export function resolveBestLandingTarget(authStore, appStore, router, preferredReturnUrl = null) {
  // 1. التحقق من وجود رابط عودة محفوظ وصالح ومصرح به للمستخدم
  if (
    preferredReturnUrl &&
    typeof preferredReturnUrl === 'string' &&
    preferredReturnUrl !== '/' &&
    !preferredReturnUrl.startsWith('/login') &&
    !preferredReturnUrl.startsWith('/app/unauthorized')
  ) {
    try {
      const resolved = router.resolve(preferredReturnUrl)
      const isGuestOnly = resolved.matched.some((record) => record.meta?.requiresGuest)

      if (
        resolved.matched.length > 0 &&
        resolved.name !== 'Login' &&
        resolved.name !== 'Unauthorized' &&
        !isGuestOnly &&
        canAccessRoute(resolved, authStore)
      ) {
        const detectedModule = detectModuleFromRoute(resolved)
        if (detectedModule && appStore) {
          appStore.setActiveModule(detectedModule)
        }
        return preferredReturnUrl
      }
    } catch {
      // تجاهل الرابط غير الصالح والانتقال للخيار التالي
    }
  }

  // 2. فحص الموديول النشط حالياً في الجلسة
  if (appStore?.activeModule) {
    const currentModuleTarget = resolveModuleLandingRoute(appStore.activeModule, authStore, router)
    if (currentModuleTarget) {
      return currentModuleTarget
    }
  }

  // 3. البحث عن أول موديول يملك فيه المستخدم صلاحيات تشغيلية وتفعيله تلقائياً
  const accessibleModules = getAccessibleModules(authStore, router)
  if (accessibleModules.length > 0) {
    const firstModule = accessibleModules[0]
    if (appStore) {
      appStore.setActiveModule(firstModule)
    }
    const targetRoute = resolveModuleLandingRoute(firstModule, authStore, router)
    if (targetRoute) {
      return targetRoute
    }
  }

  // 4. في حال كان المستخدم مديراً تقنياً يملك صلاحيات إدارة النظام فقط
  const systemRoutes = getSystemAccessibleRoutes(authStore, router)
  if (systemRoutes.length > 0) {
    return { name: systemRoutes[0] }
  }

  // 5. صمام الأمان الأخير: المستخدم مفعّل ولكن بدون أي صلاحيات مسندة له بعد
  return { name: 'Unauthorized' }
}
