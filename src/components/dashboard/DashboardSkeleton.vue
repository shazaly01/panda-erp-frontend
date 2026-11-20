<!-- src/components/dashboard/DashboardSkeleton.vue -->
<template>
  <div class="space-y-6" aria-busy="true" aria-label="جاري تحميل بيانات لوحة التحكم">
    <!-- صف المؤشرات الرئيسية (4 بطاقات) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      <div
        v-for="i in 4"
        :key="`kpi-skel-${i}`"
        class="rounded-xl border border-surface-border bg-surface-card p-5 space-y-4"
      >
        <div class="flex items-center justify-between">
          <div class="space-y-2 w-2/3">
            <div class="dashboard-shimmer h-3.5 w-24 rounded-md bg-surface-border/40"></div>
            <div class="dashboard-shimmer h-2.5 w-16 rounded-md bg-surface-border/30"></div>
          </div>
          <div class="dashboard-shimmer h-11 w-11 rounded-xl bg-surface-border/40"></div>
        </div>

        <div class="dashboard-shimmer h-8 w-36 rounded-lg bg-surface-border/50"></div>

        <div class="flex items-center justify-between pt-2 border-t border-surface-border/50">
          <div class="dashboard-shimmer h-5 w-16 rounded-md bg-surface-border/40"></div>
          <div class="dashboard-shimmer h-9 w-24 rounded-md bg-surface-border/35"></div>
        </div>
      </div>
    </div>

    <!-- صف المؤشرات الثانوية والتنبيهات (3 بطاقات) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="i in 3"
        :key="`alert-skel-${i}`"
        class="rounded-xl border border-surface-border bg-surface-card p-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-3 w-3/4">
          <div class="dashboard-shimmer h-11 w-11 rounded-xl bg-surface-border/40 shrink-0"></div>
          <div class="space-y-2 w-full">
            <div class="dashboard-shimmer h-3.5 w-32 rounded-md bg-surface-border/45"></div>
            <div class="dashboard-shimmer h-2.5 w-24 rounded-md bg-surface-border/30"></div>
          </div>
        </div>
        <div class="dashboard-shimmer h-7 w-10 rounded-lg bg-surface-border/45"></div>
      </div>
    </div>

    <!-- صف الرسوم البيانية -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div
        class="lg:col-span-8 rounded-xl border border-surface-border bg-surface-card p-5 space-y-4"
      >
        <div class="dashboard-shimmer h-4 w-44 rounded-md bg-surface-border/45"></div>
        <div class="dashboard-shimmer h-72 w-full rounded-xl bg-surface-border/25"></div>
      </div>
      <div
        class="lg:col-span-4 rounded-xl border border-surface-border bg-surface-card p-5 space-y-4"
      >
        <div class="dashboard-shimmer h-4 w-36 rounded-md bg-surface-border/45"></div>
        <div class="dashboard-shimmer h-72 w-full rounded-xl bg-surface-border/25"></div>
      </div>
    </div>
  </div>
</template>
