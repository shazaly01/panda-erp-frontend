import { defineStore } from 'pinia'
import { ref } from 'vue'
import departmentService from '../services/department.service'

export const useDepartmentStore = defineStore('hrDepartment', () => {
  // ==========================
  // 1. State
  // ==========================
  const departmentTree = ref([]) // الإدارات بشكل هرمي (كما تعود من الـ API)
  const flatDepartments = ref([]) // قائمة مسطحة منسقة للقوائم المنسدلة
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Helpers (دوال مساعدة)
  // ==========================

  // نفس دالتك الذكية في المحاسبة لتحويل الشجرة لقائمة مقروءة بصرياً
  const buildFlatList = (nodes, level = 0) => {
    let result = []
    nodes.forEach((node) => {
      result.push({
        ...node,
        level,
        // إضافة مسافات بادئة لتوضيح التبعية في الـ Dropdown
        dropdownName: '\u00A0\u00A0\u00A0'.repeat(level) + (level > 0 ? '└─ ' : '') + node.name,
      })
      // إذا كان للإدارة أقسام فرعية، نكرر العملية
      if (node.children && node.children.length > 0) {
        result = result.concat(buildFlatList(node.children, level + 1))
      }
    })
    return result
  }

  // ==========================
  // 3. Actions
  // ==========================

  // داخل دالة fetchDepartments
  async function fetchDepartments(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await departmentService.get(filters)

      // ✅ الحماية: نضمن أننا نأخذ مصفوفة حتى لو فشل الباك-إند
      const data = response.data?.data || []
      departmentTree.value = data

      if (response.data?.meta) {
        pagination.value = response.data.meta
      }

      // ✅ الحماية: لا نستدعي الدالة إلا إذا كانت المصفوفة تحتوي على عناصر
      flatDepartments.value = data.length > 0 ? buildFlatList(data) : []
    } catch (err) {
      error.value = 'فشل تحميل قائمة الإدارات'
      flatDepartments.value = [] // تفريغ القائمة عند الخطأ لمنع انهيار الواجهة
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createDepartment(payload) {
    loading.value = true
    error.value = null
    try {
      await departmentService.create(payload)
      // بعد الإضافة، نجلب الشجرة من جديد لتحديث القوائم المنسدلة
      await fetchDepartments()
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إضافة الإدارة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateDepartment(id, payload) {
    loading.value = true
    error.value = null
    try {
      await departmentService.update(id, payload)
      await fetchDepartments()
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث الإدارة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteDepartment(id) {
    loading.value = true
    error.value = null
    try {
      await departmentService.delete(id)
      await fetchDepartments()
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لا يمكن حذف الإدارة (قد تحتوي على موظفين أو أقسام فرعية)'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    departmentTree,
    flatDepartments,
    pagination,
    loading,
    error,

    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  }
})
