<template>
  <AuthCardWrapper
    :title="brandingStore.appName"
    subtitle="نظام التخطيط الموحد للموارد ERP"
    :error-message="errorMessage"
    max-width="md"
  >
    <form @submit.prevent="handleLogin" class="space-y-6">
      <div class="space-y-1 relative">
        <div class="flex items-center justify-between text-xs px-1">
          <span class="text-slate-400">رقم الهاتف</span>
          <div class="flex items-center space-x-1 space-x-reverse">
            <span
              :class="
                credentials.phone.length === 10 ? 'text-green-400 font-bold' : 'text-slate-500'
              "
            >
              {{ credentials.phone.length }}/10
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
            v-model="credentials.phone"
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
          :type="showPassword ? 'text' : 'password'"
          v-model="credentials.password"
          placeholder="كلمة المرور"
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

      <div class="flex items-center justify-between text-sm text-slate-300 px-1">
        <label class="flex items-center space-x-2 space-x-reverse cursor-pointer select-none">
          <input type="checkbox" v-model="rememberMe" class="form-checkbox" />
          <span class="mr-2">تذكرني</span>
        </label>
        <router-link to="/forgot-password" class="forgot-link">نسيت كلمة المرور؟</router-link>
      </div>

      <button type="submit" :disabled="isLoading || !isValidPhone" class="submit-button">
        <span v-if="isLoading">جاري التحقق والدخول...</span>
        <span v-else>تسجيل الدخول</span>
      </button>

      <div class="mt-6 text-center text-sm text-slate-400">
        ليس لديك حساب؟
        <router-link to="/register" class="register-link font-semibold">
          تقديم طلب تسجيل جديد
        </router-link>
      </div>
    </form>
  </AuthCardWrapper>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import AuthCardWrapper from './AuthCardWrapper.vue'
import { useBrandingStore } from '@/stores/brandingStore'
const brandingStore = useBrandingStore()

const authStore = useAuthStore()
const router = useRouter()
const credentials = reactive({ phone: '', password: '' })
const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false) // حالة التحكم برؤية كلمة المرور

const isValidPhone = computed(() => {
  return /^[0-9]{10}$/.test(credentials.phone)
})

onMounted(() => {
  const savedPhone = localStorage.getItem('remembered_phone')
  if (savedPhone) {
    credentials.phone = savedPhone
    rememberMe.value = true
  }
})

const handleLogin = async () => {
  if (!isValidPhone.value) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    await authStore.login(credentials)
    if (rememberMe.value) {
      localStorage.setItem('remembered_phone', credentials.phone)
    } else {
      localStorage.removeItem('remembered_phone')
    }
    router.push(authStore.returnUrl || '/app/dashboard')
  } catch (error) {
    if (error.response && error.response.status === 403) {
      errorMessage.value =
        error.response.data.message || 'حسابك قيد المراجعة حالياً من قبل الإدارة.'
    } else if (error.response && error.response.status === 401) {
      errorMessage.value = 'رقم الهاتف أو كلمة المرور غير صحيحة.'
    } else {
      errorMessage.value = 'تعذر الاتصال بالسيرفر، يرجى المحاولة مرة أخرى لاحقاً.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.form-checkbox {
  appearance: none;
  background-color: rgba(17, 24, 39, 0.8);
  border: 1px solid #374151;
  padding: 9px;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}
.form-checkbox:checked {
  background-color: #2563eb;
  border-color: #2563eb;
}
.form-checkbox:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 11px;
  font-weight: bold;
}

.forgot-link,
.register-link {
  color: #2563eb;
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-link:hover,
.register-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

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
