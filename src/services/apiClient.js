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
    // التحقق مما إذا كانت الاستجابة تعود لخطأ عدم الصلاحية أو فشل التحقق المحمي 401
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore()

      // 🛡️ تحديد الروابط العامة (Guest Endpoints) التي تعتمد الـ 401 كاستجابة منطقية للفشل
      const guestEndpoints = [
        '/login',
        '/register',
        '/send-otp',
        '/forgot-password',
        '/reset-password',
      ]

      // فحص إذا كان الطلب الحالي ينتمي للمنافذ العامة للضيوف
      const isGuestRequest =
        error.config && guestEndpoints.some((endpoint) => error.config.url.includes(endpoint))

      if (isGuestRequest) {
        // نمرر الخطأ فوراً للمكون (Component) ليعرضه للمستخدم في الواجهة بدون عمل أي إعادة توجيه
        return Promise.reject(error)
      }

      // 🛡️ درع حماية لكسر التكرار: إذا كان الطلب الفاشل هو نفسه طلب تسجيل الخروج
      if (error.config && error.config.url.includes('/logout')) {
        authStore.token = null
        authStore.user = null
        localStorage.removeItem('token')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      console.warn(
        '🚫 تم رصد جلسة باطلة أو منتهية لطلب محمي (خطأ 401). جاري تطهير البيانات محلياً وطرد المستخدم...',
      )

      // التنظيف المحلي الفوري الآمن وإعادة التوجيه للمستخدمين المسجلين فقط الذين انتهت جلستهم
      authStore.token = null
      authStore.user = null
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export default apiClient
