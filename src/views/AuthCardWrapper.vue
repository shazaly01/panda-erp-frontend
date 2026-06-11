<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-surface-ground">
    <div class="aurora-container">
      <div class="aurora-shape shape1"></div>
      <div class="aurora-shape shape2"></div>
      <div class="aurora-shape shape3"></div>
    </div>

    <div class="watermark-overlay"></div>

    <div class="relative z-10 flex min-h-screen items-center justify-center p-4 my-6">
      <div ref="card" @mousemove="onMouseMove" class="glass-card w-full" :class="maxWidthClass">
        <div class="card-glare"></div>

        <div class="relative z-10">
          <div class="text-center mb-6">
            <img
              :src="brandingStore.logoMiniUrl"
              :alt="brandingStore.appName"
              class="logo-main mx-auto mb-4"
            />
            <h1 class="text-3xl font-bold text-white tracking-wider">{{ title }}</h1>
            <p v-if="subtitle" class="mt-2 text-slate-300 opacity-80 text-xs">{{ subtitle }}</p>
          </div>

          <div
            v-if="errorMessage"
            class="mb-4 p-3 text-center bg-danger/20 text-red-300 rounded-md text-sm font-semibold border border-red-500/30"
          >
            {{ errorMessage }}
          </div>

          <div
            v-if="successMessage"
            class="mb-4 p-4 text-center bg-success/20 text-green-300 rounded-md text-sm font-semibold border border-green-500/30"
          >
            {{ successMessage }}
          </div>

          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBrandingStore } from '@/stores/brandingStore'
const brandingStore = useBrandingStore()

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  successMessage: { type: String, default: '' },
  maxWidth: { type: String, default: 'md' }, // تتيح التحكم بحجم البطاقة (md أو lg)
})

const maxWidthClass = computed(() => {
  return props.maxWidth === 'lg' ? 'max-w-lg' : 'max-w-md'
})

// منطق اللمعان وحركة الماوس معزول ومحمي هنا مركزيًا
const card = ref(null)
const onMouseMove = (event) => {
  if (!card.value) return
  const rect = card.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  card.value.style.setProperty('--mouse-x', `${x}px`)
  card.value.style.setProperty('--mouse-y', `${y}px`)
}
</script>

<style>
/* --- تجميع وعزل كافة أنماط التصميم الفخمة في مكان واحد --- */
.aurora-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  filter: blur(100px) saturate(1.5);
  transform: scale(1.5);
}
.aurora-shape {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: screen;
}
.shape1 {
  width: 600px;
  height: 600px;
  background-color: rgba(30, 58, 138, 0.3);
  top: -150px;
  left: -200px;
  animation: move 25s infinite alternate;
}
.shape2 {
  width: 550px;
  height: 550px;
  background-color: rgba(245, 158, 11, 0.2);
  bottom: -100px;
  right: -150px;
  animation: move 30s infinite alternate-reverse;
}
.shape3 {
  width: 500px;
  height: 500px;
  background-color: rgba(37, 99, 235, 0.2);
  bottom: 50px;
  left: 20%;
  animation: move 22s infinite alternate;
}
@keyframes move {
  from {
    transform: translate(0, 0) rotate(0deg);
  }
  to {
    transform: translate(150px, 80px) rotate(180deg);
  }
}

.glass-card {
  position: relative;
  background: rgba(31, 41, 55, 0.6);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(55, 65, 81, 0.5);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  overflow: hidden;
}

.card-glare {
  position: absolute;
  left: var(--mouse-x, -100%);
  top: var(--mouse-y, -100%);
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0) 60%);
  pointer-events: none;
  transition:
    left 0.1s ease,
    top 0.1s ease;
}

.form-input {
  width: 100%;
  background: rgba(17, 24, 39, 0.8);
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 12px 16px 12px 45px;
  color: #f9fafb;
  transition: all 0.2s ease-in-out;
}
.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9ca3af;
}

.submit-button {
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: linear-gradient(90deg, #1e3a8a, #3b82f6);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(30, 58, 138, 0.3);
}
.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.4);
}
.submit-button:disabled {
  background: #374151;
  cursor: not-allowed;
  opacity: 0.7;
}

.watermark-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.05;
  background-image: url('/Core_Logo.png');
  background-repeat: repeat;
  background-size: 300px;
  transform: rotate(-15deg) scale(1.1);
}

.logo-main {
  width: 150px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2));
}
</style>
