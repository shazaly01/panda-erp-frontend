<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-6">
        <AppInput
          :model-value="searchQuery"
          placeholder="ابحث باسم الموظف..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-3">
        <AppDropdown
          :model-value="typeFilter"
          :options="[
            { id: '', name: 'كل أنواع المدخلات' },
            { id: 'bonus', name: 'حوافز' },
            { id: 'penalty', name: 'جزاءات' },
            { id: 'allowance', name: 'بدلات' },
            { id: 'deduction', name: 'استقطاعات' },
          ]"
          @update:model-value="$emit('update:typeFilter', $event)"
        />
      </div>

      <div class="md:col-span-3">
        <AppDropdown
          :model-value="processedFilter"
          :options="[
            { id: '', name: 'كل الحالات' },
            { id: '1', name: 'تم ترحيلها للراتب' },
            { id: '0', name: 'بانتظار الترحيل' },
          ]"
          @update:model-value="$emit('update:processedFilter', $event)"
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
  processedFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:typeFilter', 'update:processedFilter'])
</script>
