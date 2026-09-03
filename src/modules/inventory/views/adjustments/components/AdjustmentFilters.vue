<!--src/modules/inventory/views/adjustments/components/AdjustmentFilters.vue-->
<template>
  <div
    class="p-4 bg-[#212634] rounded-2xl border border-[#323a4e] shadow-md text-right space-y-3"
    dir="rtl"
  >
    <!-- شبكة الفلاتر بتناسق وخلفيات أفتح لتعزيز الوضوح -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
      <!-- 1. البحث السريع -->
      <div class="relative flex items-center">
        <input
          type="text"
          v-model="search"
          placeholder="بحث برقم السند، الملاحظات..."
          class="w-full h-[42px] pr-9 pl-3 bg-[#181d28] text-white text-xs font-semibold rounded-xl border border-[#374158] hover:border-gray-400 focus:border-[#e05e2b] focus:ring-2 focus:ring-[#e05e2b]/20 outline-none transition-all placeholder:text-gray-400"
        />
        <div class="absolute right-3 pointer-events-none text-gray-400">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <!-- 2. المستودع الخاضع للجرد -->
      <div class="w-full">
        <WarehouseDropdown id="adjustment-warehouse-filter" v-model="warehouseFilter" label="" />
      </div>

      <!-- 3. نوع حركة التسوية -->
      <div class="relative flex items-center">
        <select
          v-model="typeFilter"
          :disabled="isTypeDisabled"
          style="color-scheme: dark"
          class="w-full h-[42px] px-3.5 bg-[#181d28] text-white text-xs font-bold rounded-xl border outline-none transition-all appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-85 disabled:bg-[#282f40]"
          :class="[
            isTypeDisabled
              ? 'border-emerald-600/50 text-emerald-300'
              : 'border-[#374158] hover:border-gray-400 focus:border-[#e05e2b] focus:ring-2 focus:ring-[#e05e2b]/20',
          ]"
        >
          <option value="">كافة أنواع التسويات</option>
          <option value="physical_count">جرد دوري / فعلي</option>
          <option value="opening_balance">رصيد افتتاحي</option>
          <option value="general_adjustment">تسوية عامة</option>
          <option value="damage">تسوية بضاعة تالفة</option>
          <option value="loss">تسوية عجز وفاقد</option>
        </select>
        <div class="absolute left-3 pointer-events-none text-gray-400">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      <!-- 4. حالة الاعتماد -->
      <div class="relative flex items-center">
        <select
          v-model="statusFilter"
          style="color-scheme: dark"
          class="w-full h-[42px] px-3.5 bg-[#181d28] text-white text-xs font-bold rounded-xl border border-[#374158] hover:border-gray-400 focus:border-[#e05e2b] focus:ring-2 focus:ring-[#e05e2b]/20 outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="">كافة الحالات</option>
          <option value="draft">مسودة قيد المراجعة</option>
          <option value="approved">معتمد ومؤثر مخزنياً</option>
        </select>
        <div class="absolute left-3 pointer-events-none text-gray-400">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      <!-- 5. من تاريخ -->
      <div class="relative flex items-center">
        <input
          type="date"
          v-model="fromDate"
          style="color-scheme: dark"
          class="w-full h-[42px] px-3.5 bg-[#181d28] text-white text-xs font-semibold rounded-xl border border-[#374158] hover:border-gray-400 focus:border-[#e05e2b] focus:ring-2 focus:ring-[#e05e2b]/20 outline-none transition-all"
        />
      </div>

      <!-- 6. إلى تاريخ -->
      <div class="relative flex items-center">
        <input
          type="date"
          v-model="toDate"
          style="color-scheme: dark"
          class="w-full h-[42px] px-3.5 bg-[#181d28] text-white text-xs font-semibold rounded-xl border border-[#374158] hover:border-gray-400 focus:border-[#e05e2b] focus:ring-2 focus:ring-[#e05e2b]/20 outline-none transition-all"
        />
      </div>

      <!-- 7. زر إعادة تعيين الفلاتر -->
      <div class="sm:col-span-2 lg:col-span-2 flex justify-end">
        <button
          type="button"
          @click="resetFilters"
          class="w-full sm:w-auto min-w-[160px] h-[42px] px-4 bg-[#181d28] hover:bg-[#e05e2b]/15 text-gray-300 hover:text-[#e05e2b] text-xs font-bold rounded-xl border border-[#374158] hover:border-[#e05e2b]/60 transition-all flex items-center justify-center gap-2 group shadow-sm active:scale-[0.98]"
        >
          <svg
            class="w-4 h-4 text-gray-400 group-hover:text-[#e05e2b] group-hover:rotate-180 transition-all duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>إعادة ضبط الفلاتر</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import WarehouseDropdown from '@/modules/inventory/forms/WarehouseDropdown.vue'

defineProps({
  isTypeDisabled: { type: Boolean, default: false },
})

const search = defineModel('searchQuery', { type: String, default: '' })
const typeFilter = defineModel('typeFilter', { type: String, default: '' })
const statusFilter = defineModel('statusFilter', { type: String, default: '' })
const warehouseFilter = defineModel('warehouseFilter', { type: [String, Number], default: '' })
const fromDate = defineModel('fromDateFilter', { type: String, default: '' })
const toDate = defineModel('toDateFilter', { type: String, default: '' })

const resetFilters = () => {
  search.value = ''
  statusFilter.value = ''
  warehouseFilter.value = ''
  fromDate.value = ''
  toDate.value = ''
}
</script>

<style scoped>
select option {
  background-color: #181d28 !important;
  color: #f8fafc !important;
}
</style>
