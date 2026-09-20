<!-- src/modules/purchasing/views/receipts/components/ReceiptHeaderForm.vue -->
<template>
  <div
    class="p-4 sm:p-5 bg-[#23252e] rounded-2xl border border-[#3b3f4f] shadow-xl space-y-4 text-right font-sans"
    dir="rtl"
  >
    <!-- شريط التوجيه الذكي ومسار الاستلام المخزني -->
    <div
      class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-gray-300">مسار الاستلام:</span>
        <span
          class="px-3 py-1 text-xs font-black rounded-lg border flex items-center gap-1.5 transition-all duration-300"
          :class="routeBadgeClass"
        >
          <span
            class="inline-block w-2 h-2 rounded-full"
            :class="isOrderLinked ? 'bg-sky-400' : 'bg-emerald-400 animate-pulse'"
          ></span>
          {{ routeBadgeText }}
        </span>
      </div>

      <!-- عرض معرّف أمر الشراء في حال كان الاستلام مبنياً عليه -->
      <div
        v-if="formData.purchase_order_id"
        class="flex items-center gap-4 text-xs font-mono text-gray-400"
      >
        <div
          class="flex items-center gap-1.5 bg-[#16171b] px-3 py-1 rounded-lg border border-[#3e414c]"
        >
          <span class="text-gray-400 text-[11px]">مستند لأمر شراء:</span>
          <span class="text-[#e05e2b] font-bold">#{{ formData.purchase_order_id }}</span>
        </div>
      </div>
    </div>

    <!-- الشبكة الأساسية للحقول اللوجستية -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- 1. رقم سند الاستلام التسلسلي (receipt_number) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300"> رقم سند الاستلام </label>
        <div
          class="relative w-full h-11 bg-[#121316] border border-[#3e414c] rounded-xl flex items-center shadow-inner cursor-not-allowed"
        >
          <span class="absolute right-3 text-sky-400 pointer-events-none z-10">
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
            :value="formData.receipt_number || 'توليد تلقائي عند الحفظ...'"
            readonly
            tabindex="-1"
            class="block w-full h-full pr-10 pl-4 bg-transparent text-gray-400 font-mono font-bold text-xs focus:outline-none cursor-not-allowed select-none"
          />
        </div>
        <p v-if="getFieldError('receipt_number')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('receipt_number') }}
        </p>
      </div>

      <!-- 2. المستودع المستلم (warehouse_id) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          المستودع المستلم <span class="text-rose-500">*</span>
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
              id="receipt-warehouse-id"
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

      <!-- 3. المورد التجاري (supplier_id) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          المورد / جهة التوريد <span class="text-rose-500">*</span>
        </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <span class="absolute right-3 text-gray-400 pointer-events-none z-10 flex items-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-9 pl-1 flex items-center">
            <SupplierDropdown
              id="receipt-supplier-id"
              v-model="formData.supplier_id"
              label=""
              placeholder="اختر المورد..."
              class="w-full bg-transparent header-dropdown"
            />
          </div>
        </div>
        <p v-if="getFieldError('supplier_id')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('supplier_id') }}
        </p>
      </div>

      <!-- 4. تاريخ الاستلام المخزني (receipt_date) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          تاريخ الاستلام <span class="text-rose-500">*</span>
        </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <input
            type="date"
            v-model="formData.receipt_date"
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
        <p v-if="getFieldError('receipt_date')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('receipt_date') }}
        </p>
      </div>

      <!-- 5. رقم إذن تسليم المورد (supplier_delivery_note) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300"> رقم إذن تسليم المورد </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <span class="absolute right-3 text-gray-400 pointer-events-none z-10">
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
            type="text"
            v-model="formData.supplier_delivery_note"
            placeholder="رقم سند تسليم الشحنة من المورد..."
            class="block w-full h-full pr-10 pl-4 bg-transparent text-white text-xs font-mono font-bold focus:outline-none placeholder-gray-500"
          />
        </div>
        <p
          v-if="getFieldError('supplier_delivery_note')"
          class="text-rose-400 text-[10px] font-bold pr-1"
        >
          {{ getFieldError('supplier_delivery_note') }}
        </p>
      </div>

      <!-- 6. رقم بوليصة الشحن (waybill_number) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300"> رقم بوليصة الشحن / الناقل </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <span class="absolute right-3 text-gray-400 pointer-events-none z-10">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
              />
            </svg>
          </span>

          <input
            type="text"
            v-model="formData.waybill_number"
            placeholder="رقم بوليصة شركة الشحن أو السيارة..."
            class="block w-full h-full pr-10 pl-4 bg-transparent text-white text-xs font-mono font-bold focus:outline-none placeholder-gray-500"
          />
        </div>
        <p v-if="getFieldError('waybill_number')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('waybill_number') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import SupplierDropdown from '@/modules/purchasing/forms/SupplierDropdown.vue'
import WarehouseDropdown from '@/modules/inventory/forms/WarehouseDropdown.vue'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  validationErrors: { type: Object, default: () => null },
  isOrderLinked: { type: Boolean, default: false },
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
