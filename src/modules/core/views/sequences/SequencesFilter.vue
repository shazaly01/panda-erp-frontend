<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <AppInput
          :model-value="searchQuery"
          placeholder="بحث باسم المستند أو صيغة الترقيم..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="w-full md:w-64">
        <AppDropdown
          :model-value="moduleFilter"
          :options="[
            { id: '', name: 'كل الوحدات (الكل)' },
            { id: 'accounting', name: 'الوحدة المالية' },
            { id: 'hr', name: 'الموارد البشرية' },
          ]"
          @update:model-value="$emit('update:moduleFilter', $event)"
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
  moduleFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:moduleFilter'])
</script>
