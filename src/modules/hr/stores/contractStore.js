import { defineStore } from 'pinia'
import { ref } from 'vue'
import contractService from '../services/contract.service'

export const useContractStore = defineStore('hrContract', () => {
  // ==========================
  // 1. State
  // ==========================
  const contracts = ref([])
  const singleContract = ref(null)
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

  async function fetchContracts(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await contractService.get(filters)
      contracts.value = response.data.data
      if (response.data.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة العقود'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchContractById(id) {
    loading.value = true
    error.value = null
    singleContract.value = null
    try {
      const response = await contractService.find(id)
      singleContract.value = response.data.data
      return singleContract.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل العقد'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createContract(payload) {
    loading.value = true
    error.value = null
    try {
      await contractService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء العقد الجديد'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteContract(id) {
    loading.value = true
    error.value = null
    try {
      await contractService.delete(id)
      contracts.value = contracts.value.filter((contract) => contract.id !== id)
      pagination.value.total -= 1
    } catch (err) {
      error.value =
        err.response?.data?.message ||
        'لا يمكن حذف العقد (قد يكون نشطاً أو مرتبطاً بمسيرات رواتب سابقة)'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    contracts,
    singleContract,
    pagination,
    loading,
    error,

    fetchContracts,
    fetchContractById,
    createContract,
    deleteContract,
  }
})
