<!--src\modules\hr\views\departments\components\DepartmentsTreeNode.vue-->
<template>
  <div>
    <div
      class="grid grid-cols-12 gap-4 py-3 px-4 border-b border-surface-border hover:bg-surface-section/50 transition-colors items-center group"
      :class="{ 'bg-surface-section/20': level === 0 }"
    >
      <div
        class="col-span-5 flex items-center gap-2"
        :style="{ paddingInlineStart: `${level * 1.5}rem` }"
      >
        <button
          v-if="hasChildren"
          @click="toggle"
          class="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-border text-text-muted transition-transform"
          :class="{ 'rotate-90': isExpanded }"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <div v-else class="w-6 h-6"></div>

        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span
              v-if="node.code"
              class="font-mono font-bold text-primary tracking-wider text-xs bg-primary/10 px-1.5 rounded"
            >
              {{ node.code }}
            </span>
          </div>
          <span
            :class="[
              level === 0 ? 'text-text-primary font-bold' : 'text-text-secondary font-medium',
              'text-sm',
            ]"
          >
            {{ node.name }}
          </span>
        </div>

        <button
          v-if="authStore.can('department.create')"
          @click.stop="$emit('add-child', node)"
          class="opacity-0 group-hover:opacity-100 p-1 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-all ml-2"
          title="إضافة قسم فرعي"
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
          class="px-2 py-0.5 rounded text-[11px] font-bold border bg-surface-border/50 text-text-primary border-surface-border"
        >
          {{ node.type_label || formatType(node.type) }}
        </span>
      </div>

      <div class="col-span-2 flex items-center">
        <span
          v-if="node.cost_center_id"
          class="text-xs text-text-muted truncate"
          title="مرتبط بمركز تكلفة"
        >
          🔗 مرتبط بالمحاسبة
        </span>
        <span v-else class="text-xs text-gray-400 opacity-50">-</span>
      </div>

      <div class="col-span-1 flex items-center justify-center">
        <div v-if="node.is_active" class="text-emerald-500" title="نشط">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div v-else class="text-rose-400" title="موقوف">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      <div
        class="col-span-2 flex items-center justify-end space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button
          v-if="authStore.can('department.update')"
          @click.stop="$emit('edit', node)"
          class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
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
          v-if="authStore.can('department.delete')"
          @click.stop="$emit('delete', node)"
          class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

    <div v-show="isExpanded && hasChildren">
      <DepartmentsTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        @add-child="$emit('add-child', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
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

// فتح المستوى الأول فقط افتراضياً
const isExpanded = ref(props.level === 0)
const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
const toggle = () => (isExpanded.value = !isExpanded.value)

const formatType = (type) => {
  const types = {
    administration: 'إدارة',
    department: 'قسم',
    section: 'شعبة/وحدة',
    branch: 'فرع',
  }
  return types[type] || type
}
</script>
