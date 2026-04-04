<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <AppInput
          :model-value="searchQuery"
          placeholder="بحث بالكود أو اسم الحساب..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>
      <div class="w-full md:w-64">
        <AppDropdown
          :model-value="natureFilter"
          :options="[
            { id: '', name: 'كل الطبيعة' },
            { id: 'debit', name: 'مدين' },
            { id: 'credit', name: 'دائن' },
          ]"
          @update:model-value="$emit('update:natureFilter', $event)"
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
  natureFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:natureFilter'])
</script>
