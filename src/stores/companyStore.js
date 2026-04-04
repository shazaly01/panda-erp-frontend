// src/stores/companyStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import companyService from '@/services/companyService'

export const useCompanyStore = defineStore('company', () => {
  // --- State ---
  const companies = ref([])
  const pagination = ref({})
  const currentCompany = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // --- Actions ---
  // أضفنا بارامتر search بقيمة افتراضية فارغة
  async function fetchCompanies(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      // نمرر الـ search إلى الـ service
      const response = await companyService.get(page, search)
      companies.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'Failed to fetch companies.'
      console.error(err)
      companies.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchCompany(id) {
    loading.value = true
    error.value = null
    currentCompany.value = null
    try {
      const response = await companyService.find(id)
      currentCompany.value = response.data.data
    } catch (err) {
      error.value = 'Failed to fetch company.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createCompany(payload) {
    loading.value = true
    error.value = null
    try {
      await companyService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create company.'
      console.error(err)
      throw err // أعد رمي الخطأ لمعالجته في المكون
    } finally {
      loading.value = false
    }
  }

  async function updateCompany(id, payload) {
    loading.value = true
    error.value = null
    try {
      await companyService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update company.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCompany(id) {
    loading.value = true
    error.value = null
    try {
      await companyService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete company.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- Return public API ---
  return {
    companies,
    pagination,
    currentCompany,
    loading,
    error,
    fetchCompanies,
    fetchCompany,
    createCompany,
    updateCompany,
    deleteCompany,
  }
})
