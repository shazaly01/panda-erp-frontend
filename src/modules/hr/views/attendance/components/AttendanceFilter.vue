<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-5">
        <AppInput
          id="attendance-search"
          :model-value="searchQuery"
          placeholder="ابحث باسم الموظف..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-4">
        <AppInput
          id="attendance-date-filter"
          type="date"
          :model-value="dateFilter"
          @update:model-value="$emit('update:dateFilter', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-3">
        <AppDropdown
          id="attendance-status-filter"
          :model-value="statusFilter"
          :options="statusOptions"
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
  dateFilter: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:dateFilter', 'update:statusFilter'])

// خيارات حالة الحضور
const statusOptions = [
  { id: '', name: 'كل الحالات' },
  { id: 'present', name: 'حاضر' },
  { id: 'absent', name: 'غائب' },
  { id: 'late', name: 'متأخر' },
  { id: 'on_leave', name: 'في إجازة' },
]
</script>
