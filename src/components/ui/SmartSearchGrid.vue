<!--src\components\ui\SmartSearchGrid.vue-->
<template>
  <div class="relative w-full" ref="containerRef">
    <div class="relative">
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          aria-hidden="true"
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
      </div>
      <input
        ref="inputRef"
        type="text"
        v-model="searchQuery"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="openDropdown"
        :placeholder="placeholder"
        class="block w-full p-3 pr-10 text-sm border rounded-lg transition-all shadow-sm outline-none bg-slate-900 border-primary/40 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary/20"
        autocomplete="off"
      />
    </div>

    <div
      v-if="isOpen && filteredData.length > 0"
      class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-80 overflow-y-auto"
    >
      <table class="w-full text-sm text-right">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-900 dark:text-gray-300 sticky top-0 z-10 shadow-sm"
        >
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              class="px-4 py-3"
              :class="col.widthClass || ''"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in filteredData"
            :key="index"
            @click="selectItem(item)"
            @mouseover="highlightedIndex = index"
            :class="[
              'cursor-pointer border-b dark:border-gray-700 transition-colors',
              highlightedIndex === index
                ? 'bg-blue-100 dark:bg-blue-900/40'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
            ]"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-2 font-medium text-gray-800 dark:text-gray-200"
            >
              {{ getDisplayValue(item, col.key) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="isOpen && searchQuery && filteredData.length === 0"
      class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 text-center text-gray-500 dark:text-gray-400"
    >
      لا توجد نتائج مطابقة لـ "<span class="font-bold">{{ searchQuery }}</span
      >"
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  columns: { type: Array, required: true },
  searchKeys: { type: Array, required: true },
  placeholder: { type: String, default: 'ابحث بالاسم أو الباركود...' },
})

const emit = defineEmits(['select'])

const inputRef = ref(null)
const containerRef = ref(null)
const searchQuery = ref('')
const isOpen = ref(false)
const highlightedIndex = ref(0)

const getNestedValue = (obj, path) => {
  if (!obj || !path) return null
  const parts = path.split('.')
  let current = obj

  for (let i = 0; i < parts.length; i++) {
    if (current === null || current === undefined) return null

    if (Array.isArray(current)) {
      const subKey = parts.slice(i).join('.')
      return current.flatMap((item) => getNestedValue(item, subKey)).filter(Boolean)
    }

    current = current[parts[i]]
  }

  return current
}

const getDisplayValue = (item, key) => {
  const val = getNestedValue(item, key)
  if (val === null || val === undefined || val === '') return '---'
  if (Array.isArray(val)) return val.join(', ')
  return val
}

const findExactMatch = (query) => {
  if (!query) return null
  const cleanQuery = String(query).replace(/\s+/g, '').toLowerCase()

  return props.data.find((item) => {
    if (Array.isArray(item.all_barcodes) && item.all_barcodes.length > 0) {
      const barcodeFound = item.all_barcodes.some((b) => {
        const strBarcode = String(typeof b === 'object' ? b.barcode : b)
          .replace(/\s+/g, '')
          .toLowerCase()
        return strBarcode === cleanQuery
      })
      if (barcodeFound) return true
    }

    if (Array.isArray(item.barcodes) && item.barcodes.length > 0) {
      const barcodeFound = item.barcodes.some((b) => {
        const strBarcode = String(typeof b === 'object' ? b.barcode : b)
          .replace(/\s+/g, '')
          .toLowerCase()
        return strBarcode === cleanQuery
      })
      if (barcodeFound) return true
    }

    if (item.code && String(item.code).replace(/\s+/g, '').toLowerCase() === cleanQuery) return true
    if (item.id && String(item.id) === cleanQuery) return true
    if (item.id_display && String(item.id_display).replace(/\s+/g, '').toLowerCase() === cleanQuery)
      return true

    return false
  })
}

const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return []

  const query = searchQuery.value.toLowerCase().trim()

  return props.data
    .filter((item) => {
      return props.searchKeys.some((key) => {
        const val = getNestedValue(item, key)
        if (val === null || val === undefined) return false

        if (Array.isArray(val)) {
          return val.some((v) => {
            const strVal = typeof v === 'object' ? v.barcode || JSON.stringify(v) : String(v)
            return strVal.toLowerCase().includes(query)
          })
        }

        return String(val).toLowerCase().includes(query)
      })
    })
    .slice(0, 50)
})

const handleInput = () => {
  const query = searchQuery.value.trim()

  if (!query) {
    isOpen.value = false
    return
  }

  isOpen.value = true
  highlightedIndex.value = 0
}

const openDropdown = () => {
  if (searchQuery.value.trim()) {
    isOpen.value = true
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()

    const rawValue = e.target?.value || searchQuery.value || ''
    const query = String(rawValue).trim()

    if (!query) return

    const exactMatch = findExactMatch(query)

    if (exactMatch) {
      selectItem(exactMatch)
      return
    }

    if (filteredData.value.length > 0) {
      const targetIndex =
        highlightedIndex.value >= 0 && highlightedIndex.value < filteredData.value.length
          ? highlightedIndex.value
          : 0
      selectItem(filteredData.value[targetIndex])
    }
  } else if (e.key === 'ArrowDown') {
    if (!isOpen.value) return
    e.preventDefault()
    if (highlightedIndex.value < filteredData.value.length - 1) highlightedIndex.value++
  } else if (e.key === 'ArrowUp') {
    if (!isOpen.value) return
    e.preventDefault()
    if (highlightedIndex.value > 0) highlightedIndex.value--
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

const selectItem = (item) => {
  if (!item) return

  emit('select', item)

  searchQuery.value = ''
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
})
</script>
