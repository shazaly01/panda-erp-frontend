<template>
  <AppTable
    :columns="headers"
    :data="items"
    :loading="loading"
    empty-text="لا توجد سنوات مالية معرفة"
  >
    <template #cell-status="{ row }">
      <span
        class="px-2 py-1 rounded text-xs font-bold"
        :class="row.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
      >
        {{ row.status === 'open' ? 'مفتوحة' : 'مغلقة' }}
      </span>
    </template>

    <template #cell-actions="{ row }">
      <div class="flex gap-2">
        <AppButton variant="outline" size="sm" icon="pencil" @click="$emit('edit', row)" />
        <AppButton variant="danger-outline" size="sm" icon="trash" @click="$emit('delete', row)" />
      </div>
    </template>
  </AppTable>
</template>

<script setup>
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

defineProps({
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete'])

// تعريف الأعمدة لـ AppTable
const headers = [
  { key: 'name', label: 'اسم السنة' },
  { key: 'start_date', label: 'تاريخ البداية' },
  { key: 'end_date', label: 'تاريخ النهاية' },
  { key: 'status', label: 'الحالة' }, // سيستخدم الـ Slot المخصص أعلاه
  { key: 'actions', label: 'إجراءات' },
]
</script>
