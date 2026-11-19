<!-- src/modules/purchasing/views/requisitions/components/RequisitionHeaderForm.vue -->
<template>
  <div
    class="p-3 bg-surface-header/60 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs space-y-2.5 text-right font-sans transition-all duration-200"
    dir="rtl"
  >
    <!-- شريط عنوان القسم العلوي -->
    <div class="flex items-center justify-between pb-1 border-b border-primary/15">
      <span class="text-[11px] font-black text-text-secondary flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
        البيانات الأساسية لطلب الشراء والاحتياج
      </span>
    </div>

    <!-- شبكة المدخلات الأساسية للترويسة: 4 أعمدة متساوية تماماً بارتفاع 36px -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-start">
      <!-- 1. القسم الإداري الطالب -->
      <div class="w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          القسم التابع له الطلب <span class="text-danger">*</span>
        </label>

        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
          :class="{ 'opacity-75 bg-surface-card/65': !canChangeDepartment }"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </span>

          <div class="w-full h-full pr-8 pl-1 flex items-center min-w-0">
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
              placeholder="اختر القسم..."
              class="w-full bg-transparent header-embedded-dropdown"
            />
          </div>
        </div>

        <p
          v-if="getFieldError('department_id')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('department_id') }}
        </p>
      </div>

      <!-- 2. الموظف المستلم للطلب -->
      <div class="w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          الموظف المستلم للطلب
        </label>

        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </span>

          <div class="w-full h-full pr-8 pl-1 flex items-center min-w-0">
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
              class="w-full bg-transparent header-embedded-dropdown"
            />
          </div>
        </div>

        <p
          v-if="getFieldError('received_by')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('received_by') }}
        </p>
      </div>

      <!-- 3. تاريخ الاحتياج الفعلي -->
      <div class="w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          تاريخ الاحتياج المطلوب <span class="text-danger">*</span>
        </label>

        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
        >
          <input
            type="date"
            v-model="formData.required_date"
            class="block w-full h-full px-3 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
          />
        </div>

        <p
          v-if="getFieldError('required_date')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('required_date') }}
        </p>
      </div>

      <!-- 4. درجة الأولوية والأهمية -->
      <div class="w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          درجة الأهمية <span class="text-danger">*</span>
        </label>

        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center pointer-events-none z-10"
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

          <div class="w-full h-full pr-8 pl-1 flex items-center min-w-0">
            <AppDropdown
              id="requisition-priority"
              v-model="formData.priority"
              :options="priorityOptions"
              option-label="label"
              option-value="value"
              :filter="false"
              :show-clear="false"
              placeholder="اختر درجة الأهمية..."
              class="w-full bg-transparent header-embedded-dropdown"
            />
          </div>
        </div>

        <p v-if="getFieldError('priority')" class="text-danger text-[10px] font-bold mt-0.5 pr-1">
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
      return 'text-danger'
    case 'high':
      return 'text-warning'
    case 'low':
      return 'text-text-muted'
    default:
      return 'text-primary'
  }
}
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.65;
}

/* ضبط القوائم المنسدلة المدمجة ومنع التفاف النصوص لسطرين */
:deep(.header-embedded-dropdown .p-dropdown),
:deep(.header-embedded-dropdown [data-pc-name='dropdown']),
:deep(.header-embedded-dropdown [data-pc-section='root']),
:deep(.header-embedded-dropdown div.inline-flex) {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  height: 36px !important;
  min-height: 36px !important;
  width: 100% !important;
}

:deep(.header-embedded-dropdown .p-dropdown-label),
:deep(.header-embedded-dropdown [data-pc-section='input']) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  padding: 0 0.25rem !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  display: block !important;
  line-height: 36px !important;
}

:deep(.header-embedded-dropdown .p-dropdown:not(.p-disabled).p-focus) {
  box-shadow: none !important;
  border: none !important;
}
</style>
