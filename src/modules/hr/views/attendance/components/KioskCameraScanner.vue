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
          class="w-72 h-36 border-2 border-dashed border-blue-500/70 rounded-xl relative flex items-center justify-center bg-blue-500/[0.02]"
        >
          <div
            class="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-blue-400 -mt-1 -ml-1 rounded-tl-sm"
          ></div>
          <div
            class="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-blue-400 -mt-1 -mr-1 rounded-tr-sm"
          ></div>
          <div
            class="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-blue-400 -mb-1 -ml-1 rounded-bl-sm"
          ></div>
          <div
            class="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-blue-400 -mb-1 -mr-1 rounded-br-sm"
          ></div>

          <div
            class="w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent absolute animate-scanner-laser"
          ></div>
        </div>
        <span
          class="text-[10px] font-bold text-blue-400/80 mt-2 tracking-wide bg-slate-950/80 px-2 py-0.5 rounded-md backdrop-blur-sm"
          >ضع الباركود أو الـ QR داخل المستطيل</span
        >
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
        <span class="text-xs font-bold text-slate-400">القارئ الذكي نشط (1D/2D)</span>
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

    // إعدادات محسنة خصيصاً لقراءة الخطوط العادية والضيقة بكفاءة
    const config = {
      fps: 24, // رفع الفريمات لزيادة سرعة معالجة الخطوط أثناء حركة اليد
      qrbox: { width: 288, height: 144 }, // تحويلها لمستطيل عريض أبعاده تطابق تماماً الـ UI (w-72 h-36)
      aspectRatio: 1.777778, // أبعاد 16:9 العريضة
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true, // تفعيل ميزة قارئ الأكواد العتادي الأصلي للهاتف لسرعة خارقة في الـ 1D Barcode
      },
    }

    // تشغيل الكاميرا الخلفية وتوجيه الفلتر للبحث عن كافة أنواع الأكواد خطية أو مربعة
    await html5QrcodeScanner.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        emit('scan', decodedText)
        stopScanner()
      },
      () => {
        // فلاتر صامتة أثناء البحث والتركيز المستمر
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
  setTimeout(() => {
    startScanner()
  }, 300)
})

onUnmounted(async () => {
  await stopScanner()
})
</script>

<script>
// تأكيد تسجيل اسم المكون لتسهيل التتبع والـ Debugging بمتصفحات الكروم
export default {
  name: 'KioskCameraScanner',
}
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
    top: 2%;
  }
  55% {
    top: 95%;
  }
  100% {
    top: 2%;
  }
}
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-scanner-laser {
  animation: scannerLaser 2.2s ease-in-out infinite;
}
</style>
