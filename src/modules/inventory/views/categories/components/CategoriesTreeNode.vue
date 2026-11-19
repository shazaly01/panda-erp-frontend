<!-- src/modules/inventory/views/categories/components/CategoriesTreeNode.vue -->
<template>
  <div>
    <!-- سطر العقدة الشجرية الرئيسي -->
    <div
      class="grid grid-cols-12 gap-4 py-2.5 px-4 border-b border-surface-border/70 transition-colors items-center group cursor-pointer"
      :class="
        hasChildren
          ? 'bg-surface-section hover:bg-primary/[0.04] dark:hover:bg-primary/10'
          : 'bg-surface-ground/35 hover:bg-primary/[0.04] dark:hover:bg-primary/10'
      "
      @click="toggle"
    >
      <!-- العمود 1: الإزاحة الهرمية، أيقونة المجلد، الاسم، وزر إضافة ابن سريع (6 أعمدة) -->
      <div class="col-span-6 flex items-center gap-2 overflow-hidden">
        <!-- مسافة الإزاحة بحسب المستوى الهرمي مع خط دليل بصري -->
        <div class="flex shrink-0 self-stretch items-center" v-if="level > 0">
          <div
            v-for="i in level"
            :key="'cat-spacer-' + i"
            class="w-6 h-full border-r border-dashed border-surface-border/80 mr-2"
          ></div>
        </div>

        <!-- سهم الطي والتوسيع للعقد التي تحتوي على أبناء -->
        <div class="w-4 h-4 flex items-center justify-center shrink-0">
          <svg
            v-if="hasChildren"
            class="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-transform duration-200"
            :class="{ '-rotate-90': !isExpanded }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <!-- أيقونة حالة المجلد / التصنيف -->
        <div class="w-6 h-6 flex items-center justify-center shrink-0">
          <!-- مجلد مفتوح -->
          <svg
            v-if="hasChildren && isExpanded"
            class="w-5 h-5 text-warning"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M19 20H4C2.89 20 2 19.1 2 18V6C2 4.89 2.89 4 4 4H10L12 6H19C20.1 6 21 6.89 21 8V18C21 19.1 20.1 20 19 20M19 8H4V18H19V8Z"
              opacity="0.3"
            />
            <path
              d="M19 20H4C2.89 20 2 19.1 2 18V6C2 4.89 2.89 4 4 4H10L12 6H19C20.1 6 21 6.89 21 8V18C21 19.1 20.1 20 19 20M19 10H4V18H19V10Z"
            />
          </svg>

          <!-- مجلد مغلق -->
          <svg
            v-else-if="hasChildren && !isExpanded"
            class="w-5 h-5 text-warning"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M10 4H4C2.89 4 2 4.89 2 6V18C2 19.1 2.89 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.89 21.1 6 20 6H12L10 4Z"
            />
          </svg>

          <!-- تصنيف طرفي نهائي (ليس تحته أبناء) -->
          <svg
            v-else
            class="w-4 h-4 text-info"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        </div>

        <!-- اسم التصنيف وعداد الفروع -->
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <span
            class="truncate text-xs sm:text-[13px]"
            :class="hasChildren ? 'text-text-primary font-black' : 'text-text-secondary font-bold'"
            :title="node.name"
          >
            {{ node.name }}
          </span>

          <span
            v-if="hasChildren"
            class="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-surface-ground text-text-muted border border-surface-border shrink-0"
            title="عدد التصنيفات الفرعية المباشرة"
          >
            {{ node.children.length }}
          </span>
        </div>

        <!-- زر إضافة تصنيف فرعي سريع يظهر عند التحويم -->
        <button
          v-if="authStore.can('category.create')"
          @click.stop="$emit('add-child', node)"
          class="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 text-info hover:bg-info/10 rounded-lg transition-all shrink-0 ms-auto cursor-pointer"
          title="إضافة تصنيف فرعي تحت هذا القسم"
          type="button"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <!-- العمود 2: كود/رمز التصنيف (عمودان) -->
      <div class="col-span-2 flex items-center">
        <AppBadge v-if="node.code" variant="primary" size="sm" class="font-mono tracking-wider">
          {{ node.code }}
        </AppBadge>
        <span v-else class="text-text-muted/50 text-xs font-mono">—</span>
      </div>

      <!-- العمود 3: حالة التصنيف (عمودان) -->
      <div class="col-span-2 flex items-center">
        <AppBadge :variant="node.is_active ? 'success' : 'danger'" size="xs" pill>
          {{ node.is_active ? 'نشط' : 'موقوف' }}
        </AppBadge>
      </div>

      <!-- العمود 4: إجراءات التعديل والحذف (عمودان) -->
      <div
        class="col-span-2 flex items-center justify-end space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
      >
        <button
          v-if="authStore.can('category.update')"
          @click.stop="$emit('edit', node)"
          class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors shrink-0 cursor-pointer"
          title="تعديل التصنيف"
          type="button"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>

        <button
          v-if="authStore.can('category.delete')"
          @click.stop="$emit('delete', node)"
          class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors shrink-0 cursor-pointer"
          title="حذف التصنيف"
          type="button"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- التفرع التكراري للأبناء مع الحركة الانسيابية -->
    <transition @enter="onEnter" @after-enter="onAfterEnter" @leave="onLeave">
      <div v-show="isExpanded && hasChildren" class="overflow-hidden">
        <CategoriesTreeNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :level="level + 1"
          @add-child="$emit('add-child', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppBadge from '@/components/ui/AppBadge.vue'

defineOptions({
  name: 'CategoriesTreeNode',
})

const props = defineProps({
  node: { type: Object, required: true },
  level: { type: Number, default: 0 },
})

defineEmits(['add-child', 'edit', 'delete'])
const authStore = useAuthStore()

const isExpanded = ref(props.level === 0)
const hasChildren = computed(() => props.node.children && props.node.children.length > 0)

const toggle = () => {
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value
  }
}

const onEnter = (el) => {
  el.style.height = '0px'
  el.style.opacity = '0'
  void el.offsetHeight
  el.style.transition = 'height 0.25s ease-out, opacity 0.25s ease-out'
  el.style.height = el.scrollHeight + 'px'
  el.style.opacity = '1'
}

const onAfterEnter = (el) => {
  el.style.transition = ''
  el.style.height = ''
  el.style.opacity = ''
}

const onLeave = (el) => {
  el.style.height = el.scrollHeight + 'px'
  void el.offsetHeight
  el.style.transition = 'height 0.2s ease-in, opacity 0.2s ease-in'
  el.style.height = '0px'
  el.style.opacity = '0'
}
</script>
