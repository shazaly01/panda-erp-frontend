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
        <span class="text-xs font-bold text-slate-400">نمط التدقيق فائق الدقة (UHD) نشط</span>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

const emit = defineEmits(['scan', 'close', 'error'])

const currentDecodingAttempt = ref('')
const html5QrcodeInstance = ref(null)

const initQrScanner = async () => {
  try {
    // إنشاء كائن الماسح وربطه بالـ ID المخصص
    html5QrcodeInstance.value = new Html5Qrcode('qr-reader')

    // المعامل الأول: يجب أن يحتوي على مفتاح واحد فقط (ممنوع وضع قيود الأبعاد هنا)
    const cameraConfig = { facingMode: 'environment' }

    // المعامل الثاني: نضع كافة قيود الدقة الفائقة والتركيز المستمر بداخل تراكيب المتصفح الرسمية لـ videoConstraints
    const scannerConfig = {
      fps: 25,
      videoConstraints: {
        width: { ideal: 3840 }, // طلب دقة 4K للمتصفح إن وُجدت عتادياً كخيار مثالي
        height: { ideal: 2160 },
        advanced: [{ focusMode: 'continuous' }], // تفعيل الفوكس التلقائي المستمر لمنع غشاوة القراءة
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
        // خطأ صامت أثناء محاولات الفحص المتكررة لكل فريم لمنع ملء الكونسول
      },
    )
  } catch (err) {
    emit('error', 'فشل تشغيل الكاميرا الفائقة للـ QR Code: ' + (err.message || err))
    emit('close')
  }
}

const stopScanner = async () => {
  if (html5QrcodeInstance.value && html5QrcodeInstance.value.isScanning) {
    try {
      await html5QrcodeInstance.value.stop()
    } catch (err) {
      console.error('Error stopping html5-qrcode:', err)
    }
  }
  currentDecodingAttempt.value = ''
  emit('close')
}

onMounted(() => {
  setTimeout(() => {
    initQrScanner()
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

/* إجبار عتاد بث الفيديو بالمتصفح على ملء الحاوية المربعة بشكل متناسق ومريح للعين */
:deep(#qr-reader video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}
</style>
