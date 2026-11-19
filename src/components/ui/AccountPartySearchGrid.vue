<!---src\components\ui\AccountPartySearchGrid.vue--->
<template>
  <div class="relative w-full" ref="containerRef">
    <div class="relative">
      <!-- أيقونة البحث / مؤشر التحميل -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          v-if="!isLoading"
          class="w-5 h-5 text-text-muted"
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
        class="block w-full p-3 pr-10 text-sm border rounded-lg transition-all shadow-sm outline-none bg-surface-card border-primary/40 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        autocomplete="off"
      />
    </div>

    <!-- نقل القائمة إلى body لتجنب القص داخل الجداول والنوافذ وإبقائها في منتصف الشاشة -->
    <Teleport to="body">
      <!-- جدول النتائج المنسدل -->
      <div
        v-if="isOpen && searchResults.length > 0"
        ref="dropdownRef"
        :style="dropdownStyle"
        dir="rtl"
        class="bg-surface-section border-2 border-primary/40 rounded-xl shadow-2xl overflow-y-auto"
      >
        <table class="w-full text-sm text-right border-collapse">
          <thead
            class="text-xs font-black text-text-secondary uppercase bg-surface-card border-b border-surface-border sticky top-0 z-10 shadow-2xs"
          >
            <tr>
              <th scope="col" class="px-4 py-2.5 w-28">الكود</th>
              <th scope="col" class="px-4 py-2.5">الاسم / البيان</th>
              <th scope="col" class="px-4 py-2.5 w-28 text-center">النوع</th>
              <th scope="col" class="px-4 py-2.5 text-text-muted">الحساب المالي المرتبط</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-border/60">
            <tr
              v-for="(item, index) in searchResults"
              :key="item.key"
              :ref="(el) => setRowRef(el, index)"
              @click="selectItem(item)"
              @mouseover="highlightedIndex = index"
              :class="[
                'cursor-pointer transition-colors',
                highlightedIndex === index
                  ? 'bg-primary/15 text-text-primary'
                  : 'hover:bg-surface-ground/80 text-text-primary',
              ]"
            >
              <td class="px-4 py-2.5 font-mono font-bold text-primary">
                {{ item.code }}
              </td>
              <td class="px-4 py-2.5 font-bold text-text-primary">
                {{ item.name }}
              </td>
              <td class="px-4 py-2.5 text-center">
                <span
                  class="px-2 py-0.5 text-xs font-bold rounded-full"
                  :class="getBadgeClass(item.badge_color)"
                >
                  {{ item.type_label }}
                </span>
              </td>
              <td class="px-4 py-2.5 text-xs text-text-muted">
                {{ item.parent_account_name || '---' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- رسالة عدم وجود نتائج -->
      <div
        v-if="isOpen && searchQuery && !isLoading && searchResults.length === 0"
        ref="dropdownRef"
        :style="dropdownStyle"
        dir="rtl"
        class="bg-surface-section border border-surface-border rounded-xl shadow-xl p-4 text-center text-sm text-text-muted"
      >
        لا توجد حسابات أو أطراف مطابقة لـ "<span class="font-bold text-text-primary">{{
          searchQuery
        }}</span
        >"
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
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
const dropdownRef = ref(null)
const rowRefs = ref([])

const searchQuery = ref('')
const searchResults = ref([])
const isOpen = ref(false)
const isLoading = ref(false)
const highlightedIndex = ref(0)
const dropdownStyle = ref({})

let debounceTimer = null
let abortController = null

const badgeColorMap = {
  blue: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  teal: 'bg-teal-500/15 text-teal-700 dark:text-teal-300',
  purple: 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
  emerald: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
}

const getBadgeClass = (color) => {
  return badgeColorMap[color] || 'bg-surface-card text-text-secondary border border-surface-border'
}

const setRowRef = (el, index) => {
  if (el) {
    rowRefs.value[index] = el
  }
}

