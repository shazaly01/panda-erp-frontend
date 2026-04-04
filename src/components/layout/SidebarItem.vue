<template>
  <div v-if="item.isModuleHeader" class="mt-6 mb-3 px-4 flex items-center gap-3 animate-fade-in">
    <div
      class="h-px flex-1 bg-gradient-to-r from-transparent via-surface-border to-transparent opacity-50"
    ></div>
    <span class="text-[10px] font-bold text-text-muted/70 uppercase tracking-[0.2em] shadow-sm">
      {{ label }}
    </span>
    <div
      class="h-px flex-1 bg-gradient-to-r from-transparent via-surface-border to-transparent opacity-50"
    ></div>
  </div>

  <div v-else-if="item.children" class="mb-1">
    <button
      @click="toggle"
      class="group relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 ease-out overflow-hidden"
      :class="[
        isOpen
          ? 'bg-primary/5 text-primary'
          : 'text-text-secondary hover:bg-surface-ground hover:text-text-primary',
      ]"
    >
      <div
        class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-surface-border/30 to-transparent"
      ></div>

      <div class="flex items-center gap-3 relative z-10">
        <component
          :is="item.icon"
          class="h-5 w-5 transition-transform duration-300"
          :class="{
            'scale-110 drop-shadow-md text-primary': isOpen,
            'group-hover:scale-110': !isOpen,
          }"
        />
        <span class="text-sm font-medium tracking-wide">{{ label }}</span>
      </div>

      <ChevronDownIcon
        class="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        :class="{ '-rotate-180 text-primary': isOpen, 'text-text-muted': !isOpen }"
      />
    </button>

    <div
      v-show="isOpen"
      class="grid transition-[grid-template-rows] duration-300 ease-out"
      :style="{ 'grid-template-rows': isOpen ? '1fr' : '0fr' }"
    >
      <div class="overflow-hidden">
        <div class="mt-1 ml-4 pl-3 border-r-2 border-surface-border/40 space-y-1">
          <SidebarItem
            v-for="child in item.children"
            :key="child.name || child.label"
            :item="child"
          />
        </div>
      </div>
    </div>
  </div>

  <RouterLink v-else :to="resolveRoute(item)" v-slot="{ isActive }" class="block mb-1">
    <div
      class="relative group w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 ease-out overflow-hidden"
      :class="[
        isActive
          ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary font-semibold shadow-[0_0_20px_-5px_rgba(var(--primary-rgb),0.3)] border-r-[3px] border-primary'
          : 'text-text-secondary hover:bg-surface-ground hover:text-text-primary hover:translate-x-1',
      ]"
    >
      <div
        v-if="!isActive"
        class="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-0"
      ></div>

      <div class="flex items-center gap-3 relative z-10">
        <component
          v-if="item.icon"
          :is="item.icon"
          class="h-5 w-5 transition-all duration-300"
          :class="
            isActive
              ? 'scale-110 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]'
              : 'group-hover:scale-110'
          "
        />
        <span class="text-sm">{{ label }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed, ref, inject } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  item: { type: Object, required: true },
})

const label = computed(() => props.item.label || props.item.name)

// إدارة حالة الفتح والإغلاق (يتم حقن المصفوفة من الأب)
const openGroups = inject('openGroups', ref([]))

const isOpen = computed(() => openGroups.value.includes(label.value))

const toggle = () => {
  if (isOpen.value) {
    openGroups.value = openGroups.value.filter((n) => n !== label.value)
  } else {
    openGroups.value.push(label.value)
  }
}

const resolveRoute = (item) => {
  if (item.to) return item.to
  if (item.routeName) return { name: item.routeName }
  return { path: '#' }
}
</script>

<style>
/* تعريف الأنيميشن المخصص */
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
