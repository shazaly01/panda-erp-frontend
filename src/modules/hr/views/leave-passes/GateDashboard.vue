<!--src\modules\hr\views\leave-passes\GateDashboard.vue--->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12 px-4 sm:px-6 dynamic-fade-in">
    <!-- الهيدر الاحترافي مع تأثير الزجاج الضبابي والوهج النبضي -->
    <div
      class="relative overflow-hidden bg-gradient-to-r from-surface-section via-surface-section to-primary/5 p-6 rounded-2xl border border-surface-border shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-md transition-all duration-300"
    >
      <div
        class="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse"
      ></div>

      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10"
      >
        <div>
          <h1 class="text-2xl font-black text-text-primary flex items-center gap-3 tracking-tight">
            <span class="relative flex h-3.5 w-3.5">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-[0_0_10px_#10b981]"
              ></span>
            </span>
            شاشة استقبال البوابة الأمنية
          </h1>
          <p class="text-sm text-text-muted mt-1.5 font-medium">
            متابعة حية وفورية لكافة أذونات الخروج المعتمدة لليوم الحالي وتتبع حركة الموظفين عبر
            البوابة.
          </p>
        </div>

        <!-- طابع التاريخ المتوهج -->
        <div
          class="bg-primary/10 text-primary px-4 py-2 rounded-xl font-mono font-bold text-sm border border-primary/20 shadow-[0_0_15px_rgba(56,189,248,0.05)] transition-all hover:scale-105 duration-300"
        >
          📅 تاريخ اليوم: {{ todayDate }}
        </div>
      </div>
    </div>

    <!-- قسم الفلاتر الأنيق مع الوهج الأزرق السماوي الموحد عند التركيز -->
    <div
      class="bg-surface-section p-5 rounded-2xl border border-surface-border shadow-sm transition-all duration-300"
    >
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <!-- مربع البحث الذكي المتطور -->
        <div class="md:col-span-8 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ابحث سريعاً باسم الموظف، الرقم الوظيفي، أو رقم الهاتف..."
            class="w-full px-4 py-3 bg-surface-ground text-text-primary border-2 border-gray-300 dark:border-blue-500/40 rounded-xl shadow-inner text-sm transition-all duration-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-sky-400 dark:focus:ring-sky-400/30 dark:focus:shadow-[0_0_15px_rgba(56,189,248,0.12)]"
            @input="onSearch"
          />
          <span class="absolute left-4 top-3.5 text-text-muted pointer-events-none">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-4.35-4.35M16.65 9.65A7 7 0 112.65 9.65a7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>

        <!-- قائمة التصفية المنسدلة الأنيقة -->
        <div class="md:col-span-4">
          <select
            v-model="statusFilter"
            class="w-full px-4 py-3 bg-surface-ground text-text-primary border-2 border-gray-300 dark:border-blue-500/40 rounded-xl shadow-inner text-sm transition-all duration-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
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

    <!-- جدول استعراض البيانات المدعوم بالأنيميشن والتوهج اللحظي -->
    <div
      class="bg-surface-section rounded-2xl border border-surface-border shadow-md overflow-hidden transition-all duration-300"
    >
      <!-- تأثير جاري التحميل التفاعلي المبهج -->
      <div
        v-if="loading"
        class="p-16 text-center text-text-muted text-sm flex flex-col items-center justify-center gap-4"
      >
        <div class="relative w-12 h-12">
          <div class="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
          <div
            class="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"
          ></div>
        </div>
        <span class="font-bold tracking-wide animate-pulse text-primary"
          >جاري سحب وتحديث كشف الحركة الحي...</span
        >
      </div>

      <!-- حالة خلو البيانات -->
      <div
        v-else-if="leavePasses.length === 0"
        class="p-16 text-center text-text-muted flex flex-col items-center justify-center gap-3"
      >
        <div class="p-4 bg-surface-ground rounded-full text-gray-400 dark:text-gray-600 mb-2">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p class="text-base font-semibold text-text-secondary">
          لا توجد أذونات خروج مسجلة لليوم الحالي
        </p>
        <p class="text-xs">كل شيء مستقر وآمن بالبوابة الخارجية في الوقت الحالي.</p>
      </div>

      <!-- عرض الجدول الحي مع تفعيل تأثيرات الدخول التدريجي للموظفين الجدد -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-right border-collapse text-sm">
          <thead>
            <tr class="bg-surface-ground text-text-secondary border-b border-surface-border">
              <th class="p-4 font-bold tracking-tight text-xs uppercase">الموظف طالب الإذن</th>
              <th class="p-4 font-bold tracking-tight text-xs uppercase">الوقت المخطط والمسموح</th>
              <th class="p-4 font-bold tracking-tight text-xs uppercase">
                الحركة الفعالة (البوابة)
              </th>
              <th class="p-4 font-bold tracking-tight text-xs uppercase">كود التحقق الفريد (QR)</th>
              <th class="p-4 font-bold tracking-tight text-xs uppercase">الحالة اللحظية الحالية</th>
            </tr>
          </thead>

          <!-- استخدام Transition-group لعمل انميشن انسيابي عند تصفية الموظفين -->
          <tbody class="divide-y divide-surface-border text-text-primary relative">
            <tr
              v-for="(pass, index) in leavePasses"
              :key="pass.id"
              class="hover:bg-primary/[0.02] dark:hover:bg-sky-400/[0.02] transition-all duration-300 row-appearance-animation"
              :style="{ '--delay': index * 50 + 'ms' }"
            >
              <!-- كارت بيانات الموظف المطور مع نظام ليزر هوية الموظف الدوار والمضيء -->
              <td class="p-4">
                <div class="flex items-center gap-4">
                  <!-- كبسولة الصورة الحركية بالليزر المستوحاة تماماً من الكود المرجعي -->
                  <div
                    class="relative w-14 h-14 rounded-full p-[2px] overflow-hidden flex items-center justify-center shrink-0 border transition-all duration-500"
                    :class="{
                      'bg-slate-900 border-slate-800 shadow-[0_0_15px_rgba(16,185,129,0.25)]':
                        pass.status === 'approved',
                      'bg-slate-900 border-slate-800 shadow-[0_0_15px_rgba(245,158,11,0.25)]':
                        pass.status === 'out',
                      'bg-slate-900 border-slate-800 shadow-[0_0_15px_rgba(59,130,246,0.25)]':
                        pass.status === 'returned',
                    }"
                  >
                    <!-- شعاع الحزم الضوئية الدوارة (Laser Effect) متفاعل ديناميكياً مع حالة الإذن -->
                    <div
                      class="absolute inset-0 animate-laser-rotate pointer-events-none"
                      :class="{
                        'bg-[conic-gradient(from_0deg,transparent_50%,#10b981_90%,#10b981_100%)]':
                          pass.status === 'approved',
                        'bg-[conic-gradient(from_0deg,transparent_50%,#f59e0b_90%,#f59e0b_100%)]':
                          pass.status === 'out',
                        'bg-[conic-gradient(from_0deg,transparent_50%,#3b82f6_90%,#3b82f6_100%)]':
                          pass.status === 'returned',
                      }"
                    ></div>

                    <!-- البطانة الداخلية المعزولة لعرض الصورة الشخصية أو الرمز البديل بدقة وعمق إلكتروني -->
                    <div
                      class="relative w-full h-full bg-slate-950 rounded-full overflow-hidden flex items-center justify-center z-10"
                    >
                      <img
                        v-if="pass.employee?.profile_photo"
                        :src="
                          typeof pass.employee.profile_photo === 'object'
                            ? pass.employee.profile_photo?.url
                            : pass.employee.profile_photo
                        "
                        class="w-full h-full object-cover scale-[1.04] transition-transform duration-300 hover:scale-110"
                        alt="Employee Avatar"
                      />
                      <svg
                        v-else
                        class="w-7 h-7 text-slate-600 mt-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  <!-- الهوية النصية للموظف بجانب الصورة الشخصية المتوهجة -->
                  <div class="flex flex-col">
                    <span
                      class="font-extrabold text-sm text-text-primary tracking-tight transition-colors"
                    >
                      {{ pass.employee?.full_name }}
                    </span>
                    <span class="text-xs text-text-muted mt-1 font-medium">
                      رقم وظيفي:
                      <span class="font-mono text-text-secondary font-bold">{{
                        pass.employee?.employee_number
                      }}</span>
                      <span class="mx-1.5 opacity-40">|</span>
                      هاتف: <span class="font-mono">{{ pass.employee?.phone || '---' }}</span>
                    </span>
                  </div>
                </div>
              </td>

              <!-- النطاق المخطط للخروج المؤقت بتنسيق كبسولة زمنية جذابة -->
              <td class="p-4">
                <div class="flex items-center gap-1.5 text-xs font-semibold">
                  <span
                    class="bg-gray-100 dark:bg-gray-800 text-text-secondary px-2.5 py-1 rounded-lg border border-surface-border font-mono shadow-sm"
                  >
                    {{ pass.requested_leave_at }}
                  </span>
                  <span class="text-text-muted text-[10px] font-bold px-0.5">إلى</span>
                  <span
                    class="bg-gray-100 dark:bg-gray-800 text-text-secondary px-2.5 py-1 rounded-lg border border-surface-border font-mono shadow-sm"
                  >
                    {{ pass.requested_return_at }}
                  </span>
                </div>
              </td>

              <!-- رصد الحركات اللحظية الفعالة للبوابة بتأثير مضيء -->
              <td class="p-4 text-xs font-mono">
                <div class="space-y-1">
                  <div
                    v-if="pass.actual_leave_at"
                    class="text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    خروج: {{ pass.actual_leave_at.substring(11, 16) }}
                  </div>
                  <div
                    v-if="pass.actual_return_at"
                    class="text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-1"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]"
                    ></span>
                    عودة: {{ pass.actual_return_at.substring(11, 16) }}
                  </div>
                  <span
                    v-if="!pass.actual_leave_at && !pass.actual_return_at"
                    class="text-text-muted font-sans font-medium italic"
                  >
                    في انتظار التحرك...
                  </span>
                </div>
              </td>

              <!-- كود الإذن المتوهج لسهولة القراءة بالعين المجردة -->
              <td class="p-4">
                <span
                  class="bg-primary/5 text-primary dark:bg-sky-500/5 dark:text-sky-400 font-mono font-black px-3 py-1.5 rounded-xl text-xs tracking-widest border border-primary/20 dark:border-sky-400/20 shadow-sm"
                >
                  {{ pass.pass_code }}
                </span>
              </td>

              <!-- البادج الحركي عالي التباين المتوهج بحسب الحالة الأمنية -->
              <td class="p-4">
                <span
                  class="px-3 py-1 text-xs font-black rounded-xl border inline-flex items-center gap-2 shadow-sm transition-all duration-300"
                  :class="{
                    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:shadow-[0_0_15px_rgba(16,185,129,0.08)]':
                      pass.status === 'approved',
                    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 dark:shadow-[0_0_15px_rgba(245,158,11,0.08)]':
                      pass.status === 'out',
                    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:shadow-[0_0_15px_rgba(59,130,246,0.08)]':
                      pass.status === 'returned',
                  }"
                >
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="{
                      'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse':
                        pass.status === 'approved',
                      'bg-amber-500 shadow-[0_0_8px_#f59e0b]': pass.status === 'out',
                      'bg-blue-500 shadow-[0_0_8px_#3b82f6]': pass.status === 'returned',
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

