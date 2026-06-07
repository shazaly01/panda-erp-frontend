<template>
  <div
    class="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col items-center p-4 animate-fade-in select-none"
  >
    <div
      class="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 interactive"
      id="interactive"
    >
      <div
        class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10"
      >
        <div
          class="w-72 h-32 border-2 border-dashed border-emerald-500/50 rounded-xl relative flex items-center justify-center bg-emerald-500/[0.01]"
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

          <div
            class="w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute animate-scanner-laser"
          ></div>
        </div>
        <span
          class="text-[10px] font-bold text-emerald-400/80 mt-2 tracking-wide bg-slate-950/80 px-2 py-0.5 rounded-md backdrop-blur-sm"
          >مرر خطوط الباركود أفقيًا داخل المستطيل</span
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
        <span class="text-xs font-bold text-slate-400">محرك Quagga2 نشط (1D الخطي)</span>
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
import Quagga from '@ericblade/quagga2'

const emit = defineEmits(['scan', 'close', 'error'])

const initQuagga = () => {
  Quagga.init(
    {
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: '#interactive',
        constraints: {
          facingMode: 'environment',
          aspectRatio: 1.7777777778,
        },
      },
      locator: {
        patchSize: 'medium',
        halfSample: true,
      },
      numOfWorkers: Math.max(navigator.hardwareConcurrency - 1, 2),
      decoder: {
        // تفعيل كافة صيغ الأكواد الخطية الشهيرة المستخدمة صناعياً وتجارياً
        readers: [
          'code_128_reader',
          'ean_reader',
          'code_39_reader',
          'code_39_vin_reader',
          'codabar_reader',
          'upc_reader',
          'i2of5_reader',
        ],
      },
      locate: true,
    },
    (err) => {
      if (err) {
        emit('error', 'فشل تشغيل محرك الكاميرا الخطي: ' + err.message)
        emit('close')
        return
      }
      Quagga.start()
    },
  )

  // ربط دالة الالتقاط عند التعرف على الباركود
  Quagga.onDetected(handleDetected)
}

const handleDetected = (result) => {
  if (result && result.codeResult && result.codeResult.code) {
    const code = result.codeResult.code
    emit('scan', code)
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
    top: 2%;
  }
  50% {
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
  animation: scannerLaser 2s ease-in-out infinite;
}

/* تنسيق عناصر البث المحقونة ديناميكياً عبر مكتبة Quagga وضمان ملء الحاوية */
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
