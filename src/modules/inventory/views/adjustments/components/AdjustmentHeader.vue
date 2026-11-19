<!-- src/modules/inventory/views/adjustments/components/AdjustmentHeader.vue -->
<template>
  <div
    class="p-3 bg-surface-header/60 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs space-y-2.5 text-right font-sans transition-all duration-200"
    dir="rtl"
  >
    <!-- شريط عنوان القسم العلوي -->
    <div class="flex items-center justify-between pb-1 border-b border-primary/15">
      <span class="text-[11px] font-black text-text-secondary flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
        بيانات المستودع ووثيقة التسوية الجردية
      </span>
    </div>

    <!-- شبكة الحقول الأساسية: 4 أعمدة متساوية -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      <!-- 1. رقم مستند التسوية (adjustment_number) -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          رقم وثيقة التسوية
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
          >
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
            class="block w-full h-full pr-8 pl-3 bg-transparent text-text-primary placeholder:text-text-muted font-mono font-bold text-xs focus:outline-none"
          />
        </div>
        <p
          v-if="getFieldError('adjustment_number')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('adjustment_number') }}
        </p>
      </div>

      <!-- 2. المستودع الخاضع للجرد (warehouse_id) -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          المستودع الخاضع للجرد <span class="text-danger">*</span>
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
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
          <div class="w-full h-full pr-8 pl-1 flex items-center">
            <WarehouseDropdown
              id="adjustment-warehouse-id"
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

      <!-- 3. تاريخ التسوية (adjustment_date) -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          تاريخ التسوية <span class="text-danger">*</span>
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <input
            type="date"
            v-model="formData.adjustment_date"
            class="block w-full h-full pr-3 pl-16 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
          />

          <span
            class="absolute left-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none gap-1 text-xs z-10"
          >
            <span class="font-medium text-[10px]">تاريخ</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          v-if="getFieldError('adjustment_date')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('adjustment_date') }}
        </p>
      </div>

      <!-- 4. نوع حركة التسوية المخزنية (type) -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          نوع حركة التسوية
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border rounded-lg flex items-center shadow-2xs transition-all duration-200"
          :class="[
            isTypeLocked
              ? 'border-success/50 bg-surface-card/75 opacity-95'
              : 'border-surface-border hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
          ]"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center pointer-events-none z-10"
            :class="isTypeLocked ? 'text-success' : 'text-primary'"
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
            class="block w-full h-full pr-8 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer disabled:cursor-not-allowed"
          >
            <option value="physical_count" class="bg-surface-section text-text-primary">
              جرد دوري / فعلي (Physical Count)
            </option>
            <option value="opening_balance" class="bg-surface-section text-text-primary">
              رصيد افتتاحي (Opening Balance)
            </option>
            <option value="general_adjustment" class="bg-surface-section text-text-primary">
              تسوية عامة (General Adjustment)
            </option>
            <option value="damage" class="bg-surface-section text-text-primary">
              تسوية بضاعة تالفة (Damage)
            </option>
            <option value="loss" class="bg-surface-section text-text-primary">
              تسوية فاقد وعجز (Loss)
            </option>
          </select>

          <span
            v-if="!isTypeLocked"
            class="absolute left-3 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
          >
            ▼
          </span>
          <span
            v-else
            class="absolute left-2 text-[9px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded border border-success/25 pointer-events-none"
          >
            تلقائي
          </span>
        </div>
        <p v-if="getFieldError('type')" class="text-danger text-[10px] font-bold mt-0.5 pr-1">
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
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}

/* إلغاء الإطار والخلفية للقوائم المنسدلة المدمجة داخل الحاويات المخصصة */
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
}

:deep(.header-embedded-dropdown .p-dropdown-label),
:deep(.header-embedded-dropdown [data-pc-section='input']) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  padding: 0 0.25rem !important;
  display: flex !important;
  align-items: center !important;
}
</style>
