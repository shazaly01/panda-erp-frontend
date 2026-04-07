<template>
  <AppCard class="overflow-hidden">
    <div v-if="loading" class="flex justify-center items-center p-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span class="ml-3 text-text-muted">جاري تحميل الهيكل التنظيمي...</span>
    </div>

    <div v-else>
      <div
        class="grid grid-cols-12 gap-4 py-3 px-4 bg-surface-section border-b border-surface-border font-bold text-[11px] text-text-muted uppercase tracking-wider sticky top-0 z-10"
      >
        <div class="col-span-5">تفاصيل الإدارة / القسم</div>
        <div class="col-span-2">المستوى التنظيمي</div>
        <div class="col-span-2">الربط المحاسبي</div>
        <div class="col-span-1 text-center">الحالة</div>
        <div class="col-span-2 text-left">إجراءات</div>
      </div>

      <div v-if="departments && departments.length > 0" class="flex flex-col">
        <DepartmentsTreeNode
          v-for="rootNode in departments"
          :key="rootNode.id"
          :node="rootNode"
          :level="0"
          @add-child="$emit('add-child', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>

      <div
        v-else
        class="flex flex-col justify-center items-center p-16 text-text-muted bg-surface-bg/50"
      >
        <svg
          class="w-16 h-16 mb-4 opacity-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <p class="text-lg font-semibold">لا يوجد هيكل تنظيمي حالياً.</p>
        <p class="text-sm mt-1">ابدأ بإضافة الإدارات الرئيسية أولاً.</p>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import AppCard from '@/components/ui/AppCard.vue'
import DepartmentsTreeNode from './DepartmentsTreeNode.vue'

const props = defineProps({
  departments: {
    type: Array,
    required: true,
    default: () => [],
  },
  loading: { type: Boolean, default: false },
})

defineEmits(['add-child', 'edit', 'delete'])
</script>
