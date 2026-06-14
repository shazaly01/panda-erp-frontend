<template>
  <div
    class="min-h-screen bg-[#040711] text-slate-100 flex flex-col justify-center items-center font-sans p-4 antialiased relative overflow-hidden selection:bg-indigo-500/30"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:32px_32px] opacity-70 z-0"
    ></div>

    <div
      class="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-600/15 via-purple-600/5 to-transparent rounded-full blur-[140px] animate-blob z-0"
    ></div>
    <div
      class="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-1000 z-0"
      :class="loading ? 'bg-sky-600/10' : result.allowed ? 'bg-emerald-500/10' : 'bg-rose-500/10'"
    ></div>

    <div class="w-full max-w-md z-10 relative">
      <div
        v-if="loading"
        class="bg-slate-900/40 backdrop-blur-3xl border border-slate-800/60 rounded-3xl p-10 shadow-[0_0_60px_rgba(0,0,0,0.7)] text-center space-y-6 animate-scaleIn relative overflow-hidden"
      >
        <div
          class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer"
        ></div>

        <div class="relative w-24 h-24 mx-auto">
          <div class="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div
            class="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
          ></div>
          <div
            class="absolute inset-3 border border-indigo-500/40 border-b-transparent rounded-full animate-spin-reverse"
          ></div>
          <div
            class="absolute inset-0 flex items-center justify-center text-blue-400 text-lg font-bold font-mono animate-pulse"
          >
            AI
          </div>
        </div>

        <div class="space-y-2">
          <h2
            class="text-lg font-extrabold tracking-wide bg-gradient-to-r from-slate-100 via-blue-200 to-slate-100 bg-clip-text text-transparent"
          >
            نظام الفحص اللحظي الآمن
          </h2>
          <p class="text-xs text-slate-500 font-medium">
            جاري تشفير وتدقيق بيانات بطاقة الدخول عبر السيرفر...
          </p>
        </div>
      </div>

      <div
        v-else
        class="bg-slate-900/50 backdrop-blur-3xl border rounded-3xl p-6 md:p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] text-center transition-all duration-700 relative overflow-hidden animate-scaleUp"
        :class="
          result.allowed
            ? 'border-emerald-500/30 shadow-emerald-950/20'
            : 'border-rose-500/30 shadow-rose-950/20'
        "
      >
        <div
          v-if="result.allowed"
          class="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-40 shadow-[0_0_15px_rgba(16,185,129,1)] animate-laser"
        ></div>
        <div
          v-else
          class="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-40 shadow-[0_0_15px_rgba(244,63,94,1)] animate-laser"
        ></div>

        <div
          class="absolute top-[-10%] left-[35%] w-32 h-32 rounded-full blur-3xl opacity-20 transition-all duration-700"
          :class="
            result.allowed
              ? 'bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]'
              : 'bg-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.5)]'
          "
        ></div>

        <div
          class="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 text-4xl border relative z-10 shadow-2xl transition-all duration-500"
          :class="
            result.allowed
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10 animate-glow-success'
              : 'bg-rose-950/40 text-rose-400 border-rose-500/40 shadow-rose-500/10 animate-glow-error'
          "
        >
          <span
            class="absolute inset-0 rounded-full animate-ping opacity-25"
            :class="result.allowed ? 'bg-emerald-500' : 'bg-rose-500'"
          ></span>

          <span v-if="result.allowed" class="drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]">✓</span>
          <span v-else class="drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]">✕</span>
        </div>

        <h1
          class="text-2xl font-black tracking-tight mb-3 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          :class="
            result.allowed
              ? 'bg-gradient-to-b from-emerald-300 to-emerald-500 bg-clip-text text-transparent'
              : 'bg-gradient-to-b from-rose-300 to-rose-500 bg-clip-text text-transparent'
          "
        >
          {{ result.allowed ? 'مأذون بالدخول لقسم الأمن' : 'صلاحية الدخول مرفوضة' }}
        </h1>

        <div
          class="bg-slate-950/40 border border-slate-800/80 rounded-xl px-4 py-3.5 text-xs font-semibold leading-relaxed tracking-wide shadow-inner max-w-sm mx-auto mb-6"
          :class="result.allowed ? 'text-emerald-300/90' : 'text-rose-300/90'"
        >
          {{ result.message }}
        </div>

        <div
          v-if="result.allowed && result.visitor"
          class="space-y-3.5 text-right border-t border-slate-800/60 pt-6 animate-fadeIn relative z-10"
        >
          <div
            class="group relative bg-gradient-to-l from-slate-950/60 to-slate-900/30 border border-slate-800/60 hover:border-emerald-500/20 p-4 rounded-xl shadow-md transition-all duration-300"
          >
            <span
              class="absolute right-3 top-[-8px] text-[9px] font-bold text-slate-500 bg-[#0c1120] px-2 tracking-widest border border-slate-800/60 rounded-full"
              >الاسم الثنائي/الثلاثي للزائر</span
            >
            <div class="flex items-center gap-3 mt-1">
              <div
                class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]"
              ></div>
              <span class="text-sm font-extrabold text-slate-100 tracking-wide">{{
                result.visitor.name
              }}</span>
            </div>
          </div>

          <div
            class="group relative bg-gradient-to-l from-slate-950/60 to-slate-900/30 border border-slate-800/60 p-4 rounded-xl shadow-md transition-all duration-300"
          >
            <span
              class="absolute right-3 top-[-8px] text-[9px] font-bold text-slate-500 bg-[#0c1120] px-2 tracking-widest border border-slate-800/60 rounded-full"
              >الجهة التابع لها الزائر</span
            >
            <div class="flex items-center gap-3 mt-1">
              <div class="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
              <span class="text-xs font-bold text-slate-300 tracking-wide">{{
                result.visitor.company
              }}</span>
            </div>
          </div>

          <div
            class="group relative bg-gradient-to-l from-slate-950/60 to-slate-900/30 border border-emerald-500/10 p-4 rounded-xl shadow-md transition-all duration-300"
          >
            <span
              class="absolute right-3 top-[-8px] text-[9px] font-bold text-indigo-400 bg-[#0c1120] px-2 tracking-widest border border-emerald-500/10 rounded-full"
              >الموظف المسؤول عن الاستضافة</span
            >
            <div class="flex items-center gap-3 mt-1">
              <div
                class="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]"
              ></div>
              <span class="text-xs font-black text-indigo-300 tracking-wide">{{
                result.visitor.host
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/services/apiClient'

const route = useRoute()
const loading = ref(true)
const result = ref({ allowed: false, message: '', visitor: null })

onMounted(async () => {
  const token = route.params.token
  try {
    // استدعاء رابط الـ API العام لفحص الكود
    const response = await apiClient.get(`/hr/visitors/check-status/${token}`)
    result.value = response.data
  } catch (error) {
    console.error('Security verification check failed:', error)
    result.value = {
      allowed: false,
      message:
        error.response?.data?.message ||
        'فشل فحص البوابة؛ تعذر الاتصال بالخادم الرئيسي للمنشأة أو أن الرمز تالف وتغير تشفيره يدوياً!',
    }
  } finally {
    // إعطاء فرصة بسيطة للأنيميشن لتظهر بفخامتها قبل عرض النتيجة
    setTimeout(() => {
      loading.value = false
    }, 800)
  }
})
</script>

<style scoped>
/* 🪄 المؤثرات الحركية الفاخرة للنيون والـ Glow والتنقل البصري */

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
.animate-shimmer {
  animation: shimmer 2.5s infinite linear;
}

@keyframes laser {
  0% {
    top: 0%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}
.animate-laser {
  animation: laser 4s infinite linear;
}

@keyframes blob {
  0%,
  100% {
    transform: scale(1) translate(0px, 0px);
  }
  33% {
    transform: scale(1.08) translate(30px, -20px);
  }
  66% {
    transform: scale(0.93) translate(-20px, 20px);
  }
}
.animate-blob {
  animation: blob 10s infinite ease-in-out;
}

@keyframes glow-success {
  0%,
  100% {
    shadow: 0 0 15px rgba(16, 185, 129, 0.2);
    border-color: rgba(16, 185, 129, 0.3);
  }
  50% {
    shadow: 0 0 30px rgba(16, 185, 129, 0.5);
    border-color: rgba(16, 185, 129, 0.6);
  }
}
.animate-glow-success {
  animation: glow-success 3s infinite ease-in-out;
}

@keyframes glow-error {
  0%,
  100% {
    shadow: 0 0 15px rgba(244, 63, 94, 0.2);
    border-color: rgba(244, 63, 94, 0.3);
  }
  50% {
    shadow: 0 0 30px rgba(244, 63, 94, 0.5);
    border-color: rgba(244, 63, 94, 0.6);
  }
}
.animate-glow-error {
  animation: glow-error 3s infinite ease-in-out;
}

.animate-scaleIn {
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scaleUp {
  animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.93) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.15s forwards;
  opacity: 0;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-spin-reverse {
  animation: spin-reverse 2s infinite linear;
}
@keyframes spin-reverse {
  0% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
</style>
