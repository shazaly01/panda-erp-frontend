<!-- src/modules/hr/views/attendance/TeamAttendancePage.vue -->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- الترويسة العلوية (Vivid & Glossy Header) -->
    <div
      class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg shadow-indigo-500/30 p-6 sm:p-8"
    >
      <!-- Wave SVG Background -->
      <svg
        class="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#ffffff"
          fill-opacity="1"
          d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,170.7C960,160,1056,192,1152,208C1248,224,1344,224,1392,224L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        ></path>
      </svg>

      <div
        class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div class="text-white">
          <h1 class="text-3xl font-bold tracking-tight">حضور فريقي</h1>
          <p class="text-indigo-100 mt-1">
            الخدمة الذاتية للمدير - متابعة واعتماد الحضور اليومي للموظفين.
          </p>
        </div>

        <!-- فلتر التاريخ المخصص -->
        <div
          class="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-xl"
        >
          <label for="date-filter" class="text-sm font-medium text-white whitespace-nowrap pl-2">
            تاريخ السجل:
          </label>
          <input
            id="date-filter"
            type="date"
            v-model="selectedDate"
            @change="fetchData"
            class="p-2 border-0 rounded-lg bg-white text-gray-900 font-mono text-sm focus:ring-2 focus:ring-indigo-300 outline-none cursor-pointer"
          />
          <button
            @click="fetchData"
            class="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            title="تحديث البيانات"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- البطاقات الإحصائية -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div
        class="bg-surface-section p-5 rounded-xl shadow-sm border border-surface-border flex items-center justify-between border-l-4 border-l-indigo-500"
      >
        <div>
          <p class="text-sm text-text-muted font-medium mb-1">إجمالي الفريق</p>
          <h3 class="text-2xl font-bold text-text-primary">
            {{ teamStore.totalTeamMembers || 0 }}
          </h3>
        </div>
        <div class="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
      </div>

      <div
        class="bg-surface-section p-5 rounded-xl shadow-sm border border-surface-border flex items-center justify-between border-l-4 border-l-emerald-500"
      >
        <div>
          <p class="text-sm text-text-muted font-medium mb-1">الحضور اليوم</p>
          <h3 class="text-2xl font-bold text-text-primary">
            {{ teamStore.presentMembersCount || 0 }}
          </h3>
        </div>
        <div class="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      <div
        class="bg-surface-section p-5 rounded-xl shadow-sm border border-surface-border flex items-center justify-between border-l-4 border-l-rose-500"
      >
        <div>
          <p class="text-sm text-text-muted font-medium mb-1">الغياب / بدون بصمة</p>
          <h3 class="text-2xl font-bold text-text-primary">
            {{ teamStore.absentMembersCount || 0 }}
          </h3>
        </div>
        <div class="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-full">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- جدول إدخال الحضور (AppTable) -->
    <AppTable
      :headers="tableHeaders"
      :items="teamStore.teamMatrix"
      :isLoading="teamStore.loading"
      :row-clickable="false"
    >
      <!-- معلومات الموظف -->
      <template #cell-employee="{ item }">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold"
          >
            {{ item.full_name.charAt(0) }}
          </div>
          <div>
            <div class="font-bold text-text-primary">{{ item.full_name }}</div>
            <div class="text-xs text-text-muted font-mono">{{ item.employee_number }}</div>
          </div>
        </div>
      </template>

      <!-- المنصب -->
      <template #cell-position="{ item }">
        <span class="text-text-secondary">{{ item.position?.name || 'غير محدد' }}</span>
      </template>

      <!-- الحالة (مع إشارة للمعدل يدوياً) -->
      <template #cell-status="{ item }">
        <div class="flex flex-col gap-1 items-start">
          <span
            v-if="!item.today_attendance"
            class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
          >
            بدون بصمة
          </span>
          <span
            v-else-if="item.today_attendance.status === 'present'"
            class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          >
            حاضر
          </span>
          <span
            v-else-if="item.today_attendance.status === 'late'"
            class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          >
            متأخر ({{ item.today_attendance.delay_minutes }} د)
          </span>
          <span
            v-else
            class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {{ item.today_attendance.status }}
          </span>

          <span
            v-if="item.today_attendance?.is_manual_override"
            class="text-[10px] text-indigo-500 font-medium flex items-center gap-1"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              ></path>
            </svg>
            تعديل مشرف
          </span>
        </div>
      </template>

      <!-- حقول الإدخال المباشرة (Inline Editing) -->
      <template #cell-check_in="{ item }">
        <input
          type="time"
          v-model="editForms[item.id].check_in"
          class="w-28 p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-ground text-text-primary focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
        />
      </template>

      <template #cell-check_out="{ item }">
        <input
          type="time"
          v-model="editForms[item.id].check_out"
          class="w-28 p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-ground text-text-primary focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
        />
      </template>

      <template #cell-reason="{ item }">
        <input
          type="text"
          v-model="editForms[item.id].reason"
          placeholder="سبب التعديل..."
          class="w-36 p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-surface-ground text-text-primary focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
        />
      </template>

      <!-- زر الحفظ -->
      <template #cell-actions="{ item }">
        <button
          @click="saveRow(item.id)"
          :disabled="editForms[item.id].isSaving"
          class="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all focus:outline-none"
          :class="[
            editForms[item.id].reason.trim()
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
              : 'bg-surface-ground text-text-secondary border border-surface-border hover:bg-black/5 dark:hover:bg-white/5',
          ]"
        >
          <span
            v-if="editForms[item.id].isSaving"
            class="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full"
          ></span>
          <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          اعتماد
        </button>
      </template>
    </AppTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useTeamAttendanceStore } from '@/modules/hr/stores/teamAttendanceStore'
