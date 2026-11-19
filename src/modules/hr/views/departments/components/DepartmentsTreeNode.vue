<!-- src/modules/hr/views/departments/components/DepartmentsTreeNode.vue -->
<template>
  <div>
    <div
      class="grid grid-cols-12 gap-4 py-2.5 px-4 hover:bg-primary/5 transition-colors items-center group"
      :class="level === 0 ? 'bg-surface-header/25' : 'bg-surface-section'"
    >
      <!-- 1. اسم الإدارة والكود والمشرفون -->
      <div
        class="col-span-5 flex items-center gap-2"
        :style="{ paddingInlineStart: `${level * 1.5}rem` }"
      >
        <button
          v-if="hasChildren"
          type="button"
          @click="toggle"
          class="w-6 h-6 flex items-center justify-center rounded-lg bg-surface-card border border-surface-border hover:border-primary/60 text-text-secondary hover:text-primary transition-all cursor-pointer shrink-0 shadow-2xs"
          :title="isExpanded ? 'طي الفروع' : 'توسيع الفروع'"
        >
          <svg
            class="w-3.5 h-3.5 transition-transform duration-200 rtl:rotate-180"
            :class="{ '!rotate-90': isExpanded }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <div v-else class="w-6 h-6 flex items-center justify-center shrink-0">
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="level === 0 ? 'bg-primary' : 'bg-surface-border'"
          ></span>
        </div>

        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span
              :class="[
                level === 0
                  ? 'text-text-primary font-black text-sm'
                  : 'text-text-primary font-bold text-xs sm:text-sm',
              ]"
            >
              {{ node.name }}
            </span>

            <AppBadge v-if="node.code" variant="primary" size="xs" class="font-mono tracking-wider">
              {{ node.code }}
            </AppBadge>
          </div>

          <!-- عرض المشرفين تحت اسم القسم مباشرة -->
          <div
            v-if="node.supervisors && node.supervisors.length"
            class="text-[11px] text-text-muted mt-0.5 flex items-center gap-1"
          >
            <span class="text-primary font-bold shrink-0">المشرفون:</span>
            <span
              class="truncate max-w-[260px] text-text-secondary font-medium"
              :title="node.supervisors.map((s) => s.full_name).join('، ')"
            >
              {{ node.supervisors.map((s) => s.full_name).join('، ') }}
            </span>
          </div>
        </div>
      </div>

      <!-- 2. المستوى التنظيمي -->
      <div class="col-span-2 flex items-center justify-center">
        <AppBadge :variant="level === 0 ? 'primary' : 'secondary'" size="xs">
          {{ node.type_label || formatType(node.type) }}
        </AppBadge>
      </div>

      <!-- 3. الربط المحاسبي -->
      <div class="col-span-2 flex items-center justify-center">
        <AppBadge
          v-if="node.cost_center_id"
          variant="info"
          size="xs"
          title="مرتبط بمركز تكلفة محاسبي"
        >
          مرتبط بمركز تكلفة
        </AppBadge>
        <span v-else class="text-xs text-text-muted/50 font-mono">—</span>
      </div>

      <!-- 4. الحالة -->
      <div class="col-span-1 flex items-center justify-center">
        <AppBadge :variant="node.is_active ? 'success' : 'danger'" size="xs" pill>
          {{ node.is_active ? 'نشط' : 'موقوف' }}
        </AppBadge>
      </div>

      <!-- 5. الإجراءات -->
      <div class="col-span-2 flex items-center justify-end space-x-1 space-x-reverse">
        <button
          v-if="authStore.can('department.create')"
          type="button"
          @click.stop="$emit('add-child', node)"
          class="p-1.5 text-info hover:bg-info/10 rounded-lg transition-colors cursor-pointer"
          title="إضافة قسم / شعبة فرعية"
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

        <button
          v-if="authStore.can('department.update')"
          type="button"
          @click.stop="$emit('edit', node)"
          class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
          title="تعديل بيانات الإدارة"
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
          v-if="authStore.can('department.delete')"
          type="button"
          @click.stop="$emit('delete', node)"
          class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
          title="حذف الإدارة"
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

    <!-- الفروع التابعة -->
    <div v-show="isExpanded && hasChildren" class="divide-y divide-surface-border/60">
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
import AppBadge from '@/components/ui/AppBadge.vue'

const props = defineProps({
  node: { type: Object, required: true },
  level: { type: Number, default: 0 },
})

defineEmits(['add-child', 'edit', 'delete'])
const authStore = useAuthStore()

// فتح المستوى الأول فقط افتراضياً
const isExpanded = ref(props.level === 0)
const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
const toggle = () => (isExpanded.value = !isExpanded.value)

const formatType = (type) => {
  const types = {
    administration: 'إدارة عليا',
    department: 'قسم',
    section: 'شعبة / وحدة',
    branch: 'فرع',
  }
  return types[type] || type
}
</script>
