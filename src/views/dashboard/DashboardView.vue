<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
    <div
      class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse"
    >
      <svg class="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    </div>

    <h1 class="text-3xl font-bold text-text-primary mb-2">أهلاً بك في Panda ERP</h1>
    <p class="text-text-muted max-w-md mx-auto leading-relaxed">
      نعمل حالياً على تطوير لوحة تحكم ذكية تلخص لك كافة العمليات المالية والإدارية. يمكنك البدء
      باستخدام القائمة الجانبية للوصول إلى موديولات النظام.
    </p>

    <div
      class="mt-10 px-6 py-3 bg-surface-section border border-surface-border rounded-full flex items-center gap-3 shadow-sm"
    >
      <span class="relative flex h-3 w-3">
        <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
        ></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
      </span>
      <span class="text-sm font-bold text-text-secondary">قسم الإحصائيات قيد التطوير</span>
    </div>
  </div>
</template>

<script setup>
// قمنا بحذف استدعاء الـ Store والـ API لتجنب أخطاء 404
</script>
