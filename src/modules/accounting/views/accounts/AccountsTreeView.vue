<!--src\modules\accounting\views\accounts\AccountsTreeView.vue-->
<template>
  <AppCard>
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span class="ml-3 text-text-muted">جاري تحميل دليل الحسابات...</span>
    </div>

    <div v-else>
      <div
        class="grid grid-cols-12 gap-4 py-3 px-4 bg-surface-section border-b border-surface-border font-semibold text-xs text-text-muted uppercase tracking-wider"
      >
        <div class="col-span-5">تفاصيل الحساب</div>
        <div class="col-span-2">الطبيعة</div>
        <div class="col-span-2">التصنيف</div>
        <div class="col-span-1 text-center">حركي</div>
        <div class="col-span-2 text-left">إجراءات</div>
      </div>

      <div v-if="accounts && accounts.length > 0" class="flex flex-col">
        <AccountsTreeNode
          v-for="rootNode in accounts"
          :key="rootNode.id"
          :node="rootNode"
          :level="0"
          @add-child="$emit('add-child', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>

      <div v-else class="flex flex-col justify-center items-center p-12 text-text-muted">
        <svg
          class="w-12 h-12 mb-3 opacity-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p>لا توجد حسابات مالية مضافة حالياً.</p>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import AppCard from '@/components/ui/AppCard.vue'
import AccountsTreeNode from './AccountsTreeNode.vue'

const props = defineProps({
  // أضفنا قيمة افتراضية مصفوفة فارغة لضمان عدم انهيار الشاشة إذا تأخر الباك-إند
  accounts: {
    type: Array,
    required: true,
    default: () => [],
  },
  loading: { type: Boolean, default: false },
})

defineEmits(['add-child', 'edit', 'delete'])
</script>
