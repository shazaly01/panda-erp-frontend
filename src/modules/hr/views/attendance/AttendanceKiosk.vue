<template>
  <div
    class="fixed inset-0 z-[100] w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto font-sans select-none"
    @click="handleBackgroundClick"
  >
    <div
      class="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-float"
    ></div>
    <div
      class="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-float-reverse"
    ></div>

    <div
      class="w-full max-w-4xl relative z-10 flex flex-col items-center min-h-full justify-between py-4 gap-6"
    >
      <KioskHeader />

      <div class="w-full max-w-md flex justify-center">
        <button
          type="button"
          @click="toggleEmergencyMode"
          :class="[
            'px-5 py-2.5 rounded-xl font-bold text-xs border transition-all duration-300 flex items-center gap-2 shadow-lg',
            isEmergencyMode
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-300 hover:border-slate-700',
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          {{
            isEmergencyMode
              ? 'العودة للوضع الافتراضي (الماسح العادي)'
              : 'تفعيل وضع(كاميرا الهاتف / إدخال يدوي)'
          }}
        </button>
      </div>

      <div
        :class="[
          'w-full flex justify-center gap-6 flex-1 my-2 transition-all duration-500',
          isEmergencyMode
            ? 'flex-col lg:flex-row items-center lg:items-start'
            : 'flex-col items-center max-w-md',
        ]"
      >
        <div class="w-full flex flex-col items-center justify-center gap-4">
          <div v-if="!isEmergencyMode" class="relative w-full group">
            <div
              class="absolute inset-0 bg-blue-500/5 rounded-xl blur-xl transition-all duration-500 group-focus-within:bg-blue-500/15 animate-pulse"
            ></div>
            <input
              ref="barcodeInput"
              v-model="employeeNumber"
              @keyup.enter="handleHardwareScan"
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

          <div v-else class="w-full flex flex-col items-center gap-4 animate-fade-in">
            <KioskCameraScanner
              v-if="showCamera"
              @scan="processAttendanceCode"
              @close="showCamera = false"
              @error="handleCameraError"
            />

            <button
              v-else
              type="button"
              @click="showCamera = true"
              class="w-full py-3 bg-blue-950/40 hover:bg-blue-950/60 border border-blue-900/40 text-blue-400 rounded-2xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
              </svg>
              فتح كاميرا الهاتف للمسح
            </button>

            <KioskManualNumpad v-model="manualEmployeeNumber" @submit="processAttendanceCode" />
          </div>
        </div>

        <div class="w-full min-h-[380px] relative flex items-center justify-center">
          <Transition
            enter-active-class="transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
            enter-from-class="opacity-0 translate-y-8 scale-95 blur-sm"
            enter-to-class="opacity-100 translate-y-0 scale-100 blur-0"
            leave-active-class="transition-all duration-300 cubic-bezier(0.7, 0, 0.84, 0)"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95 translate-y-4 blur-sm"
          >
            <KioskResultCard v-if="scanResult" :result="scanResult" />
          </Transition>

          <Transition
            enter-active-class="transition duration-200"
            enter-from-class="opacity-0 scale-95"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="attendanceStore.loading"
              class="absolute inset-0 flex items-center justify-center z-20"
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

      <KioskClock />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useAttendanceLogStore } from '@/modules/hr/stores/attendanceLogStore'

// استيراد المكوّنات الفرعية المجهزة للهيكلة الجديدة
import KioskHeader from './components/KioskHeader.vue'
import KioskClock from './components/KioskClock.vue'
import KioskResultCard from './components/KioskResultCard.vue'
import KioskCameraScanner from './components/KioskCameraScanner.vue'
import KioskManualNumpad from './components/KioskManualNumpad.vue'

const attendanceStore = useAttendanceLogStore()
const barcodeInput = ref(null)
const employeeNumber = ref('')
const manualEmployeeNumber = ref('')
const scanResult = ref(null)

// متغيرات التحكم في الحالات الخاصة بوضع الطوارئ والهاتف
const isEmergencyMode = ref(false)
const showCamera = ref(false)

let resultTimeout = null

// إبقاء التركيز على حقل الإدخال فقط في حال لم نكن في وضع الطوارئ
const keepFocus = () => {
  if (isEmergencyMode.value) return
  nextTick(() => {
    if (barcodeInput.value) barcodeInput.value.focus()
  })
}

const handleBackgroundClick = () => {
  keepFocus()
}

// تشغيل/إيقاف وضع الطوارئ بالهاتف ممرراً فصل/وصل التحكم والتركيز
const toggleEmergencyMode = () => {
  isEmergencyMode.value = !isEmergencyMode.value
  scanResult.value = null
  employeeNumber.value = ''
  manualEmployeeNumber.value = ''

  if (isEmergencyMode.value) {
    showCamera.value = true
  } else {
    showCamera.value = false
    keepFocus()
  }
}

// معالجة قراءة الباركود العادي من الـ Hardware Scanner الخاص بالكشك
const handleHardwareScan = () => {
  const code = employeeNumber.value.trim()
  employeeNumber.value = ''
  if (code) {
    processAttendanceCode(code)
  }
}

// استقبال كود الخطأ الممرر من الكاميرا وعرضه على فرد الأمن بشكل كرت تنبيه
const handleCameraError = (errorMessage) => {
  scanResult.value = {
    status: 'error',
    message: errorMessage,
    employee_name: 'خطأ بالعتاد',
  }
}

// النواة المركزية الموحدة لاستقبال الأكواد من أي وسيلة كانت (كاميرا، يدوي، ماسح عتادي) وإرسالها للـ API
const processAttendanceCode = async (code) => {
  if (!code || attendanceStore.loading) return

  scanResult.value = null
  clearTimeout(resultTimeout)

  try {
    const data = await attendanceStore.scanBarcode(code)
    setTimeout(() => {
      scanResult.value = {
        status: data.status,
        action: data.action,
        employee_name: data.full_name || data.employee_name,
        message: data.message,
        time: data.time,
        voucher: data.voucher,
        profile_photo: data.profile_photo?.url || data.avatar || data.profile_photo,
      }
    }, 50)
  } catch {
    setTimeout(() => {
      scanResult.value = {
        status: 'error',
        message: attendanceStore.error || 'بطاقة غير صالحة، يرجى المراجعة.',
        employee_name: null,
      }
    }, 50)
  } finally {
    // تصفير الخانات المخصصة لليدوي
    manualEmployeeNumber.value = ''

    // إعادة بناء الكاميرا تلقائيًا للمسح التالي في وضع الطوارئ إذا أغلقت بعد المسح الناجح
    if (isEmergencyMode.value) {
      showCamera.value = true
    } else {
      keepFocus()
    }

    // إخفاء كرت البيانات تلقائيًا بعد 8 ثوانٍ من ظهور النتيجة للتهيؤ للموظف القادم
    resultTimeout = setTimeout(() => {
      scanResult.value = null
    }, 8000)
  }
}

onMounted(() => {
  keepFocus()
})

onUnmounted(() => {
  clearTimeout(resultTimeout)
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
.animate-float {
  animation: float 10s ease-in-out infinite;
}
.animate-float-reverse {
  animation: float-reverse 12s ease-in-out infinite;
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
</style>
