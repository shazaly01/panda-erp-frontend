<!-- src/modules/purchasing/views/bills/components/BillHeaderForm.vue -->
<template>
  <div
    class="p-3 bg-surface-header/60 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs space-y-2.5 text-right font-sans transition-all duration-200"
    dir="rtl"
  >
    <!-- شريط التوجيه ومسار العملية المخزنية -->
    <div
      class="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-primary/15"
    >
      <div class="flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
        <span class="text-[11px] font-black text-text-secondary">مسار الفاتورة:</span>
        <span
          class="px-2.5 py-0.5 text-[11px] font-black rounded-lg border inline-flex items-center gap-1.5"
          :class="
            isReceiptLinked
              ? 'bg-info/12 text-info border-info/35'
              : 'bg-success/12 text-success border-success/35'
          "
        >
          <span
            class="inline-block w-1.5 h-1.5 rounded-full"
            :class="isReceiptLinked ? 'bg-info' : 'bg-success'"
          ></span>
          {{ routeBadgeText }}
        </span>
      </div>

      <div class="flex items-center gap-2 text-[11px] font-mono text-text-secondary">
        <span
          v-if="formData.bill_number"
          class="bg-surface-card px-2.5 py-0.5 rounded-lg border border-surface-border font-bold text-primary shadow-2xs"
        >
          {{ formData.bill_number }}
        </span>
        <span
          v-if="formData.purchase_order_id"
          class="bg-surface-card px-2 py-0.5 rounded-lg border border-surface-border"
        >
          أمر شراء: <strong class="text-primary">#{{ formData.purchase_order_id }}</strong>
        </span>
        <span
          v-if="formData.receipt_id"
          class="bg-surface-card px-2 py-0.5 rounded-lg border border-surface-border"
        >
          إذن استلام: <strong class="text-info">#{{ formData.receipt_id }}</strong>
        </span>
      </div>
    </div>

    <!-- الصف الأول: 4 أعمدة متساوية تماماً -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-start">
      <!-- 1. المورد التجاري -->
      <div class="w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          المورد / جهة التوريد <span class="text-danger">*</span>
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-8 pl-1 flex items-center min-w-0">
            <SupplierDropdown
              id="bill-supplier-id"
              v-model="formData.supplier_id"
              label=""
              placeholder="اختر المورد..."
              class="w-full bg-transparent header-embedded-dropdown"
            />
          </div>
        </div>
        <p
          v-if="getFieldError('supplier_id')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('supplier_id') }}
        </p>
      </div>

      <!-- 2. المستودع المستلم -->
      <div class="w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          المستودع <span class="text-danger">*</span>
        </label>

        <div
          v-if="isDirectInventoryPurchase"
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
              id="bill-warehouse-id"
              v-model="formData.warehouse_id"
              label=""
              class="w-full bg-transparent header-embedded-dropdown"
            />
          </div>
        </div>

        <div
          v-else
          class="relative w-full h-9 bg-info/10 border border-info/35 rounded-lg flex items-center px-3 gap-2 cursor-not-allowed overflow-hidden"
        >
          <span class="text-info flex items-center shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </span>
          <span class="text-xs font-bold text-info truncate">
            استلام مسبق (#{{ formData.receipt_id }})
          </span>
        </div>

        <p
          v-if="getFieldError('warehouse_id')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('warehouse_id') }}
        </p>
      </div>

      <!-- 3. القسم المستفيد -->
      <div class="w-full">
        <div class="flex items-center justify-between pr-1 mb-1">
          <label class="block text-[11px] font-bold text-text-secondary">القسم المستفيد</label>
          <span
            v-if="isReceiptLinked && formData.department_id"
            class="text-[9px] text-info bg-info/10 px-1.5 rounded border border-info/30 font-bold"
          >
            من السند
          </span>
        </div>

        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
          :class="{
            'opacity-75 bg-surface-card/65': isReceiptLinked && Boolean(formData.department_id),
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
              id="bill-department-id"
              v-model="formData.department_id"
              :options="departmentOptions"
              option-label="name"
              option-value="id"
              :disabled="isReceiptLinked && Boolean(formData.department_id)"
              :show-clear="!(isReceiptLinked && Boolean(formData.department_id))"
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

      <!-- 4. رقم فاتورة المورد الضريبية -->
      <div class="w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          فاتورة المورد الضريبية
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none z-10"
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
            type="text"
            v-model="formData.supplier_bill_number"
            placeholder="رقم فاتورة المورد..."
            class="block w-full h-full pr-8 pl-3 bg-transparent text-text-primary placeholder:text-text-muted text-xs font-mono font-bold focus:outline-none"
          />
        </div>
        <p
          v-if="getFieldError('supplier_bill_number')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('supplier_bill_number') }}
        </p>
      </div>
    </div>

    <!-- الصف الثاني: 4 أعمدة متوازية تماماً مع الصف الأول -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-start">
      <!-- 5. تاريخ الفاتورة -->
      <div class="w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          تاريخ الفاتورة <span class="text-danger">*</span>
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
        >
          <input
            type="date"
            v-model="formData.bill_date"
            class="block w-full h-full px-3 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
          />
        </div>
        <p v-if="getFieldError('bill_date')" class="text-danger text-[10px] font-bold mt-0.5 pr-1">
          {{ getFieldError('bill_date') }}
        </p>
      </div>

      <!-- 6. تاريخ الاستحقاق -->
      <div class="w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">
          تاريخ الاستحقاق
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
        >
          <input
            type="date"
            v-model="formData.due_date"
            class="block w-full h-full px-3 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
          />
        </div>
        <p v-if="getFieldError('due_date')" class="text-danger text-[10px] font-bold mt-0.5 pr-1">
          {{ getFieldError('due_date') }}
        </p>
      </div>

      <!-- 7. العملة -->
      <div class="w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1">العملة</label>
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>

          <div class="w-full h-full pr-8 pl-1 flex items-center min-w-0">
            <AppDropdown
              id="bill-currency-id"
              v-model="formData.currency_id"
              :options="currencyOptions"
              option-label="label"
              option-value="value"
              :filter="false"
              :show-clear="false"
              placeholder="اختر العملة..."
              class="w-full bg-transparent header-embedded-dropdown"
            />
          </div>
        </div>
        <p
          v-if="getFieldError('currency_id')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('currency_id') }}
        </p>
      </div>

      <!-- 8. سعر الصرف -->
      <div class="w-full">
        <label class="block text-[11px] font-bold text-text-secondary pr-1 mb-1"> سعر الصرف </label>
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
        >
          <input
            type="number"
            step="0.0001"
            v-model="formData.exchange_rate"
            placeholder="1.0000"
            class="block w-full h-full px-3 bg-transparent text-text-primary placeholder:text-text-muted text-xs font-mono font-bold focus:outline-none text-left"
          />
        </div>
        <p
          v-if="getFieldError('exchange_rate')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('exchange_rate') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SupplierDropdown from '@/modules/purchasing/forms/SupplierDropdown.vue'
import WarehouseDropdown from '@/modules/inventory/forms/WarehouseDropdown.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  departments: { type: Array, default: () => [] },
  validationErrors: { type: Object, default: () => null },
  isReceiptLinked: { type: Boolean, default: false },
  isDirectInventoryPurchase: { type: Boolean, default: true },
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
