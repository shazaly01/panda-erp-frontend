<!-- src/modules/purchasing/views/requisitions/components/RequisitionHeaderForm.vue -->
<template>
  <div
    class="p-4 sm:p-5 bg-[#23252e] rounded-2xl border border-[#3b3f4f] shadow-xl text-right font-sans"
    dir="rtl"
  >
    <!-- شبكة المدخلات الأساسية والمبسطة للموظف -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <!-- 1. القسم الإداري الطالب -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          القسم التابع له الطلب <span class="text-rose-500">*</span>
        </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <span class="absolute right-3 text-gray-400 pointer-events-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <p v-if="getFieldError('department_id')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('department_id') }}
        </p>
      </div>

      <!-- 2. تاريخ الحاجة الفعلي المطلوب توفير المواد قبله -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          تاريخ الاحتياج المطلوب <span class="text-rose-500">*</span>
        </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <input
            type="date"
            v-model="formData.required_date"
            class="block w-full h-full pr-4 pl-10 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
          />

          <span class="absolute left-3 text-gray-400 pointer-events-none">
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
        <p v-if="getFieldError('required_date')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('required_date') }}
        </p>
      </div>

      <!-- 3. درجة الأولوية والأهمية -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          درجة الأهمية <span class="text-rose-500">*</span>
        </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <span
            class="absolute right-3 pointer-events-none"
            :class="getPriorityIconColor(formData.priority)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <option value="low" class="bg-[#16171b]">عادية / منخفضة (Low)</option>
            <option value="medium" class="bg-[#16171b]">متوسطة الأهمية (Medium)</option>
            <option value="high" class="bg-[#16171b]">عاجلة ومهمة (High)</option>
            <option value="urgent" class="bg-[#16171b]">طارئة جداً وتوقف عمل (Urgent)</option>
          </select>
          <span class="absolute left-3 text-gray-500 pointer-events-none text-[10px]">▼</span>
        </div>
        <p v-if="getFieldError('priority')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('priority') }}
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

const getPriorityIconColor = (priority) => {
  switch (priority) {
    case 'urgent':
      return 'text-rose-400'
    case 'high':
      return 'text-amber-400'
    case 'low':
      return 'text-slate-400'
    default:
      return 'text-blue-400'
  }
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
