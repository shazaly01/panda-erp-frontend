<!-- src/modules/inventory/views/adjustments/components/AdjustmentHeader.vue -->
<template>
  <div
    class="p-4 sm:p-5 bg-[#23252e] rounded-2xl border border-[#3b3f4f] shadow-xl space-y-4 text-right font-sans"
    dir="rtl"
  >
    <!-- شبكة الحقول الأساسية: 4 أعمدة متناسقة -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- 1. رقم مستند التسوية (adjustment_number) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300"> رقم وثيقة التسوية </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
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
            v-model="formData.adjustment_number"
            placeholder="رقم طلب التسوية..."
            class="block w-full h-full pr-10 pl-4 bg-transparent text-white font-mono font-bold text-xs focus:outline-none placeholder-gray-500"
          />
        </div>
        <p
          v-if="getFieldError('adjustment_number')"
          class="text-rose-400 text-[10px] font-bold pr-1"
        >
          {{ getFieldError('adjustment_number') }}
        </p>
      </div>

      <!-- 2. المستودع الخاضع للجرد (warehouse_id) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          المستودع الخاضع للجرد <span class="text-rose-500">*</span>
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
              id="adjustment-warehouse-id"
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

      <!-- 3. تاريخ التسوية (adjustment_date) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          تاريخ التسوية <span class="text-rose-500">*</span>
        </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <input
            type="date"
            v-model="formData.adjustment_date"
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
        <p v-if="getFieldError('adjustment_date')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('adjustment_date') }}
        </p>
      </div>

      <!-- 4. نوع حركة التسوية المخزنية (type) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300"> نوع حركة التسوية </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border rounded-xl flex items-center transition-all duration-200"
          :class="[
            isTypeLocked
              ? 'border-emerald-600/50 bg-[#121316] opacity-90'
              : 'border-[#3e414c] hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30',
          ]"
        >
          <span
            class="absolute right-3 pointer-events-none z-10"
            :class="isTypeLocked ? 'text-emerald-400' : 'text-gray-400'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </span>

          <select
            v-model="formData.type"
            :disabled="isTypeLocked"
            style="color-scheme: dark"
            class="block w-full h-full pr-10 pl-10 bg-transparent text-white focus:outline-none text-xs font-bold appearance-none cursor-pointer disabled:cursor-not-allowed"
          >
            <option value="physical_count" class="bg-[#16171b]">
              جرد دوري / فعلي (Physical Count)
            </option>
            <option value="opening_balance" class="bg-[#16171b]">
              رصيد افتتاحي (Opening Balance)
            </option>
            <option value="general_adjustment" class="bg-[#16171b]">
              تسوية عامة (General Adjustment)
            </option>
            <option value="damage" class="bg-[#16171b]">تسوية بضاعة تالفة (Damage)</option>
            <option value="loss" class="bg-[#16171b]">تسوية فاقد وعجز (Loss)</option>
          </select>

          <span
            v-if="!isTypeLocked"
            class="absolute left-4 text-gray-500 pointer-events-none text-[10px]"
          >
            ▼
          </span>
          <span
            v-else
            class="absolute left-3 text-[10px] font-bold text-emerald-400/80 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20 pointer-events-none"
          >
            محدد تلقائياً
          </span>
        </div>
        <p v-if="getFieldError('type')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('type') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import WarehouseDropdown from '@/modules/inventory/forms/WarehouseDropdown.vue'

const route = useRoute()
const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  validationErrors: { type: Object, default: () => null },
})

const isTypeLocked = computed(() => {
  return Boolean(route?.meta?.defaultType)
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

/* إلغاء الإطار والخلفية للقوائم المنسدلة المدمجة داخل الحاويات المخصصة */
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
