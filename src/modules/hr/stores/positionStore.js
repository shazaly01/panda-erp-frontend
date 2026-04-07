import { defineStore } from 'pinia'
import { ref } from 'vue'
import positionService from '../services/position.service'

export const usePositionStore = defineStore('hrPosition', () => {
  // ==========================
  // 1. State (الحالة)
  // ==========================
  const positions = ref([]) // قائمة المسميات الوظيفية للجدول
  const flatPositions = ref([]) // قائمة مبسطة للقوائم المنسدلة (مثلاً عند إضافة موظف)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions (الإجراءات)
  // ==========================

  /**
   * جلب المسميات الوظيفية من الخادم
   */
  async function fetchPositions(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await positionService.get(filters)

      positions.value = response.data.data

      if (response.data.meta) {
        pagination.value = response.data.meta
      }

      // تجهيز قائمة بسيطة لاستخدامها كخيارات في Dropdowns بالشاشات الأخرى
      flatPositions.value = positions.value.map((pos) => ({
        id: pos.id,
        name: pos.name,
        code: pos.code,
      }))
    } catch (err) {
      error.value = 'فشل تحميل قائمة المسميات الوظيفية'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * إضافة مسمى وظيفي جديد
   */
  async function createPosition(payload) {
    loading.value = true
    error.value = null
    try {
      await positionService.create(payload)
      // تحديث القائمة بعد الإضافة الناجحة
      await fetchPositions()
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إضافة المسمى الوظيفي'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * تحديث مسمى وظيفي موجود
   */
  async function updatePosition(id, payload) {
    loading.value = true
    error.value = null
    try {
      await positionService.update(id, payload)
      // تحديث القائمة لتعكس التعديلات
      await fetchPositions()
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث المسمى الوظيفي'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * حذف مسمى وظيفي
   */
  async function deletePosition(id) {
    loading.value = true
    error.value = null
    try {
      await positionService.delete(id)
      // تحديث القائمة بعد الحذف
      await fetchPositions()
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لا يمكن حذف المسمى الوظيفي (قد يكون مرتبطاً بموظفين)'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    positions,
    flatPositions,
    pagination,
    loading,
    error,

    // Actions
    fetchPositions,
    createPosition,
    updatePosition,
    deletePosition,
  }
})
