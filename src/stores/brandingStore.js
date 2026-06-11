import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBrandingStore = defineStore('branding', () => {
  // --- State ---
  const appName = ref('نظام ERP')
  const logoFullUrl = ref('')
  const logoMiniUrl = ref('')
  const faviconUrl = ref('')
  const isLoaded = ref(false)

  // --- Actions ---
  /**
   * جلب الإعدادات البصرية مباشرة من الباك إيند بشكل معزول
   */
  async function fetchBranding() {
    try {
      const apiUrl = import.meta.env.VITE_API_URL

      // استخدام native fetch هنا هو الأفضل عالمياً لعزل مرحلة الإقلاع (Bootstrapping)
      const response = await fetch(`${apiUrl}/branding`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const result = await response.json()
      const { app_name, logo_full_url, logo_mini_url, favicon_url } = result.data

      // تحديث الحالة
      appName.value = app_name
      logoFullUrl.value = logo_full_url
      logoMiniUrl.value = logo_mini_url
      faviconUrl.value = favicon_url

      // تحديث عناصر الـ DOM للمتصفح فوراً
      updateDOM()
    } catch (error) {
      console.error('🔴 فشل جلب الهوية البصرية للنظام، سيتم اعتماد الإعدادات الافتراضية:', error)
    } finally {
      isLoaded.value = true
    }
  }

  /**
   * تحديث عنوان المتصفح والأيقونة العليا ديناميكياً
   */
  function updateDOM() {
    // 1. تحديث عنوان الصفحة
    if (appName.value) {
      document.title = appName.value
    }

    // 2. تحديث الأيقونة باستخدام الـ ID الجديد
    const favicon = document.getElementById('app-favicon')
    if (favicon) {
      favicon.href = faviconUrl.value
    }
  }

  // --- Return public API ---
  return {
    appName,
    logoFullUrl,
    logoMiniUrl,
    faviconUrl,
    isLoaded,
    fetchBranding,
  }
})
