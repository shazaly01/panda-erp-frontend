<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6 shadow-sm">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <AppInput
          id="voucher-search-query"
          :model-value="searchQuery"
          placeholder="ابحث برقم الكود..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div>
        <AppDropdown
          id="voucher-status-filter"
          :model-value="status"
          :options="statusOptions"
          option-label="name"
          option-value="id"
          placeholder="تصفية حسب الحالة"
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

// خيارات الحالة (مطابقة للباك-إند)
const statusOptions = [
  { id: '', name: 'كل الأكواد' },
  { id: 'available', name: 'متاح (غير مصروف)' },
  { id: 'assigned', name: 'مصروف' },
]
</script>
