<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <AppInput
          id="search-cost-center"
          :model-value="searchQuery"
          placeholder="بحث بكود أو اسم مركز التكلفة..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="w-full md:w-48">
        <AppDropdown
          id="filter-cost-center-type"
          :model-value="typeFilter"
          :options="[
            { id: '', name: 'كل الأنواع' },
            { id: 'direct', name: 'مباشر' },
            { id: 'indirect', name: 'غير مباشر' },
            { id: 'group', name: 'تجميعي' },
          ]"
          @update:model-value="$emit('update:typeFilter', $event)"
        />
      </div>

      <div class="w-full md:w-48">
        <AppDropdown
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'كل الحالات' },
            { id: '1', name: 'نشط' },
            { id: '0', name: 'غير نشط' },
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
  statusFilter: { type: [String, Number], default: '' },
})

defineEmits(['update:searchQuery', 'update:typeFilter', 'update:statusFilter'])
</script>
