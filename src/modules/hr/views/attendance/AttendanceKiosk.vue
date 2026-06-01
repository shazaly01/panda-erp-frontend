<template>
  <div
    class="fixed inset-0 z-[100] w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden font-sans select-none"
    @click="keepFocus"
  >
    <div
      class="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-float"
    ></div>
    <div
      class="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-float-reverse"
    ></div>

    <div class="w-full max-w-2xl relative z-10 flex flex-col items-center">
      <div class="mb-6 text-center animate-fade-in">
        <div
          class="w-16 h-16 bg-slate-900/80 border border-slate-800 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)] border-t-blue-500/30"
        >
          <svg
            class="w-9 h-9 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
        </div>
        <h1 class="text-3xl font-black text-white mb-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          نظام
          <span class="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
            >المنارة</span
          >
        </h1>
        <h2 class="text-[11px] text-blue-400/90 font-bold uppercase tracking-[0.2em]">
          تسجيل الحضور والانصراف الذكي
        </h2>
      </div>

      <div
        class="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/60 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] rounded-3xl p-6 w-full max-w-md text-center mb-6 border-t-white/5"
      >
        <div
          class="text-5xl font-mono font-black text-white tracking-tighter mb-1 bg-gradient-to-b from-white to-slate-200 bg-clip-text"
          dir="ltr"
        >
          {{ currentTime }}
        </div>
        <div class="text-xs font-bold text-slate-400">{{ currentDate }}</div>
      </div>

      <div class="relative w-full max-w-md group mb-8">
        <div
          class="absolute inset-0 bg-blue-500/5 rounded-xl blur-xl transition-all duration-500 group-focus-within:bg-blue-500/15 animate-pulse"
        ></div>
        <input
          ref="barcodeInput"
          v-model="employeeNumber"
          @keyup.enter="handleScan"
          @blur="keepFocus"
          type="text"
          placeholder="مرر بطاقتك الوظيفية الآن..."
          class="relative w-full text-center text-lg font-bold bg-slate-950/90 border border-slate-800 text-white placeholder-slate-600 rounded-xl px-6 py-4 outline-none transition-all duration-300 focus:border-blue-500/50 focus:shadow-[0_0_25px_rgba(59,130,246,0.2)]"
          autocomplete="off"
          autofocus
        />
        <div class="absolute right-4 top-1/2 -translate-y-1/2 flex h-2 w-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"
          ></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </div>
      </div>

      <div class="h-96 w-full max-w-md relative">
        <Transition
          enter-active-class="transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
          enter-from-class="opacity-0 translate-y-8 scale-95 blur-sm"
          enter-to-class="opacity-100 translate-y-0 scale-100 blur-0"
          leave-active-class="transition-all duration-300 cubic-bezier(0.7, 0, 0.84, 0)"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95 translate-y-4 blur-sm"
        >
          <div
            v-if="scanResult"
            :class="[
              'p-6 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] flex flex-col items-center border transition-all duration-500 backdrop-blur-2xl relative overflow-hidden w-full text-center',
              resultTheme.card,
              resultTheme.glow,
            ]"
          >
            <div
              class="relative w-36 h-36 rounded-full p-[3px] overflow-hidden bg-slate-800 shadow-[0_0_30px_rgba(234,179,8,0.2)] flex items-center justify-center mb-4 z-10"
            >
              <div
                class="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_50%,#eab308_90%,#eab308_100%)] animate-laser-rotate"
              ></div>
              <div
                class="relative w-full h-full bg-slate-900 rounded-full overflow-hidden flex items-center justify-center"
              >
                <img
                  v-if="scanResult.profile_photo"
                  :src="scanResult.profile_photo"
                  class="w-full h-full object-cover scale-[1.02]"
                  alt="Employee"
                />
                <div
                  v-else
                  v-html="resultTheme.icon"
                  class="text-white filter drop-shadow-lg"
                ></div>
              </div>
            </div>

            <div class="z-10 w-full flex flex-col items-center">
              <h3 class="text-2xl font-black mb-2 text-white tracking-wide drop-shadow-md">
                {{ scanResult.employee_name || 'تنبيه النظام' }}
              </h3>
              <p class="text-sm font-bold text-slate-300 opacity-90 max-w-xs mb-4 leading-relaxed">
                {{ scanResult.message }}
              </p>

              <div
                v-if="scanResult.voucher"
                class="bg-slate-950/80 border border-sky-500/20 rounded-xl px-4 py-1.5 shadow-[0_4px_15px_rgba(14,165,233,0.1)] backdrop-blur-md mb-4 animate-pulse-slow"
              >
                <span
                  class="block text-[8px] text-sky-400 font-black uppercase tracking-widest mb-0.5"
                  >كود الإنترنت اليومي (1GB)</span
                >
                <span class="text-lg font-mono font-black text-white tracking-[0.2em]">{{
                  scanResult.voucher
                }}</span>
              </div>

              <div
                v-if="scanResult.time"
                class="bg-slate-950/40 border border-slate-850 px-4 py-2 rounded-xl min-w-[100px]"
              >
                <span
                  class="block text-[9px] font-black uppercase tracking-widest mb-0.5 text-slate-500"
                  >الوقت المسجل</span
                >
                <span :class="['text-xl font-mono font-black', resultTheme.time]" dir="ltr">{{
                  scanResult.time
                }}</span>
              </div>
            </div>
          </div>
        </Transition>

        <Transition
          enter-active-class="transition duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="attendanceStore.loading"
            class="absolute inset-0 flex items-center justify-center"
          >
            <div
              class="bg-slate-900/95 backdrop-blur-xl px-6 py-3 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-slate-800 flex items-center gap-3"
            >
              <svg class="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
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
              <span class="text-xs font-black text-slate-200"
                >جاري معالجة البيانات بالسيرفر...</span
              >
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useAttendanceLogStore } from '@/modules/hr/stores/attendanceLogStore'

