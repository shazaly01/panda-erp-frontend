<!-- src/modules/inventory/views/categories/components/CategoriesTreeView.vue -->
<template>
  <div
    class="invoice-stage-3d rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 font-sans text-right"
    dir="rtl"
  >
    <!-- حالة التحميل -->
    <div v-if="loading" class="flex justify-center items-center p-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"
      ></div>
      <span class="mr-3 text-xs font-bold text-text-secondary">
        جاري تحميل هيكل تصنيفات الأصناف...
      </span>
    </div>

    <template v-else>
      <div class="overflow-x-auto">
        <div class="min-w-[680px]">
          <!-- سطر الترويسة الموحد للجدول الشجري -->
          <div
            class="invoice-thead-3d grid grid-cols-12 gap-4 px-4 h-11 items-center select-none text-xs tracking-tight"
          >
            <div class="col-span-6 font-black text-white dark:text-slate-900 text-[13px]">
              <span class="inline-flex items-center gap-2">
                <span
                  class="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/25 inline-block"
                ></span>
                تفاصيل التصنيف والهيكل الشجري
              </span>
            </div>
            <div class="col-span-2 font-bold text-slate-200 dark:text-slate-800">كود التصنيف</div>
            <div class="col-span-2 font-bold text-slate-200 dark:text-slate-800">الحالة</div>
            <div class="col-span-2 text-left font-bold text-slate-300 dark:text-slate-700">
              إجراءات
            </div>
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
          <div
            v-else
            class="flex flex-col justify-center items-center py-12 px-4 text-text-muted space-y-2.5"
          >
            <div
              class="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/25 flex items-center justify-center"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <p class="text-xs font-medium text-center">
              لا توجد تصنيفات مضافة حالياً. يمكنك إضافة تصنيف رئيسي جديد للبدء.
            </p>
          </div>
        </div>
      </div>

      <!-- شريط ملخص إحصائي مدمج أسفل المنصة -->
      <div
        class="px-4 py-2 bg-surface-ground/60 border-t border-surface-border/80 flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary"
      >
        <span class="text-[11px] text-text-muted">
          انقر على أي تصنيف رئيسي لطي أو توسيع الأقسام الفرعية التابعة له
        </span>

        <div class="flex items-center gap-2">
          <span
            class="px-2.5 py-1 rounded-lg bg-surface-card border border-surface-border font-mono shadow-2xs"
          >
            التصنيفات الرئيسية:
            <strong class="text-primary font-black text-sm mr-1">{{
              rootCategories.length
            }}</strong>
          </span>
          <span
            class="px-2.5 py-1 rounded-lg bg-surface-card border border-surface-border font-mono shadow-2xs"
          >
            الإجمالي الكلي:
            <strong class="text-text-primary font-black text-sm mr-1">{{
              categories.length
            }}</strong>
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
