<template>
  <div class="relative" ref="dropdownRef">
    <label v-if="label" :for="id" class="text-sm font-medium text-text-primary mb-2 block">
      {{ label }}
    </label>

    <div
      :id="id"
      class="w-full rounded-md border border-surface-border bg-surface-section px-3 py-2 text-text-primary cursor-pointer flex justify-between items-center focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
      @click="toggleDropdown"
    >
      <span :class="{ 'text-text-muted': !selectedAccount }">
        {{ selectedAccount ? `${selectedAccount.code} - ${selectedAccount.name}` : placeholder }}
      </span>
      <svg
        class="w-4 h-4 text-text-muted transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    </div>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-1 bg-surface-section border border-surface-border rounded-md shadow-lg max-h-64 flex flex-col"
      >
        <div
          class="p-2 border-b border-surface-border sticky top-0 bg-surface-section rounded-t-md"
        >
          <input
            type="text"
            v-model="searchQuery"
            placeholder="ابحث باسم الحساب أو الكود..."
            class="w-full rounded-md border border-surface-border bg-surface-section/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            @click.stop
            ref="searchInput"
          />
        </div>

        <ul class="overflow-y-auto p-1">
          <li
            v-for="account in filteredCandidates"
            :key="account.id"
            @click="selectAccount(account)"
            class="px-3 py-2.5 text-sm text-text-primary hover:bg-primary/10 hover:text-primary cursor-pointer rounded-md transition-colors"
            :class="{ 'bg-primary/10 text-primary font-bold': modelValue === account.id }"
          >
            {{ account.code }} - {{ account.name }}
          </li>
          <li
            v-if="filteredCandidates.length === 0"
            class="px-3 py-4 text-sm text-center text-text-muted"
          >
            لا توجد حسابات مطابقة لـ "{{ searchQuery }}"
          </li>
        </ul>
      </div>
    </Transition>

    <input type="text" :value="modelValue" class="sr-only" :required="required" tabindex="-1" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: [Number, String], default: null },
  candidates: { type: Array, default: () => [] },
  label: { type: String, default: 'الحساب المحاسبي' },
  placeholder: { type: String, default: '-- اختر الحساب --' },
  id: { type: String, default: 'account-candidate-select' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref(null)
const searchInput = ref(null)

// معرفة الحساب المختار حالياً
const selectedAccount = computed(() => {
  return props.candidates.find((a) => a.id === props.modelValue) || null
})

// فلترة الحسابات
const filteredCandidates = computed(() => {
  if (!searchQuery.value) return props.candidates

  const query = searchQuery.value.toLowerCase()
  return props.candidates.filter(
    (a) =>
      (a.name && a.name.toLowerCase().includes(query)) ||
      (a.code && a.code.toLowerCase().includes(query)),
  )
})

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    nextTick(() => {
      if (searchInput.value) searchInput.value.focus()
    })
  }
}

const selectAccount = (account) => {
  emit('update:modelValue', account.id)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