// حساب موقع القائمة بدقة فوق جميع الطبقات دون الخروج عن حدود الشاشة
const updateDropdownPosition = () => {
  const inputEl = inputRef.value
  if (!inputEl) return

  const rect = inputEl.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const margin = 12
  const gap = 6
  const preferredMaxHeight = 320

  const desiredWidth = Math.min(Math.max(rect.width, 520), viewportWidth - margin * 2)

  // محاذاة يمين القائمة مع يمين حقل البحث (RTL)
  let left = rect.right - desiredWidth
  if (left < margin) {
    left = margin
  }
  if (left + desiredWidth > viewportWidth - margin) {
    left = viewportWidth - margin - desiredWidth
  }

  const spaceBelow = viewportHeight - rect.bottom - gap - margin
  const spaceAbove = rect.top - gap - margin

  if (spaceBelow >= 200 || spaceBelow >= spaceAbove) {
    const maxHeight = Math.max(150, Math.min(preferredMaxHeight, spaceBelow))
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + gap}px`,
      left: `${left}px`,
      width: `${desiredWidth}px`,
      maxHeight: `${maxHeight}px`,
      zIndex: 9999,
    }
  } else {
    const maxHeight = Math.max(150, Math.min(preferredMaxHeight, spaceAbove))
    dropdownStyle.value = {
      position: 'fixed',
      bottom: `${viewportHeight - rect.top + gap}px`,
      left: `${left}px`,
      width: `${desiredWidth}px`,
      maxHeight: `${maxHeight}px`,
      zIndex: 9999,
    }
  }
}

// توجيه التمرير التلقائي للحاوية الأم بحيث تتمركز القائمة في منتصف الشاشة
const centerDropdownInViewport = () => {
  const inputEl = inputRef.value
  if (!inputEl) return

  let scrollParent = inputEl.parentElement
  while (scrollParent && scrollParent !== document.body) {
    const style = window.getComputedStyle(scrollParent)
    const overflowY = style.overflowY
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      scrollParent.scrollHeight > scrollParent.clientHeight
    ) {
      break
    }
    scrollParent = scrollParent.parentElement
  }

  const inputRect = inputEl.getBoundingClientRect()
  // وضع حقل البحث عند ~30% من أعلى الشاشة لتكون القائمة المنسدلة تحته في المنتصف تماماً
  const targetInputTop = Math.max(80, Math.min(window.innerHeight * 0.3, window.innerHeight - 380))
  const scrollDelta = inputRect.top - targetInputTop

  if (Math.abs(scrollDelta) > 15) {
    if (scrollParent && scrollParent !== document.body) {
      scrollParent.scrollBy({ top: scrollDelta, behavior: 'smooth' })
    } else {
      window.scrollBy({ top: scrollDelta, behavior: 'smooth' })
    }
  }
}

const openAndPositionDropdown = async () => {
  isOpen.value = true
  await nextTick()
  updateDropdownPosition()
  centerDropdownInViewport()
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

    rowRefs.value = []
    searchResults.value = data
    highlightedIndex.value = 0
    await openAndPositionDropdown()
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

const handleFocus = async () => {
  if (searchQuery.value.trim() && searchResults.value.length > 0) {
    await openAndPositionDropdown()
  }
}

const scrollHighlightedRowIntoView = () => {
  nextTick(() => {
    const rowEl = rowRefs.value[highlightedIndex.value]
    if (rowEl && typeof rowEl.scrollIntoView === 'function') {
      rowEl.scrollIntoView({ block: 'nearest' })
    }
  })
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
      scrollHighlightedRowIntoView()
    }
  } else if (e.key === 'ArrowUp') {
    if (!isOpen.value) return
    e.preventDefault()
    if (highlightedIndex.value > 0) {
      highlightedIndex.value--
      scrollHighlightedRowIntoView()
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
  rowRefs.value = []
  isOpen.value = false
  highlightedIndex.value = 0

  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleClickOutside = (event) => {
  const clickedInsideContainer = containerRef.value && containerRef.value.contains(event.target)
  const clickedInsideDropdown = dropdownRef.value && dropdownRef.value.contains(event.target)

  if (!clickedInsideContainer && !clickedInsideDropdown) {
    isOpen.value = false
  }
}

watch(isOpen, (opened) => {
  if (opened) {
    updateDropdownPosition()
    window.addEventListener('scroll', updateDropdownPosition, true)
    window.addEventListener('resize', updateDropdownPosition)
  } else {
    window.removeEventListener('scroll', updateDropdownPosition, true)
    window.removeEventListener('resize', updateDropdownPosition)
  }
})

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
  if (abortController) {
    abortController.abort()
  }
  clearTimeout(debounceTimer)
})
</script>
