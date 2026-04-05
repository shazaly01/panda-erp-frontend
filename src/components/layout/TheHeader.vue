<template>
  <header
    class="flex h-16 items-center justify-between bg-surface-section px-4 sm:px-6 lg:px-8 flex-shrink-0"
  >
    <button
      @click="$emit('open-sidebar')"
      class="lg:hidden text-text-muted hover:text-text-primary"
    >
      <Bars3Icon class="h-6 w-6" />
    </button>

    <div class="flex-1 flex justify-center gap-2 sm:gap-4 px-4">
      <button
        @click="appStore.setActiveModule('accounting')"
        :class="[
          appStore.activeModule === 'accounting'
            ? 'bg-primary text-white shadow-md'
            : 'text-text-muted hover:bg-surface-hover hover:text-text-primary',
          'px-3 sm:px-5 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2',
        ]"
      >
        <BanknotesIcon class="w-5 h-5 hidden sm:block" />
        <span>المحاسبة</span>
      </button>

      <button
        @click="appStore.setActiveModule('hr')"
        :class="[
          appStore.activeModule === 'hr'
            ? 'bg-primary text-white shadow-md'
            : 'text-text-muted hover:bg-surface-hover hover:text-text-primary',
          'px-3 sm:px-5 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2',
        ]"
      >
        <UserGroupIcon class="w-5 h-5 hidden sm:block" />
        <span>الموارد البشرية</span>
      </button>
    </div>

    <div class="flex items-center gap-4">
      <span class="font-medium text-text-primary hidden sm:inline">
        {{ authStore.user?.full_name }}
      </span>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore' // <-- استدعاء الستور الجديد
import { Bars3Icon, BanknotesIcon, UserGroupIcon } from '@heroicons/vue/24/outline'

defineEmits(['open-sidebar'])
const authStore = useAuthStore()
const appStore = useAppStore() // <-- تهيئة الستور
</script>
