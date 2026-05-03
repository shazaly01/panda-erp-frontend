<!--src\modules\hr\views\attendance\AttendanceKiosk.vue--->
<template>
  <div
    class="fixed inset-0 z-[100] w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden font-sans"
    @click="keepFocus"
  >
    <div
      class="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"
    ></div>
    <div
      class="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none"
    ></div>

    <div class="w-full max-w-3xl relative z-10 flex flex-col items-center">
      <div class="mb-10 text-center">
        <div
          class="w-20 h-20 bg-slate-900 border border-slate-800 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
        >
          <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
        </div>
        <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight mb-3 drop-shadow-md">
          نظام Panda ERP
        </h1>
        <h2 class="text-xl text-blue-400 font-bold uppercase tracking-widest opacity-80">
          تسجيل الحضور والانصراف
        </h2>
      </div>

      <div
        class="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-10 w-full max-w-xl text-center mb-8"
      >
        <div
          class="text-6xl md:text-7xl font-mono font-black text-white tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          dir="ltr"
        >
          {{ currentTime }}
        </div>
        <div class="text-lg font-bold text-slate-400">
          {{ currentDate }}
        </div>
      </div>

      <div class="relative w-full max-w-md group">
        <div
          class="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl transition-all duration-300 group-focus-within:bg-blue-500/40"
        ></div>
        <input
          ref="barcodeInput"
          v-model="employeeNumber"
          @keyup.enter="handleScan"
          @blur="keepFocus"
          type="text"
          placeholder="مرر بطاقتك أو أدخل الرقم..."
          class="relative w-full text-center text-2xl tracking-widest font-mono font-bold bg-slate-900/80 border-2 border-slate-700 text-white placeholder-slate-500 rounded-2xl px-6 py-5 outline-none transition-all duration-300 focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-md"
          autocomplete="off"
          autofocus
        />
        <div class="absolute right-6 top-1/2 -translate-y-1/2">
          <span class="flex h-3 w-3">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"
            ></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      </div>

      <div class="h-40 mt-8 w-full max-w-lg relative">
        <Transition
          enter-active-class="transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)"
          enter-from-class="opacity-0 translate-y-8 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div v-if="scanResult" class="absolute inset-0 w-full">
            <div
              :class="[
                'p-6 rounded-3xl shadow-2xl flex items-center gap-6 border border-slate-700 overflow-hidden relative backdrop-blur-xl',
                resultTheme.card,
              ]"
            >
              <div
                :class="[
                  'absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20 blur-3xl',
                  resultTheme.glow,
                ]"
              ></div>

              <div
                :class="[
                  'w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border',
                  resultTheme.iconBg,
                ]"
              >
                <span v-html="resultTheme.icon" class="text-white drop-shadow-md"></span>
              </div>

              <div class="text-right flex-1 z-10">
                <h3 class="text-2xl font-black mb-1 text-white drop-shadow-sm">
                  {{ scanResult.employee_name || 'تنبيه النظام' }}
                </h3>
                <p
                  :class="[
                    'text-lg font-medium opacity-90 text-slate-200',
                    scanResult.voucher ? 'mb-3' : '',
                  ]"
                >
                  {{ scanResult.message }}
                </p>

                <!-- 🌟 عرض كود الإنترنت بتصميم مضيء وجذاب -->
                <div
                  v-if="scanResult.voucher"
                  class="inline-block bg-slate-950/80 border border-sky-500/50 rounded-xl px-5 py-2 shadow-[0_0_15px_rgba(14,165,233,0.2)] backdrop-blur-sm"
                >
                  <span
                    class="text-[10px] text-sky-400 font-bold uppercase tracking-widest block mb-0.5"
                    >كود الإنترنت اليومي (1GB)</span
                  >
                  <span class="text-2xl font-mono font-black text-white tracking-[0.2em]">{{
                    scanResult.voucher
                  }}</span>
                </div>
              </div>

              <div
                v-if="scanResult.time"
                class="shrink-0 flex flex-col items-center justify-center bg-slate-950/50 border border-slate-700/50 px-4 py-2 rounded-xl z-10"
              >
                <span class="text-xs font-bold uppercase mb-1 text-slate-400">الوقت</span>
                <span
                  :class="['text-xl font-mono font-bold drop-shadow-md', resultTheme.timeText]"
                  dir="ltr"
                  >{{ scanResult.time }}</span
                >
              </div>
            </div>
          </div>
        </Transition>

        <Transition
          enter-active-class="transition duration-200"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div
            v-if="attendanceStore.loading"
            class="absolute inset-0 flex items-center justify-center"
          >
            <div
              class="bg-slate-800/90 backdrop-blur-md px-6 py-3 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-slate-700 flex items-center gap-3"
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
              <span class="text-sm font-bold text-white">جاري الاتصال بالسيرفر...</span>
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

// --- الثيمات الديناميكية (Dark Mode Glowing Effects) ---
const resultTheme = computed(() => {
  if (!scanResult.value) return {}

  switch (scanResult.value.status) {
    case 'success':
      if (scanResult.value.action === 'check_in') {
        return {
          card: 'bg-emerald-950/80',
          glow: 'bg-emerald-500',
          iconBg: 'bg-emerald-600 border-emerald-400 shadow-[0_0_20px_rgba(5,150,105,0.5)]',
          timeText: 'text-emerald-400',
          icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>`,
        }
      } else {
        return {
          card: 'bg-blue-950/80',
          glow: 'bg-blue-500',
          iconBg: 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.5)]',
          timeText: 'text-blue-400',
          icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>`,
        }
      }
    case 'warning':
      return {
        card: 'bg-amber-950/80',
        glow: 'bg-amber-500',
        iconBg: 'bg-amber-600 border-amber-400 shadow-[0_0_20px_rgba(217,119,6,0.5)]',
        timeText: 'text-amber-400',
        icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
      }
    case 'error':
    default:
      return {
        card: 'bg-rose-950/80',
        glow: 'bg-rose-500',
        iconBg: 'bg-rose-600 border-rose-400 shadow-[0_0_20px_rgba(225,29,72,0.5)]',
        timeText: 'text-rose-400',
        icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>`,
      }
  }
})
</script>
