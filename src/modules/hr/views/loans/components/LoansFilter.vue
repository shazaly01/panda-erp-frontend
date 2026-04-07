<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-8">
        <AppInput
          id="loan-search"
          :model-value="searchQuery"
          placeholder="ابحث باسم الموظف أو مبرر السلفة..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-4">
        <AppDropdown
          id="loan-status"
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
  statusFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:statusFilter'])

// خيارات حالة السلفة (بناءً على دورة حياة السلفة المنطقية)
const statusOptions = [
  { id: '', name: 'كل الحالات' },
  { id: 'pending', name: 'قيد الانتظار (Pending)' },
  { id: 'approved', name: 'معتمدة / نشطة (Approved)' },
  { id: 'rejected', name: 'مرفوضة (Rejected)' },
  { id: 'paid', name: 'مسددة بالكامل (Paid)' },
]
</script>