const attendanceStore = useAttendanceLogStore()
const currentTime = ref('')
const currentDate = ref('')
const barcodeInput = ref(null)
const employeeNumber = ref('')
const scanResult = ref(null)
let timer
let resultTimeout

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  currentDate.value = now.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const keepFocus = () => {
  nextTick(() => {
    if (barcodeInput.value) barcodeInput.value.focus()
  })
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  keepFocus()
})

onUnmounted(() => {
  clearInterval(timer)
  clearTimeout(resultTimeout)
})

const handleScan = async () => {
  const code = employeeNumber.value.trim()
  employeeNumber.value = ''
  if (!code || attendanceStore.loading) return

  scanResult.value = null
  clearTimeout(resultTimeout)

  try {
    const data = await attendanceStore.scanBarcode(code)
    setTimeout(() => {
      scanResult.value = {
        status: data.status,
        action: data.action,
        employee_name: data.employee_name,
        message: data.message,
        time: data.time,
        voucher: data.voucher,
        profile_photo: data.profile_photo,
      }
    }, 50)
  } catch (error) {
    setTimeout(() => {
      scanResult.value = {
        status: 'error',
        message: attendanceStore.error || 'بطاقة غير صالحة، يرجى المراجعة.',
        employee_name: null,
      }
    }, 50)
  } finally {
    keepFocus()
    resultTimeout = setTimeout(() => {
      scanResult.value = null
    }, 8000)
  }
}

// دمج وإدارة الثيمات البصرية بشكل مقتضب لمنع تضخم الـ HTML
const resultTheme = computed(() => {
  if (!scanResult.value) return {}
  const status = scanResult.value.status
  const action = scanResult.value.action

  if (status === 'success') {
    return action === 'check_in'
      ? {
          card: 'bg-emerald-950/20 border-emerald-500/30',
          glow: 'shadow-[0_0_50px_rgba(16,185,129,0.15)]',
          time: 'text-emerald-400',
          icon: '<svg class="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>',
        }
      : {
          card: 'bg-blue-950/20 border-blue-500/30',
          glow: 'shadow-[0_0_50px_rgba(59,130,246,0.15)]',
          time: 'text-blue-400',
          icon: '<svg class="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>',
        }
  }

  return status === 'warning'
    ? {
        card: 'bg-amber-950/20 border-amber-500/30',
        glow: 'shadow-[0_0_50px_rgba(245,158,11,0.15)]',
        time: 'text-amber-400',
        icon: '<svg class="w-12 h-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>',
      }
    : {
        card: 'bg-rose-950/20 border-rose-500/30',
        glow: 'shadow-[0_0_50px_rgba(244,63,94,0.15)]',
        time: 'text-rose-400',
        icon: '<svg class="w-12 h-12 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>',
      }
})
</script>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}
@keyframes float-reverse {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(20px) scale(0.95);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes laser-rotate {
  100% {
    transform: rotate(360deg);
  }
}
@keyframes pulseSlow {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.95;
    transform: scale(0.98);
  }
}
.animate-float {
  animation: float 10s ease-in-out infinite;
}
.animate-float-reverse {
  animation: float-reverse 12s ease-in-out infinite;
}
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}
.animate-laser-rotate {
  animation: laser-rotate 2s linear infinite;
}
.animate-pulse-slow {
  animation: pulseSlow 2.5s ease-in-out infinite;
}
</style>