// تثبيت التصفية على تاريخ اليوم الحالي تلقائياً
const todayDate = ref(new Date().toISOString().split('T')[0])
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

// سحب ومزامنة البيانات الحية لليوم الحالي فقط
const fetchTodayPasses = async () => {
  const filters = {
    date: todayDate.value,
    search: searchQuery.value,
    status: statusFilter.value,
  }
  try {
    await leavePassStore.fetchLeavePasses(filters)
  } catch (error) {
    console.error('فشل تحديث كشف البوابة اليومي التفاعلي:', error)
  }
}

// محرك البحث المدعوم بميزة الـ Debounce لحماية جودة الاتصال بالسيرفر
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

<style scoped>
/* انميشن انسيابي لدخول الشاشة بالكامل بشكل جذاب عند التحميل */
.dynamic-fade-in {
  animation: fadeInLayout 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInLayout {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* انميشن الدخول المتتابع لأسطر الموظفين (Staggered Entrance Effect) */
.row-appearance-animation {
  opacity: 0;
  transform: translateY(12px);
  animation: slideInRow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--delay, 0ms);
}

@keyframes slideInRow {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* إنيميشن شعاع الليزر الدوار الدائري المطابق للمرجع الممرر تماماً */
@keyframes laser-rotate {
  100% {
    transform: rotate(360deg);
  }
}

.animate-laser-rotate {
  animation: laser-rotate 2.5s linear infinite;
}

/* تعديل ملمس خطوط الجداول والتركيز الميداني البصري */
table {
  letter-spacing: -0.01em;
}
</style>
