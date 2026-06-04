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

      <div class="relative">
        <input
          type="text"
          v-model="form.username"
          placeholder="اسم المستخدم المستعار (اختياري)"
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
            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21 Grama8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
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
          :type="showPassword ? 'text' : 'password'"
          v-model="form.password"
          placeholder="كلمة المرور الجديدة"
          required
          class="form-input pl-10"
        />

        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
        >
          <svg
            v-if="showPassword"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.822 7.822L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      <div class="relative">
        <input
          :type="showConfirmPassword ? 'text' : 'password'"
          v-model="form.password_confirmation"
          placeholder="تأكيد كلمة المرور"
          required
          class="form-input pl-10"
        />

        <button
          type="button"
          @click="showConfirmPassword = !showConfirmPassword"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
        >
          <svg
            v-if="showConfirmPassword"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.822 7.822L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
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
  username: '',
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
const showPassword = ref(false)
const showConfirmPassword = ref(false)
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