import AppTable from '@/components/ui/AppTable.vue' // استيراد مكونك الجاهز

const toast = useToast()
const teamStore = useTeamAttendanceStore()

// إعدادات الجدول
const tableHeaders = [
  { key: 'employee', label: 'الموظف', class: 'w-1/4' },
  { key: 'position', label: 'المنصب' },
  { key: 'status', label: 'الحالة' },
  { key: 'check_in', label: 'وقت الدخول' },
  { key: 'check_out', label: 'وقت الخروج' },
  { key: 'reason', label: 'سبب التعديل' },
  { key: 'actions', label: 'الإجراء', class: 'text-center' },
]

// الحالة (State)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const editForms = ref({}) // قاموس لحفظ بيانات الإدخال لكل صف بمعزل عن الآخر

// جلب البيانات ومزامنة حقول الإدخال
onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  try {
    await teamStore.fetchTeamMatrix(selectedDate.value)
    syncEditForms() // تجهيز حقول الإدخال بعد جلب البيانات
  } catch (error) {
    toast.error('فشل في جلب مصفوفة الحضور')
  }
}

// بناء النماذج (Inline Forms) لكل موظف
const syncEditForms = () => {
  teamStore.teamMatrix.forEach((emp) => {
    // إنشاء كائن لكل موظف إذا لم يكن موجوداً
    if (!editForms.value[emp.id]) {
      editForms.value[emp.id] = {
        check_in: '',
        check_out: '',
        reason: '',
        isSaving: false,
      }
    }

    // تعبئة الأوقات إذا كان للموظف سجل في هذا اليوم
    if (emp.today_attendance) {
      editForms.value[emp.id].check_in = emp.today_attendance.check_in
        ? emp.today_attendance.check_in.substring(0, 5)
        : ''
      editForms.value[emp.id].check_out = emp.today_attendance.check_out
        ? emp.today_attendance.check_out.substring(0, 5)
        : ''
      // لا نملأ السبب القديم حتى يكتب المشرف سبباً جديداً لكل تعديل (إجراء تدقيقي أفضل)
    } else {
      editForms.value[emp.id].check_in = ''
      editForms.value[emp.id].check_out = ''
      editForms.value[emp.id].reason = ''
    }
  })
}

// دالة الحفظ للصف الواحد
const saveRow = async (employeeId) => {
  const form = editForms.value[employeeId]

  // التحقق من وجود مبرر
  if (!form.reason.trim()) {
    return toast.warning('يجب كتابة سبب التعديل (في خانة السبب) لاعتماده.')
  }

  form.isSaving = true
  try {
    const payload = {
      employee_id: employeeId,
      date: selectedDate.value,
      check_in: form.check_in || null,
      check_out: form.check_out || null,
      reason: form.reason,
    }

    await teamStore.overrideAttendance(payload)
    toast.success('تم اعتماد التعديل وتسجيل التدقيق بنجاح.')

    // تفريغ حقل السبب بعد نجاح العملية لتجنب تكرار إرساله بالخطأ
    form.reason = ''
  } catch (error) {
    const errorMsg =
      error.response?.data?.error || error.response?.data?.message || 'فشل حفظ التعديل'
    toast.error(errorMsg)
  } finally {
    form.isSaving = false
  }
}
</script>
