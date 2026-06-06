<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-section p-6 rounded-xl border border-surface-border shadow-sm"
    >
      <div>
        <h1 class="text-2xl font-bold text-text-primary flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
          شاشة استقبال البوابة الأمنية
        </h1>
        <p class="text-sm text-text-muted mt-1">
          متابعة حية وفورية لكافة أذونات الخروج المعتمدة لليوم الحالي وتتبع حركة الموظفين عبر
          البوابة (للعرض الميداني).
        </p>
      </div>
      <div
        class="bg-primary/10 text-primary px-4 py-2 rounded-lg font-mono font-bold text-sm border border-primary/20 shadow-sm"
      >
        تاريخ اليوم: {{ todayDate }}
      </div>
    </div>

    <div class="bg-surface-section p-4 rounded-xl border border-surface-border shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div class="md:col-span-8">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ابحث سريعاً باسم الموظف، الرقم الوظيفي، أو رقم الهاتف..."
            class="w-full px-4 py-2.5 bg-surface-ground text-text-primary border border-surface-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
            @input="onSearch"
          />
        </div>
        <div class="md:col-span-4">
          <select
            v-model="statusFilter"
            class="w-full px-4 py-2.5 bg-surface-ground text-text-primary border border-surface-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
            @change="fetchTodayPasses"
          >
            <option value="">كل الحالات الحركية اليوم</option>
            <option value="approved">معتمد للعبور (لم يخرج بعد)</option>
            <option value="out">خارج المنشأة حالياً</option>
            <option value="returned">عاد للمنشأة (تم الإغلاق)</option>
          </select>
        </div>
      </div>
    </div>

    <div
      class="bg-surface-section rounded-xl border border-surface-border shadow-sm overflow-hidden"
    >
      <div
        v-if="loading"
        class="p-12 text-center text-text-muted text-sm flex flex-col items-center gap-3"
      >
        <svg
          class="animate-spin h-8 w-8 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        جاري تحديث كشف الأذونات اللحظي...
      </div>

      <div v-else-if="leavePasses.length === 0" class="p-12 text-center text-text-muted text-sm">
        لا توجد أذونات خروج مسجلة أو مطابقة للبحث لليوم الحالي {{ todayDate }}.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-right border-collapse text-sm">
          <thead>
            <tr class="bg-surface-ground text-text-secondary border-b border-surface-border">
              <th class="p-4 font-semibold">الموظف طالب الإذن</th>
              <th class="p-4 font-semibold">الوقت المخطط والمسموح</th>
              <th class="p-4 font-semibold">الحركة الفعالة (البوابة)</th>
              <th class="p-4 font-semibold">كود التحقق الفريد (QR)</th>
              <th class="p-4 font-semibold">الحالة اللحظية الحالية</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-border text-text-primary">
            <tr
              v-for="pass in leavePasses"
              :key="pass.id"
              class="hover:bg-surface-ground/40 transition-colors"
            >
              <td class="p-4">
                <div class="flex flex-col">
                  <span class="font-bold text-sm text-text-primary">{{
                    pass.employee?.full_name
                  }}</span>
                  <span class="text-xs text-text-muted mt-1"
                    >رقم وظيفي: {{ pass.employee?.employee_number }} | هاتف:
                    {{ pass.employee?.phone || '---' }}</span
                  >
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center gap-1.5 text-xs font-medium">
                  <span
                    class="bg-surface-border/60 px-2 py-0.5 rounded text-text-secondary font-mono"
                    >{{ pass.requested_leave_at }}</span
                  >
                  <span class="text-text-muted text-[10px]">إلى</span>
                  <span
                    class="bg-surface-border/60 px-2 py-0.5 rounded text-text-secondary font-mono"
                    >{{ pass.requested_return_at }}</span
                  >
                </div>
              </td>
              <td class="p-4 text-xs font-mono">
                <div
                  v-if="pass.actual_leave_at"
                  class="text-amber-600 dark:text-amber-400 font-bold"
                >
                  مغادرة: {{ pass.actual_leave_at.substring(11, 16) }}
                </div>
                <div
                  v-if="pass.actual_return_at"
                  class="text-blue-600 dark:text-blue-400 font-bold mt-1"
                >
                  عودة: {{ pass.actual_return_at.substring(11, 16) }}
                </div>
                <span v-if="!pass.actual_leave_at && !pass.actual_return_at" class="text-text-muted"
                  >لم يتحرك بعد</span
                >
              </td>
              <td class="p-4">
                <span
                  class="bg-primary/10 text-primary font-mono font-bold px-2.5 py-1 rounded text-xs tracking-wider border border-primary/20"
                >
                  {{ pass.pass_code }}
                </span>
              </td>
              <td class="p-4">
                <span
                  class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border inline-flex items-center gap-1.5"
                  :class="{
                    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400':
                      pass.status === 'approved',
                    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400':
                      pass.status === 'out',
                    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400':
                      pass.status === 'returned',
                  }"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="{
                      'bg-emerald-500': pass.status === 'approved',
                      'bg-amber-500': pass.status === 'out',
                      'bg-blue-500': pass.status === 'returned',
                    }"
                  ></span>
                  {{
                    pass.status === 'approved'
                      ? 'معتمد للعبور'
                      : pass.status === 'out'
                        ? 'خارج المنشأة'
                        : 'عاد للمنشأة'
                  }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useLeavePassStore } from '@/modules/hr/stores/leavePassStore'

const leavePassStore = useLeavePassStore()
const { leavePasses, loading } = storeToRefs(leavePassStore)

// توليد وإجبار تصفية التاريخ على تاريخ اليوم الحالي فقط بصيغة YYYY-MM-DD
const todayDate = ref(new Date().toISOString().split('T')[0])
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

// دالة سحب أذونات اليوم الحالي فقط وإرسال الفلاتر المتوافقة مع الباكيند
const fetchTodayPasses = async () => {
  const filters = {
    date: todayDate.value, // إجبار التصفية الميدانية على اليوم الحالي دائماً
    search: searchQuery.value,
    status: statusFilter.value,
  }
  try {
    await leavePassStore.fetchLeavePasses(filters)
  } catch (error) {
    console.error('فشل جلب أذونات الاستقبال اليومية لليوم الحالي:', error)
  }
}

// محرك الفلترة والبحث اللحظي مع ميزة الـ Debounce لحماية أداء السيرفر
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchTodayPasses()
  }, 500)
}

onMounted(() => {
  fetchTodayPasses()
})
</script>
