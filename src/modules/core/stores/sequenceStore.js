import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import sequenceService from '../services/sequence.service'

export const useSequenceStore = defineStore('sequence', () => {
  // ==========================
  // 1. State
  // ==========================
  const sequences = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  // جلب كل إعدادات الترقيم الحالية
  async function fetchSequences() {
    loading.value = true
    error.value = null
    try {
      const response = await sequenceService.get()
      sequences.value = Array.isArray(response.data) ? response.data : response.data.data || []
    } catch (err) {
      error.value = 'فشل تحميل إعدادات الترقيم'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // تحديث إعداد ترقيم معين
  async function updateSequence(id, data) {
    loading.value = true
    error.value = null
    try {
      await sequenceService.update(id, data)

      // تحديث القائمة محلياً لتعكس التغيير فوراً
      const item = sequences.value.find((s) => s.id === id)
      if (item) {
        Object.assign(item, data)
        // إعادة جلب القائمة للتأكد من التزامن مع الخادم
        await fetchSequences()
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل حفظ إعدادات الترقيم'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==========================
  // 3. Getters
  // ==========================

  // تجميع الإعدادات حسب الموديول بناءً على اسم الموديل في قاعدة البيانات
  // لتسهيل عرضها في تبويبات (مثلاً: مالية، موارد بشرية)
  const groupedSequences = computed(() => {
    const groups = {
      accounting: [],
      hr: [],
      other: [],
    }

    sequences.value.forEach((s) => {
      if (!s.model) return

      const modelLower = s.model.toLowerCase()

      // تصنيف بناءً على النيم سبيس الخاص بالباك إند
      if (modelLower.includes('\\accounting\\') || s.model === 'RECEIPT' || s.model === 'PAYMENT') {
        groups.accounting.push(s)
      } else if (modelLower.includes('\\hr\\')) {
        groups.hr.push(s)
      } else {
        groups.other.push(s)
      }
    })

    return groups
  })

  return {
    sequences,
    loading,
    error,
    groupedSequences,
    fetchSequences,
    updateSequence,
  }
})
