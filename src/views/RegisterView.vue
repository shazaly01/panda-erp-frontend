<template>
  <AuthCardWrapper
    title="إنشاء حساب جديد"
    subtitle="قم بتقديم طلب تسجيل في منظومة باندا ERP"
    :error-message="errorMessage"
    :success-message="successMessage"
    max-width="lg"
  >
    <form v-if="!successMessage" @submit.prevent="handleRegister" class="space-y-4">
      <div class="relative">
        <input
          type="text"
          v-model="form.full_name"
          placeholder="الاسم الكامل للموظف"
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
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      </div>

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

        <div class="flex space-x-2 space-x-reverse relative">
          <div class="relative flex-1">
            <input
              type="text"
              v-model="form.phone"
              placeholder="0912345678"
              required
              maxlength="10"
              :disabled="otpSent"
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

          <button
            type="button"
            @click="sendVerificationCode"
            :disabled="isSendingOtp || countdown > 0 || !isValidPhone"
            class="otp-send-btn px-4 text-xs font-bold rounded-lg text-white transition-all duration-200"
          >
            <span v-if="isSendingOtp">انتظر...</span>
            <span v-else-if="countdown > 0">إعادة إرسال ({{ countdown }}ث)</span>
            <span v-else-if="otpSent">إعادة إرسال الرمز</span>
            <span v-else>إرسال الرمز</span>
          </button>
        </div>
      </div>

      <div class="relative transition-all duration-300" v-if="otpSent">
        <input
          type="text"
          v-model="form.code"
          placeholder="أدخل رمز التحقق المكون من 6 أرقام"
          required
          maxlength="6"
          class="form-input border-dashed border-blue-500/50"
        />
        <svg
          class="input-icon text-blue-400"
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
        <p class="text-xs text-green-400 mt-1 px-1">تم إرسال كود التحقق بنجاح إلى هاتفك.</p>
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
          placeholder="تأكيد كلمة المرور"
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

      <button type="submit" :disabled="isLoading || !otpSent" class="submit-button">
        <span v-if="isLoading">جاري معالجة الحساب...</span>
        <span v-else>تقديم طلب التسجيل للإدارة</span>
      </button>

      <div class="mt-4 text-center text-sm text-slate-400">
        لديك حساب بالفعل؟
        <router-link to="/login" class="login-link font-semibold">تسجيل الدخول من هنا</router-link>
      </div>
    </form>

    <div v-else class="mt-4">
      <router-link to="/login" class="submit-button block text-center pt-2"
        >الانتقال لصفحة الدخول</router-link
      >
    </div>
  </AuthCardWrapper>
</template>

<script setup>
import { ref, reactive, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AuthCardWrapper from './AuthCardWrapper.vue'

const authStore = useAuthStore()
const form = reactive({
  full_name: '',
  phone: '',
  password: '',
  password_confirmation: '',
  code: '',
})

const isSendingOtp = ref(false)
const otpSent = ref(false)
const isLoading = ref(false)
const countdown = ref(0)
const errorMessage = ref('')
const successMessage = ref('')
let timerInterval = null

const isValidPhone = computed(() => {
  return /^[0-9]{10}$/.test(form.phone)
})

const sendVerificationCode = async () => {
  if (!isValidPhone.value) return
  isSendingOtp.value = true
  errorMessage.value = ''
  try {
    await authStore.sendOtp({
      phone: form.phone,
      build_mode: 'release',
    })
    otpSent.value = true
    startTimer()
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || 'فشل إرسال كود التحقق، تأكد من صحة رقم الهاتف.'
  } finally {
    isSendingOtp.value = false
  }
}

const startTimer = () => {
  countdown.value = 60
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
}

const handleRegister = async () => {
  if (form.password !== form.password_confirmation) {
    errorMessage.value = 'كلمات المرور المدخلة غير متطابقة.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await authStore.register(form)
    successMessage.value =
      response.data?.message ||
      'تم تقديم طلب تسجيل حسابك بنجاح وهو بانتظار موافقة المشرف وتعيين الصلاحيات.'
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || 'فشل تقديم طلب التسجيل، يرجى مراجعة الكود أو البيانات.'
  } finally {
    isLoading.value = false
  }
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
.otp-send-btn {
  background: linear-gradient(135deg, #1e40af, #2563eb);
  border: 1px solid rgba(55, 65, 81, 0.5);
  cursor: pointer;
}
.otp-send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  box-shadow: 0 0 15px rgba(37, 99, 235, 0.4);
}
.otp-send-btn:disabled {
  background: #374151;
  color: #9ca3af;
  cursor: not-allowed;
}
.login-link {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
}
.login-link:hover {
  color: #60a5fa;
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
