<!--src\modules\accounting\views\bank-accounts\BankAccountsFilter.vue-->
<template>
  <div
    class="bg-surface-header/60 p-4 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs mb-6 transition-all duration-200"
    dir="rtl"
  >
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <label class="block text-xs font-bold text-text-secondary mb-1.5"> البحث السريع </label>
        <AppInput
          :model-value="searchQuery"
          placeholder="بحث باسم البنك، اسم الحساب، أو رقم الحساب..."
          class="bg-surface-card"
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <!-- <div class="w-full md:w-64">
        <label class="block text-xs font-bold text-text-secondary mb-1.5">
          حالة الحساب
        </label>
        <AppDropdown
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'حالة الحساب (الكل)' },
            { id: '1', name: 'نشط' },
            { id: '0', name: 'غير نشط' },
          ]"
          class="bg-surface-card"
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
