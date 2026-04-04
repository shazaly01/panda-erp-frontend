<template>
  <AppTable
    :headers="headers"
    :items="accounts"
    :is-loading="isLoading"
    :row-clickable="true"
    @row-click="$emit('edit', $event)"
  >
    <template #cell-code="{ item }">
      <div class="flex items-center gap-2">
        <span class="font-mono font-bold text-primary tracking-wider">
          {{ item.code }}
        </span>
        <span v-if="item.requires_cost_center" title="يتطلب مركز تكلفة" class="text-orange-500">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </div>
    </template>

    <template #cell-name="{ item }">
      <div class="flex flex-col">
        <span :class="[item.is_transactional ? 'font-medium' : 'font-bold', 'text-text-primary']">
          {{ item.name }}
        </span>
        <span v-if="item.parent_id" class="text-[10px] text-text-muted flex items-center gap-1">
          <svg class="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h10a2 2 0 012 2v8m0 0l-3-3m3 3l3-3"
            ></path>
          </svg>
          حساب فرعي
        </span>
      </div>
    </template>

    <template #cell-nature="{ item }">
      <span
        class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
        :class="
          item.nature === 'debit'
            ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
            : 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
        "
      >
        {{ item.nature_label || (item.nature === 'debit' ? 'مدين' : 'دائن') }}
      </span>
    </template>

    <template #cell-type="{ item }">
      <span class="text-text-secondary text-xs font-medium">{{ formatType(item.type) }}</span>
    </template>

    <template #cell-is_transactional="{ item }">
      <div class="flex justify-center">
        <div v-if="item.is_transactional" class="text-emerald-500" title="يقبل قيود (حركي)">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <div v-else class="text-text-muted opacity-40" title="حساب أب (تجميعي)">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            ></path>
          </svg>
        </div>
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
  accounts: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete'])

// دالة الترجمة لتوحيد الشكل مع الشجرة
const formatType = (type) => {
  const types = {
    asset: 'أصول',
    liability: 'خصوم',
    equity: 'حقوق ملكية',
    revenue: 'إيرادات',
    expense: 'مصروفات',
  }
  return types[type] || type
}

const headers = [
  { label: 'كود الحساب', key: 'code', cellClass: 'font-semibold w-32' },
  { label: 'اسم الحساب', key: 'name' },
  { label: 'الطبيعة', key: 'nature', cellClass: 'text-center w-24' },
  { label: 'التصنيف', key: 'type', cellClass: 'w-32' },
  { label: 'حركي', key: 'is_transactional', cellClass: 'text-center w-20' },
  { label: 'إجراءات', key: 'actions', cellClass: 'text-left w-32' },
]
</script>
