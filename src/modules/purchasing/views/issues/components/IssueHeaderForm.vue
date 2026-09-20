<!-- src/modules/purchasing/views/issues/components/IssueHeaderForm.vue -->
<template>
  <div
    class="p-4 sm:p-5 bg-[#23252e] rounded-2xl border border-[#3b3f4f] shadow-xl space-y-4 text-right font-sans"
    dir="rtl"
  >
    <!-- شريط التوجيه الذكي ومسار الصرف المخزني -->
    <div
      class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-gray-300">مسار إذن الصرف:</span>
        <span
          class="px-3 py-1 text-xs font-black rounded-lg border flex items-center gap-1.5 transition-all duration-300"
          :class="routeBadgeClass"
        >
          <span
            class="inline-block w-2 h-2 rounded-full"
            :class="isRequisitionLinked ? 'bg-sky-400' : 'bg-emerald-400 animate-pulse'"
          ></span>
          {{ routeBadgeText }}
        </span>
      </div>

      <div
        v-if="formData.requisition_id"
        class="flex items-center gap-4 text-xs font-mono text-gray-400"
      >
        <div
          class="flex items-center gap-1.5 bg-[#16171b] px-3 py-1 rounded-lg border border-[#3e414c]"
        >
          <span class="text-gray-400 text-[11px]">طلب الاحتياج الداخلي:</span>
          <span class="text-sky-400 font-bold">#{{ formData.requisition_id }}</span>
        </div>
      </div>
    </div>

    <!-- شبكة الحقول الأساسية: 4 أعمدة متناسقة -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- 1. رقم إذن الصرف التسلسلي (issue_number) - مقفل ومولّد تلقائياً -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">رقم الإذن</label>
        <div
          class="relative w-full h-11 bg-[#121316] border border-[#3e414c] rounded-xl flex items-center shadow-inner cursor-not-allowed"
        >
          <span class="absolute right-3 text-[#e05e2b] pointer-events-none z-10">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            :value="formData.issue_number || 'توليد تسلسلي تلقائي...'"
            readonly
            tabindex="-1"
            class="block w-full h-full pr-10 pl-4 bg-transparent text-gray-400 font-mono font-bold text-xs focus:outline-none cursor-not-allowed select-none"
          />
        </div>
        <p v-if="getFieldError('issue_number')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('issue_number') }}
        </p>
      </div>

      <!-- 2. المستودع المصروف منه (warehouse_id) - إلزامي -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          مستودع الصرف <span class="text-rose-500">*</span>
        </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <span
            class="absolute right-3 text-emerald-400 pointer-events-none z-10 flex items-center"
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
          <div class="w-full h-full pr-9 pl-1 flex items-center">
            <WarehouseDropdown
              id="issue-warehouse-id"
              v-model="formData.warehouse_id"
              label=""
              class="w-full bg-transparent header-dropdown"
            />
          </div>
        </div>
        <p v-if="getFieldError('warehouse_id')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('warehouse_id') }}
        </p>
      </div>

      <!-- 3. تاريخ الصرف (issue_date) - إلزامي -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          تاريخ الصرف <span class="text-rose-500">*</span>
        </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <input
            type="date"
            v-model="formData.issue_date"
            class="block w-full h-full pr-4 pl-10 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
          />
          <span class="absolute left-3 text-gray-400 pointer-events-none flex items-center z-10">
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
        <p v-if="getFieldError('issue_date')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('issue_date') }}
        </p>
      </div>

      <!-- 4. رقم طلب الاحتياج المرتبط (اختياري) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300"> رقم طلب الاحتياج </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <span class="absolute right-3 text-sky-400 pointer-events-none z-10">
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
            class="block w-full h-full pr-10 pl-4 bg-transparent text-white text-xs font-mono font-bold focus:outline-none placeholder-gray-500"
          />
        </div>
        <p v-if="getFieldError('requisition_id')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('requisition_id') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import WarehouseDropdown from '@/modules/inventory/forms/WarehouseDropdown.vue'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  validationErrors: { type: Object, default: () => null },
  isRequisitionLinked: { type: Boolean, default: false },
  routeBadgeText: { type: String, default: '' },
  routeBadgeClass: { type: String, default: '' },
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
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

/* إلغاء الإطار والخلفية للقائمة المنسدلة المدمجة داخل الحاوية المخصصة */
:deep(.header-dropdown .p-dropdown),
:deep(.header-dropdown [data-pc-name='dropdown']),
:deep(.header-dropdown [data-pc-section='root']),
:deep(.header-dropdown div.inline-flex) {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

:deep(.header-dropdown .p-dropdown-label),
:deep(.header-dropdown [data-pc-section='input']) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  color: #ffffff !important;
  padding-right: 0.25rem !important;
}

:deep(.header-dropdown .p-dropdown:not(.p-disabled).p-focus) {
  box-shadow: none !important;
  border: none !important;
}
</style>
