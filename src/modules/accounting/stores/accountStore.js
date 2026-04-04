import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import accountService from '../services/account.service'

export const useAccountStore = defineStore('accountingAccount', () => {
  // ==========================
  // 1. State
  // ==========================
  const accountTree = ref([]) // الشجرة الهرمية كما تأتي من الباك-إند
  const flatAccounts = ref([]) // قائمة مسطحة مُعالجة (للقوائم المنسدلة Dropdowns)
  const accountTypes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Helpers (دوال مساعدة)
  // ==========================

  // دالة ذكية لتحويل الشجرة إلى قائمة مسطحة مع إزاحة بصرية للقوائم المنسدلة
  const buildFlatList = (nodes, level = 0) => {
    let result = []
    nodes.forEach((node) => {
      result.push({
        ...node,
        level,
        // إضافة مسافات بادئة ورموز شجرية لتسهيل القراءة في الـ Dropdown
        dropdownName:
          '\u00A0\u00A0\u00A0'.repeat(level) +
          (level > 0 ? '└─ ' : '') +
          node.code +
          ' - ' +
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

  async function fetchAccounts(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await accountService.get(params)
      // الباك-إند يعيد البيانات كشجرة جاهزة بفضل toTree()
      accountTree.value = response.data.data

      // بناء القائمة المسطحة لاستخدامها في نموذج الإدخال (AccountForm)
      flatAccounts.value = buildFlatList(accountTree.value)
    } catch (err) {
      error.value = 'فشل تحميل دليل الحسابات'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchAccountTypes() {
    if (accountTypes.value.length > 0) return
    try {
      const response = await accountService.getTypes()
      accountTypes.value = response.data
    } catch (err) {
      console.error('Failed to load account types', err)
    }
  }

  async function createAccount(payload) {
    loading.value = true
    error.value = null
    try {
      await accountService.create(payload)
      await fetchAccounts() // إعادة تحميل الشجرة لتحديث العرض
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء الحساب'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAccount(id, payload) {
    loading.value = true
    error.value = null
    try {
      await accountService.update(id, payload)
      await fetchAccounts() // تحديث الشجرة
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث الحساب'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAccount(id) {
    loading.value = true
    error.value = null
    try {
      await accountService.delete(id)
      await fetchAccounts() // إعادة تحميل الشجرة بعد الحذف لضمان تزامن الهيكلة
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لا يمكن حذف الحساب (قد يكون مستخدماً في قيود أو لديه أبناء)'
      throw err
    } finally {
      loading.value = false
    }
  }

  // --------------------------------------------------
  // الميزة الجديدة: اقتراح كود الحساب
  // --------------------------------------------------
  async function suggestAccountCode(parentId) {
    if (!parentId) return '' // إذا لم يتم اختيار أب، نترك الحقل فارغاً

    try {
      const response = await accountService.suggestCode(parentId)
      return response.data.code // سيعود الرقم مثلاً: '1101003'
    } catch (err) {
      console.error('فشل جلب الكود المقترح:', err)
      return '' // في حال حدوث خطأ، نترك الحقل فارغاً ليدخله المحاسب يدوياً
    }
  }

  // ==========================
  // 4. Getters
  // ==========================

  // Getter للحسابات الحركية فقط (للقيود اليومية)
  const transactionalAccounts = computed(() => {
    return flatAccounts.value.filter((a) => a.is_transactional)
  })

  return {
    accountTree,
    flatAccounts,
    accountTypes,
    loading,
    error,
    transactionalAccounts,

    fetchAccounts,
    fetchAccountTypes,
    createAccount,
    updateAccount,
    deleteAccount,
    suggestAccountCode, // تم التصدير بنجاح
  }
})
