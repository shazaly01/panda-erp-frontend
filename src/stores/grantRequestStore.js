import { defineStore } from 'pinia'
import { ref } from 'vue'
import grantRequestService from '@/services/grantRequestService'

export const useGrantRequestStore = defineStore('grantRequest', () => {
  // --- State ---
  const grantRequests = ref([])
  const pagination = ref({})
  const currentGrantRequest = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // --- Actions ---
  async function fetchGrantRequests(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await grantRequestService.get(page, search)
      grantRequests.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'Failed to fetch grant requests.'
      console.error(err)
      grantRequests.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchGrantRequest(id) {
    loading.value = true
    error.value = null
    currentGrantRequest.value = null
    try {
      const response = await grantRequestService.find(id)
      currentGrantRequest.value = response.data.data
    } catch (err) {
      error.value = 'Failed to fetch grant request.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createGrantRequest(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await grantRequestService.create(payload)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create grant request.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateGrantRequest(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await grantRequestService.update(id, payload)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update grant request.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteGrantRequest(id) {
    loading.value = true
    error.value = null
    try {
      await grantRequestService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete grant request.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchPrintData(id) {
    loading.value = true
    error.value = null
    try {
      const response = await grantRequestService.getPrintData(id)
      return response.data.data
    } catch (err) {
      error.value = 'Failed to fetch print data.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- Return public API ---
  return {
    grantRequests,
    pagination,
    currentGrantRequest,
    loading,
    error,
    fetchGrantRequests,
    fetchGrantRequest,
    createGrantRequest,
    updateGrantRequest,
    deleteGrantRequest,
    fetchPrintData,
  }
})
