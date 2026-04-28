import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import accountMappingService from '../services/accountMapping.service'

export const useAccountMappingStore = defineStore('accountingMapping', () => {
  // ==========================
  // 1. State
  // ==========================
  const mappings = ref([])
  const candidates = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================
  async function fetchMappings() {
    loading.value = true
    error.value = null
    try {
      const response = await accountMappingService.get()
      const rawData = response.data.data !== undefined ? response.data.data : response.data
      mappings.value = Array.isArray(rawData) ? rawData : []
    } catch (err) {
      error.value = 'فشل تحميل إعدادات التوجيه المحاسبي'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchCandidates() {
    loading.value = true
    error.value = null
    try {
      const response = await accountMappingService.getCandidates()
      const rawData = response.data.data !== undefined ? response.data.data : response.data
      candidates.value = Array.isArray(rawData) ? rawData : []
    } catch (err) {
      error.value = 'فشل تحميل قائمة الحسابات المرشحة'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function updateMapping(id, accountId) {
    loading.value = true
    error.value = null
    try {
      await accountMappingService.update(id, accountId)
      // تحديث الحالة محلياً لتجنب إعادة تحميل كل البيانات
      const item = mappings.value.find((m) => m.id === id)
      if (item) {
        item.account_id = accountId
        await fetchMappings() // جلب البيانات المحدثة للحصول على كود واسم الحساب المرتبط
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل حفظ الإعدادات'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==========================
  // 3. Getters (الاستخراج الديناميكي)
  // ==========================
  const groupedMappings = computed(() => {
    const groups = {}

    mappings.value.forEach((m) => {
      if (!m.key) return

      // استخراج البادئة (Prefix) مثل 'hr', 'sales', 'inventory'
      const prefix = m.key.split('_')[0]

      if (!groups[prefix]) {
        groups[prefix] = []
      }

      groups[prefix].push(m)
    })

    return groups
  })

  return {
    mappings,
    candidates,
    loading,
    error,
    groupedMappings,
    fetchMappings,
    fetchCandidates,
    updateMapping,
  }
})
