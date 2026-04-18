<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-6">
        <AppInput
          id="payperiod-search"
          :model-value="searchQuery"
          placeholder="ابحث باسم الفترة (مثلاً: أبريل)..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-3">
        <AppDropdown
          id="payperiod-group-filter"
          :model-value="payGroupFilter"
          :options="payGroupOptions"
          option-label="name"
          option-value="id"
          placeholder="تصفية حسب المجموعة"
          @update:model-value="$emit('update:payGroupFilter', $event)"
        />
      </div>

      <div class="md:col-span-3">
        <AppDropdown
          id="payperiod-status-filter"
          :model-value="statusFilter"
          :options="statusOptions"
          option-label="name"
          option-value="id"
          @update:model-value="$emit('update:statusFilter', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePayGroupStore } from '@/modules/hr/stores/payGroupStore'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  payGroupFilter: { type: [String, Number], default: '' },
  statusFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:payGroupFilter', 'update:statusFilter'])

const payGroupStore = usePayGroupStore()

// جلب المجموعات عند تحميل المكون لاستخدامها في الفلتر
onMounted(() => {
  if (payGroupStore.groups.length === 0) {
    payGroupStore.fetchPayGroups({ is_active: 1 })
  }
})

// إضافة خيار "كل المجموعات" في بداية القائمة
const payGroupOptions = computed(() => {
  return [{ id: '', name: 'كل المجموعات' }, ...payGroupStore.groups]
})

const statusOptions = [
  { id: '', name: 'كل الحالات' },
  { id: 'open', name: 'مفتوحة (للاصرف)' },
  { id: 'processing', name: 'قيد المعالجة' },
  { id: 'closed', name: 'مغلقة (مرحّلة)' },
]
</script>
