<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 items-center text-right">
    <div class="relative md:col-span-1">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="بحث سريع بالاسم، الهاتف، أو اسم الدخول..."
        class="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
      />
      <div
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>

    <div
      class="md:col-span-2 flex bg-gray-100 dark:bg-slate-800/80 p-1 rounded-lg border border-gray-200 dark:border-slate-700"
    >
      <button
        type="button"
        @click="changeTab('active')"
        :class="[
          'flex-1 text-center py-2 text-xs font-bold rounded-md transition-all',
          activeTab === 'active'
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700',
        ]"
      >
        الحسابات النشطة
      </button>

      <button
        type="button"
        @click="changeTab('suspended')"
        :class="[
          'flex-1 text-center py-2 text-xs font-bold rounded-md transition-all',
          activeTab === 'suspended'
            ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700',
        ]"
      >
        الحسابات المجمدة
      </button>

      <button
        type="button"
        @click="changeTab('pending')"
        :class="[
          'flex-1 text-center py-2 text-xs font-bold rounded-md transition-all relative',
          activeTab === 'pending'
            ? 'bg-white dark:bg-slate-700 text-yellow-600 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700',
        ]"
      >
        طلبات معلقة
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  initialTab: { type: String, default: 'active' },
  initialSearch: { type: String, default: '' },
})

const emit = defineEmits(['tab-change', 'search-change'])

const activeTab = ref(props.initialTab)
const searchQuery = ref(props.initialSearch)
let debounceTimeout = null

const changeTab = (tab) => {
  activeTab.value = tab
  emit('tab-change', tab)
}

watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    emit('search-change', newQuery)
  }, 500)
})

onUnmounted(() => {
  clearTimeout(debounceTimeout)
})
</script>
