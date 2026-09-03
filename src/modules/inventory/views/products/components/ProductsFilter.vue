<!--src\modules\inventory\views\products\components\ProductsFilter.vue--->
<template>
  <div class="bg-surface-section p-4 rounded-2xl border border-surface-border mb-6 shadow-sm">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <!-- حقل البحث بالأسم أو SKU -->
      <div class="md:col-span-5">
        <AppInput
          id="products-search"
          :model-value="searchQuery"
          placeholder="ابحث باسم الصنف، كود SKU..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <!-- فلتر التصنيف -->
      <div class="md:col-span-3">
        <AppDropdown
          id="products-category-filter"
          :model-value="categoryFilter"
          :options="categoryOptions"
          option-label="name"
          option-value="id"
          placeholder="كل التصنيفات"
          @update:model-value="$emit('update:categoryFilter', $event)"
        />
      </div>

      <!-- فلتر نوع المنتج -->
      <div class="md:col-span-2">
        <AppDropdown
          id="products-type-filter"
          :model-value="typeFilter"
          :options="[
            { id: '', name: 'كل الأنواع' },
            { id: 'storable', name: 'مخزني' },
            { id: 'raw_material', name: 'مادة خام' },
            { id: 'composite', name: 'تجميعي' },
            { id: 'service', name: 'خدمة' },
          ]"
          placeholder="كل الأنواع"
          @update:model-value="$emit('update:typeFilter', $event)"
        />
      </div>

      <!-- فلتر الحالة -->
      <div class="md:col-span-2">
        <AppDropdown
          id="products-status-filter"
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'كل الحالات' },
            { id: '1', name: 'نشط' },
            { id: '0', name: 'موقوف' },
          ]"
          placeholder="كل الحالات"
          @update:model-value="$emit('update:statusFilter', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  categoryFilter: { type: [String, Number], default: '' },
  typeFilter: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
})

defineEmits([
  'update:searchQuery',
  'update:categoryFilter',
  'update:typeFilter',
  'update:statusFilter',
])

const categoryOptions = computed(() => [{ id: '', name: 'كل التصنيفات' }, ...props.categories])
</script>
