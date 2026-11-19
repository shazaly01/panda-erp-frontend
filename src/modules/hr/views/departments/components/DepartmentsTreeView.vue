<!-- src/modules/hr/views/departments/components/DepartmentsTreeView.vue -->
<template>
  <div
    class="invoice-stage-3d rounded-2xl overflow-hidden text-right font-sans transition-all duration-200"
    dir="rtl"
  >
    <!-- حالة التحميل -->
    <div v-if="loading" class="flex justify-center items-center gap-3 p-12 text-text-secondary">
      <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-primary"></div>
      <span class="text-xs font-bold">جاري تحميل الهيكل التنظيمي...</span>
    </div>

    <div v-else class="overflow-x-auto">
      <div class="min-w-[720px]">
        <!-- ترويسة الشجرة المجسّمة المطابقة لجداول النظام -->
        <div
          class="invoice-thead-3d grid grid-cols-12 gap-4 py-3 px-4 font-black text-xs select-none sticky top-0 z-10"
        >
          <div class="col-span-5 flex items-center gap-2">
            <span
              class="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/25 inline-block"
            ></span>
            <span>تفاصيل الإدارة / القسم</span>
          </div>
          <div class="col-span-2 text-center">المستوى التنظيمي</div>
          <div class="col-span-2 text-center">الربط المحاسبي</div>
          <div class="col-span-1 text-center">الحالة</div>
          <div class="col-span-2 text-left">إجراءات</div>
        </div>

        <!-- عقد الشجرة -->
        <div
          v-if="departments && departments.length > 0"
          class="flex flex-col divide-y divide-surface-border/70 bg-surface-section"
        >
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

        <!-- الحالة الفارغة -->
        <div
          v-else
          class="flex flex-col justify-center items-center p-14 text-text-muted bg-surface-section"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3"
          >
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <p class="text-sm font-black text-text-primary">لا يوجد هيكل تنظيمي حالياً</p>
          <p class="text-xs text-text-muted mt-1">
            ابدأ بإضافة الإدارات الرئيسية لبناء الهيكل الإداري للمنشأة.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import DepartmentsTreeNode from './DepartmentsTreeNode.vue'

defineProps({
  departments: {
    type: Array,
    required: true,
    default: () => [],
  },
  loading: { type: Boolean, default: false },
})

defineEmits(['add-child', 'edit', 'delete'])
</script>
