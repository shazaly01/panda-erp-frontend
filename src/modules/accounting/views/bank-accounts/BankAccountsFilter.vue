<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <AppInput
          :model-value="searchQuery"
          placeholder="بحث باسم البنك، اسم الحساب، أو رقم الحساب..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <!-- <div class="w-full md:w-64">
        <AppDropdown
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'حالة الحساب (الكل)' },
            { id: '1', name: 'نشط' },
            { id: '0', name: 'غير نشط' },
          ]"
          @update:model-value="$emit('update:statusFilter', $event)"
        />
      </div> -->
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  searchQuery: { type: String, default: '' },
  statusFilter: { type: [String, Number], default: '' },
})

defineEmits(['update:searchQuery', 'update:statusFilter'])
</script>
