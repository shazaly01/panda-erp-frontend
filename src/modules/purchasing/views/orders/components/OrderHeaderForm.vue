<!--src/modules/purchasing/views/orders/components/OrderHeaderForm.vue-->
<template>
  <div
    class="p-5 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl space-y-4 text-right font-sans"
    dir="rtl"
  >
    <!-- شريط التوجيه الذكي والارتباطات بطلبات الاحتياج -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-700/40">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-gray-300">مسار أمر الشراء:</span>
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

      <div class="flex items-center gap-4 text-xs font-mono text-gray-400">
        <div
          v-if="formData.requisition_id"
          class="flex items-center gap-1 bg-[#16171b] px-2.5 py-1 rounded border border-[#3e414c]"
        >
          <span class="text-gray-400 text-[11px]">طلب الاحتياج:</span>
          <span class="text-sky-400 font-bold">#{{ formData.requisition_id }}</span>
        </div>
      </div>
    </div>

    <!-- الشبكة الأساسية: الصف الأول (4 أعمدة) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- 1. رقم أمر الشراء التسلسلي (order_number) - مقفل ومولّد تلقائياً -->
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
            :value="formData.order_number || 'توليد تسلسلي تلقائي...'"
            readonly
            tabindex="-1"
            class="block w-full h-full pr-10 pl-4 bg-transparent text-gray-400 font-mono font-bold text-xs focus:outline-none cursor-not-allowed select-none"
          />
        </div>
        <p
          v-if="getFieldError('order_number')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('order_number') }}
        </p>
      </div>

      <!-- 2. المورد التجاري (supplier_id) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
        >
          <span class="absolute right-3 text-gray-400 pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </span>

          <div class="w-full h-full pr-10 pl-2 flex items-center">
            <SupplierDropdown
              id="order-supplier-id"
              v-model="formData.supplier_id"
              label=""
              placeholder="اختر المورد التجاري..."
              class="w-full bg-transparent"
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

      <!-- 3. تاريخ أمر الشراء (order_date) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
        >
          <input
            type="date"
            v-model="formData.order_date"
            class="block w-full h-full pr-4 pl-20 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
          />

          <span
            class="absolute left-3 text-gray-400 pointer-events-none flex items-center gap-1.5 text-xs z-10"
          >
            <span class="text-gray-400 font-medium text-[11px]">تاريخ الأمر</span>
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
        <p v-if="getFieldError('order_date')" class="text-rose-500 text-[10px] font-bold mt-1 pr-1">
          {{ getFieldError('order_date') }}
        </p>
      </div>

      <!-- 4. تاريخ التوريد المتوقع (expected_delivery_date) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
        >
          <input
            type="date"
            v-model="formData.expected_delivery_date"
            class="block w-full h-full pr-4 pl-24 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
          />

          <span
            class="absolute left-3 text-amber-400/80 pointer-events-none flex items-center gap-1.5 text-xs z-10"
          >
            <span class="font-medium text-[11px]">التوريد المتوقع</span>
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
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('expected_delivery_date') }}
        </p>
      </div>
    </div>

    <!-- الشبكة الأساسية: الصف الثاني (4 أعمدة: شروط الدفع، عملة، سعر صرف، ربط طلب احتياج) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- 5. شروط الدفع والائتمان (payment_terms) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
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
            v-model="formData.payment_terms"
            placeholder="شروط الدفع (مثال: نقداً، 30 يوم، 50% مقدماً)..."
            class="block w-full h-full pr-10 pl-4 bg-transparent text-white text-xs font-semibold focus:outline-none placeholder-gray-500"
          />
        </div>
        <p
          v-if="getFieldError('payment_terms')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('payment_terms') }}
        </p>
      </div>

      <!-- 6. عملة أمر الشراء (currency_id) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
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

      <!-- 7. سعر الصرف (exchange_rate) -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
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

      <!-- 8. بطاقة حالة الارتباط بطلب الشراء / الاحتياج -->
      <div class="relative w-full">
        <div
          v-if="isRequisitionLinked"
          class="relative w-full h-11 bg-[#121316] border border-sky-600/40 rounded-lg flex items-center px-3 gap-2 opacity-90 cursor-not-allowed"
        >
          <span class="text-sky-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </span>
          <span class="text-xs font-bold text-sky-300 truncate">
            طلب احتياج مرتبط (#{{ formData.requisition_id }})
          </span>
        </div>

        <div
          v-else
          class="relative w-full h-11 bg-[#121316] border border-[#3e414c]/60 rounded-lg flex items-center px-3 gap-2 text-gray-500 cursor-not-allowed select-none"
        >
          <span class="text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <span class="text-xs font-medium truncate"> إصدار أمر شراء مباشر غير مرتبط </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SupplierDropdown from '@/modules/purchasing/forms/SupplierDropdown.vue'

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
</style>
