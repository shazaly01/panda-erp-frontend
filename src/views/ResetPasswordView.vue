<template>
  <AuthCardWrapper
    title="تعيين كلمة المرور"
    subtitle="أدخل رمز التحقق المرسل إلى هاتفك وكلمة المرور الجديدة"
    :error-message="errorMessage"
    :success-message="successMessage"
    max-width="md"
  >
    <form v-if="!successMessage" @submit.prevent="handleResetPassword" class="space-y-4">
      <div class="space-y-1 relative">
        <div class="flex items-center justify-between text-xs px-1">
          <span class="text-slate-400">رقم الهاتف</span>
          <div class="flex items-center space-x-1 space-x-reverse">
            <span :class="form.phone.length === 10 ? 'text-green-400 font-bold' : 'text-slate-500'">
              {{ form.phone.length }}/10
            </span>
            <svg
              v-if="isValidPhone"
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-green-500 animate-fade-in"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div class="relative">
          <input
            type="text"
            v-model="form.phone"
            placeholder="رقم الهاتف"
            required
            maxlength="10"
            class="form-input transition-all duration-300"
            :class="{
              'border-green-500 focus:border-green-500 focus:ring-green-500/20': isValidPhone,
            }"
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
      </div>

      <div class="relative">
        <input
          type="text"
          v-model="form.code"
          placeholder="رمز التحقق المكون من 6 أرقام"
          required
          maxlength="6"
          class="form-input text-center tracking-widest font-bold border-blue-500/30"
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
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z"
          />
        </svg>
      </div>

      <div class="relative">
        <input
          type="password"
          v-model="form.password"
          placeholder="كلمة المرور الجديدة"
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
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </div>

      <div class="relative">
        <input
          type="password"
          v-model="form.password_confirmation"
          placeholder="تأكيد كلمة المرور الجديدة"
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
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
      </div>

      <button type="submit" :disabled="isLoading || !isValidPhone" class="submit-button">
        <span v-if="isLoading">جاري تحديث كلمة المرور...</span>
        <span v-else>حفظ وتحديث كلمة المرور</span>
      </button>

      <div class="text-center text-sm mt-4">
        <router-link to="/login" class="back-link">إلغاء والعودة لصفحة الدخول</router-link>
      </div>
    </form>

    <div v-else class="mt-4">
      <router-link to="/login" class="submit-button block text-center pt-2"
        >تسجيل الدخول الآن</router-link
      >
    </div>
  </AuthCardWrapper>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AuthCardWrapper from './AuthCardWrapper.vue'

const authStore = useAuthStore()
const form = reactive({
  phone: '',
  code: '',
  password: '',
  password_confirmation: '',
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// فحص صحة طول ونوع مدخلات رقم الهاتف (10 أرقام مجردة)
const isValidPhone = computed(() => {
  return /^[0-9]{10}$/.test(form.phone)
})

onMounted(() => {
  const cachedPhone = localStorage.getItem('password_reset_phone')
  if (cachedPhone) {
    form.phone = cachedPhone
  }
})

const handleResetPassword = async () => {
  if (form.password !== form.password_confirmation) {
    errorMessage.value = 'كلمات المرور الجديدة غير متطابقة.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  try {
    await authStore.resetPassword(form)
    localStorage.removeItem('password_reset_phone')
    successMessage.value =
      'تم إعادة تعيين كلمة المرور الجديدة بنجاح، تم إلغاء كافة الجلسات السابقة للأمان.'
  } catch (error) {
    if (error.response && error.response.status === 401) {
      errorMessage.value = 'رمز التحقق المكتوب غير صحيح أو انتهت صلاحيته.'
    } else {
      errorMessage.value =
        error.response?.data?.message || 'حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً.'
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

/* حل مشكلة الخلفية البيضاء عند الإدخال التلقائي من المتصفح للمظهر الداكن */
:deep(input:-webkit-autofill),
:deep(input:-webkit-autofill:hover),
:deep(input:-webkit-autofill:focus),
:deep(input:-webkit-autofill:active) {
  -webkit-text-fill-color: #f8fafc !important;
  box-shadow: 0 0 0px 1000px #1f2937 inset !important;
  -webkit-box-shadow: 0 0 0px 1000px #1f2937 inset !important;
  transition: background-color 5000s ease-in-out 0s;
}
</style>
