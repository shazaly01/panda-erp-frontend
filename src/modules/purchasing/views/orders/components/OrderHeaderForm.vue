<!-- src/modules/purchasing/views/orders/components/OrderHeaderForm.vue -->
<template>
  <div
    class="p-4 sm:p-5 bg-[#23252e] rounded-2xl border border-[#3b3f4f] shadow-xl space-y-4 text-right font-sans"
    dir="rtl"
  >
    <!-- شريط التوجيه والمسار الذكي لأمر الشراء -->
    <div
      class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-gray-300">مسار أمر الشراء:</span>
        <span
          class="px-2.5 py-0.5 text-xs font-black rounded-lg border flex items-center gap-1.5 transition-all duration-300"
          :class="routeBadgeClass"
        >
          <span
            class="inline-block w-2 h-2 rounded-full"
            :class="isRequisitionLinked ? 'bg-sky-400' : 'bg-emerald-400 animate-pulse'"
          ></span>
          {{ routeBadgeText }}
        </span>
      </div>

      <div class="flex items-center gap-4 text-xs font-mono text-gray-400">
        <div
          v-if="formData.requisition_id"
          class="flex items-center gap-1 bg-[#16171b] px-2.5 py-0.5 rounded-lg border border-[#3e414c]"
        >
          <span class="text-gray-400 text-[11px]">طلب الاحتياج:</span>
          <span class="text-sky-400 font-bold">#{{ formData.requisition_id }}</span>
        </div>
      </div>
    </div>

    <!-- الشبكة الأساسية: الصف الأول (4 أعمدة بارتفاع موحد 36px) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
      <!-- 1. رقم أمر الشراء التسلسلي (order_number) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300"> رقم أمر الشراء </label>
        <div
          class="relative w-full h-9 min-h-[36px] max-h-[36px] bg-[#121316] border border-[#3e414c] rounded-xl flex items-center shadow-inner cursor-not-allowed overflow-hidden"
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
            :value="formData.order_number || 'توليد تسلسلي تلقائي...'"
            readonly
            tabindex="-1"
            class="block w-full h-full pr-10 pl-4 bg-transparent text-gray-400 font-mono font-bold text-xs focus:outline-none cursor-not-allowed select-none"
          />
        </div>
        <p v-if="getFieldError('order_number')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('order_number') }}
        </p>
      </div>

      <!-- 2. المورد التجاري (supplier_id) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          المورد التجاري <span class="text-rose-500">*</span>
        </label>
        <div
          class="relative w-full h-9 min-h-[36px] max-h-[36px] bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30 overflow-hidden"
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

          <div class="w-full h-full pr-8 pl-1 flex items-center">
            <SupplierDropdown
              id="order-supplier-id"
              v-model="formData.supplier_id"
              label=""
              placeholder="اختر المورد التجاري..."
              class="w-full bg-transparent header-dropdown"
            />
          </div>
        </div>
        <p v-if="getFieldError('supplier_id')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('supplier_id') }}
        </p>
      </div>

      <!-- 3. القسم المستفيد مع دعم البحث (department_id) -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-bold text-gray-300"> القسم المستفيد </label>
          <span
            v-if="isRequisitionLinked"
            class="text-[10px] text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800"
          >
            محدد من طلب الاحتياج
          </span>
        </div>

        <AppDropdown
          id="order-department-id"
          v-model="formData.department_id"
          :options="departmentOptions"
          option-label="name"
          option-value="id"
          :disabled="isRequisitionLinked"
          :show-clear="!isRequisitionLinked"
          :filter="true"
          filter-placeholder="ابحث عن القسم..."
          placeholder="اختر القسم المستفيد..."
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

      <!-- 4. تاريخ أمر الشراء (order_date) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300">
          تاريخ الأمر <span class="text-rose-500">*</span>
        </label>
        <div
          class="relative w-full h-9 min-h-[36px] max-h-[36px] bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30 overflow-hidden"
        >
          <input
            type="date"
            v-model="formData.order_date"
            style="color-scheme: dark"
            class="block w-full h-full py-0 pr-4 pl-10 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
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
        <p v-if="getFieldError('order_date')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('order_date') }}
        </p>
      </div>
    </div>

    <!-- الشبكة الأساسية: الصف الثاني (4 أعمدة بارتفاع موحد 36px) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
      <!-- 5. تاريخ التوريد المتوقع (expected_delivery_date) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300"> التوريد المتوقع </label>
        <div
          class="relative w-full h-9 min-h-[36px] max-h-[36px] bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30 overflow-hidden"
        >
          <input
            type="date"
            v-model="formData.expected_delivery_date"
            style="color-scheme: dark"
            class="block w-full h-full py-0 pr-4 pl-10 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
          />

          <span
            class="absolute left-3 text-amber-400/80 pointer-events-none flex items-center z-10"
          >
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
        <p
          v-if="getFieldError('expected_delivery_date')"
          class="text-rose-400 text-[10px] font-bold pr-1"
        >
          {{ getFieldError('expected_delivery_date') }}
        </p>
      </div>

      <!-- 6. شروط الدفع والائتمان (payment_terms) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300"> شروط الدفع </label>
        <div
          class="relative w-full h-9 min-h-[36px] max-h-[36px] bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30 overflow-hidden"
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
            v-model="formData.payment_terms"
            placeholder="مثال: نقداً، 30 يوم..."
            class="block w-full h-full pr-10 pl-4 bg-transparent text-white text-xs font-semibold focus:outline-none placeholder-gray-500"
          />
        </div>
        <p v-if="getFieldError('payment_terms')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('payment_terms') }}
        </p>
      </div>

      <!-- 7. عملة أمر الشراء (currency_id) مع دعم AppDropdown -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300"> العملة </label>

        <AppDropdown
          id="order-currency-id"
          v-model="formData.currency_id"
          :options="currencyOptions"
          option-label="label"
          option-value="value"
          :filter="false"
          :show-clear="false"
          placeholder="اختر العملة..."
          accent-color="orange"
        >
          <template #icon>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </template>
        </AppDropdown>

        <p v-if="getFieldError('currency_id')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('currency_id') }}
        </p>
      </div>

      <!-- 8. سعر الصرف (exchange_rate) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-300"> سعر الصرف </label>
        <div
          class="relative w-full h-9 min-h-[36px] max-h-[36px] bg-[#16171b] border border-[#3e414c] rounded-xl flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/30 overflow-hidden"
        >
          <input
            type="number"
            step="0.0001"
            v-model="formData.exchange_rate"
            placeholder="1.0000"
            class="block w-full h-full pr-4 pl-4 bg-transparent text-white text-xs font-mono font-bold focus:outline-none text-left placeholder-gray-500"
          />
        </div>
        <p v-if="getFieldError('exchange_rate')" class="text-rose-400 text-[10px] font-bold pr-1">
          {{ getFieldError('exchange_rate') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SupplierDropdown from '@/modules/purchasing/forms/SupplierDropdown.vue'
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

const currencyOptions = [
  { value: 1, label: 'الريال السعودي (SAR)' },
  { value: 2, label: 'الدولار الأمريكي (USD)' },
  { value: 3, label: 'اليورو الأوروبي (EUR)' },
]

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

/* ضبط وتوحيد قائمة المورد المنسدلة بارتفاع 36px */
:deep(.header-dropdown .p-dropdown),
:deep(.header-dropdown [data-pc-name='dropdown']),
:deep(.header-dropdown [data-pc-section='root']),
:deep(.header-dropdown div.inline-flex) {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  height: 36px !important;
  min-height: 36px !important;
}

:deep(.header-dropdown .p-dropdown-label),
:deep(.header-dropdown [data-pc-section='input']) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  color: #ffffff !important;
  padding: 0 0.5rem 0 0.25rem !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.header-dropdown .p-dropdown:not(.p-disabled).p-focus) {
  box-shadow: none !important;
  border: none !important;
}
</style>
