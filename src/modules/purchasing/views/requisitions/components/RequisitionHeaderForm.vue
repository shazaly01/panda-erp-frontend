<!-- src/modules/purchasing/views/requisitions/components/RequisitionHeaderForm.vue -->
<template>
  <div
    class="p-4 sm:p-5 bg-[#23252e] rounded-2xl border border-[#3b3f4f] shadow-xl text-right font-sans"
    dir="rtl"
  >
    <!-- شبكة المدخلات الأساسية للترويسة (4 أعمدة متناسقة تماماً بارتفاع 36px) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      <!-- 1. القسم الإداري الطالب -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          القسم التابع له الطلب <span class="text-rose-500">*</span>
        </label>

        <AppDropdown
          id="requisition-department"
          v-model="formData.department_id"
          :options="departmentOptions"
          option-label="name"
          option-value="id"
          :disabled="!canChangeDepartment"
          :show-clear="false"
          :filter="true"
          filter-placeholder="ابحث عن القسم..."
          placeholder="اختر القسم التابع له الطلب..."
          accent-color="orange"
        >
          <template #icon>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </template>
        </AppDropdown>

        <p v-if="getFieldError('department_id')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('department_id') }}
        </p>
      </div>

      <!-- 2. الموظف المستلم للطلب (بدون شارة اختياري لتوحيد النسق) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300"> الموظف المستلم للطلب </label>

        <AppDropdown
          id="requisition-received-by"
          v-model="formData.received_by"
          :options="employees"
          option-label="full_name"
          option-value="id"
          :filter="true"
          :show-clear="true"
          filter-placeholder="ابحث باسم الموظف..."
          placeholder="اختر الموظف المستلم..."
          accent-color="orange"
        >
          <template #icon>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </template>
        </AppDropdown>

        <p v-if="getFieldError('received_by')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('received_by') }}
        </p>
      </div>

      <!-- 3. تاريخ الاحتياج الفعلي (بارتفاع 36px مقفل ومطابق تماماً للبقية) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          تاريخ الاحتياج المطلوب <span class="text-rose-500">*</span>
        </label>

        <div
          class="relative w-full h-9 min-h-[36px] max-h-[36px] bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30 overflow-hidden"
        >
          <input
            type="date"
            v-model="formData.required_date"
            style="color-scheme: dark"
            class="block w-full h-full py-0 pr-4 pl-10 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
          />

          <span class="absolute left-3 text-gray-400 pointer-events-none flex items-center">
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

      <!-- 4. درجة الأولوية والأهمية -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          درجة الأهمية <span class="text-rose-500">*</span>
        </label>

        <AppDropdown
          id="requisition-priority"
          v-model="formData.priority"
          :options="priorityOptions"
          option-label="label"
          option-value="value"
          :filter="false"
          :show-clear="false"
          placeholder="اختر درجة الأهمية..."
          accent-color="orange"
        >
          <template #icon>
            <span :class="getPriorityIconColor(formData.priority)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
          </template>
        </AppDropdown>

        <p v-if="getFieldError('priority')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('priority') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  departments: { type: Array, default: () => [] },
  employees: { type: Array, default: () => [] },
  validationErrors: { type: Object, default: () => null },
  canChangeDepartment: { type: Boolean, default: false },
})

const departmentOptions = computed(() => {
  return props.departments.map((dept) => ({
    id: dept.id,
    name: dept.dropdownName || dept.name,
  }))
})

const priorityOptions = [
  { value: 'low', label: 'عادية / منخفضة (Low)' },
  { value: 'medium', label: 'متوسطة الأهمية (Medium)' },
  { value: 'high', label: 'عاجلة ومهمة (High)' },
  { value: 'urgent', label: 'طارئة جداً وتوقف عمل (Urgent)' },
]

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
</style>
