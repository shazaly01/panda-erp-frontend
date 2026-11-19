<!-- src/modules/hr/views/leave-passes/GateDashboard.vue -->
<template>
  <div class="space-y-3 max-w-7xl mx-auto pb-12 text-right font-sans dynamic-fade-in" dir="rtl">
    <!-- 1. ترويسة البوابة الأمنية الحية -->
    <div
      class="relative overflow-hidden bg-surface-header/80 p-4 sm:p-5 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm transition-all duration-200"
    >
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 relative z-10"
      >
        <div>
          <h1 class="text-base sm:text-lg font-black text-text-primary flex items-center gap-2.5">
            <span class="relative flex h-3 w-3 shrink-0">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"
              ></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
            <span>شاشة استقبال البوابة الأمنية</span>
          </h1>
          <p class="text-xs text-text-secondary mt-1 font-medium pr-5">
            متابعة حية وفورية لكافة أذونات الخروج المعتمدة لليوم الحالي وتتبع حركة الموظفين عبر
            البوابة.
          </p>
        </div>

        <!-- طابع التاريخ الحالي -->
        <div
          class="inline-flex items-center gap-2 bg-surface-card text-text-primary px-3.5 py-2 rounded-xl font-mono font-black text-xs border border-primary/35 shadow-2xs shrink-0"
        >
          <svg
            class="w-4 h-4 text-primary shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>تاريخ اليوم: {{ todayDate }}</span>
        </div>
      </div>
    </div>

    <!-- 2. شريط البحث السريع والتصفية -->
    <div
      class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs transition-colors duration-200"
    >
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <!-- مربع البحث الذكي -->
        <div class="md:col-span-8 flex flex-col space-y-1">
          <label for="gate-search" class="text-[11px] font-bold text-text-secondary pr-1">
            البحث الفوري
          </label>
          <div
            class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs"
          >
            <span class="absolute right-3 text-text-muted pointer-events-none z-10">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>

            <input
              id="gate-search"
              v-model="searchQuery"
              type="text"
              placeholder="ابحث سريعاً باسم الموظف، الرقم الوظيفي، أو رقم الهاتف..."
              class="block w-full h-full pr-10 pl-9 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-semibold"
              @input="onSearch"
            />

            <button
              v-if="searchQuery"
              type="button"
              @click="clearSearch"
              class="absolute left-2.5 p-1 text-text-muted hover:text-danger rounded-md transition-colors cursor-pointer"
              title="مسح البحث"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- قائمة التصفية حسب الحالة الحركية -->
        <div class="md:col-span-4 flex flex-col space-y-1">
          <label for="gate-status-filter" class="text-[11px] font-bold text-text-secondary pr-1">
            الحالة الحركية اليوم
          </label>
          <div
            class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs"
          >
            <span class="absolute right-3 text-primary pointer-events-none z-10">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>

            <select
              id="gate-status-filter"
              v-model="statusFilter"
              class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
              @change="fetchTodayPasses"
            >
              <option value="" class="bg-surface-section text-text-primary">
                كل الحالات الحركية اليوم
              </option>
              <option value="approved" class="bg-surface-section text-text-primary">
                معتمد للعبور (لم يخرج بعد)
              </option>
              <option value="out" class="bg-surface-section text-text-primary">
                خارج المنشأة حالياً
              </option>
              <option value="returned" class="bg-surface-section text-text-primary">
                عاد للمنشأة (تم الإغلاق)
              </option>
            </select>

            <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. منصة جدول استعراض الحركة الحية (3D Elevated Stage) -->
    <div class="invoice-stage-3d rounded-2xl overflow-hidden transition-all duration-200">
      <!-- حالة التحميل -->
      <div
        v-if="loading"
        class="p-14 text-center text-text-secondary text-xs flex flex-col items-center justify-center gap-3 bg-surface-section"
      >
        <div class="relative w-10 h-10">
          <div class="absolute inset-0 rounded-full border-3 border-primary/20 animate-pulse"></div>
          <div
            class="absolute inset-0 rounded-full border-3 border-transparent border-t-primary animate-spin"
          ></div>
        </div>
        <span class="font-black text-primary">جاري سحب وتحديث كشف الحركة الحي...</span>
      </div>

      <!-- حالة خلو البيانات -->
      <div
        v-else-if="leavePasses.length === 0"
        class="p-14 text-center text-text-muted flex flex-col items-center justify-center gap-2 bg-surface-section"
      >
        <div
          class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-1"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <p class="text-sm font-black text-text-primary">لا توجد أذونات خروج مسجلة لليوم الحالي</p>
        <p class="text-xs text-text-muted">كل شيء مستقر وآمن بالبوابة الخارجية في الوقت الحالي.</p>
      </div>

      <!-- الجدول الحي -->
      <div v-else class="overflow-x-auto bg-surface-section">
        <table class="w-full text-right border-collapse text-xs">
          <thead class="invoice-thead-3d select-none h-11">
            <tr>
              <th class="px-4 py-2.5 font-black text-right">
                <span class="inline-flex items-center gap-2">
                  <span
                    class="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/25 inline-block"
                  ></span>
                  <span>الموظف طالب الإذن</span>
                </span>
              </th>
              <th class="px-4 py-2.5 font-bold text-center">الوقت المخطط والمسموح</th>
              <th class="px-4 py-2.5 font-bold text-center">الحركة الفعالة (البوابة)</th>
              <th class="px-4 py-2.5 font-bold text-center">كود التحقق (QR)</th>
              <th class="px-4 py-2.5 font-bold text-center">الحالة اللحظية</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-surface-border/70 text-text-primary">
            <tr
              v-for="(pass, index) in leavePasses"
              :key="pass.id"
              class="hover:bg-primary/5 transition-colors duration-200 row-appearance-animation"
              :style="{ '--delay': index * 45 + 'ms' }"
            >
              <!-- 1. بطاقة الموظف مع إطار الليزر التفاعلي -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3.5">
                  <div
                    class="relative w-12 h-12 rounded-full p-[2px] overflow-hidden flex items-center justify-center shrink-0 border border-surface-border bg-surface-card shadow-xs"
                  >
                    <!-- شعاع الليزر الدوار المتفاعل مع حالة الإذن -->
                    <div
                      class="absolute inset-0 animate-laser-rotate pointer-events-none"
                      :class="{
                        'bg-[conic-gradient(from_0deg,transparent_50%,#10b981_90%,#10b981_100%)]':
                          pass.status === 'approved',
                        'bg-[conic-gradient(from_0deg,transparent_50%,#f59e0b_90%,#f59e0b_100%)]':
                          pass.status === 'out',
                        'bg-[conic-gradient(from_0deg,transparent_50%,#0ea5e9_90%,#0ea5e9_100%)]':
                          pass.status === 'returned',
                      }"
                    ></div>

                    <!-- الصورة الشخصية أو الحرف البديل -->
                    <div
                      class="relative w-full h-full bg-surface-card rounded-full overflow-hidden flex items-center justify-center z-10 text-primary font-black text-sm"
                    >
                      <img
                        v-if="pass.employee?.profile_photo"
                        :src="
                          typeof pass.employee.profile_photo === 'object'
                            ? pass.employee.profile_photo?.url
                            : pass.employee.profile_photo
                        "
                        class="w-full h-full object-cover"
                        alt="صورة الموظف"
                      />
                      <span v-else>{{ pass.employee?.full_name?.charAt(0) || '?' }}</span>
                    </div>
                  </div>

                  <div class="flex flex-col gap-0.5">
                    <span class="font-black text-xs sm:text-sm text-text-primary">
                      {{ pass.employee?.full_name || '---' }}
                    </span>
                    <div class="flex items-center gap-2 text-[11px] text-text-muted flex-wrap">
                      <span class="font-mono font-bold text-primary">
                        #{{ pass.employee?.employee_number || '---' }}
                      </span>
                      <span v-if="pass.employee?.phone" class="opacity-40">|</span>
                      <span v-if="pass.employee?.phone" dir="ltr" class="font-mono">
                        {{ pass.employee.phone }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- 2. النطاق المخطط للخروج المؤقت -->
              <td class="px-4 py-3 text-center">
                <div class="inline-flex items-center gap-1.5 text-xs">
                  <span
                    class="bg-surface-ground text-text-primary px-2.5 py-1 rounded-lg border border-surface-border font-mono font-bold shadow-2xs"
                  >
                    {{ pass.requested_leave_at }}
                  </span>
                  <span class="text-text-muted text-[10px] font-bold">إلى</span>
                  <span
                    class="bg-surface-ground text-text-primary px-2.5 py-1 rounded-lg border border-surface-border font-mono font-bold shadow-2xs"
                  >
                    {{ pass.requested_return_at }}
                  </span>
                </div>
              </td>

              <!-- 3. الحركات اللحظية الفعالة للبوابة -->
              <td class="px-4 py-3 text-center text-xs font-mono">
                <div class="inline-flex flex-col items-start gap-1">
                  <div
                    v-if="pass.actual_leave_at"
                    class="text-warning font-black flex items-center gap-1.5"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></span>
                    <span>خروج: {{ pass.actual_leave_at.substring(11, 16) }}</span>
                  </div>
                  <div
                    v-if="pass.actual_return_at"
                    class="text-info font-black flex items-center gap-1.5"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-info"></span>
                    <span>عودة: {{ pass.actual_return_at.substring(11, 16) }}</span>
                  </div>
                  <span
                    v-if="!pass.actual_leave_at && !pass.actual_return_at"
                    class="text-text-muted font-sans font-medium italic"
                  >
                    في انتظار التحرك...
                  </span>
                </div>
              </td>

              <!-- 4. كود التحقق الفريد -->
              <td class="px-4 py-3 text-center">
                <AppBadge variant="primary" size="sm" class="font-mono tracking-widest select-all">
                  {{ pass.pass_code }}
                </AppBadge>
              </td>

              <!-- 5. الحالة اللحظية -->
              <td class="px-4 py-3 text-center">
                <AppBadge :variant="getStatusVariant(pass.status)" size="sm" pill>
                  <span class="inline-flex items-center gap-1.5">
                    <span
                      class="w-2 h-2 rounded-full"
                      :class="{
                        'bg-success animate-pulse': pass.status === 'approved',
                        'bg-warning': pass.status === 'out',
                        'bg-info': pass.status === 'returned',
                      }"
                    ></span>
                    <span>{{ getStatusLabel(pass.status) }}</span>
                  </span>
                </AppBadge>
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
import AppBadge from '@/components/ui/AppBadge.vue'

const leavePassStore = useLeavePassStore()
const { leavePasses, loading } = storeToRefs(leavePassStore)

const todayDate = ref(new Date().toISOString().split('T')[0])
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

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

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchTodayPasses()
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  fetchTodayPasses()
}

const getStatusVariant = (status) => {
  const map = {
    approved: 'success',
    out: 'warning',
    returned: 'info',
  }
  return map[status] || 'secondary'
}

const getStatusLabel = (status) => {
  const map = {
    approved: 'معتمد للعبور',
    out: 'خارج المنشأة',
    returned: 'عاد للمنشأة',
  }
  return map[status] || status
}

onMounted(() => {
  fetchTodayPasses()
})
</script>

<style scoped>
.dynamic-fade-in {
  animation: fadeInLayout 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInLayout {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.row-appearance-animation {
  opacity: 0;
  transform: translateY(10px);
  animation: slideInRow 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--delay, 0ms);
}

@keyframes slideInRow {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes laser-rotate {
  100% {
    transform: rotate(360deg);
  }
}

.animate-laser-rotate {
  animation: laser-rotate 2.5s linear infinite;
}
</style>
