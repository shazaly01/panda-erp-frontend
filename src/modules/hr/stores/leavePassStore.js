// src/stores/leavePassStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { leavePassService } from '@/services/leavePassService'

export const useLeavePassStore = defineStore('leavePass', () => {
  // الحالات الافتراضية (State)
  const leavePasses = ref([])
  const pagination = ref({})
  const currentPass = ref(null)
  const musterRecords = ref([])
  const musterSummary = ref({ total_inside: 0, total_temp_out: 0, total_outside: 0 })
  const loading = ref(false)

  /**
   * جلب الأذونات وتحديث القائمة
   */
  async function fetchLeavePasses(filters = {}) {
    loading.value = true
    try {
      const response = await leavePassService.getAll(filters)
      leavePasses.value = response.data.data
      pagination.value = response.data.meta || {}
    } finally {
      loading.value = false
    }
  }

  /**
   * إصدار إذن جديد وضخه مباشرة في واجهة المشرف
   */
  async function createLeavePass(payload) {
    loading.value = true
    try {
      const response = await leavePassService.create(payload)
      leavePasses.value.unshift(response.data.data)
      return response.data.data
    } finally {
      loading.value = false
    }
  }

  /**
   * تحديث بيانات إذن قائم
   */
  async function updateLeavePass(id, payload) {
    loading.value = true
    try {
      const response = await leavePassService.update(id, payload)
      const index = leavePasses.value.findIndex((p) => p.id === id)
      if (index !== -1) leavePasses.value[index] = response.data.data
      if (currentPass.value?.id === id) currentPass.value = response.data.data
      return response.data.data
    } finally {
      loading.value = false
    }
  }

  /**
   * إلغاء الإذن وحذفه محلياً
   */
  async function deleteLeavePass(id) {
    loading.value = true
    try {
      await leavePassService.delete(id)
      leavePasses.value = leavePasses.value.filter((p) => p.id !== id)
    } finally {
      loading.value = false
    }
  }

  /**
   * تغيير الحالة يدوياً من قبل الحارس (الضغط البصري)
   */
  async function submitGateCheck(id, action) {
    loading.value = true
    try {
      const response = await leavePassService.gateCheck(id, action)
      const index = leavePasses.value.findIndex((p) => p.id === id)
      if (index !== -1) leavePasses.value[index] = response.data.data
      return response.data.data
    } finally {
      loading.value = false
    }
  }

  /**
   * معالجة المسح السريع للـ QR Code وفك الارتباط الحركي تلقائياً
   */
  async function executeQRScan(passCode) {
    loading.value = true
    try {
      const response = await leavePassService.scanGateCode(passCode)
      // تحديث السجل في القائمة المحلية إن وجد لضمان المزامنة اللحظية مع الشاشات
      const index = leavePasses.value.findIndex((p) => p.id === response.data.data.id)
      if (index !== -1) leavePasses.value[index] = response.data.data
      return response.data.data
    } finally {
      loading.value = false
    }
  }

  /**
   * تغذية قائمة حصر التواجد الميداني للطوارئ والأزمات
   */
  async function fetchEmergencyMuster() {
    loading.value = true
    try {
      const response = await leavePassService.getEmergencyMuster()
      musterRecords.value = response.data.records
      musterSummary.value = response.data.summary
    } finally {
      loading.value = false
    }
  }

  return {
    leavePasses,
    pagination,
    currentPass,
    musterRecords,
    musterSummary,
    loading,
    fetchLeavePasses,
    createLeavePass,
    updateLeavePass,
    deleteLeavePass,
    submitGateCheck,
    executeQRScan,
    fetchEmergencyMuster,
  }
})
