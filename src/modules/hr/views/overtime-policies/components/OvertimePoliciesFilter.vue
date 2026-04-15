<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <AppInput
          :model-value="searchQuery"
          placeholder="ابحث باسم السياسة..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div>
        <AppDropdown
          :model-value="status"
          :options="calcTypeOptions"
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

// حولنا الخيارات لتناسب طبيعة سياسات الأوفرتايم (بدلاً من نشط/منتهي)
const calcTypeOptions = [
  { id: '', name: 'كل السياسات' },
  { id: 'daily', name: 'بنظام الأيام' },
  { id: 'hourly', name: 'بنظام الساعات' },
]
</script>
