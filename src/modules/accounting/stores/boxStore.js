import { defineStore } from 'pinia'
import { ref } from 'vue'
import boxService from '../services/box.service'

export const useBoxStore = defineStore('box', () => {
  // ==========================
  // 1. State
  // ==========================
  const boxes = ref([])
  const pagination = ref({})
  const currentBox = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const allowedAccounts = ref([])
  // ==========================
  // 2. Actions
  // ==========================

  async function fetchBoxes(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await boxService.get(params)
      boxes.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في تحميل قائمة الخزائن.'
      console.error(err)
      boxes.value = []
      pagination.value = {}
    } finally {
      loading.value = false
    }
  }

  async function fetchBox(id) {
    loading.value = true
    error.value = null
    currentBox.value = null
    try {
      const response = await boxService.find(id)
      currentBox.value = response.data.data
    } catch (err) {
      error.value = 'فشل في تحميل تفاصيل الخزينة.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createBox(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await boxService.create(payload)

      // التعديل: إضافة الخزينة الجديدة إلى القائمة محلياً
      if (response.data && response.data.data) {
        boxes.value.unshift(response.data.data) // نضعها في البداية
      }

      return response.data.data
    } catch (err) {
      // التعديل: تحسين التقاط رسالة الخطأ من السيرفر
      error.value = err.response?.data?.message || 'فشل إضافة الخزينة.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateBox(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await boxService.update(id, payload)

      // التعديل: تحديث البيانات في القائمة المحلية فوراً
      const updatedBox = response.data.data
      const index = boxes.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        boxes.value[index] = updatedBox
      }

      return updatedBox
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث بيانات الخزينة.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteBox(id) {
    loading.value = true
    error.value = null
    try {
      await boxService.delete(id)
      // الحذف المحلي مؤقتاً، لكن يُفضل دائماً إعادة تحميل الصفحة لضمان تزامن الترقيم
      boxes.value = boxes.value.filter((box) => box.id !== id)
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لا يمكن حذف الخزينة؛ قد تكون مرتبطة بحركات مالية.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAllowedAccounts(key = 'default_box_parent') {
    loading.value = true
    error.value = null
    try {
      const response = await boxService.getAllowedAccounts(key)
      // نجهز البيانات لتناسب الـ Dropdown (مثلاً دمج الكود مع الاسم)
      allowedAccounts.value = response.data.data.map((acc) => ({
        ...acc,
        dropdownName: `${acc.code} - ${acc.name}`,
      }))
    } catch (err) {
      error.value = 'فشل في تحميل الحسابات المسموح بها.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return {
    boxes,
    pagination,
    currentBox,
    loading,
    error,
    allowedAccounts, // تصدير المصفوفة الجديدة
    fetchAllowedAccounts, // تصدير الدالة الجديدة
    fetchBoxes,
    fetchBox,
    createBox,
    updateBox,
    deleteBox,
  }
})
