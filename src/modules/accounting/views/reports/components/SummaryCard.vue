<template>
  <div
    class="p-5 rounded-2xl border transition-all duration-300 shadow-sm"
    :class="[bg, border, isDark ? 'shadow-lg shadow-primary/10' : '']"
  >
    <p
      class="text-[10px] font-black uppercase tracking-widest mb-1"
      :class="isDark ? 'text-slate-900/70' : color"
    >
      {{ title }}
    </p>

    <div class="flex items-baseline justify-between">
      <h3
        class="text-2xl font-black font-mono tracking-tight"
        :class="isDark ? 'text-slate-900' : 'text-white'"
      >
        {{ formatNumber(value) }}
      </h3>

      <div class="opacity-10" :class="isDark ? 'text-slate-900' : color">
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  color: { type: String, default: 'text-primary' },
  bg: { type: String, default: 'bg-slate-800' },
  border: { type: String, default: 'border-slate-700' },
  isDark: { type: Boolean, default: false }, // للتمييز مثل الرصيد الختامي
})

const formatNumber = (num) => {
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>
