<!--src/modules/purchasing/views/bills/components/BillHeaderForm.vue-->
<template>
  <div
    class="p-5 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl space-y-4 text-right font-sans"
    dir="rtl"
  >
    <!-- شريط التوجيه الذكي ومسار العملية المخزنية -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-700/40">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-gray-300">مسار الفاتورة:</span>
        <span
          class="px-3 py-1 text-xs font-black rounded-lg border flex items-center gap-1.5 transition-all duration-300"
          :class="routeBadgeClass"
        >
          <span
            class="inline-block w-2 h-2 rounded-full"
            :class="isReceiptLinked ? 'bg-sky-400' : 'bg-emerald-400 animate-pulse'"
          ></span>
          {{ routeBadgeText }}
        </span>
      </div>

      <div class="flex items-center gap-4 text-xs font-mono text-gray-400">
        <div
          v-if="formData.purchase_order_id"
          class="flex items-center gap-1 bg-[#16171b] px-2.5 py-1 rounded border border-[#3e414c]"
        >
          <span class="text-gray-400 text-[11px]">أمر الشراء:</span>
          <span class="text-[#e05e2b] font-bold">#{{ formData.purchase_order_id }}</span>
        </div>
        <div
          v-if="formData.receipt_id"
          class="flex items-center gap-1 bg-[#16171b] px-2.5 py-1 rounded border border-[#3e414c]"
        >
          <span class="text-gray-400 text-[11px]">إذن الاستلام:</span>
          <span class="text-sky-400 font-bold">#{{ formData.receipt_id }}</span>
        </div>
      </div>
    </div>

    <!-- الشبكة الأساسية: الصف الأول (4 أعمدة) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- 1. رقم الفاتورة التسلسلي (bill_number) - مقفل ومولّد تلقائياً -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#121316] border border-[#3e414c] rounded-lg flex items-center shadow-inner cursor-not-allowed"
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
            :value="formData.bill_number || 'توليد تسلسلي تلقائي...'"
            readonly
            tabindex="-1"
            class="block w-full h-full pr-10 pl-4 bg-transparent text-gray-400 font-mono font-bold text-xs focus:outline-none cursor-not-allowed select-none"
          />
        </div>
        <p
          v-if="getFieldError('bill_number')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('bill_number') }}
        </p>
      </div>

      <!-- 2. المورد (supplier_id) - قائمة منسدلة لاختيار المورد -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <span class="absolute right-3 text-gray-400 pointer-events-none z-10 flex items-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              id="bill-supplier-id"
              v-model="formData.supplier_id"
              label=""
              placeholder="اختر المورد..."
              class="w-full bg-transparent header-dropdown"
            />
          </div>
        </div>
        <p
          v-if="getFieldError('supplier_id')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('supplier_id') }}
        </p>
      </div>

      <!-- 3. المستودع المستلم (warehouse_id) - يتكيف بحسب المسار -->
      <div class="relative w-full">
        <!-- في حالة الشراء المباشر: يظهر حقل المستودع إلزامياً ونشطاً -->
        <div
          v-if="isDirectInventoryPurchase"
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <span
            class="absolute right-3 text-emerald-400 pointer-events-none z-10 flex items-center"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              id="bill-warehouse-id"
              v-model="formData.warehouse_id"
              label=""
              class="w-full bg-transparent header-dropdown"
            />
          </div>
        </div>

        <!-- في حالة الارتباط بسند استلام: إظهار خانة إعلامية مقفلة بأن المخزن تحرك مسبقاً -->
        <div
          v-else
          class="relative w-full h-11 bg-[#121316] border border-sky-600/40 rounded-lg flex items-center px-3 gap-2 opacity-90 cursor-not-allowed"
        >
          <span class="text-sky-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </span>
          <span class="text-xs font-bold text-sky-300 truncate">
            استلام مخزني مسبق (#{{ formData.receipt_id }})
          </span>
        </div>

        <p
          v-if="getFieldError('warehouse_id')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('warehouse_id') }}
        </p>
      </div>

      <!-- 4. رقم فاتورة المورد الضريبية (supplier_bill_number) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <span class="absolute right-3 text-gray-400 pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            v-model="formData.supplier_bill_number"
            placeholder="رقم فاتورة المورد الضريبية الأصلية..."
            class="block w-full h-full pr-10 pl-4 bg-transparent text-white text-xs font-mono font-bold focus:outline-none placeholder-gray-500"
          />
        </div>
        <p
          v-if="getFieldError('supplier_bill_number')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('supplier_bill_number') }}
        </p>
      </div>
    </div>

    <!-- الشبكة الأساسية: الصف الثاني (4 أعمدة: تواريخ وعملة وسعر صرف) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- 5. تاريخ الفاتورة (bill_date) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <input
            type="date"
            v-model="formData.bill_date"
            class="block w-full h-full pr-4 pl-20 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
          />

          <span
            class="absolute left-3 text-gray-400 pointer-events-none flex items-center gap-1.5 text-xs z-10"
          >
            <span class="text-gray-400 font-medium text-[11px]">الفاتورة</span>
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
        <p v-if="getFieldError('bill_date')" class="text-rose-500 text-[10px] font-bold mt-1 pr-1">
          {{ getFieldError('bill_date') }}
        </p>
      </div>

      <!-- 6. تاريخ الاستحقاق (due_date) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <input
            type="date"
            v-model="formData.due_date"
            class="block w-full h-full pr-4 pl-20 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
          />

          <span
            class="absolute left-3 text-gray-400 pointer-events-none flex items-center gap-1.5 text-xs z-10"
          >
            <span class="text-gray-400 font-medium text-[11px]">الاستحقاق</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
        </div>
        <p v-if="getFieldError('due_date')" class="text-rose-500 text-[10px] font-bold mt-1 pr-1">
          {{ getFieldError('due_date') }}
        </p>
      </div>

      <!-- 7. عملة الفاتورة (currency_id) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <span class="absolute right-3 text-gray-400 pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>

          <select
            v-model="formData.currency_id"
            style="color-scheme: dark"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-white focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option :value="1" class="bg-[#16171b]">الريال السعودي (SAR)</option>
            <option :value="2" class="bg-[#16171b]">الدولار الأمريكي (USD)</option>
            <option :value="3" class="bg-[#16171b]">اليورو الأوروبي (EUR)</option>
          </select>
          <span class="absolute left-3 text-gray-500 pointer-events-none text-[10px]">▼</span>
        </div>
        <p
          v-if="getFieldError('currency_id')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('currency_id') }}
        </p>
      </div>

      <!-- 8. سعر الصرف (exchange_rate) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30"
        >
          <span
            class="absolute right-3 text-gray-400 pointer-events-none z-10 text-[11px] font-bold"
          >
            سعر الصرف:
          </span>

          <input
            type="number"
            step="0.0001"
            v-model="formData.exchange_rate"
            placeholder="1.0000"
            class="block w-full h-full pr-24 pl-4 bg-transparent text-white text-xs font-mono font-bold focus:outline-none text-left placeholder-gray-500"
          />
        </div>
        <p
          v-if="getFieldError('exchange_rate')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('exchange_rate') }}
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
  isReceiptLinked: { type: Boolean, default: false },
  isDirectInventoryPurchase: { type: Boolean, default: true },
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
