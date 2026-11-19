<!-- src/modules/auth/views/AuthCardWrapper.vue -->
<template>
  <div
    class="relative min-h-screen w-full overflow-hidden bg-surface-ground text-text-primary transition-colors duration-300"
    dir="rtl"
  >
    <!-- زر تبديل الثيم في الزاوية العلوية -->
    <div class="fixed top-4 left-4 z-30">
      <button
        @click="themeStore.toggleTheme"
        type="button"
        class="p-2.5 rounded-xl bg-surface-section/80 backdrop-blur-md text-text-secondary hover:text-primary border border-surface-border shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        :title="
          themeStore.currentTheme === 'dark'
            ? 'التبديل إلى الوضع الفاتح'
            : 'التبديل إلى الوضع الداكن'
        "
        aria-label="تبديل وضع المظهر"
      >
        <SunIcon
          v-if="themeStore.currentTheme === 'dark'"
          class="h-5 w-5 text-amber-400 transition-transform duration-300 hover:rotate-45"
        />
        <MoonIcon
          v-else
          class="h-5 w-5 text-text-secondary transition-transform duration-300 hover:-rotate-12"
        />
      </button>
    </div>

    <!-- الخلفية الضبابية الديناميكية -->
    <div class="aurora-container">
      <div class="aurora-shape shape1"></div>
      <div class="aurora-shape shape2"></div>
      <div class="aurora-shape shape3"></div>
    </div>

    <div class="watermark-overlay"></div>

    <!-- حاوية البطاقة المركزية -->
    <div class="relative z-10 flex min-h-screen items-center justify-center p-4 my-6">
      <div ref="card" @mousemove="onMouseMove" class="glass-card w-full" :class="maxWidthClass">
        <div class="card-glare"></div>

        <div class="relative z-10">
          <!-- رأس البطاقة والشعار -->
          <div class="text-center mb-6">
            <img
              v-if="brandingStore.logoMiniUrl || brandingStore.logoFullUrl"
              :src="brandingStore.logoMiniUrl || brandingStore.logoFullUrl"
              :alt="brandingStore.appName"
              class="logo-main mx-auto mb-4"
            />
            <h1 class="text-2xl sm:text-3xl font-black text-text-primary tracking-wide">
              {{ title }}
            </h1>
            <p v-if="subtitle" class="mt-2 text-text-secondary text-xs font-medium">
              {{ subtitle }}
            </p>
          </div>

          <!-- رسالة الخطأ -->
          <div
            v-if="errorMessage"
            class="mb-4 p-3 text-center bg-danger/10 text-danger rounded-xl text-xs sm:text-sm font-bold border border-danger/30"
          >
            {{ errorMessage }}
          </div>

          <!-- رسالة النجاح -->
          <div
            v-if="successMessage"
            class="mb-4 p-4 text-center bg-success/10 text-success rounded-xl text-xs sm:text-sm font-bold border border-success/30"
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
import { useThemeStore } from '@/stores/themeStore'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const brandingStore = useBrandingStore()
const themeStore = useThemeStore()

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  successMessage: { type: String, default: '' },
  maxWidth: { type: String, default: 'md' },
})

const maxWidthClass = computed(() => {
  return props.maxWidth === 'lg' ? 'max-w-lg' : 'max-w-md'
})

// منطق اللمعان وحركة الماوس
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
/* --- أنماط الخلفية الضبابية بهوية النظام البرتقالية --- */
.aurora-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  filter: blur(110px) saturate(1.3);
  transform: scale(1.4);
  pointer-events: none;
}
.aurora-shape {
  position: absolute;
  border-radius: 50%;
}
.shape1 {
  width: 550px;
  height: 550px;
  background-color: rgba(var(--color-primary), 0.14);
  top: -150px;
  left: -150px;
  animation: move 25s infinite alternate;
}
.shape2 {
  width: 500px;
  height: 500px;
  background-color: rgba(var(--color-warning), 0.12);
  bottom: -100px;
  right: -120px;
  animation: move 30s infinite alternate-reverse;
}
.shape3 {
  width: 450px;
  height: 450px;
  background-color: rgba(var(--color-primary-light), 0.12);
  bottom: 50px;
  left: 20%;
  animation: move 22s infinite alternate;
}

.dark .aurora-shape {
  mix-blend-mode: screen;
}
.dark .shape1 {
  background-color: rgba(var(--color-primary), 0.22);
}
.dark .shape2 {
  background-color: rgba(var(--color-warning), 0.16);
}
.dark .shape3 {
  background-color: rgba(var(--color-primary-dark), 0.2);
}

@keyframes move {
  from {
    transform: translate(0, 0) rotate(0deg);
  }
  to {
    transform: translate(120px, 60px) rotate(180deg);
  }
}

/* البطاقة الزجاجية المتجاوبة مع الوضعين الفاتح والداكن */
.glass-card {
  position: relative;
  background-color: rgb(var(--color-surface-section) / 0.88);
  border-radius: 20px;
  padding: 36px 32px;
  border: 1px solid rgb(var(--color-surface-border));
  border-top: 4px solid rgb(var(--color-primary));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 12px 36px -8px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.dark .glass-card {
  background-color: rgb(var(--color-surface-section) / 0.78);
  box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.55);
}

.card-glare {
  position: absolute;
  left: var(--mouse-x, -100%);
  top: var(--mouse-y, -100%);
  transform: translate(-50%, -50%);
  width: 380px;
  height: 380px;
  background: radial-gradient(
    circle,
    rgba(var(--color-primary), 0.12) 0%,
    rgba(var(--color-primary), 0) 65%
  );
  pointer-events: none;
  transition:
    left 0.1s ease,
    top 0.1s ease;
}

/* حقول الإدخال الموحدة لصفحات المصادقة */
.form-input {
  width: 100%;
  background-color: rgb(var(--color-surface-card));
  border: 1px solid rgb(var(--color-surface-border));
  border-radius: 10px;
  padding: 12px 16px 12px 44px;
  color: rgb(var(--color-text-primary));
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease-in-out;
}
.form-input::placeholder {
  color: rgb(var(--color-text-muted));
  font-weight: 500;
}
.form-input:focus {
  outline: none;
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.18);
}
.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: rgb(var(--color-surface-ground));
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: rgb(var(--color-text-muted));
  pointer-events: none;
}

/* زر الإرسال الرئيسي بهوية البرتقالي */
.submit-button {
  width: 100%;
  padding: 13px 16px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-primary-dark)));
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 6px 20px -4px rgba(var(--color-primary), 0.35);
}
.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -4px rgba(var(--color-primary), 0.45);
}
.submit-button:disabled {
  background: rgb(var(--color-secondary) / 0.45);
  color: rgb(var(--color-text-muted));
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.75;
}

/* معالجة التعبئة التلقائية للمتصفح (Autofill) لكلا الوضعين */
.glass-card input:-webkit-autofill,
.glass-card input:-webkit-autofill:hover,
.glass-card input:-webkit-autofill:focus,
.glass-card input:-webkit-autofill:active {
  -webkit-text-fill-color: rgb(var(--color-text-primary)) !important;
  box-shadow: 0 0 0px 1000px rgb(var(--color-surface-card)) inset !important;
  -webkit-box-shadow: 0 0 0px 1000px rgb(var(--color-surface-card)) inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.watermark-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.04;
  background-image: url('/Core_Logo.png');
  background-repeat: repeat;
  background-size: 300px;
  transform: rotate(-15deg) scale(1.1);
}

.logo-main {
  width: 120px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.15));
}
</style>
