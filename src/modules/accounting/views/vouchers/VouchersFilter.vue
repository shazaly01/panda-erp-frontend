<!--src/modules/accounting/views/vouchers/VouchersFilter.vue-->
<template>
  <div
    class="bg-surface-header/60 p-4 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs mb-6 space-y-4 transition-all duration-200"
    dir="rtl"
  >
    <!-- الصف الأول: البحث ونوع السند والحالة -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-5">
        <label
          for="voucher-search-input"
          class="block text-xs font-bold text-text-secondary mb-1.5"
        >
          البحث السريع
        </label>
        <AppInput
          id="voucher-search-input"
          :model-value="searchQuery"
          placeholder="بحث برقم السند، البيان، أو اسم الحساب..."
          class="bg-surface-card"
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-3">
        <label for="voucher-type-filter" class="block text-xs font-bold text-text-secondary mb-1.5">
          نوع السند
        </label>
        <AppDropdown
          id="voucher-type-filter"
          :model-value="typeFilter"
          :options="[
            { id: '', name: 'كل أنواع السندات' },
            { id: 'payment', name: 'سندات صرف (دفع)' },
            { id: 'receipt', name: 'سندات قبض (استلام)' },
          ]"
          class="bg-surface-card"
          @update:model-value="$emit('update:typeFilter', $event)"
        />
      </div>

      <div class="md:col-span-4">
        <label
          for="voucher-status-filter"
          class="block text-xs font-bold text-text-secondary mb-1.5"
        >
          حالة السند
        </label>
        <AppDropdown
          id="voucher-status-filter"
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'كل الحالات' },
            { id: 'draft', name: 'مسودة (تحت المراجعة)' },
            { id: 'approved', name: 'معتمد (بانتظار الترحيل)' },
            { id: 'posted', name: 'مُرحل (قيد يومية)' },
          ]"
          class="bg-surface-card"
          @update:model-value="$emit('update:statusFilter', $event)"
        />
      </div>
    </div>

    <!-- الصف الثاني: فلترة التواريخ، أزرار الفترات، وزر طباعة كشف التقرير الديناميكي -->
    <div
      class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-primary/15"
    >
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-1.5 text-xs text-text-secondary">
          <span class="font-bold text-text-primary">من:</span>
          <input
            type="date"
            :value="dateFrom"
            @input="$emit('update:dateFrom', $event.target.value)"
            class="bg-surface-card border border-surface-border hover:border-primary/60 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-2xs"
          />
        </div>

        <div class="flex items-center gap-1.5 text-xs text-text-secondary">
          <span class="font-bold text-text-primary">إلى:</span>
          <input
            type="date"
            :value="dateTo"
            @input="$emit('update:dateTo', $event.target.value)"
            class="bg-surface-card border border-surface-border hover:border-primary/60 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-2xs"
          />
        </div>

        <!-- أزرار الاختصارات الزمنية السريعة -->
        <div class="flex items-center gap-1.5 mr-1">
          <button
            type="button"
            @click="setPeriod('today')"
            class="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-surface-border bg-surface-card hover:border-primary/60 hover:text-primary text-text-secondary transition-all cursor-pointer"
          >
            اليوم
          </button>
          <button
            type="button"
            @click="setPeriod('week')"
            class="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-surface-border bg-surface-card hover:border-primary/60 hover:text-primary text-text-secondary transition-all cursor-pointer"
          >
            هذا الأسبوع
          </button>
          <button
            type="button"
            @click="setPeriod('month')"
            class="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-surface-border bg-surface-card hover:border-primary/60 hover:text-primary text-text-secondary transition-all cursor-pointer"
          >
            هذا الشهر
          </button>
          <button
            v-if="dateFrom || dateTo"
            type="button"
            @click="clearDates"
            class="px-2.5 py-1.5 text-xs font-bold text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
          >
            مسح التاريخ
          </button>
        </div>
      </div>

      <!-- زر استخراج وطباعة كشف المصروفات / الإيرادات الديناميكي -->
      <button
        type="button"
        @click="$emit('print-expenses')"
        :class="[
          'text-white font-bold py-1.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs shadow-sm active:scale-95 cursor-pointer',
          isReceipt
            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/15'
            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/15',
        ]"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
        <span>{{ isReceipt ? 'طباعة كشف الإيرادات للفترة' : 'طباعة كشف المصروفات للفترة' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  typeFilter: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
  dateFrom: { type: String, default: '' },
  dateTo: { type: String, default: '' },
  type: { type: String, default: 'payment' },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:typeFilter',
  'update:statusFilter',
  'update:dateFrom',
  'update:dateTo',
  'print-expenses',
])

const isReceipt = computed(() => props.type === 'receipt')

const formatIsoDate = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const setPeriod = (type) => {
  const now = new Date()
  if (type === 'today') {
    const todayStr = formatIsoDate(now)
    emit('update:dateFrom', todayStr)
    emit('update:dateTo', todayStr)
  } else if (type === 'week') {
    const dayOfWeek = now.getDay()
    const diffToSaturday = (dayOfWeek + 1) % 7
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - diffToSaturday)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    emit('update:dateFrom', formatIsoDate(startOfWeek))
    emit('update:dateTo', formatIsoDate(endOfWeek))
  } else if (type === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    emit('update:dateFrom', formatIsoDate(startOfMonth))
    emit('update:dateTo', formatIsoDate(endOfMonth))
  }
}

const clearDates = () => {
  emit('update:dateFrom', '')
  emit('update:dateTo', '')
}
</script>
