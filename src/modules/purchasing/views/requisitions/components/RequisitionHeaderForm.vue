<!-- src/modules/purchasing/views/requisitions/components/RequisitionHeaderForm.vue -->
<template>
  <div
    class="p-5 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl space-y-4 text-right font-sans"
    dir="rtl"
  >
    <!-- شريط معلومات المسار وحالة المستند -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-700/40">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-gray-300">طبيعة المستند:</span>
        <span
          class="px-3 py-1 text-xs font-black rounded-lg border flex items-center gap-1.5 transition-all duration-300 bg-orange-950/40 text-orange-400 border-orange-500/30"
        >
          <span class="inline-block w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
          طلب احتياج داخلي للموظفين والأقسام
        </span>
      </div>

      <div class="flex items-center gap-2 text-xs font-mono text-gray-400">
        <span class="text-gray-400 text-[11px]">حالة الطلب:</span>
        <span
          class="px-2.5 py-0.5 rounded border text-[11px] font-bold"
          :class="getStatusBadgeClass(formData.status)"
        >
          {{ getStatusLabel(formData.status) }}
        </span>
      </div>
    </div>

    <!-- الشبكة الأساسية: الصف الأول (3 أعمدة) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 1. رقم الطلب التسلسلي (requisition_number) - مقفل ومولّد تلقائياً -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-gray-300 mb-1"> رقم الطلب التسلسلي </label>
        <div
          class="relative w-full h-11 bg-[#121316] border border-[#3e414c] rounded-lg flex items-center shadow-inner cursor-not-allowed"
        >
          <span class="absolute right-3 text-[#e05e2b] pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
              />
            </svg>
          </span>

          <input
            type="text"
            :value="formData.requisition_number || 'توليد تسلسلي تلقائي عند الحفظ...'"
            readonly
            tabindex="-1"
            class="block w-full h-full pr-10 pl-4 bg-transparent text-gray-400 font-mono font-bold text-xs focus:outline-none cursor-not-allowed select-none"
          />
        </div>
        <p
          v-if="getFieldError('requisition_number')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('requisition_number') }}
        </p>
      </div>

      <!-- 2. القسم الإداري الطالب (department_id) -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-gray-300 mb-1"> القسم الإداري الطالب </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
        >
          <span class="absolute right-3 text-gray-400 pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </span>

          <select
            v-model="formData.department_id"
            style="color-scheme: dark"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-white focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="" class="bg-[#16171b] text-gray-400">
              اختر القسم التابع له الطلب...
            </option>
            <option
              v-for="dept in departments"
              :key="dept.id"
              :value="dept.id"
              class="bg-[#16171b]"
            >
              {{ dept.name }}
            </option>
          </select>
          <span class="absolute left-3 text-gray-500 pointer-events-none text-[10px]">▼</span>
        </div>
        <p
          v-if="getFieldError('department_id')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('department_id') }}
        </p>
      </div>

      <!-- 3. درجة الأولوية (priority) -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-gray-300 mb-1">
          درجة الأولوية والأهمية <span class="text-rose-500">*</span>
        </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
        >
          <span class="absolute right-3 text-amber-400 pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </span>

          <select
            v-model="formData.priority"
            style="color-scheme: dark"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-white focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="low" class="bg-[#16171b]">منخفضة (Low)</option>
            <option value="medium" class="bg-[#16171b]">متوسطة (Medium)</option>
            <option value="high" class="bg-[#16171b]">عاجلة (High)</option>
            <option value="urgent" class="bg-[#16171b]">طارئة جداً (Urgent)</option>
          </select>
          <span class="absolute left-3 text-gray-500 pointer-events-none text-[10px]">▼</span>
        </div>
        <p v-if="getFieldError('priority')" class="text-rose-500 text-[10px] font-bold mt-1 pr-1">
          {{ getFieldError('priority') }}
        </p>
      </div>
    </div>

    <!-- الشبكة الأساسية: الصف الثاني (تواريخ الطلب والحاجة) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 4. تاريخ تقديم الطلب (request_date) -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-gray-300 mb-1"> تاريخ تقديم الطلب </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
        >
          <input
            type="date"
            v-model="formData.request_date"
            class="block w-full h-full pr-4 pl-20 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
          />

          <span
            class="absolute left-3 text-gray-400 pointer-events-none flex items-center gap-1.5 text-xs z-10"
          >
            <span class="text-gray-400 font-medium text-[11px]">تاريخ الطلب</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>
        </div>
        <p
          v-if="getFieldError('request_date')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('request_date') }}
        </p>
      </div>

      <!-- 5. تاريخ الحاجة الفعلي (required_date) -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-gray-300 mb-1">
          تاريخ الاحتياج المطلوب توريده قبله
        </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
        >
          <input
            type="date"
            v-model="formData.required_date"
            class="block w-full h-full pr-4 pl-20 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
          />

          <span
            class="absolute left-3 text-gray-400 pointer-events-none flex items-center gap-1.5 text-xs z-10"
          >
            <span class="text-gray-400 font-medium text-[11px]">تاريخ الاحتياج</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
        </div>
        <p
          v-if="getFieldError('required_date')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('required_date') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  departments: { type: Array, default: () => [] },
  validationErrors: { type: Object, default: () => null },
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة قيد الإعداد',
    pending: 'بانتظار الاعتماد',
    submitted: 'بانتظار الاعتماد',
    approved: 'معتمد',
    rejected: 'مرفوض',
  }
  return map[status] || status || 'مسودة'
}

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    pending: 'bg-sky-950/40 text-sky-400 border-sky-500/30',
    submitted: 'bg-sky-950/40 text-sky-400 border-sky-500/30',
    approved: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-rose-950/40 text-rose-400 border-rose-500/30',
  }
  return map[status] || 'bg-gray-800 text-gray-300 border-gray-600'
}
</script>

<style scoped>
input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.6;
}

select option {
  background-color: #16171b !important;
  color: #f8fafc !important;
}
</style>
