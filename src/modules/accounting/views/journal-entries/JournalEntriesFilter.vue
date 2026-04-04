<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-4">
        <AppInput
          :model-value="searchQuery"
          placeholder="بحث برقم القيد أو البيان..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-3">
        <AppDropdown
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'كل الحالات' },
            { id: 'draft', name: 'مسودة' },
            { id: 'posted', name: 'مُرحل' },
          ]"
          @update:model-value="$emit('update:statusFilter', $event)"
        />
      </div>

      <div class="md:col-span-5 flex items-center gap-2">
        <AppInput
          type="date"
          :model-value="startDate"
          @update:model-value="$emit('update:startDate', $event)"
          class="flex-1"
          placeholder="من تاريخ"
        />
        <span class="text-text-muted text-sm">-</span>
        <AppInput
          type="date"
          :model-value="endDate"
          @update:model-value="$emit('update:endDate', $event)"
          class="flex-1"
          placeholder="إلى تاريخ"
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
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:statusFilter', 'update:startDate', 'update:endDate'])
</script>
