<!--src\modules\hr\views\payroll\components\SalaryRulesTable.vue-->
<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="rules" :is-loading="loading">
      <template #cell-rule_info="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <span class="font-bold text-sm text-text-primary">
            {{ item.name }}
          </span>
          <span
            class="text-xs font-mono font-bold text-primary bg-primary/10 w-fit px-1.5 py-0.5 rounded tracking-wider"
          >
            {{ item.code }}
          </span>
        </div>
      </template>

      <template #cell-category="{ item }">
        <span
          class="px-2 py-1 text-[11px] font-bold rounded-md"
          :class="getCategoryClass(item.category)"
        >
          {{ getCategoryLabel(item.category) }}
        </span>
      </template>

      <template #cell-calculation="{ item }">
        <div class="flex flex-col text-xs">
          <span class="text-text-primary font-medium">{{ getTypeLabel(item.type) }}</span>
          <span v-if="item.type === 'fixed'" class="text-text-muted">
            {{ item.value }} (مبلغ ثابت)
          </span>
          <span v-else-if="item.type === 'percentage'" class="text-text-muted">
            {{ item.value }}% من {{ item.percentage_of_code || '---' }}
          </span>
          <span
            v-else-if="item.type === 'formula'"
            class="text-text-muted truncate max-w-[150px]"
            :title="item.formula_expression"
          >
            {{ item.formula_expression }}
          </span>
          <span v-else class="text-text-muted italic">إدخال يدوي</span>
        </div>
      </template>

      <template #cell-mapping="{ item }">
        <div v-if="item.account_details" class="flex flex-col py-1">
          <span class="text-xs font-bold text-text-primary">
            {{ item.account_details.account_name }}
          </span>
          <span class="text-[11px] font-mono text-text-muted mt-0.5">
            كود: {{ item.account_details.account_code }}
          </span>
        </div>

        <span
          v-else-if="item.account_mapping_key"
          class="text-xs font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
          title="المفتاح موجود ولكن الحساب غير متوفر بشجرة الحسابات"
        >
          {{ item.account_mapping_key }} (حساب مفقود)
        </span>

        <span v-else class="text-xs text-text-muted italic"> غير مرتبط </span>
      </template>

      <template #cell-status="{ item }">
        <span
          class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1.5"
          :class="
            item.is_active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          "
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="item.is_active ? 'bg-emerald-500' : 'bg-rose-500'"
          ></span>
          {{ item.is_active ? 'نشط' : 'موقوف' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('salary_rule.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل القاعدة"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('salary_rule.delete')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </template>
    </AppTable>

    <AppPagination :meta="pagination" @page-change="$emit('page-change', $event)" />
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const props = defineProps({
  rules: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'rule_info', label: 'القاعدة / الكود', class: 'min-w-[180px]' },
  { key: 'category', label: 'الفئة', class: 'min-w-[120px]' },
  { key: 'calculation', label: 'طريقة الحساب والقيمة', class: 'min-w-[200px]' },
  { key: 'mapping', label: 'الربط المحاسبي', class: 'min-w-[150px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[100px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])

// دالات مساعدة للتنسيق (Helpers)
const getCategoryLabel = (cat) => {
  const labels = {
    allowance: 'استحقاق',
    deduction: 'استقطاع',
    company_contribution: 'مساهمة شركة',
  }
  return labels[cat] || cat
}

const getCategoryClass = (cat) => {
  const classes = {
    allowance: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    deduction: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    company_contribution: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  }
  return classes[cat] || ''
}

const getTypeLabel = (type) => {
  const types = {
    fixed: 'مبلغ ثابت',
    percentage: 'نسبة مئوية',
    formula: 'معادلة',
    input: 'مدخل يدوي',
  }
  return types[type] || type
}
</script>
