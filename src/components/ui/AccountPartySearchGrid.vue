<!---src\components\ui\AccountPartySearchGrid.vue--->
<template>
  <div class="relative w-full" ref="containerRef">
    <div class="relative">
      <!-- أيقونة البحث / مؤشر التحميل -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          v-if="!isLoading"
          class="w-5 h-5 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>

        <svg
          v-else
          class="w-5 h-5 text-primary animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>

      <!-- حقل الإدخال -->
      <input
        ref="inputRef"
        type="text"
        v-model="searchQuery"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="handleFocus"
        :placeholder="placeholder"
        :disabled="disabled"
        class="block w-full p-3 pr-10 text-sm border rounded-lg transition-all shadow-sm outline-none bg-slate-900 border-primary/40 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        autocomplete="off"
      />
    </div>

    <!-- جدول النتائج المنسدل -->
    <div
      v-if="isOpen && searchResults.length > 0"
      class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-80 overflow-y-auto"
    >
      <table class="w-full text-sm text-right">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-900 dark:text-gray-300 sticky top-0 z-10 shadow-sm"
        >
          <tr>
            <th scope="col" class="px-4 py-2.5 w-32">الكود</th>
            <th scope="col" class="px-4 py-2.5">الاسم / البيان</th>
            <th scope="col" class="px-4 py-2.5 w-28 text-center">النوع</th>
            <th scope="col" class="px-4 py-2.5 text-gray-500 dark:text-gray-400">
              الحساب المالي المرتبط
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in searchResults"
            :key="item.key"
            @click="selectItem(item)"
            @mouseover="highlightedIndex = index"
            :class="[
              'cursor-pointer border-b dark:border-gray-700 transition-colors',
              highlightedIndex === index
                ? 'bg-blue-100 dark:bg-blue-900/40'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
            ]"
          >
            <td class="px-4 py-2 font-mono font-bold text-gray-900 dark:text-gray-100">
              {{ item.code }}
            </td>
            <td class="px-4 py-2 font-medium text-gray-800 dark:text-gray-200">
              {{ item.name }}
            </td>
            <td class="px-4 py-2 text-center">
              <span
                class="px-2 py-0.5 text-xs font-semibold rounded-full"
                :class="getBadgeClass(item.badge_color)"
              >
                {{ item.type_label }}
              </span>
            </td>
            <td class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
              {{ item.parent_account_name || '---' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- رسالة عدم وجود نتائج -->
    <div
      v-if="isOpen && searchQuery && !isLoading && searchResults.length === 0"
      class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 text-center text-gray-500 dark:text-gray-400"
    >
      لا توجد حسابات أو أطراف مطابقة لـ "<span class="font-bold">{{ searchQuery }}</span
      >"
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import partySearchService from '@/modules/accounting/services/partySearch.service'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'ابحث برقم الحساب، اسم الموظف، أو المستودع...',
  },
  allowedTypes: {
    type: Array,
    default: () => [],
  },
  limitPerType: {
    type: Number,
    default: 10,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

const inputRef = ref(null)
const containerRef = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const isOpen = ref(false)
const isLoading = ref(false)
const highlightedIndex = ref(0)

let debounceTimer = null
let abortController = null

const badgeColorMap = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
  teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
}

const getBadgeClass = (color) => {
  return badgeColorMap[color] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const executeSearch = async () => {
  const query = searchQuery.value.trim()

  if (!query) {
    searchResults.value = []
    isOpen.value = false
    isLoading.value = false
    return
  }

  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()

  isLoading.value = true

  try {
    const data = await partySearchService.search(
      query,
      props.allowedTypes,
      props.limitPerType,
      abortController.signal,
    )

    searchResults.value = data
    isOpen.value = true
    highlightedIndex.value = 0
  } catch (err) {
    if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
      console.error('فشل البحث في الحسابات والأطراف:', err)
      searchResults.value = []
    }
  } finally {
    isLoading.value = false
  }
}

const handleInput = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    executeSearch()
  }, 300)
}

const handleFocus = () => {
  if (searchQuery.value.trim() && searchResults.value.length > 0) {
    isOpen.value = true
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()

    if (!isOpen.value || searchResults.value.length === 0) {
      executeSearch()
      return
    }

    const targetIndex =
      highlightedIndex.value >= 0 && highlightedIndex.value < searchResults.value.length
        ? highlightedIndex.value
        : 0

    selectItem(searchResults.value[targetIndex])
  } else if (e.key === 'ArrowDown') {
    if (!isOpen.value) return
    e.preventDefault()
    if (highlightedIndex.value < searchResults.value.length - 1) {
      highlightedIndex.value++
    }
  } else if (e.key === 'ArrowUp') {
    if (!isOpen.value) return
    e.preventDefault()
    if (highlightedIndex.value > 0) {
      highlightedIndex.value--
    }
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

const selectItem = (item) => {
  if (!item) return

  emit('select', item)

  searchQuery.value = ''
  searchResults.value = []
  isOpen.value = false
  highlightedIndex.value = 0

  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  if (abortController) {
    abortController.abort()
  }
  clearTimeout(debounceTimer)
})
</script>
