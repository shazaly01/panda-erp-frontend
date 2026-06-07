<template>
  <div
    class="bg-slate-900/20 backdrop-blur-xl border border-slate-900 shadow-[0_15px_35px_rgba(0,0,0,0.6)] rounded-2xl px-6 py-3 w-full max-w-sm text-center border-t-white/5 mb-2"
  >
    <div
      class="text-3xl font-mono font-black text-white tracking-tighter bg-gradient-to-b from-white to-slate-300 bg-clip-text"
      dir="ltr"
    >
      {{ currentTime }}
    </div>
    <div class="text-[10px] font-bold text-slate-500 tracking-wide mt-0.5">
      {{ currentDate }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

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
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
