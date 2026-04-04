import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import currencyService from '../services/currency.service'

export const useCurrencyStore = defineStore('currency', () => {
  // ==========================
  // 1. State
  // ==========================
  const currencies = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Getters
  // ==========================

  // Getter مفيد جداً لجلب العملة الأساسية للنظام
  const baseCurrency = computed(() => {
    return currencies.value.find((c) => c.is_base === true) || null
  })

  // ==========================
  // 3. Actions
  // ==========================

  // جلب كل العملات (لا نحتاج Pagination هنا لأن عدد العملات قليل)
  async function fetchCurrencies(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await currencyService.get(params)
      currencies.value = response.data.data
    } catch (err) {
      error.value = 'فشل في تحميل العملات.'
      console.error(err)
      currencies.value = []
    } finally {
      loading.value = false
    }
  }

  async function createCurrency(payload) {
    loading.value = true
    error.value = null
    try {
      await currencyService.create(payload)
      await fetchCurrencies() // إعادة تحميل القائمة لتحديث الحالات (خاصة إذا تغيرت العملة الأساسية)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إضافة العملة.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCurrency(id, payload) {
    loading.value = true
    error.value = null
    try {
      await currencyService.update(id, payload)
      await fetchCurrencies() // إعادة تحميل القائمة
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث العملة.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCurrency(id) {
    loading.value = true
    error.value = null
    try {
      await currencyService.delete(id)
      currencies.value = currencies.value.filter((c) => c.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'لا يمكن حذف العملة لارتباطها بحركات مالية.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    currencies,
    baseCurrency,
    loading,
    error,
    fetchCurrencies,
    createCurrency,
    updateCurrency,
    deleteCurrency,
  }
})
