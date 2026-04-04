<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
    @click.self="close"
  >
    <div
      class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all duration-300 scale-95"
      :class="{ 'scale-100': isOpen }"
    >
      <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-5">
        <h3 class="text-lg font-semibold text-text-primary">{{ title }}</h3>
        <button @click="close" class="text-text-muted hover:text-text-primary">&times;</button>
      </div>

      <OwnerForm :initial-data="ownerData" :is-saving="isSaving" @submit="handleFormSubmit" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import OwnerForm from './OwnerForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = ref(props.modelValue)
const ownerData = ref(props.owner)

const title = computed(() =>
  props.owner && props.owner.id ? 'تعديل جهة مالكة' : 'إضافة جهة مالكة جديدة',
)

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  },
)

watch(
  () => props.owner,
  (val) => {
    ownerData.value = val
  },
)

const close = () => {
  emit('update:modelValue', false)
}

const handleFormSubmit = (formData) => {
  emit('save', formData)
}
</script>
