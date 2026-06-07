<template>
  <div
    class="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col items-center p-4 animate-fade-in select-none"
  >
    <div
      class="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80"
    >
      <div id="kiosk-reader" class="w-full h-full"></div>

      <div
        class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10"
      >
        <div
          class="w-48 h-48 border-2 border-dashed border-blue-500/60 rounded-xl relative flex items-center justify-center"
        >
          <div
            class="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-400 -mt-1 -ml-1 rounded-tl-sm"
          ></div>
          <div
            class="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-400 -mt-1 -mr-1 rounded-tr-sm"
          ></div>
          <div
            class="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-400 -mb-1 -ml-1 rounded-bl-sm"
          ></div>
          <div
            class="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-400 -mb-1 -mr-1 rounded-br-sm"
          ></div>

          <div
            class="w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent absolute animate-scanner-laser"
          ></div>
        </div>
      </div>
    </div>

    <div class="w-full flex items-center justify-between mt-3 px-1">
      <div class="flex items-center gap-2">
        <span class="relative flex h-2 w-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
          ></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span class="text-xs font-bold text-slate-400">العدسة النشطة: الكاميرا الخلفية</span>
      </div>

      <button
        type="button"
        @click="stopScanner"
        class="text-xs font-black text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 px-3 py-1 rounded-lg transition-all duration-150"
      >
        إلغاء تشغيل الكاميرا
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

const emit = defineEmits(['scan', 'close', 'error'])

let html5QrcodeScanner = null
const scannerId = 'kiosk-reader'

const startScanner = async () => {
  try {
    html5QrcodeScanner = new Html5Qrcode(scannerId)

    const config = {
      fps: 15,
      qrbox: { width: 200, height: 200 },
      aspectRatio: 1.777778, // 16:9 أبعاد البث القياسية للهواتف
    }

    // تشغيل الكاميرا الخلفية تلقائياً (environment) لقراءة الباركود والـ QR Code معاً
    await html5QrcodeScanner.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        // عند نجاح القراءة، نرسل الكود للأب فوراً ونوقف الكاميرا مؤقتاً لعدم التكرار
        emit('scan', decodedText)
        stopScanner()
      },
      () => {
        // فلاتر الأخطاء الصامتة أثناء تدوير العدسة أو البحث المستمر عن كود
      },
    )
  } catch (err) {
    emit('error', err.message || 'فشل الوصول إلى الكاميرا، يرجى التحقق من الصلاحيات.')
    emit('close')
  }
}

const stopScanner = async () => {
  if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
    try {
      await html5QrcodeScanner.stop()
    } catch (err) {
      console.error('Error stopping scanner:', err)
    } finally {
      html5QrcodeScanner = null
    }
  }
  emit('close')
}

onMounted(() => {
  // تأخير طفيف لضمان رندر الـ DOM بالكامل قبل ربط مكتبة الكاميرا
  setTimeout(() => {
    startScanner()
  }, 300)
})

onUnmounted(async () => {
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
@keyframes scannerLaser {
  0% {
    top: 0%;
  }
  50% {
    top: 100%;
  }
  100% {
    top: 0%;
  }
}
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-scanner-laser {
  animation: scannerLaser 2s linear infinite;
}
</style>
