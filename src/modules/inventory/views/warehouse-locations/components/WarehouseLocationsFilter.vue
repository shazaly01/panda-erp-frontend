<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-4">
        <AppInput
          id="loc-search"
          :model-value="searchQuery"
          placeholder="ابحث باسم الموقع أو الكود..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-3">
        <AppDropdown
          id="filter-warehouse"
          :model-value="warehouseFilter"
          :options="[{ id: '', name: 'كل المستودعات' }, ...warehouses]"
          option-label="name"
          option-value="id"
          placeholder="تصفية حسب المستودع"
          @update:model-value="$emit('update:warehouseFilter', $event)"
        />
      </div>

      <div class="md:col-span-3">
        <AppDropdown
          id="filter-type"
          :model-value="typeFilter"
          :options="[
            { id: '', name: 'كل الأنواع' },
            { id: 'aisle', name: 'ممر (Aisle)' },
            { id: 'rack', name: 'صف رفوف (Rack)' },
            { id: 'shelf', name: 'رف (Shelf)' },
            { id: 'bin', name: 'صندوق / حاوية (Bin)' },
          ]"
          option-label="name"
          option-value="id"
          placeholder="تصفية حسب النوع"
          @update:model-value="$emit('update:typeFilter', $event)"
        />
      </div>

      <div class="md:col-span-2">
        <AppDropdown
          id="filter-status"
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'كل الحالات' },
            { id: '1', name: 'نشط' },
            { id: '0', name: 'موقوف' },
          ]"
          option-label="name"
          option-value="id"
          placeholder="الحالة"
          @update:model-value="$emit('update:statusFilter', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  searchQuery: { type: String, default: '' },
  warehouseFilter: { type: [String, Number], default: '' },
  typeFilter: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
  warehouses: { type: Array, default: () => [] },
})

defineEmits([
  'update:searchQuery',
  'update:warehouseFilter',
  'update:typeFilter',
  'update:statusFilter',
])
</script>
