<!-- src/views/dashboard/DashboardView.vue -->
<template>
  <div>
    <!-- عنوان الصفحة -->
    <h1 class="text-3xl font-bold text-text-primary mb-6">لوحة التحكم</h1>

    <!-- عرض رسالة الخطأ إذا حدث -->
    <div v-if="error" class="p-4 text-center bg-danger/20 text-red-400 rounded-lg">
      <p>حدث خطأ أثناء تحميل بيانات لوحة التحكم.</p>
      <p class="text-sm mt-1">{{ error }}</p>
    </div>

    <!-- تمرير البيانات وحالة التحميل إلى المكون الفرعي -->
    <DashboardStatsCards :stats="dashboardStats" :is-loading="loading" />

    <!-- يمكنك إضافة مكونات أخرى هنا لاحقًا، مثل الرسوم البيانية -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useReportStore } from '@/stores/reportStore'
import { storeToRefs } from 'pinia'

import DashboardStatsCards from './DashboardStatsCards.vue'

// 1. استدعاء الـ store
const reportStore = useReportStore()

// 2. استخراج المتغيرات من الـ store بشكل تفاعلي (reactive)
//    `dashboardStats` سيحتوي على بيانات الإحصائيات.
//    `loading` و `error` سيساعداننا في عرض حالة التحميل أو الأخطاء.
const { dashboardStats, loading, error } = storeToRefs(reportStore)

// 3. عند تحميل المكون، قم بجلب البيانات
onMounted(() => {
  reportStore.fetchDashboardStats()
})
</script>
