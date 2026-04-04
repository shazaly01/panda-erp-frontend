<template>
  <div class="flex flex-col md:flex-row gap-4 mb-6 items-end">
    <div class="w-full md:w-1/3">
      <AppInput
        :model-value="search"
        @update:model-value="$emit('update:search', $event)"
        label="بحث"
        placeholder="ابحث باسم السنة..."
        icon="search"
      />
    </div>

    <div class="w-full md:w-1/4">
      <AppDropdown
        :model-value="status"
        @update:model-value="$emit('update:status', $event)"
        label="الحالة"
        :options="[
          { label: 'الكل', value: '' },
          { label: 'مفتوحة', value: 'open' },
          { label: 'مغلقة', value: 'closed' },
        ]"
      />
    </div>

    <div class="mr-auto">
      <AppButton @click="$emit('create')" variant="primary" icon="plus"> سنة جديدة </AppButton>
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'

defineProps(['search', 'status'])
defineEmits(['update:search', 'update:status', 'create'])
</script>
