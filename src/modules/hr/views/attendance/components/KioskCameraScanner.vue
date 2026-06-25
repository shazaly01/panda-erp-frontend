<!--src\modules\hr\views\attendance\components\KioskCameraScanner.vue---->
<template>
  <div
    class="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col items-center p-4 animate-fade-in select-none"
  >
    <!-- منطقة بث الكاميرا الخاصة بـ Quagga2 -->
    <div
      class="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 interactive"
      id="interactive"
    >
      <!-- طبقة المؤشرات المرئية فوق الكاميرا -->
      <div
        class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10"
      >
        <!-- مستطيل التركيز الخطي عريض ومحدد بدقة -->
        <div
          class="w-76 h-28 border-2 border-dashed border-emerald-500/60 rounded-xl relative flex items-center justify-center bg-emerald-500/[0.01]"
        >
          <div
            class="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-sm"
          ></div>
          <div
            class="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-sm"
          ></div>
          <div
            class="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-sm"
          ></div>
          <div
            class="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-sm"
          ></div>

          <!-- خط الليزر الأخضر المخصص للمسح الخطي -->
          <div
            class="w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute animate-scanner-laser"
          ></div>
        </div>
        <span
          class="text-[10px] font-bold text-emerald-400/80 mt-2 tracking-wide bg-slate-950/80 px-2 py-0.5 rounded-md backdrop-blur-sm"
          >وجّه مستطيل على الباركود مباشرة</span
        >
      </div>
    </div>

    <!-- شاشة رصد وقراءة حية للكود المقروء للتأكد من ثباته -->
    <div
      class="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl py-2 px-4 mt-3 text-center min-h-[38px] flex items-center justify-center"
    >
      <p class="text-xs font-mono font-bold text-slate-400">
        <span class="text-slate-500 font-sans">إشارة القراءة الحالية:</span>
        <span class="text-emerald-400 ml-1 text-sm tracking-widest font-black">{{
          currentDecodingAttempt || 'في انتظار محاذاة الخطوط...'
        }}</span>
      </p>
    </div>

    <!-- مؤشر الحالة وزر الإلغاء -->
    <div class="w-full flex items-center justify-between mt-3 px-1">
      <div class="flex items-center gap-2">
        <span class="relative flex h-2 w-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
          ></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span class="text-xs font-bold text-slate-400">نمط التدقيق الفائق (HD) نشط</span>
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
import Quagga from '@ericblade/quagga2'

const emit = defineEmits(['scan', 'close', 'error'])

const currentDecodingAttempt = ref('')
const consecutiveReads = ref([])
const REQUIRED_CONSECUTIVE_MATCHES = 3

const initQuagga = () => {
  Quagga.init(
    {
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: '#interactive',
        constraints: {
          facingMode: 'environment',
          // التعديل 1: إجبار الكاميرا على بث أبعاد HD كاملة لالتقاط أدق التفاصيل للخطوط النحيفة
          width: 1280,
          height: 720,
          aspectRatio: 1.7777777778,
        },
      },
      locator: {
        patchSize: 'medium',
        // التعديل 2: إيقاف خفض الجودة وتحليل الصورة بأبعادها الكاملة الصافية بكسل ببكسل لرفع التباين
        halfSample: false,
      },
      numOfWorkers: Math.max(navigator.hardwareConcurrency - 1, 2),
      decoder: {
        // التعديل 3: حصر المعالجة الرياضية في أكواد البطاقات التعريفية فقط وإلغاء فلاتر المنتجات التجارية لتسريع الفوكس
        readers: ['code_128_reader', 'code_39_reader'],
      },
      locate: true,
    },
    (err) => {
      if (err) {
        emit('error', 'فشل تشغيل محرك الكاميرا المطور: ' + err.message)
        emit('close')
        return
      }
      Quagga.start()
    },
  )

  Quagga.onDetected(handleDetected)
}

const handleDetected = (result) => {
  if (!result || !result.codeResult || !result.codeResult.code) return

  const scannedCode = result.codeResult.code.trim()
  currentDecodingAttempt.value = scannedCode

  const readsCount = consecutiveReads.value.length

  if (readsCount === 0 || consecutiveReads.value[readsCount - 1] === scannedCode) {
    consecutiveReads.value.push(scannedCode)
  } else {
    consecutiveReads.value = [scannedCode]
  }

  if (consecutiveReads.value.length >= REQUIRED_CONSECUTIVE_MATCHES) {
    emit('scan', scannedCode)
    stopScanner()
  }
}

const stopScanner = () => {
  try {
    Quagga.offDetected(handleDetected)
    Quagga.stop()
  } catch (err) {
    console.error('Error stopping Quagga:', err)
  } finally {
    consecutiveReads.value = []
    currentDecodingAttempt.value = ''
    emit('close')
  }
}

onMounted(() => {
  setTimeout(() => {
    initQuagga()
  }, 300)
})

onUnmounted(() => {
  stopScanner()
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
    top: 4%;
  }
  50% {
    top: 92%;
  }
  100% {
    top: 4%;
  }
}
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-scanner-laser {
  animation: scannerLaser 1.8s ease-in-out infinite;
}

:deep(#interactive video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
:deep(#interactive canvas.drawingBuffer) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
