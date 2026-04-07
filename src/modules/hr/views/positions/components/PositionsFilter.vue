<!--src\modules\hr\views\positions\components\PositionsFilter.vue-->
<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-8">
        <AppInput
          :model-value="searchQuery"
          placeholder="ابحث باسم المسمى الوظيفي أو الكود..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-4">
        <AppDropdown
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'كل الحالات' },
            { id: '1', name: 'نشط (متاح للاختيار)' },
            { id: '0', name: 'موقوف' },
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
  statusFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:statusFilter'])
</script>
