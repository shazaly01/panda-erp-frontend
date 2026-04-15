// src/modules/hr/stores/overtimePolicyStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import overtimePolicyService from '../services/overtimePolicy.service'

export const useOvertimePolicyStore = defineStore('hrOvertimePolicy', () => {
  // ==========================
  // 1. State
  // ==========================
  const policies = ref([])
  const singlePolicy = ref(null)
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

  async function fetchPolicies(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await overtimePolicyService.get(filters)
      // شبكة الأمان للتعامل مع البيانات القادمة
      const incomingData = response.data?.data || response.data || []
      policies.value = Array.isArray(incomingData) ? incomingData : []

      if (response.data?.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة سياسات العمل الإضافي'
      policies.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchPolicyById(id) {
    loading.value = true
    error.value = null
    singlePolicy.value = null
    try {
      const response = await overtimePolicyService.find(id)
      singlePolicy.value = response.data?.data || response.data
      return singlePolicy.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل السياسة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPolicy(payload) {
    loading.value = true
    error.value = null
    try {
      await overtimePolicyService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء سياسة جديدة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updatePolicy(id, payload) {
    loading.value = true
    error.value = null
    try {
      await overtimePolicyService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث السياسة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deletePolicy(id) {
    loading.value = true
    error.value = null
    try {
      await overtimePolicyService.delete(id)
      if (Array.isArray(policies.value)) {
        policies.value = policies.value.filter((policy) => policy.id !== id)
      }
      if (pagination.value.total > 0) {
        pagination.value.total -= 1
      }
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لا يمكن حذف السياسة (قد تكون مرتبطة بعقود موظفين حالية)'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    policies,
    singlePolicy,
    pagination,
    loading,
    error,

    fetchPolicies,
    fetchPolicyById,
    createPolicy,
    updatePolicy,
    deletePolicy,
  }
})
