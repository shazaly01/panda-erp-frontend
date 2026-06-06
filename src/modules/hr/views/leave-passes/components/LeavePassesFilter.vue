<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-5">
        <label class="block text-xs font-medium text-text-secondary mb-1">البحث الذكي</label>
        <AppInput
          :model-value="searchQuery"
          placeholder="ابحث باسم الموظف، الرقم الوظيفي، أو الهاتف..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-4">
        <label class="block text-xs font-medium text-text-secondary mb-1">الحالة الحركية</label>
        <AppDropdown
          :model-value="statusFilter"
          :options="statusOptions"
          option-label="name"
          option-value="id"
          placeholder="كل الحالات الحركية"
          :show-clear="true"
          @update:model-value="$emit('update:statusFilter', $event)"
        />
      </div>

      <div class="md:col-span-3">
        <label class="block text-xs font-medium text-text-secondary mb-1">تاريخ الإذن</label>
        <AppInput
          :model-value="dateFilter"
          type="date"
          @update:model-value="$emit('update:dateFilter', $event)"
          clearable
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  searchQuery: { type: String, default: '' },
  statusFilter: { type: [String, Number], default: '' },
  dateFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:statusFilter', 'update:dateFilter'])

// مصفوفة خيارات الحالات الحركية الموحدة مع الباكيند والواجهات
const statusOptions = ref([
  { id: 'approved', name: 'معتمد للعبور (لم يخرج)' },
  { id: 'out', name: 'خارج المنشأة حالياً' },
  { id: 'returned', name: 'عاد للمنشأة (مغلق)' },
  { id: 'rejected', name: 'أذونات مرفوضة إدارياً' },
])
</script>
