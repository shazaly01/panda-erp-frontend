<template>
  <div
    class="fixed inset-0 z-[100] w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden font-sans select-none"
    @click="keepFocus"
  >
    <div
      class="absolute top-[-15%] left-[-15%] w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none animate-float-slow"
    ></div>
    <div
      class="absolute bottom-[-15%] right-[-15%] w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none animate-float-reverse"
    ></div>

    <div class="w-full max-w-3xl relative z-10 flex flex-col items-center">
      <div class="mb-8 text-center animate-fade-in">
        <div
          class="w-20 h-20 bg-slate-900/80 border border-slate-800 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_40px_rgba(59,130,246,0.25)] border-t-blue-500/30 transition-all duration-300"
        >
          <svg
            class="w-11 h-11 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
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
        <h1
          class="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        >
          نظام
          <span class="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
            >المنارة</span
          >
        </h1>
        <h2 class="text-xs md:text-sm text-blue-400/90 font-black uppercase tracking-[0.3em]">
          تسجيل الحضور والانصراف الذكي
        </h2>
      </div>

      <div
        class="bg-slate-900/40 backdrop-blur-3xl border border-slate-800/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] rounded-[2.5rem] p-8 w-full max-w-xl text-center mb-8 border-t-white/5 shadow-blue-500/[0.02]"
      >
        <div
          class="text-6xl md:text-7xl font-mono font-black text-white tracking-tighter mb-1 drop-shadow-[0_0_25px_rgba(255,255,255,0.15)] bg-gradient-to-b from-white to-slate-200 bg-clip-text"
          dir="ltr"
        >
          {{ currentTime }}
        </div>
        <div class="text-sm md:text-base font-bold text-slate-400 tracking-wide">
          {{ currentDate }}
        </div>
      </div>

      <div class="relative w-full max-w-md group mb-10">
        <div
          class="absolute inset-0 bg-blue-500/10 rounded-2xl blur-xl transition-all duration-500 group-focus-within:bg-blue-500/30 group-focus-within:scale-105 animate-pulse"
        ></div>
        <input
          ref="barcodeInput"
          v-model="employeeNumber"
          @keyup.enter="handleScan"
          @blur="keepFocus"
          type="text"
          placeholder="مرر بطاقتك الوظيفية الآن..."
          class="relative w-full text-center text-xl tracking-wider font-bold bg-slate-950/90 border-2 border-slate-800 text-white placeholder-slate-600 rounded-2xl px-6 py-5 outline-none transition-all duration-300 focus:border-blue-500/80 focus:shadow-[0_0_30px_rgba(59,130,246,0.4)] focus:scale-[1.01] backdrop-blur-md"
          autocomplete="off"
          autofocus
        />
        <div class="absolute right-5 top-1/2 -translate-y-1/2">
          <span class="flex h-3 w-3">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"
            ></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      </div>

      <div class="h-48 w-full max-w-2xl relative">
        <Transition
          enter-active-class="transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
          enter-from-class="opacity-0 translate-y-12 scale-95 blur-md"
          enter-to-class="opacity-100 translate-y-0 scale-100 blur-0"
          leave-active-class="transition-all duration-300 cubic-bezier(0.7, 0, 0.84, 0)"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95 translate-y-6 blur-sm"
        >
          <div v-if="scanResult" class="absolute inset-0 w-full">
            <div
              :class="[
                'p-6 rounded-[2.2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex items-center gap-6 border transition-all duration-500 backdrop-blur-2xl relative overflow-hidden',
                resultTheme.card,
                resultTheme.cardGlow,
              ]"
            >
              <div
                :class="[
                  'absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-25 blur-[40px] pointer-events-none transition-all duration-500',
                  resultTheme.glowBlob,
                ]"
              ></div>

              <div
                :class="[
                  'w-28 h-28 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.5)] border-2 overflow-hidden relative transition-all duration-500 bg-slate-900',
                  resultTheme.avatarRing,
                ]"
              >
                <img
                  v-if="scanResult.profile_photo"
                  :src="scanResult.profile_photo"
                  class="w-full h-full object-cover scale-[1.02] transform transition-transform duration-500"
                  alt="Employee Photo"
                />
                <div
                  v-else
                  v-html="resultTheme.icon"
                  class="text-white filter drop-shadow-lg"
                ></div>

                <div
                  v-if="scanResult.profile_photo"
                  :class="[
                    'absolute left-0 w-full h-1 z-20 animate-laser-scan shadow-[0_0_12px_4px_currentColor]',
                    resultTheme.laserColor,
                  ]"
                ></div>
              </div>

              <div class="text-right flex-1 z-10">
                <h3 class="text-2xl font-black mb-1.5 text-white tracking-wide drop-shadow-md">
                  {{ scanResult.employee_name || 'تنبيه النظام' }}
                </h3>
                <p class="text-base font-bold text-slate-300 opacity-95 mb-2 leading-relaxed">
                  {{ scanResult.message }}
                </p>

                <div
                  v-if="scanResult.voucher"
                  class="inline-flex flex-col bg-slate-950/80 border border-sky-500/30 rounded-xl px-4 py-1.5 shadow-[0_4px_20px_rgba(14,165,233,0.15)] backdrop-blur-md mt-1 animate-pulse-slow"
                >
                  <span
                    class="text-[9px] text-sky-400 font-extrabold uppercase tracking-widest mb-0.5"
                  >
                    كود الإنترنت اليومي (1GB)
                  </span>
                  <span
                    class="text-xl font-mono font-black text-white tracking-[0.25em] text-center pr-1"
                  >
                    {{ scanResult.voucher }}
                  </span>
                </div>
              </div>

              <div
                v-if="scanResult.time"
                class="shrink-0 flex flex-col items-center justify-center bg-slate-950/60 border border-slate-800/80 px-5 py-3 rounded-2xl shadow-inner z-10"
              >
                <span class="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500"
                  >الوقت</span
                >
                <span
                  :class="[
                    'text-2xl font-mono font-black drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]',
                    resultTheme.timeText,
                  ]"
                  dir="ltr"
                >
                  {{ scanResult.time }}
                </span>
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
              class="bg-slate-900/95 backdrop-blur-xl px-7 py-4 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-slate-800 flex items-center gap-3.5"
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
              <span class="text-sm font-black text-slate-200 tracking-wide"
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

