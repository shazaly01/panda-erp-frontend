import { defineStore } from 'pinia'
import { ref } from 'vue'
import salaryRuleService from '../services/salaryRule.service'

export const useSalaryRuleStore = defineStore('hrSalaryRule', () => {
  // ==========================
  // 1. State
  // ==========================
  const rules = ref([])
  const singleRule = ref(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  async function fetchRules(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await salaryRuleService.get(filters)

      // 🛡️ تأمين البيانات: نضمن دائماً وصول مصفوفة للجدول حتى لو فشل الرد
      const incomingData = response.data?.data || response.data || []
      rules.value = Array.isArray(incomingData) ? incomingData : []

      if (response.data?.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة قواعد الرواتب'
      rules.value = [] // تفريغ القائمة لمنع الأخطاء في القالب (Template)
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchRuleById(id) {
    loading.value = true
    error.value = null
    singleRule.value = null
    try {
      const response = await salaryRuleService.find(id)
      // تأمين جلب السجل الواحد
      singleRule.value = response.data?.data || response.data
      return singleRule.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل القاعدة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createRule(payload) {
    loading.value = true
    error.value = null
    try {
      await salaryRuleService.create(payload)
      // يفضل إعادة الجلب بعد الإضافة لضمان تحديث القائمة فوراً
      await fetchRules()
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إضافة قاعدة الراتب'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateRule(id, payload) {
    loading.value = true
    error.value = null
    try {
      await salaryRuleService.update(id, payload)
      await fetchRules() // تحديث القائمة لتعكس التعديلات
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث قاعدة الراتب'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteRule(id) {
    loading.value = true
    error.value = null
    try {
      await salaryRuleService.delete(id)
      if (Array.isArray(rules.value)) {
        rules.value = rules.value.filter((rule) => rule.id !== id)
      }
      if (pagination.value.total > 0) {
        pagination.value.total -= 1
      }
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لا يمكن حذف القاعدة (مستخدمة في هياكل رواتب حالية)'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    rules,
    singleRule,
    pagination,
    loading,
    error,

    fetchRules,
    fetchRuleById,
    createRule,
    updateRule,
    deleteRule,
  }
})
