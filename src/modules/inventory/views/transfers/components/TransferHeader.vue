<!-- src/modules/inventory/views/transfers/components/TransferHeader.vue -->
<template>
  <div
    class="p-3 bg-surface-header/60 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs space-y-2.5 text-right font-sans transition-all duration-200"
    dir="rtl"
  >
    <!-- شريط عنوان القسم العلوي -->
    <div class="flex items-center justify-between pb-1 border-b border-primary/15">
      <span class="text-[11px] font-black text-text-secondary flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
        بيانات المستودعات وأمر التحويل المخزني
      </span>
    </div>

    <!-- شبكة الحقول الرئيسية: 4 أعمدة متساوية -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      <!-- 1. transfer_number (رقم أمر التحويل) -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          رقم أمر التحويل
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
            v-model="formData.transfer_number"
            placeholder="رقم أمر التحويل..."
            class="block w-full h-full pr-8 pl-3 bg-transparent text-text-primary placeholder:text-text-muted font-mono font-bold text-xs focus:outline-none"
          />
        </div>
        <p
          v-if="getFieldError('transfer_number')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('transfer_number') }}
        </p>
      </div>

      <!-- 2. from_warehouse_id (المستودع المصدر / المخرِج) -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          المستودع المصدر <span class="text-danger">*</span>
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center text-warning pointer-events-none z-10"
            title="المستودع المصدر"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-8 pl-1 flex items-center">
            <WarehouseDropdown
              id="transfer-from-warehouse-id"
              v-model="formData.from_warehouse_id"
              label=""
              placeholder="اختر المستودع المصدر..."
              class="w-full bg-transparent header-embedded-dropdown"
            />
          </div>
        </div>
        <p
          v-if="getFieldError('from_warehouse_id')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('from_warehouse_id') }}
        </p>
      </div>

      <!-- 3. to_warehouse_id (المستودع الوجهة / المستلم) -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          المستودع الوجهة <span class="text-danger">*</span>
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border rounded-lg flex items-center shadow-2xs transition-all duration-200 overflow-hidden"
          :class="[
            formData.from_warehouse_id &&
            formData.to_warehouse_id &&
            formData.from_warehouse_id === formData.to_warehouse_id
              ? 'border-danger ring-2 ring-danger/20'
              : 'border-surface-border hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
          ]"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center text-success pointer-events-none z-10"
            title="المستودع الوجهة"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-8 pl-1 flex items-center">
            <WarehouseDropdown
              id="transfer-to-warehouse-id"
              v-model="formData.to_warehouse_id"
              label=""
              placeholder="اختر المستودع الوجهة..."
              class="w-full bg-transparent header-embedded-dropdown"
            />
          </div>
        </div>
        <p
          v-if="getFieldError('to_warehouse_id')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('to_warehouse_id') }}
        </p>
        <p
          v-else-if="
            formData.from_warehouse_id &&
            formData.to_warehouse_id &&
            formData.from_warehouse_id === formData.to_warehouse_id
          "
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          لا يمكن اختيار نفس المستودع كمصدر ووجهة.
        </p>
      </div>

      <!-- 4. transfer_date (تاريخ التحويل) -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          تاريخ التحويل <span class="text-danger">*</span>
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <input
            type="date"
            v-model="formData.transfer_date"
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
          v-if="getFieldError('transfer_date')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('transfer_date') }}
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
