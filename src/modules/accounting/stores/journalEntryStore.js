import { defineStore } from 'pinia'
import { ref } from 'vue'
import journalEntryService from '../services/journalEntry.service'

export const useJournalEntryStore = defineStore('journalEntry', () => {
  // ==========================
  // 1. State
  // ==========================
  const entries = ref([])
  const pagination = ref({})
  const currentEntry = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  // توحيد تمرير المعاملات كـ Object ليتوافق مع الفلاتر
  async function fetchEntries(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await journalEntryService.get(params)
      entries.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في تحميل القيود اليومية.'
      console.error(err)
      entries.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchEntry(id) {
    loading.value = true
    error.value = null
    currentEntry.value = null
    try {
      const response = await journalEntryService.find(id)

      // === السطر السحري لاكتشاف الخطأ ===
      console.log('بيانات القيد القادمة من السيرفر:', response.data)

      // حاول أخذ البيانات سواء كانت مغلفة بـ data أم لا
      currentEntry.value = response.data.data || response.data
    } catch (err) {
      error.value = 'فشل في تحميل تفاصيل القيد.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createEntry(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await journalEntryService.create(payload)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء القيد.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEntry(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await journalEntryService.update(id, payload)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث القيد.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function postEntry(id) {
    loading.value = true
    try {
      await journalEntryService.postEntry(id)

      // تحديث الحالة محلياً (تحسين أداء رائع من طرفك)
      if (currentEntry.value && currentEntry.value.id === id) {
        currentEntry.value.status = 'posted'
      }
      const entryInList = entries.value.find((e) => e.id === id)
      if (entryInList) entryInList.status = 'posted'
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل ترحيل القيد'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteEntry(id) {
    loading.value = true
    error.value = null
    try {
      await journalEntryService.delete(id)
      entries.value = entries.value.filter((e) => e.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'لا يمكن حذف قيد مُرحل.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    entries,
    pagination,
    currentEntry,
    loading,
    error,
    fetchEntries,
    fetchEntry,
    createEntry,
    updateEntry,
    postEntry,
    deleteEntry,
  }
})
