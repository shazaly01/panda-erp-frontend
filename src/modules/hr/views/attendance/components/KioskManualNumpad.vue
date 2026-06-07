<template>
  <div
    class="w-full max-w-xs bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 p-4 rounded-3xl shadow-2xl flex flex-col gap-3 animate-fade-in select-none"
  >
    <div
      class="w-full bg-slate-950/80 border border-slate-800 text-center py-3 px-4 rounded-xl text-xl font-mono font-bold text-emerald-400 tracking-widest min-h-[52px] flex items-center justify-center shadow-inner"
      dir="ltr"
    >
      {{ displayValue || '---' }}
    </div>

    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
        :key="num"
        type="button"
        @click="pressNum(num)"
        class="h-14 bg-slate-900/60 hover:bg-slate-800/80 active:scale-95 border border-slate-800/50 hover:border-slate-700 text-white font-mono text-xl font-bold rounded-xl transition-all duration-150 flex items-center justify-center"
      >
        {{ num }}
      </button>

      <button
        type="button"
        @click="pressBackspace"
        class="h-14 bg-rose-950/30 hover:bg-rose-900/40 active:scale-95 border border-rose-900/30 text-rose-400 font-bold rounded-xl transition-all duration-150 flex items-center justify-center"
        title="حذف رقم"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H20a2 2 0 012 2v10a2 2 0 01-2 2h-9.172a2 2 0 01-1.414-.586L3 12z"
          />
        </svg>
      </button>

      <button
        type="button"
        @click="pressNum(0)"
        class="h-14 bg-slate-900/60 hover:bg-slate-800/80 active:scale-95 border border-slate-800/50 hover:border-slate-700 text-white font-mono text-xl font-bold rounded-xl transition-all duration-150 flex items-center justify-center"
      >
        0
      </button>

      <button
        type="button"
        @click="submit"
        class="h-14 bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white font-bold rounded-xl transition-all duration-150 flex items-center justify-center"
        title="تأكيد الحضور"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const displayValue = ref(props.modelValue)

// مزامنة القيمة مع الأب في حال تم تصفيرها من الخارج بعد المسح الناجح
watch(
  () => props.modelValue,
  (newVal) => {
    displayValue.value = newVal
  },
)

const pressNum = (num) => {
  displayValue.value += num.toString()
  emit('update:modelValue', displayValue.value)
}

const pressBackspace = () => {
  displayValue.value = displayValue.value.slice(0, -1)
  emit('update:modelValue', displayValue.value)
}

const submit = () => {
  if (displayValue.value.trim()) {
    emit('submit', displayValue.value.trim())
    displayValue.value = ''
    emit('update:modelValue', '')
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
