<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">الربط المحاسبي للإعدادات</h1>
        <p class="text-sm text-text-muted mt-1">
          توجيه مفاتيح النظام (ERP Modules) إلى شجرة الحسابات الخاصة بالشركة
        </p>
      </div>
    </div>

    <AccountMappingsFilter v-model:searchQuery="searchQuery" @update:searchQuery="onSearch" />

    <div
      v-if="Object.keys(groupedMappings).length > 0"
      class="flex gap-2 overflow-x-auto border-b border-surface-border pb-px scrollbar-hide"
    >
      <button
        v-for="(groupData, groupKey) in groupedMappings"
        :key="groupKey"
        @click="activeTab = groupKey"
        class="px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2"
        :class="
          activeTab === groupKey
            ? 'border-primary text-primary'
            : 'border-transparent text-text-muted hover:text-text-primary hover:border-surface-border'
        "
      >
        <span>{{ getTabName(groupKey) }}</span>
        <span
          class="px-2 py-0.5 text-[10px] rounded-full font-bold"
          :class="
            activeTab === groupKey
              ? 'bg-primary/10 text-primary'
              : 'bg-surface-section border border-surface-border text-text-muted'
          "
        >
          {{ groupData.length }}
        </span>
      </button>
    </div>

    <AccountMappingsTable
      :mappings="filteredMappings"
      :loading="loading"
      @edit="openModal"
      @row-clicked="openModal"
    />

    <AccountMappingModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :mapping="selectedMapping"
      :is-saving="isSaving"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useAccountMappingStore } from '@/modules/accounting/stores/accountMappingStore'

import AccountMappingsFilter from './AccountMappingsFilter.vue'
import AccountMappingsTable from './AccountMappingsTable.vue'
import AccountMappingModal from './AccountMappingModal.vue'

// -- إدارة الحالة --
const authStore = useAuthStore()
const mappingStore = useAccountMappingStore()
const toast = useToast()

const { mappings, loading, groupedMappings } = storeToRefs(mappingStore)

// -- إدارة التبويبات (Tabs) --
const activeTab = ref('')

// قاموس المعيار الموحد لترجمة التبويبات (متوافق مع الـ Seeder الشامل)
const getTabName = (prefix) => {
  const dictionary = {
    treasury: 'الخزينة والبنوك',
    sales: 'المبيعات والعملاء',
    purchases: 'المشتريات والموردين',
    inventory: 'المخزون والمستودعات',
    tax: 'الضرائب',
    hr: 'الموارد البشرية والرواتب',
    assets: 'الأصول الثابتة',
    deferred: 'المقدمات والمستحقات',
    equity: 'حقوق الملكية',
    pos: 'نقاط البيع',
    projects: 'المشاريع والمقاولات',
    mfg: 'التصنيع والإنتاج',
    fleet: 'حركة السيارات',
    company: 'حسابات مشتركة',
  }
  return dictionary[prefix] || prefix.toUpperCase()
}

// تحديد التبويب الأول كنشط افتراضياً عند تحميل البيانات
watch(
  groupedMappings,
  (newGroups) => {
    const keys = Object.keys(newGroups)
    if (keys.length > 0 && (!activeTab.value || !keys.includes(activeTab.value))) {
      activeTab.value = keys[0]
    }
  },
  { immediate: true },
)

// -- حالة الفلاتر والبحث محلياً --
const searchQuery = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {}, 300)
}

// التصفية تطبق فقط على المجموعات الموجودة في التبويب النشط
const filteredMappings = computed(() => {
  const currentTabData = groupedMappings.value[activeTab.value] || []

  if (!searchQuery.value) return currentTabData

  const query = searchQuery.value.toLowerCase()
  return currentTabData.filter(
    (m) =>
      m.name?.toLowerCase().includes(query) ||
      m.key?.toLowerCase().includes(query) ||
      m.account_name?.toLowerCase().includes(query) ||
      m.account_code?.toLowerCase().includes(query),
  )
})

// -- جلب البيانات --
onMounted(async () => {
  if (mappings.value.length === 0) {
    await mappingStore.fetchMappings()
  }
})

// -- إدارة المودال --
const isModalOpen = ref(false)
const isSaving = ref(false)
const selectedMapping = ref(null)

const openModal = (mapping) => {
  if (!authStore.can('account_mapping.update')) {
    toast.error('ليس لديك الصلاحية لتعديل الربط المحاسبي.')
    return
  }
  selectedMapping.value = { ...mapping }
  isModalOpen.value = true
}

const handleSave = async (formData) => {
  isSaving.value = true
  try {
    await mappingStore.updateMapping(formData.id, formData.account_id)
    toast.success('تم تحديث التوجيه المحاسبي بنجاح.')
    isModalOpen.value = false
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء الحفظ.'
    toast.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}
</script>
