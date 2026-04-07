<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-6">
        <AppInput
          id="leave-search"
          :model-value="searchQuery"
          placeholder="ابحث باسم الموظف..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-3">
        <AppDropdown
          id="leave-type-filter"
          :model-value="typeFilter"
          :options="leaveTypesOptions"
          option-label="name"
          option-value="id"
          @update:model-value="$emit('update:typeFilter', $event)"
        />
      </div>

      <div class="md:col-span-3">
        <AppDropdown
          id="leave-status-filter"
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
  typeFilter: { type: [String, Number], default: '' },
  statusFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:typeFilter', 'update:statusFilter'])

// خيارات حالة الطلب
const statusOptions = [
  { id: '', name: 'كل الحالات' },
  { id: 'pending', name: 'قيد الانتظار' },
  { id: 'approved', name: 'معتمدة' },
  { id: 'rejected', name: 'مرفوضة' },
]

// خيارات أنواع الإجازات (يمكن جلبها من الـ Store لاحقاً إذا كانت ديناميكية)
const leaveTypesOptions = [
  { id: '', name: 'كل أنواع الإجازات' },
  { id: 1, name: 'إجازة سنوية' },
  { id: 2, name: 'إجازة مرضية' },
  { id: 3, name: 'إجازة طارئة' },
]
</script>
