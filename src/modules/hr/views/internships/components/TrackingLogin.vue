<template>
  <div class="space-y-6 animate-fadeIn">
    <div class="text-center space-y-1.5">
      <h2 class="text-xl font-black text-slate-900 tracking-tight">
        بوابة متابعة الطلبات الخارجية
      </h2>
      <p class="text-xs text-slate-400 font-semibold max-w-xs mx-auto leading-relaxed">
        أدخل رقم الهاتف الجوال وكود المتابعة السري المكون من 5 أرقام للاستعلام عن حالة طلبك أو
        تعديله.
      </p>
    </div>

    <form @submit.prevent="handleTrackSubmit" class="space-y-4">
      <!-- حقل رقم الهاتف -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-slate-700 tracking-wide"
          >رقم الهاتف الجوال *</label
        >
        <div class="relative shadow-sm rounded-xl">
          <input
            v-model="loginForm.phone"
            type="tel"
            placeholder="مثال: 09xxxxxxxx"
            required
            class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 text-right font-medium"
          />
        </div>
      </div>

      <!-- حقل كود المتابعة -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-slate-700 tracking-wide"
          >كود المتابعة السري (5 أرقام) *</label
        >
        <div class="relative shadow-sm rounded-xl">
          <input
            v-model="loginForm.tracking_code"
            type="text"
            maxlength="5"
            placeholder="أدخل الرمز المكون من 5 أرقام..."
            required
            class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 text-center font-mono tracking-[0.25em]"
          />
        </div>
      </div>

      <!-- زر الإرسال والاستدعاء -->
      <button
        type="submit"
        :disabled="store.loading"
        class="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3.5 text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
      >
        <span v-if="store.loading" class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          جاري التحقق من السجلات البوابية...
        </span>
        <span v-else>دخول بوابة المتابعة</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useInternshipStore } from '../../../stores/internshipStore'

const store = useInternshipStore()
const toast = useToast()

const emit = defineEmits(['on-tracked'])

const loginForm = ref({
  phone: '',
  tracking_code: '',
})

/**
 * معالجة الإرسال والتحقق مع معالجة الأخطاء الصارمة من الباك إيند
 */
const handleTrackSubmit = async () => {
  if (!loginForm.value.phone.trim()) return toast.error('يرجى إدخال رقم الهاتف الجوال.')
  if (loginForm.value.tracking_code.trim().length !== 5) {
    return toast.error('يجب أن يكون كود المتابعة مكوناً من 5 أرقام تماماً.')
  }

  try {
    // الاستدعاء مباشرة دون تخزين النتيجة في متغير غير مستخدم
    await store.trackApplication(loginForm.value.phone.trim(), loginForm.value.tracking_code.trim())
    toast.success('تم التحقق والدخول بنجاح.')

    // إرسال حدث النجاح فقط دون تمرير داتا
    emit('on-tracked')
  } catch {
    toast.error(store.error || 'فشل الدخول، تأكد من صحة رقم الهاتف والرمز السري.')
  }
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
