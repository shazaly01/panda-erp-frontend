// src/modules/hr/stores/teamAttendanceStore.js
import { defineStore } from 'pinia'
import teamAttendanceService from '@/modules/hr/services/teamAttendance.service'

export const useTeamAttendanceStore = defineStore('teamAttendance', {
  state: () => ({
    teamMatrix: [], // مصفوفة الموظفين وحضورهم
    loading: false,
    error: null,
  }),

  getters: {
    // إحصائيات مفيدة لواجهة المستخدم أو لوحة التحكم
    totalTeamMembers: (state) => state.teamMatrix.length,
    presentMembersCount: (state) =>
      state.teamMatrix.filter(
        (emp) => emp.today_attendance && emp.today_attendance.status === 'present',
      ).length,
    absentMembersCount: (state) =>
      state.teamMatrix.filter(
        (emp) => !emp.today_attendance || emp.today_attendance.status === 'absent',
      ).length,
  },

  actions: {
    /**
     * جلب مصفوفة الفريق من الخادم
     */
    async fetchTeamMatrix(date) {
      this.loading = true
      this.error = null
      try {
        const response = await teamAttendanceService.getTeamMatrix({ date })
        // استلام البيانات وحفظها في الحالة
        this.teamMatrix = response.data.data || []
      } catch (err) {
        console.error('Failed to fetch team attendance matrix:', err)
        this.error = err.response?.data?.message || 'حدث خطأ أثناء جلب بيانات الفريق.'
        this.teamMatrix = []
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * تعديل أو إدخال حضور الموظف (Override) وتحديث الواجهة لحظياً
     */
    async overrideAttendance(payload) {
      try {
        const response = await teamAttendanceService.overrideAttendance(payload)
        const updatedLog = response.data.data

        // 🌟 التحديث اللحظي (Optimistic Update):
        // نبحث عن الموظف في المصفوفة ونحدث سجله فوراً لتتجاوب الواجهة بدون إعادة تحميل
        const employeeIndex = this.teamMatrix.findIndex((emp) => emp.id === payload.employee_id)
        if (employeeIndex !== -1) {
          this.teamMatrix[employeeIndex].today_attendance = updatedLog
        }

        return response.data
      } catch (err) {
        console.error('Failed to override attendance:', err)
        throw err // نعيد رمي الخطأ لتلتقطه الشاشة (Component) وتعرض رسالة للمشرف
      }
    },

    /**
     * تفريغ البيانات (مفيد عند تسجيل الخروج أو تبديل الحسابات)
     */
    clearStore() {
      this.teamMatrix = []
      this.error = null
    },
  },
})
