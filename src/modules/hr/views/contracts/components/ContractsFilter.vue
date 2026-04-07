<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <AppInput
          :model-value="searchQuery"
          placeholder="ابحث باسم الموظف أو رقم العقد..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div>
        <AppDropdown
          :model-value="status"
          :options="statusOptions"
          option-label="name"
          option-value="id"
          @update:model-value="$emit('update:status', $event)"
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
  status: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:status'])

const statusOptions = [
  { id: '', name: 'كل العقود' },
  { id: 'active', name: 'عقود سارية (نشطة)' },
  { id: 'expired', name: 'عقود منتهية' },
]
</script>
