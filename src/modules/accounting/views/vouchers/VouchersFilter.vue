<!--src\modules\accounting\views\vouchers\VouchersFilter.vue-->
<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-5">
        <AppInput
          :model-value="searchQuery"
          placeholder="بحث برقم السند، البيان، أو اسم الحساب..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-3">
        <AppDropdown
          :model-value="typeFilter"
          :options="[
            { id: '', name: 'كل أنواع السندات' },
            { id: 'payment', name: 'سندات صرف (دفع)' },
            { id: 'receipt', name: 'سندات قبض (استلام)' },
          ]"
          @update:model-value="$emit('update:typeFilter', $event)"
        />
      </div>

      <div class="md:col-span-4">
        <AppDropdown
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'كل الحالات' },
            { id: 'draft', name: 'مسودة (تحت المراجعة)' },
            { id: 'approved', name: 'معتمد (بانتظار الترحيل)' },
            { id: 'posted', name: 'مُرحل (قيد يومية)' },
          ]"
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
  typeFilter: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:typeFilter', 'update:statusFilter'])
</script>
