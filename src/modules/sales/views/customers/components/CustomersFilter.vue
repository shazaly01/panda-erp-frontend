<!--src/modules/sales/views/customers/components/CustomersFilter.vue-->
<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-6">
        <AppInput
          id="customer-search"
          :model-value="searchQuery"
          placeholder="ابحث باسم العميل، الاسم التجاري، الكود، الهاتف، أو الرقم الضريبي..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-3">
        <AppDropdown
          id="customer-type-filter"
          :model-value="typeFilter"
          :options="[
            { id: '', name: 'كل الأنواع' },
            { id: 'company', name: 'شركة / منشأة' },
            { id: 'person', name: 'فرد' },
          ]"
          @update:model-value="$emit('update:typeFilter', $event)"
        />
      </div>

      <div class="md:col-span-3">
        <AppDropdown
          id="customer-status-filter"
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'كل الحالات' },
            { id: 'active', name: 'نشط (متاح للتعامل)' },
            { id: 'inactive', name: 'غير نشط' },
            { id: 'blocked', name: 'محظور' },
          ]"
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
  typeFilter: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:typeFilter', 'update:statusFilter'])
</script>
