<!--src\modules\hr\views\attendance\components\KioskQrCameraScanner.vue---->
<template>
  <div
    class="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col items-center p-4 animate-fade-in select-none"
  >
    <div
      class="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 interactive"
      id="qr-reader"
    >
      <div
        class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10"
      >
        <div
          class="w-64 h-64 border-2 border-dashed border-blue-500/60 rounded-2xl relative flex items-center justify-center bg-blue-500/[0.01]"
        >
          <div
            class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 -mt-1 -ml-1 rounded-tl-md shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          ></div>
          <div
            class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 -mt-1 -mr-1 rounded-tr-md shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          ></div>
          <div
            class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 -mb-1 -ml-1 rounded-bl-md shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          ></div>
          <div
            class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 -mb-1 -mr-1 rounded-br-md shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          ></div>

          <div
            class="w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent absolute animate-qr-laser shadow-[0_0_8px_rgba(59,130,246,0.8)]"
          ></div>
        </div>
        <span
          class="text-[10px] font-bold text-blue-400/80 mt-4 tracking-wide bg-slate-950/80 px-2 py-0.5 rounded-md backdrop-blur-sm"
        >
          وجّه المربع فوق رمز الـ QR Code مباشرة
        </span>
      </div>
    </div>

    <div
      class="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl py-2 px-4 mt-3 text-center min-h-[38px] flex items-center justify-center"
    >
      <p class="text-xs font-mono font-bold text-slate-400">
        <span class="text-slate-500 font-sans">إشارة القراءة الحالية:</span>
        <span class="text-blue-400 ml-1 text-sm tracking-widest font-black">
          {{ currentDecodingAttempt || 'في انتظار محاذاة الرمز...' }}
        </span>
      </p>
    </div>

    <div class="w-full flex items-center justify-between mt-3 px-1">
      <div class="flex items-center gap-2">
        <span class="relative flex h-2 w-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"
          ></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span class="text-xs font-bold text-slate-400">نمط التدقيق المطور نشط</span>
      </div>

      <button
        type="button"
        @click="stopScanner"
        class="text-xs font-black text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 px-3 py-1 rounded-lg transition-all duration-150"
      >
        إلغاء
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

const emit = defineEmits(['scan', 'close', 'error'])

const currentDecodingAttempt = ref('')
const html5QrcodeInstance = ref(null)
let isComponentDestroyed = false

const initQrScanner = async () => {
  if (isComponentDestroyed) return

  // 1. فحص استباقي للبيئة الأمنية للمتصفح لمنع الأعطال الصامتة في الشبكات المحلية (HTTP vs HTTPS)
  if (!window.isSecureContext) {
    emit('error', 'فشل التشغيل: الكاميرا تتطلب بيئة آمنة (HTTPS) أو تشغيل التطبيق من localhost.')
    emit('close')
    return
  }

  try {
    const elementId = 'qr-reader'
    const container = document.getElementById(elementId)

    if (!container) {
      console.warn('DOM element #qr-reader not found yet.')
      return
    }

    // تصفير وتنظيف ميكانيكي مسبق للحاوية لقطع الطريق على وجود أي كائن شبحي مخفي بالـ DOM
    container.innerHTML = ''

    html5QrcodeInstance.value = new Html5Qrcode(elementId)

    // 2. إجبار المتصفح على اختيار الكاميرا الخلفية بشكل صارم كخيار أولي
    const cameraConfig = {
      facingMode: { exact: 'environment' },
    }

    // 3. ضبط عقلاني للأبعاد ومعدل الـ FPS لإنهاء تجميد خيط التنفيذ الرئيسي تماماً وتحرير المعالج
    const scannerConfig = {
      fps: 15,
      qrbox: { width: 250, height: 250 },
      videoConstraints: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
        advanced: [{ focusMode: 'continuous' }],
      },
    }

    await html5QrcodeInstance.value.start(
      cameraConfig,
      scannerConfig,
      (decodedText) => {
        const cleanCode = decodedText.trim()
        if (cleanCode) {
          currentDecodingAttempt.value = cleanCode
          emit('scan', cleanCode)
          stopScanner()
        }
      },
      () => {
        // دالة خطأ صامتة ومحمية تمنع تراكم الاستثناءات أو تسريب الذاكرة أثناء تفحص الفريمات
      },
    )
  } catch (err) {
    // 4. تراجع مرن وذكي في حال كانت بيئة المتصفح لا تدعم كلمة exact للكاميرات الخلفية (مثل بعض المتصفحات المكتبية المحاكية)
    if (err.message?.includes('Constraints') || err.name === 'OverconstrainedError') {
      try {
        if (html5QrcodeInstance.value) {
          await html5QrcodeInstance.value.start(
            { facingMode: 'environment' },
            {
              fps: 15,
              videoConstraints: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
            },
            (decodedText) => {
              const cleanCode = decodedText.trim()
              if (cleanCode) {
                currentDecodingAttempt.value = cleanCode
                emit('scan', cleanCode)
                stopScanner()
              }
            },
            () => {},
          )
          return
        }
      } catch (retryErr) {
        emit('error', 'فشل تشغيل الكاميرا الخلفية للجهاز: ' + (retryErr.message || retryErr))
      }
    } else {
      emit('error', 'فشل تهيئة سياق كاميرا الـ QR Code: ' + (err.message || err))
    }
    emit('close')
  }
}

const stopScanner = async () => {
  if (html5QrcodeInstance.value && html5QrcodeInstance.value.isScanning) {
    try {
      await html5QrcodeInstance.value.stop()
    } catch (err) {
      console.error('Error stopping html5-qrcode instance:', err)
    }
  }

  // تنظيف وتصفير يدوي إضافي للحاوية لمنع بقاء دفق الكاميرا معلقاً في الخلفية
  const container = document.getElementById('qr-reader')
  if (container) {
    container.innerHTML = ''
  }

  currentDecodingAttempt.value = ''
  emit('close')
}

onMounted(async () => {
  // إلغاء الميقاتي السحري القديم والاعتماد على دورة طلاء وتحديث الـ DOM الرسمية لـ Vue
  await nextTick()
  initQrScanner()
})

onUnmounted(async () => {
  isComponentDestroyed = true
  await stopScanner()
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes qrLaser {
  0% {
    top: 4%;
  }
  50% {
    top: 94%;
  }
  100% {
    top: 4%;
  }
}
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-qr-laser {
  animation: qrLaser 2s ease-in-out infinite;
}

/* ضبط إحداثيات الـ Canvas الداخلي ليتطابق هندسياً مع دفق الفيديو الحقيقي دون انحراف أبعاد القراءة */
:deep(#qr-reader video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
}
</style>
