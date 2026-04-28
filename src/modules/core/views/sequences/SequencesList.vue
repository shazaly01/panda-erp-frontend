<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">إعدادات ترقيم المستندات</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة بادئات الترقيم وطريقة تصفير العدادات للمستندات
        </p>
      </div>
    </div>

    <SequencesFilter
      v-model:searchQuery="searchQuery"
      v-model:moduleFilter="moduleFilter"
      @update:searchQuery="onSearch"
    />

    <SequencesTable
      :sequences="filteredSequences"
      :loading="loading"
      @edit="openModal"
      @row-clicked="openModal"
    />

    <SequenceModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :sequence="selectedSequence"
      :is-saving="isSaving"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useSequenceStore } from '@/modules/core/stores/sequenceStore'

import SequencesFilter from './SequencesFilter.vue'
import SequencesTable from './SequencesTable.vue'
import SequenceModal from './SequenceModal.vue'

// -- إدارة الحالة --
const authStore = useAuthStore()
const sequenceStore = useSequenceStore()
const toast = useToast()

const { sequences, loading } = storeToRefs(sequenceStore)

// -- حالة الفلاتر والبحث --
const searchQuery = ref('')
const moduleFilter = ref('') // لفلترة الموديول (مثلاً: مالية، موارد بشرية)
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // التصفية تتم عبر computed property أدناه
  }, 300)
}

const filteredSequences = computed(() => {
  let result = sequences.value

  if (moduleFilter.value) {
    result = result.filter((s) => s.model.toLowerCase().includes(moduleFilter.value.toLowerCase()))
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (s) => s.model.toLowerCase().includes(query) || s.format.toLowerCase().includes(query),
    )
  }

  return result
})

// -- جلب البيانات --
onMounted(async () => {
  if (sequences.value.length === 0) {
    await sequenceStore.fetchSequences()
  }
})

// -- إدارة المودال (التعديل فقط) --
const isModalOpen = ref(false)
const isSaving = ref(false)
const selectedSequence = ref(null)

const openModal = (sequence) => {
  if (!authStore.can('update_sequences')) {
    toast.error('ليس لديك الصلاحية لتعديل إعدادات الترقيم.')
    return
  }
  selectedSequence.value = { ...sequence }
  isModalOpen.value = true
}

const handleSave = async (formData) => {
  isSaving.value = true
  try {
    // formData تحتوي على: format, reset_frequency, next_value
    await sequenceStore.updateSequence(formData.id, formData)
    toast.success('تم تحديث إعدادات الترقيم بنجاح.')
    isModalOpen.value = false
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء الحفظ. تأكد من صحة الصيغة.'
    toast.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}
</script>
