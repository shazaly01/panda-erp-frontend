<template>
  <div class="text-center animate-fade-in mt-2 select-none">
    <h1
      class="text-3xl md:text-4xl font-black text-white mb-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
    >
      نظام
      <span class="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
        >المنارة</span
      >
    </h1>
    <h2 class="text-[11px] text-blue-400/90 font-bold uppercase tracking-[0.2em]">
      تسجيل الحضور والانصراف الذكي
    </h2>
  </div>
</template>

<script setup>
// مكوّن عرض مرئي نقي لا يحتاج إلى منطق برميجي داخلي حالياً
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}
</style>
