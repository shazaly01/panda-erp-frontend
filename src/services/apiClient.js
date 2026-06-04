// src/services/apiClient.js
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

/**
 * 1. حارس الطلبات الصادرة (Request Interceptor)
 */
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

/**
 * 2. حارس الاستجابات الواردة المحمي معمارياً ضد الحلقات المفرغة (Anti-Infinite Loop)
 */
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    // التحقق مما إذا كانت الاستجابة تعود لخطأ عدم الصلاحية 401
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore()

      // 🛡️ درع حماية لكسر التكرار: إذا كان الطلب الفاشل هو نفسه طلب تسجيل الخروج أو الدخول
      // نقوم بالتنظيف المحلي الصارم فوراً دون إعادة ضرب السيرفر لمنع الـ Loop
      if (
        error.config &&
        (error.config.url.includes('/logout') || error.config.url.includes('/login'))
      ) {
        authStore.token = null
        authStore.user = null
        localStorage.removeItem('token')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      console.warn(
        '🚫 تم رصد جلسة باطلة أو منتهية (خطأ 401). جاري تطهير البيانات محلياً وطرد المستخدم...',
      )

      // التنظيف المحلي الفوري الآمن وإعادة التوجيه لضمان عزل الذاكرة الميتة
      authStore.token = null
      authStore.user = null
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export default apiClient
