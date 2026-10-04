import { defineStore } from 'pinia'
import { ref } from 'vue'
import voucherService from '../services/voucher.service'

export const useVoucherStore = defineStore('voucher', () => {
  // ==========================
  // 1. State
  // ==========================
  const vouchers = ref([])
  const pagination = ref({})
  const currentVoucher = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  async function fetchVouchers(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await voucherService.get(params)
      vouchers.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في تحميل السندات.'
      console.error(err)
      vouchers.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchVoucher(id) {
    loading.value = true
    error.value = null
    currentVoucher.value = null
    try {
      const response = await voucherService.find(id)
      currentVoucher.value = response.data.data
    } catch (err) {
      error.value = 'فشل في تحميل تفاصيل السند.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createVoucher(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await voucherService.create(payload)
      currentVoucher.value = response.data?.data || response.data || null
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء السند.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateVoucher(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await voucherService.update(id, payload)
      currentVoucher.value = response.data?.data || response.data || null
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث السند.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function postVoucherAction(id) {
    loading.value = true
    error.value = null
    try {
      await voucherService.postVoucher(id)
      if (currentVoucher.value && currentVoucher.value.id === id) {
        currentVoucher.value.status = 'posted'
      }
      const voucherInList = vouchers.value.find((v) => v.id === id)
      if (voucherInList) voucherInList.status = 'posted'
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل ترحيل السند.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function unpostVoucherAction(id) {
    loading.value = true
    error.value = null
    try {
      const response = await voucherService.unpostVoucher(id)
      if (currentVoucher.value && currentVoucher.value.id === id) {
        currentVoucher.value.status = 'draft'
      }
      const voucherInList = vouchers.value.find((v) => v.id === id)
      if (voucherInList) voucherInList.status = 'draft'
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إلغاء ترحيل السند.'
      throw err
    } finally {
      loading.value = false
    }
  }

  // حذف السندات (للمسودات)
  async function deleteVoucher(id) {
    loading.value = true
    error.value = null
    try {
      await voucherService.delete(id)
      vouchers.value = vouchers.value.filter((v) => v.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'لا يمكن حذف سند مُرحل.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function approveVoucherAction(id) {
    loading.value = true
    error.value = null
    try {
      await voucherService.approveVoucher(id)

      if (currentVoucher.value && currentVoucher.value.id === id) {
        currentVoucher.value.status = 'approved'
      }
      const voucherInList = vouchers.value.find((v) => v.id === id)
      if (voucherInList) voucherInList.status = 'approved'
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل اعتماد السند.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    vouchers,
    pagination,
    currentVoucher,
    loading,
    error,
    fetchVouchers,
    fetchVoucher,
    createVoucher,
    updateVoucher,
    postVoucherAction,
    unpostVoucherAction,
    deleteVoucher,
    approveVoucherAction,
  }
})
