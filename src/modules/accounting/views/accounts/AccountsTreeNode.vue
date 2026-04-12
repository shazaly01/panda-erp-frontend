<template>
  <div>
    <div
      class="grid grid-cols-12 gap-4 py-2 px-4 border-b border-surface-border hover:bg-surface-section/50 transition-colors items-center group cursor-pointer"
      :class="{ 'bg-surface-section/30': !node.is_transactional }"
      @click="toggle"
    >
      <div class="col-span-5 flex items-center gap-2 overflow-hidden">
        <div class="flex shrink-0" v-if="level > 0">
          <div v-for="i in level" :key="'spacer-' + i" class="w-6"></div>
        </div>

        <div class="w-6 h-6 flex items-center justify-center shrink-0">
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
              d="M19 20H4C2.89 20 2 19.1 2 18V6C2 4.89 2.89 4 4 4H10L12 6H19C20.1 6 21 6.89 21 8V18C21 19.1 20.1 20 19 20M19 8H4V18H19V8M19 10H4V18H19V10Z"
            />
          </svg>

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

          <svg
            v-else-if="node.is_transactional"
            class="w-5 h-5 text-sky-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>

          <svg
            v-else
            class="w-6 h-6 text-amber-500 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
            />
          </svg>
        </div>

        <div class="flex flex-col flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-mono font-bold text-primary tracking-wider text-sm shrink-0">
              {{ node.code }}
            </span>
            <span
              v-if="node.requires_cost_center"
              title="يتطلب مركز تكلفة"
              class="text-orange-500 shrink-0"
            >
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </div>
          <span
            class="truncate text-sm"
            :class="
              node.is_transactional
                ? 'text-text-secondary font-medium'
                : 'text-text-primary font-bold'
            "
            :title="node.name"
          >
            {{ node.name }}
          </span>
        </div>

        <button
          v-if="!node.is_transactional && authStore.can('account.create')"
          @click.stop="$emit('add-child', node)"
          class="opacity-0 group-hover:opacity-100 p-1 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-all shrink-0 ms-auto"
          title="إضافة حساب فرعي"
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

      <div class="col-span-2 flex items-center">
        <span
          class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
          :class="
            node.nature === 'debit'
              ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
              : 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
          "
        >
          {{ node.nature === 'debit' ? 'مدين' : 'دائن' }}
        </span>
      </div>

      <div class="col-span-2 flex items-center">
        <span class="text-text-secondary text-xs font-medium">{{ formatType(node.type) }}</span>
      </div>

      <div class="col-span-1 flex items-center justify-center">
        <div v-if="node.is_transactional" class="text-emerald-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div v-else class="text-slate-400 opacity-60">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
      </div>

      <div
        class="col-span-2 flex items-center justify-end space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button
          v-if="authStore.can('account.update')"
          @click.stop="$emit('edit', node)"
          class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors shrink-0"
          title="تعديل"
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
          v-if="authStore.can('account.delete')"
          @click.stop="$emit('delete', node)"
          class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
          title="حذف"
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

    <transition @enter="onEnter" @after-enter="onAfterEnter" @leave="onLeave">
      <div v-show="isExpanded && hasChildren" class="overflow-hidden">
        <AccountsTreeNode
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

const props = defineProps({
  node: { type: Object, required: true },
  level: { type: Number, default: 0 },
})

const emit = defineEmits(['add-child', 'edit', 'delete'])
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
</script>
