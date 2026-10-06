<!--src\modules\inventory\views\categories\components\CategoriesTreeView.vue-->
<template>
  <AppCard class="overflow-hidden">
    <!-- حالة التحميل -->
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span class="mr-3 text-text-muted">جاري تحميل هيكل تصنيفات الأصناف...</span>
    </div>

    <div v-else>
      <!-- سطر الترويسة الموحد للجدول الشجري -->
      <div
        class="grid grid-cols-12 gap-4 py-3 px-4 bg-surface-section border-b border-surface-border font-semibold text-xs text-text-muted uppercase tracking-wider"
      >
        <div class="col-span-6">تفاصيل التصنيف</div>
        <div class="col-span-2">كود التصنيف</div>
        <div class="col-span-2">الحالة</div>
        <div class="col-span-2 text-left">إجراءات</div>
      </div>

      <!-- قائمة عقد الشجرة المحسوبة -->
      <div v-if="rootCategories && rootCategories.length > 0" class="flex flex-col">
        <CategoriesTreeNode
          v-for="rootNode in rootCategories"
          :key="rootNode.id"
          :node="rootNode"
          :level="0"
          @add-child="$emit('add-child', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>

      <!-- حالة عدم وجود بيانات -->
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        <p>لا توجد تصنيفات مضافة حالياً. يمكنك إضافة تصنيف رئيسي جديد للبدء.</p>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'
import CategoriesTreeNode from './CategoriesTreeNode.vue'

defineOptions({
  name: 'CategoriesTreeView',
})

const props = defineProps({
  categories: {
    type: Array,
    required: true,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['add-child', 'edit', 'delete'])

/**
 * بناء الشجرة الهرمية اللانهائية بدقة 100%:
 * نقوم بجمع كافة العناصر وربط كل ابن بأبيه عبر خريطة Map
 * ليعمل التفرع للأبناء والأحفاد مهما كان عمق وتداخل المستويات.
 */
const rootCategories = computed(() => {
  if (!props.categories || props.categories.length === 0) {
    return []
  }

  // 1. إنشاء نسخة نظيفة من كل عنصر مع مصفوفة children فارغة
  const categoryMap = new Map()
  props.categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
    })
  })

  const roots = []

  // 2. ربط كل ابن بوالده بدقة، وجمع الجذور الرئيسية فقط في المستوى الأول
  props.categories.forEach((cat) => {
    const node = categoryMap.get(cat.id)
    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      categoryMap.get(cat.parent_id).children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
})
</script>
