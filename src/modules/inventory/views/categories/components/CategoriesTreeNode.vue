<!--src\modules\inventory\views\categories\components\CategoriesTreeNode.vue-->
<template>
  <div>
    <!-- سطر العقدة الشجرية الرئيسي -->
    <div
      class="grid grid-cols-12 gap-4 py-2 px-4 border-b border-surface-border hover:bg-surface-section/50 transition-colors items-center group cursor-pointer"
      :class="{ 'bg-surface-section/20': !hasChildren }"
      @click="toggle"
    >
      <!-- العمود 1: الإزاحة الهرمية، أيقونة المجلد، الاسم، وزر إضافة ابن سريع (6 أعمدة) -->
      <div class="col-span-6 flex items-center gap-2 overflow-hidden">
        <!-- مسافة الإزاحة بحسب المستوى الهرمي -->
        <div class="flex shrink-0" v-if="level > 0">
          <div v-for="i in level" :key="'cat-spacer-' + i" class="w-6"></div>
        </div>

        <!-- أيقونة حالة المجلد / التصنيف -->
        <div class="w-6 h-6 flex items-center justify-center shrink-0">
          <!-- مجلد مفتوح -->
          <svg
            v-if="hasChildren && isExpanded"
            class="w-6 h-6 text-amber-500"
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
            class="w-6 h-6 text-amber-500"
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
            class="w-5 h-5 text-sky-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        </div>

        <!-- اسم التصنيف -->
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <span
            class="truncate text-sm"
            :class="hasChildren ? 'text-text-primary font-bold' : 'text-text-secondary font-medium'"
            :title="node.name"
          >
            {{ node.name }}
          </span>
        </div>

        <!-- زر إضافة تصنيف فرعي سريع يظهر عند التحويم فقط -->
        <button
          v-if="authStore.can('category.create')"
          @click.stop="$emit('add-child', node)"
          class="opacity-0 group-hover:opacity-100 p-1 text-sky-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded transition-all shrink-0 ms-auto"
          title="إضافة تصنيف فرعي تحت هذا القسم"
          type="button"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <!-- العمود 2: كود/رمز التصنيف (عمودان) -->
      <div class="col-span-2 flex items-center">
        <span
          v-if="node.code"
          class="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded tracking-wider"
        >
          {{ node.code }}
        </span>
        <span v-else class="text-text-muted text-xs font-mono">—</span>
      </div>

      <!-- العمود 3: حالة التصنيف (عمودان) -->
      <div class="col-span-2 flex items-center">
        <span
          class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
          :class="
            node.is_active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
          "
        >
          {{ node.is_active ? 'نشط' : 'موقوف' }}
        </span>
      </div>

      <!-- العمود 4: إجراءات التعديل والحذف (عمودان) -->
      <div
        class="col-span-2 flex items-center justify-end space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button
          v-if="authStore.can('category.update')"
          @click.stop="$emit('edit', node)"
          class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors shrink-0"
          title="تعديل التصنيف"
          type="button"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>

        <button
          v-if="authStore.can('category.delete')"
          @click.stop="$emit('delete', node)"
          class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
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
