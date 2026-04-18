<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-8">
        <AppInput
          id="paygroup-search"
          :model-value="searchQuery"
          placeholder="ابحث باسم المجموعة..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-4">
        <AppDropdown
          id="paygroup-status-filter"
          :model-value="statusFilter"
          :options="statusOptions"
          option-label="name"
          option-value="id"
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
  statusFilter: { type: [String, Number, Boolean], default: '' },
})

defineEmits(['update:searchQuery', 'update:statusFilter'])

const statusOptions = [
  { id: '', name: 'كل الحالات' },
  { id: '1', name: 'المجموعات النشطة فقط' },
  { id: '0', name: 'المجموعات المتوقفة' },
]
</script>
