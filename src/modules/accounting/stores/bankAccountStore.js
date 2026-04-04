// src/modules/accounting/stores/bankAccountStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import bankAccountService from '../services/bankAccount.service'

export const useBankAccountStore = defineStore('bankAccount', () => {
  // ==========================
  // 1. State
  // ==========================
  const bankAccounts = ref([])
  const pagination = ref({})
  const currentBankAccount = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // التعديل 1: مصفوفة لتخزين حسابات البنوك المسموح بها فقط
  const allowedAccounts = ref([])

  // ==========================
  // 2. Actions
  // ==========================

  // التعديل 2: دالة جلب الحسابات المسموح بها (الافتراضي هو مفتاح البنوك)
  async function fetchAllowedAccounts(key = 'default_bank_parent') {
    loading.value = true
    error.value = null
    try {
      const response = await bankAccountService.getAllowedAccounts(key)

      // استخراج المصفوفة بشكل آمن من الرد
      const accountsArray = response.data.data || response.data || []

      // دمج الكود مع الاسم في خاصية 'name' التي يقرأها الـ Dropdown افتراضياً
      allowedAccounts.value = accountsArray.map((acc) => ({
        ...acc,
        name: `${acc.code} - ${acc.name}`, // هذا هو السطر السحري
      }))
    } catch (err) {
      error.value = 'فشل في تحميل الحسابات المسموح بها.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchBankAccounts(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await bankAccountService.get(params)
      bankAccounts.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في تحميل الحسابات البنكية.'
      bankAccounts.value = []
      pagination.value = {}
    } finally {
      loading.value = false
    }
  }

  async function fetchBankAccount(id) {
    loading.value = true
    error.value = null
    currentBankAccount.value = null
    try {
      const response = await bankAccountService.find(id)
      currentBankAccount.value = response.data.data
    } catch (err) {
      error.value = 'فشل في تحميل تفاصيل الحساب البنكي.'
    } finally {
      loading.value = false
    }
  }

  async function createBankAccount(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await bankAccountService.create(payload)

      // التعديل 3: إضافة البنك الجديد للقائمة محلياً فور الإنشاء
      if (response.data && response.data.data) {
        bankAccounts.value.unshift(response.data.data)
      }

      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إضافة الحساب البنكي.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateBankAccount(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await bankAccountService.update(id, payload)

      // التعديل 4: تحديث البنك في القائمة المحلية فور التعديل
      const updatedBank = response.data.data
      const index = bankAccounts.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        bankAccounts.value[index] = updatedBank
      }

      return updatedBank
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث الحساب البنكي.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteBankAccount(id) {
    loading.value = true
    error.value = null
    try {
      await bankAccountService.delete(id)
      // الحذف المحلي مؤقتاً، لكن في القوائم المعتمدة على Pagination يفضل إعادة جلب الصفحة
      bankAccounts.value = bankAccounts.value.filter((bank) => bank.id !== id)
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لا يمكن حذف الحساب البنكي لوجود حركات مالية مرتبطة به.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    bankAccounts,
    pagination,
    currentBankAccount,
    loading,
    error,
    allowedAccounts, // تم التصدير
    fetchAllowedAccounts, // تم التصدير
    fetchBankAccounts,
    fetchBankAccount,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
  }
})
