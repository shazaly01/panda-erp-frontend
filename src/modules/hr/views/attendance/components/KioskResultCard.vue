<template>
  <div
    :class="[
      'p-6 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] flex flex-col items-center border transition-all duration-500 backdrop-blur-2xl relative overflow-hidden w-full text-center',
      resultTheme.card,
      resultTheme.glow,
    ]"
  >
    <div class="relative w-44 h-44 flex items-center justify-center mb-5 group select-none">
      <div
        :class="['absolute inset-0 pointer-events-none animate-pulse-slow', resultTheme.techColor]"
      >
        <div
          class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-current rounded-tl-md"
        ></div>
        <div
          class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-current rounded-tr-md"
        ></div>
        <div
          class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-current rounded-bl-md"
        ></div>
        <div
          class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-current rounded-br-md"
        ></div>
      </div>

      <div
        :class="[
          'w-36 h-36 rounded-full p-1 bg-slate-950 border transition-all duration-500 flex items-center justify-center overflow-hidden',
          resultTheme.photoBorder,
        ]"
      >
        <img
          v-if="result.profile_photo"
          :src="
            typeof result.profile_photo === 'object'
              ? result.profile_photo?.url
              : result.profile_photo
          "
          class="w-full h-full object-cover rounded-full scale-[1.01] bg-slate-900"
          alt="Employee"
        />
        <svg v-else class="w-16 h-16 text-slate-700 mt-2" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </div>
    </div>

    <div class="z-10 w-full flex flex-col items-center flex-1 justify-center">
      <h3 class="text-2xl md:text-3xl font-black mb-2 text-white tracking-wide drop-shadow-md">
        {{ result.employee_name || 'تنبيه النظام' }}
      </h3>
      <p class="text-sm font-bold text-slate-300 opacity-90 max-w-xs mb-4 leading-relaxed">
        {{ result.message }}
      </p>

      <div
        v-if="result.voucher"
        class="bg-slate-950/80 border border-sky-500/20 rounded-xl px-4 py-1.5 shadow-[0_4px_15px_rgba(14,165,233,0.1)] backdrop-blur-md mb-4 animate-pulse-slow"
      >
        <span class="block text-[8px] text-sky-400 font-black uppercase tracking-widest mb-0.5"
          >كود الإنترنت اليومي (1GB)</span
        >
        <span class="text-lg font-mono font-black text-white tracking-[0.2em]">{{
          result.voucher
        }}</span>
      </div>

      <div
        v-if="result.time"
        class="bg-slate-950/40 border border-slate-850/60 px-4 py-1.5 rounded-xl min-w-[110px]"
      >
        <span class="block text-[8px] font-black uppercase tracking-widest mb-0.5 text-slate-500"
          >الوقت المسجل</span
        >
        <span :class="['text-lg font-mono font-black', resultTheme.time]" dir="ltr">{{
          result.time
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
})

// تحديث مصفوفة الثيمات لتوزيع الهالات والزوايا التقنية حسب الحالة تلقائياً
const resultTheme = computed(() => {
  if (!props.result) return {}
  const status = props.result.status
  const action = props.result.action

  if (status === 'success') {
    return action === 'check_in'
      ? {
          card: 'bg-emerald-950/20 border-emerald-500/30',
          glow: 'shadow-[0_0_50px_rgba(16,185,129,0.15)]',
          time: 'text-emerald-400',
          photoBorder: 'border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]',
          techColor: 'text-emerald-500/60',
        }
      : {
          card: 'bg-blue-950/20 border-blue-500/30',
          glow: 'shadow-[0_0_50px_rgba(59,130,246,0.15)]',
          time: 'text-blue-400',
          photoBorder: 'border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.2)]',
          techColor: 'text-blue-500/60',
        }
  }

  return status === 'warning'
    ? {
        card: 'bg-amber-950/20 border-amber-500/30',
        glow: 'shadow-[0_0_50px_rgba(245,158,11,0.15)]',
        time: 'text-amber-400',
        photoBorder: 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)]',
        techColor: 'text-amber-500/60',
      }
    : {
        card: 'bg-rose-950/20 border-rose-500/30',
        glow: 'shadow-[0_0_50px_rgba(244,63,94,0.15)]',
        time: 'text-rose-400',
        photoBorder: 'border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.2)]',
        techColor: 'text-rose-500/60',
      }
})
</script>

<style scoped>
@keyframes pulseSlow {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.97);
  }
}
.animate-pulse-slow {
  animation: pulseSlow 2.5s ease-in-out infinite;
}
</style>
