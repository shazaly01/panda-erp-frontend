//src\modules\inventory\stores\categoryStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import categoryService from '../services/category.service'

export const useCategoryStore = defineStore('inventoryCategory', () => {
  // ==========================
  // 1. State
  // ==========================
  const categories = ref([])
  const categoryTree = ref([])
  const flatCategories = ref([])
  const pagination = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Helpers (دوال مساعدة)
  // ==========================

  // دالة تحويل الهيكل الشجري للتصنيفات إلى قائمة مسطحة مع إزاحة بصرية للقوائم المنسدلة
  const buildFlatList = (nodes, level = 0) => {
    let result = []
    if (!Array.isArray(nodes)) return result

    nodes.forEach((node) => {
      result.push({
        ...node,
        level,
        dropdownName:
          '\u00A0\u00A0\u00A0'.repeat(level) +
          (level > 0 ? '└─ ' : '') +
          (node.code ? node.code + ' - ' : '') +
          node.name,
      })
      if (node.children && node.children.length > 0) {
        result = result.concat(buildFlatList(node.children, level + 1))
      }
    })
    return result
  }

  // ==========================
  // 3. Actions
  // ==========================

  // جلب قائمة التصنيفات
  async function fetchCategories(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await categoryService.get(params)
      const data = response.data?.data || response.data

      if (Array.isArray(data)) {
        categories.value = data
        categoryTree.value = data
        flatCategories.value = buildFlatList(data)
      } else {
        categories.value = data
      }

      pagination.value = response.data?.meta || response.data?.pagination || null
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحميل التصنيفات'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // إنشاء تصنيف جديد
  async function createCategory(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await categoryService.create(payload)
      await fetchCategories()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء التصنيف'
      throw err
    } finally {
      loading.value = false
    }
  }

  // تحديث بيانات تصنيف
  async function updateCategory(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await categoryService.update(id, payload)
      await fetchCategories()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث التصنيف'
      throw err
    } finally {
      loading.value = false
    }
  }

  // حذف تصنيف
  async function deleteCategory(id) {
    loading.value = true
    error.value = null
    try {
      await categoryService.delete(id)
      await fetchCategories()
    } catch (err) {
      error.value =
        err.response?.data?.message || 'فشل حذف التصنيف (قد يحتوي على تصنيفات فرعية أو أصناف)'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    categoryTree,
    flatCategories,
    pagination,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