// --- الساعة الحية ---
const currentTime = ref('')
const currentDate = ref('')
let timer

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

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  keepFocus()
})

onUnmounted(() => {
  clearInterval(timer)
})

// --- إدارة الباركود ---
const barcodeInput = ref(null)
const employeeNumber = ref('')
const scanResult = ref(null)
let resultTimeout

const keepFocus = () => {
  nextTick(() => {
    if (barcodeInput.value) {
      barcodeInput.value.focus()
    }
  })
}

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

// --- الثيمات والمؤثرات النيونية التفاعلية (Interactive Neon Themes) ---
const resultTheme = computed(() => {
  if (!scanResult.value) return {}

  switch (scanResult.value.status) {
    case 'success':
      if (scanResult.value.action === 'check_in') {
        return {
          card: 'bg-emerald-950/35 border-emerald-500/40',
          cardGlow: 'shadow-[0_0_50px_rgba(16,185,129,0.2)]',
          glowBlob: 'bg-emerald-500',
          avatarRing: 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.4)]',
          laserColor: 'text-emerald-400 bg-emerald-400',
          timeText: 'text-emerald-400 font-extrabold',
          icon: `<svg class="w-14 h-14 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>`,
        }
      } else {
        return {
          card: 'bg-blue-950/35 border-blue-500/40',
          cardGlow: 'shadow-[0_0_50px_rgba(59,130,246,0.2)]',
          glowBlob: 'bg-blue-500',
          avatarRing: 'border-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.4)]',
          laserColor: 'text-blue-400 bg-blue-400',
          timeText: 'text-blue-400 font-extrabold',
          icon: `<svg class="w-14 h-14 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>`,
        }
      }
    case 'warning':
      return {
        card: 'bg-amber-950/35 border-amber-500/40',
        cardGlow: 'shadow-[0_0_50px_rgba(245,158,11,0.2)]',
        glowBlob: 'bg-amber-500',
        avatarRing: 'border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.4)]',
        laserColor: 'text-amber-400 bg-amber-400',
        timeText: 'text-amber-400 font-extrabold',
        icon: `<svg class="w-14 h-14 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
      }
    case 'error':
    default:
      return {
        card: 'bg-rose-950/35 border-rose-500/40',
        cardGlow: 'shadow-[0_0_50px_rgba(244,63,94,0.2)]',
        glowBlob: 'bg-rose-500',
        avatarRing: 'border-rose-400 shadow-[0_0_25px_rgba(251,113,133,0.4)]',
        laserColor: 'text-rose-400 bg-rose-400',
        timeText: 'text-rose-400 font-extrabold',
        icon: `<svg class="w-14 h-14 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>`,
      }
  }
})
</script>

<style scoped>
/* 🏎️ أنيميشن كتل الإضاءة الخلفية العائمة ببطء */
@keyframes floatSlow {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.08);
  }
}

@keyframes floatReverse {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(30px) scale(0.93);
  }
}

/* 🚨 أنيميشن خط مسح الباركود البيومتري المتكرر لمرة واحدة */
@keyframes laserScan {
  0% {
    top: -5%;
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    top: 105%;
    opacity: 0;
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

@keyframes pulseSlow {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.animate-float-slow {
  animation: floatSlow 12s ease-in-out infinite;
}

.animate-float-reverse {
  animation: floatReverse 14s ease-in-out infinite;
}

.animate-laser-scan {
  animation: laserScan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.animate-pulse-slow {
  animation: pulseSlow 3s ease-in-out infinite;
}
</style>
