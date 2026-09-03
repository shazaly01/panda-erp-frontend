<!--src/modules/inventory/views/transfers/components/TransferHeader.vue-->
<template>
  <div
    class="p-5 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl space-y-4 text-right font-sans"
    dir="rtl"
  >
    <!-- شبكة الحقول الرئيسية: 4 أعمدة (رقم التحويل + مستودع المصدر + مستودع الوجهة + تاريخ التحويل) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- 1. transfer_number (رقم أمر التحويل) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#e05e2b] rounded-lg flex items-center shadow-[0_0_10px_rgba(224,94,43,0.15)] focus-within:ring-1 focus-within:ring-[#e05e2b]"
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
            v-model="formData.transfer_number"
            placeholder="رقم أمر التحويل..."
            class="block w-full h-full pr-10 pl-4 bg-transparent text-white font-mono font-bold text-xs focus:outline-none placeholder-gray-500"
          />
        </div>
        <p
          v-if="getFieldError('transfer_number')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('transfer_number') }}
        </p>
      </div>

      <!-- 2. from_warehouse_id (المستودع المصدر / المخرِج) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
        >
          <span
            class="absolute right-3 text-amber-400 pointer-events-none z-10"
            title="المستودع المصدر"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-10 pl-2 flex items-center">
            <WarehouseDropdown
              id="transfer-from-warehouse-id"
              v-model="formData.from_warehouse_id"
              label=""
              placeholder="اختر المستودع المصدر..."
              class="w-full bg-transparent"
            />
          </div>
        </div>
        <p
          v-if="getFieldError('from_warehouse_id')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('from_warehouse_id') }}
        </p>
      </div>

      <!-- 3. to_warehouse_id (المستودع الوجهة / المستلم) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border rounded-lg flex items-center transition-all duration-200"
          :class="[
            formData.from_warehouse_id &&
            formData.to_warehouse_id &&
            formData.from_warehouse_id === formData.to_warehouse_id
              ? 'border-rose-500 ring-1 ring-rose-500/50'
              : 'border-[#3e414c] hover:border-[#e05e2b]',
          ]"
        >
          <span
            class="absolute right-3 text-emerald-400 pointer-events-none z-10"
            title="المستودع الوجهة"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-10 pl-2 flex items-center">
            <WarehouseDropdown
              id="transfer-to-warehouse-id"
              v-model="formData.to_warehouse_id"
              label=""
              placeholder="اختر المستودع الوجهة..."
              class="w-full bg-transparent"
            />
          </div>
        </div>
        <p
          v-if="getFieldError('to_warehouse_id')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('to_warehouse_id') }}
        </p>
        <p
          v-else-if="
            formData.from_warehouse_id &&
            formData.to_warehouse_id &&
            formData.from_warehouse_id === formData.to_warehouse_id
          "
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          لا يمكن اختيار نفس المستودع كمصدر ووجهة.
        </p>
      </div>

      <!-- 4. transfer_date (تاريخ التحويل) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
        >
          <input
            type="date"
            v-model="formData.transfer_date"
            class="block w-full h-full pr-4 pl-20 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
          />

          <span
            class="absolute left-3 text-gray-400 pointer-events-none flex items-center gap-1.5 text-xs z-10"
          >
            <span class="text-gray-400 font-medium text-[11px]">تاريخ</span>
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
          v-if="getFieldError('transfer_date')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
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
input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.6;
}
</style>
