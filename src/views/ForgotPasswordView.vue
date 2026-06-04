<template>
  <AuthCardWrapper
    title="استعادة كلمة المرور"
    subtitle="أدخل رقم هاتفك المسجل لإرسال رمز إعادة التعيين"
    :error-message="errorMessage"
    max-width="md"
  >
    <form @submit.prevent="handleForgotPassword" class="space-y-6">
      <div class="relative">
        <input
          type="text"
          v-model="form.phone"
          placeholder="رقم الهاتف المسجل بالنظام"
          required
          class="form-input"
        />
        <svg
          class="input-icon"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.454-5.117-3.746-6.564-6.564l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
          />
        </svg>
      </div>

      <button type="submit" :disabled="isLoading" class="submit-button">
        <span v-if="isLoading">جاري التحقق وإرسال الرمز...</span>
        <span v-else>إرسال رمز التحقق (OTP)</span>
      </button>

      <div class="flex items-center justify-between text-sm mt-6 px-1">
        <router-link to="/login" class="back-link">العودة لتسجيل الدخول</router-link>
        <router-link to="/reset-password" class="back-link text-blue-400"
          >لديك كود بالفعل؟</router-link
        >
      </div>
    </form>
  </AuthCardWrapper>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import AuthCardWrapper from './AuthCardWrapper.vue'

const authStore = useAuthStore()
const router = useRouter()
const form = reactive({ phone: '' })
const isLoading = ref(false)
const errorMessage = ref('')

const handleForgotPassword = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await authStore.forgotPassword({ phone: form.phone })

    // حفظ رقم الهاتف في الذاكرة المؤقتة لراحة المستخدم في الشاشة القادمة
    localStorage.setItem('password_reset_phone', form.phone)

    // الانتقال التلقائي لشاشة إدخال الكود وتغيير كلمة المرور
    router.push('/reset-password')
  } catch (error) {
    if (error.response && error.response.status === 429) {
      errorMessage.value =
        'لقد تجاوزت الحد المسموح به من المحاولات. يرجى الانتظار دقيقة قبل المحاولة مرة أخرى.'
    } else {
      errorMessage.value =
        error.response?.data?.message || 'رقم الهاتف المدخل غير مسجل لدينا في النظام.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.back-link {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.2s ease;
}
.back-link:hover {
  color: #f9fafb;
  text-decoration: underline;
}
</style>
