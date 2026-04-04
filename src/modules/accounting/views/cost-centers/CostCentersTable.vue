<template>
  <AppTable
    :headers="headers"
    :items="costCenters"
    :is-loading="isLoading"
    :row-clickable="true"
    @row-click="$emit('edit', $event)"
  >
    <template #cell-code="{ item }">
      <span class="font-mono font-bold text-primary tracking-tighter">
        {{ item.code }}
      </span>
    </template>

    <template #cell-name="{ item }">
      <div class="flex flex-col">
        <span class="font-semibold text-text-primary">{{ item.name }}</span>
        <span v-if="item.notes" class="text-[11px] text-text-muted truncate max-w-[200px]">
          {{ item.notes }}
        </span>
      </div>
    </template>

    <template #cell-properties="{ item }">
      <div class="flex items-center gap-2">
        <span
          v-if="item.is_branch"
          class="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[11px] font-bold"
        >
          فرع مستقل {{ item.code_prefix ? `(${item.code_prefix})` : '' }}
        </span>
        <span
          v-else
          class="px-2 py-0.5 bg-surface-section text-text-muted border border-surface-border rounded text-[11px]"
        >
          تاق (مركز تكلفة)
        </span>
      </div>
    </template>

    <template #cell-is_active="{ item }">
      <div class="flex justify-center">
        <span
          class="px-2 py-0.5 rounded text-[10px] font-bold border"
          :class="
            item.is_active
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'bg-slate-50 text-slate-400 border-slate-200'
          "
        >
          {{ item.is_active ? 'نشط' : 'معطل' }}
        </span>
      </div>
    </template>

    <template #cell-actions="{ item }">
      <div class="flex items-center gap-1 justify-end">
        <AppButton size="sm" variant="secondary" @click.stop="$emit('edit', item)">
          تعديل
        </AppButton>
        <AppButton size="sm" variant="danger-text" @click.stop="$emit('delete', item)">
          حذف
        </AppButton>
      </div>
    </template>
  </AppTable>
</template>

<script setup>
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  costCenters: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete'])

// تم تحديث العناوين لتتناسب مع النظام الجديد
const headers = [
  { label: 'كود التاق', key: 'code' },
  { label: 'اسم المركز (التاق)', key: 'name' },
  { label: 'الخصائص', key: 'properties' },
  { label: 'الحالة', key: 'is_active', cellClass: 'text-center' },
  { label: 'إجراءات', key: 'actions', cellClass: 'text-left' },
]
</script>
