<template>
  <AppCard v-if="!isChild" class="p-4 overflow-hidden">
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div
      v-else-if="!categories || categories.length === 0"
      class="text-center py-12 text-text-muted"
    >
      لا توجد تصنيفات مضافة حتى الآن. يمكنك إضافة تصنيف رئيسي جديد للبدء.
    </div>

    <div v-else class="space-y-2">
      <CategoriesTreeView
        v-for="item in categories"
        :key="item.id"
        :node="item"
        :is-child="true"
        @add-child="$emit('add-child', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </AppCard>

  <div
    v-else
    class="border border-surface-border rounded-xl p-3 bg-surface-ground/50 transition-all hover:border-primary/40"
  >
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <button
          v-if="node.children && node.children.length > 0"
          @click="isOpen = !isOpen"
          class="p-1 rounded hover:bg-surface-border text-text-muted transition-colors"
          type="button"
        >
          <svg
            class="w-4 h-4 transform transition-transform duration-200"
            :class="{ '-rotate-90': !isOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div v-else class="w-6"></div>

        <div class="flex items-center gap-2">
          <span class="font-bold text-sm text-text-primary">{{ node.name }}</span>
          <span
            v-if="node.code"
            class="text-xs font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded tracking-wider"
          >
            {{ node.code }}
          </span>
          <span
            class="px-2 py-0.5 text-[10px] font-bold rounded-full border"
            :class="
              node.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400'
            "
          >
            {{ node.is_active ? 'نشط' : 'موقوف' }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <button
          v-if="authStore.can('category.create')"
          @click="$emit('add-child', node)"
          class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
          title="إضافة تصنيف فرعي"
          type="button"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        <button
          v-if="authStore.can('category.update')"
          @click="$emit('edit', node)"
          class="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
          title="تعديل التصنيف"
          type="button"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          @click="$emit('delete', node)"
          class="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
          title="حذف التصنيف"
          type="button"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    <div
      v-if="isOpen && node.children && node.children.length > 0"
      class="mt-2 mr-6 space-y-2 border-r-2 border-surface-border pr-3"
    >
      <CategoriesTreeView
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :is-child="true"
        @add-child="$emit('add-child', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'

defineOptions({
  name: 'CategoriesTreeView',
})

defineProps({
  categories: { type: Array, default: () => [] },
  node: { type: Object, default: null },
  isChild: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

defineEmits(['add-child', 'edit', 'delete'])

const authStore = useAuthStore()
const isOpen = ref(true)
</script>
