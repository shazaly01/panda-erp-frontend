<!-- src/modules/purchasing/views/issues/components/IssueHeaderForm.vue -->
<template>
  <div
    class="p-3 bg-surface-header/60 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs space-y-2.5 text-right font-sans transition-all duration-200"
    dir="rtl"
  >
    <!-- شريط التوجيه الذكي ومسار الصرف المخزني -->
    <div
      class="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-primary/15"
    >
      <div class="flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
        <span class="text-[11px] font-black text-text-secondary">مسار إذن الصرف:</span>
        <span
          class="px-2.5 py-0.5 text-[11px] font-black rounded-lg border inline-flex items-center gap-1.5 transition-all duration-200"
          :class="
            isRequisitionLinked
              ? 'bg-info/12 text-info border-info/35'
              : 'bg-success/12 text-success border-success/35'
          "
        >
          <span
            class="inline-block w-1.5 h-1.5 rounded-full"
            :class="isRequisitionLinked ? 'bg-info' : 'bg-success animate-pulse'"
          ></span>
          {{ routeBadgeText }}
        </span>
      </div>

      <!-- عرض رقم الإذن ومعرّف طلب الاحتياج المرجعي -->
      <div class="flex items-center gap-2 text-[11px] font-mono text-text-secondary">
        <span
          class="bg-surface-card px-2.5 py-0.5 rounded-lg border border-surface-border font-bold shadow-2xs"
          :class="formData.issue_number ? 'text-primary' : 'text-text-muted'"
        >
          {{ formData.issue_number || 'توليد تسلسلي تلقائي' }}
        </span>

        <span
          v-if="formData.requisition_id"
          class="bg-surface-card px-2.5 py-0.5 rounded-lg border border-surface-border shadow-2xs"
        >
          طلب الاحتياج الداخلي: <strong class="text-info">#{{ formData.requisition_id }}</strong>
        </span>
      </div>
    </div>

    <!-- شبكة الحقول الأساسية: 4 أعمدة متساوية تماماً بارتفاع موحد 36px -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-start">
      <!-- 1. المستودع المصروف منه (warehouse_id) -->
      <div class="w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          مستودع الصرف <span class="text-danger">*</span>
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-8 pl-1 flex items-center min-w-0">
            <WarehouseDropdown
              id="issue-warehouse-id"
              v-model="formData.warehouse_id"
              label=""
              class="w-full bg-transparent header-embedded-dropdown"
            />
          </div>
        </div>
        <p
          v-if="getFieldError('warehouse_id')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('warehouse_id') }}
        </p>
      </div>

      <!-- 2. القسم المستفيد مع دعم البحث (department_id) -->
      <div class="w-full">
        <div class="flex items-center justify-between pr-1 mb-1">
          <label class="block text-[11px] font-bold text-text-secondary">القسم المستفيد</label>
          <span
            v-if="isRequisitionLinked && formData.department_id"
            class="text-[9px] text-info bg-info/10 px-1.5 rounded border border-info/30 font-bold"
          >
            من طلب الاحتياج
          </span>
        </div>

        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
          :class="{
            'opacity-75 bg-surface-card/65': isRequisitionLinked && Boolean(formData.department_id),
          }"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </span>

          <div class="w-full h-full pr-8 pl-1 flex items-center min-w-0">
            <AppDropdown
              id="issue-department-id"
              v-model="formData.department_id"
              :options="departmentOptions"
              option-label="name"
              option-value="id"
              :disabled="isRequisitionLinked && Boolean(formData.department_id)"
              :show-clear="!(isRequisitionLinked && Boolean(formData.department_id))"
              :filter="true"
              filter-placeholder="ابحث عن القسم..."
              placeholder="اختر القسم (اختياري)..."
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

      <!-- 3. تاريخ الصرف (issue_date) -->
      <div class="w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          تاريخ الصرف <span class="text-danger">*</span>
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
        >
          <input
            type="date"
            v-model="formData.issue_date"
            class="block w-full h-full px-3 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
          />
        </div>
        <p v-if="getFieldError('issue_date')" class="text-danger text-[10px] font-bold mt-0.5 pr-1">
          {{ getFieldError('issue_date') }}
        </p>
      </div>

      <!-- 4. رقم طلب الاحتياج المرتبط (اختياري) -->
      <div class="w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          رقم طلب الاحتياج
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center text-info pointer-events-none z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </span>
          <input
            type="number"
            v-model.number="formData.requisition_id"
            placeholder="معرف الطلب إن وجد..."
            class="block w-full h-full pr-8 pl-3 bg-transparent text-text-primary placeholder:text-text-muted text-xs font-mono font-bold focus:outline-none"
          />
        </div>
        <p
          v-if="getFieldError('requisition_id')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('requisition_id') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import WarehouseDropdown from '@/modules/inventory/forms/WarehouseDropdown.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  departments: { type: Array, default: () => [] },
  validationErrors: { type: Object, default: () => null },
  isRequisitionLinked: { type: Boolean, default: false },
  routeBadgeText: { type: String, default: '' },
  routeBadgeClass: { type: String, default: '' },
})

const departmentOptions = computed(() => {
  return props.departments.map((dept) => ({
    id: dept.id,
    name: dept.dropdownName || dept.name,
  }))
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
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
