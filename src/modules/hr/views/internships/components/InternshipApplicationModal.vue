<!--src\modules\hr\views\internships\components\InternshipApplicationModal.vue--->
<template>
  <Teleport to="body">
    <AppDialog
      :model-value="isOpen"
      @update:model-value="handleClose"
      title="الملف الرقمي التفصيلي للمتقدم"
      size="max-w-3xl"
    >
      <div class="space-y-6 text-right -mt-2 pb-2" dir="rtl">
        <!-- بطاقة الترويسة والصورة الشخصية -->
        <div
          class="flex flex-col sm:flex-row justify-between items-center gap-5 bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl relative overflow-hidden"
        >
          <div class="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
            <div
              @click="application?.photo_url ? (isPhotoZoomed = true) : null"
              :class="[
                'w-20 h-20 rounded-full overflow-hidden border-2 border-slate-700 shadow-md bg-slate-800 shrink-0 transition-all duration-300 group relative',
                application?.photo_url
                  ? 'cursor-pointer hover:ring-4 hover:ring-indigo-500/30 hover:border-indigo-400'
                  : '',
              ]"
              :title="application?.photo_url ? 'اضغط لتكبير الصورة الشخصية 🔍' : ''"
            >
              <img
                v-if="application?.photo_url"
                :src="application.photo_url"
                class="w-full h-full object-cover transform -scale-x-100 group-hover:scale-110 transition-transform duration-300"
                alt="صورة المتقدم"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-slate-400 text-lg font-bold"
              >
                {{ application?.application_type === 'employment' ? '💼' : 'HR' }}
              </div>
              <div
                v-if="application?.photo_url"
                class="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold"
              >
                تكبير 👁️
              </div>
            </div>

            <div class="text-center sm:text-right space-y-1.5">
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h4 class="text-base font-black text-slate-100 tracking-wide">
                  {{ application?.full_name }}
                </h4>

                <span
                  :class="[
                    'text-[10px] font-extrabold px-2 py-0.5 rounded border',
                    application?.application_type === 'employment'
                      ? 'bg-sky-500/10 text-sky-300 border-sky-500/25'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
                  ]"
                >
                  {{
                    application?.application_type === 'employment'
                      ? '💼 طلب توظيف'
                      : '🎓 تدريب أكاديمي'
                  }}
                </span>

                <span
                  v-if="application?.source"
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded border',
                    application?.source === 'manual'
                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25'
                      : 'bg-slate-900 text-slate-400 border-slate-800',
                  ]"
                >
                  {{ application?.source === 'manual' ? 'إدخال يدوي' : 'تقديم إلكتروني' }}
                </span>
              </div>

              <div
                class="flex flex-wrap justify-center sm:justify-start items-center gap-x-3 gap-y-1 text-xs"
              >
                <span class="text-slate-400 font-bold font-mono"
                  >هاتف: {{ application?.phone }}</span
                >
                <span v-if="application?.email" class="text-slate-600 font-bold">|</span>
                <span v-if="application?.email" class="text-slate-400 font-medium font-mono">{{
                  application?.email
                }}</span>
              </div>
              <div class="pt-0.5 flex flex-wrap justify-center sm:justify-start gap-2">
                <span
                  v-if="application?.national_id"
                  class="inline-block text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md"
                >
                  هوية/إقامة: {{ application.national_id }}
                </span>
                <span
                  v-if="application?.tracking_code"
                  class="inline-block text-[10px] font-mono font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded-md"
                >
                  كود المتابعة: {{ application.tracking_code }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 self-start sm:self-center">
            <span
              class="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-xl text-xs font-black border border-indigo-500/10 shadow-sm"
            >
              ID: #{{ application?.id }}
            </span>
            <button
              @click="handleClose"
              type="button"
              class="text-slate-400 hover:text-slate-200 text-xs font-bold bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-xl transition-colors"
              :disabled="store.loading"
            >
              إغلاق ✕
            </button>
          </div>
        </div>

        <!-- شبكة التفاصيل حسب نوع الطلب (توظيف أو تدريب) -->
        <div
          v-if="application?.application_type === 'employment'"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div class="border border-slate-800/60 p-3 rounded-xl bg-slate-950/20 shadow-sm">
            <span class="block text-[10px] font-bold text-slate-500 mb-1">الوظيفة المستهدفة</span>
            <span class="text-xs font-extrabold text-sky-300">
              {{ application?.position?.title || application?.position?.name || 'غير محددة' }}
            </span>
          </div>
          <div class="border border-slate-800/60 p-3 rounded-xl bg-slate-950/20 shadow-sm">
            <span class="block text-[10px] font-bold text-slate-500 mb-1">المؤهل العلمي</span>
            <span class="text-xs font-extrabold text-slate-200">
              {{ application?.qualification || 'غير محدد' }}
            </span>
          </div>
          <div class="border border-slate-800/60 p-3 rounded-xl bg-slate-950/20 shadow-sm">
            <span class="block text-[10px] font-bold text-slate-500 mb-1">سنوات الخبرة</span>
            <span class="text-xs font-bold font-mono text-amber-400">
              {{
                application?.experience_years !== null &&
                application?.experience_years !== undefined
                  ? `${application.experience_years} سنوات`
                  : 'غير محدد'
              }}
            </span>
          </div>
          <div class="border border-slate-800/60 p-3 rounded-xl bg-slate-950/20 shadow-sm">
            <span class="block text-[10px] font-bold text-slate-500 mb-1">السيرة الذاتية (CV)</span>
            <a
              v-if="application?.cv_url"
              :href="application.cv_url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-xs font-black text-indigo-400 hover:text-indigo-300 underline"
            >
              <span>معاينة / تحميل 📄</span>
            </a>
            <span v-else class="text-xs text-slate-500 font-medium">لا يوجد ملف</span>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div class="border border-slate-800/60 p-3 rounded-xl bg-slate-950/20 shadow-sm">
            <span class="block text-[10px] font-bold text-slate-500 mb-1"
              >المنشأة التعليمية / الجامعة</span
            >
            <span class="text-xs font-extrabold text-slate-200">{{
              application?.academic_institution || 'غير محدد'
            }}</span>
          </div>
          <div class="border border-slate-800/60 p-3 rounded-xl bg-slate-950/20 shadow-sm">
            <span class="block text-[10px] font-bold text-slate-500 mb-1"
              >التخصص الدراسي الرئيسي</span
            >
            <span class="text-xs font-extrabold text-slate-200">{{
              application?.academic_major || 'غير محدد'
            }}</span>
          </div>
          <div class="border border-slate-800/60 p-3 rounded-xl bg-slate-950/20 shadow-sm">
            <span class="block text-[10px] font-bold text-slate-500 mb-1"
              >تاريخ بدء التدريب المعتمد</span
            >
            <span class="text-xs font-bold font-mono text-emerald-400">{{
              application?.internship_start_date || 'لم يحدد بعد'
            }}</span>
          </div>
          <div class="border border-slate-800/60 p-3 rounded-xl bg-slate-950/20 shadow-sm">
            <span class="block text-[10px] font-bold text-slate-500 mb-1"
              >تاريخ انتهاء فترة التدريب</span
            >
            <span class="text-xs font-bold font-mono text-rose-400">{{
              application?.internship_end_date || 'لم يحدد بعد'
            }}</span>
          </div>
        </div>

        <!-- بيانات المعاينة المجدولة مسبقاً إن وجدت -->
        <div
          v-if="application?.interview_date || application?.interview_notes"
          class="border border-sky-500/30 p-4 rounded-xl bg-sky-950/15 shadow-sm space-y-1.5"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-sky-300">🗓️ بيانات المعاينة المحددة</span>
            <span
              v-if="application?.interview_date"
              class="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20"
              dir="ltr"
            >
              {{ application.interview_date }}
            </span>
          </div>
          <p v-if="application?.interview_notes" class="text-xs text-slate-300 leading-relaxed">
            {{ application.interview_notes }}
          </p>
        </div>

        <div class="border border-slate-800/60 p-4 rounded-xl bg-slate-950/20 shadow-sm">
          <span class="block text-[10px] font-bold text-slate-500 mb-1"
            >ملاحظات خاصة ملحقة بالطلب</span
          >
          <p class="text-xs font-medium text-slate-400 leading-relaxed">
            {{ application?.notes || 'لا توجد أي ملاحظات إضافية ملحقة مع هذا الطلب.' }}
          </p>
        </div>

        <!-- ======================================================= -->
        <!-- قسم جدولة المعاينة (متاح في حالتي المعلق وقيد المعاينة) -->
        <!-- ======================================================= -->
        <div
          v-if="
            (statusType === 'pending' || statusType === 'interview') &&
            authStore.can('hr.internship_applications.interview')
          "
          class="border border-sky-800/40 rounded-2xl bg-sky-950/10 p-4 space-y-3"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-3.5 bg-sky-500 rounded-full"></span>
              <h5 class="text-xs font-black text-sky-300">مرحلة المعاينة والتقييم الأولي</h5>
            </div>

            <button
              type="button"
              @click="showInterviewForm = !showInterviewForm"
              class="px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-all"
            >
              {{
                showInterviewForm
                  ? 'إخفاء نموذج المعاينة ▲'
                  : statusType === 'interview'
                    ? 'تعديل موعد المعاينة 🗓️'
                    : 'تحديد موعد معاينة 🗓️'
              }}
            </button>
          </div>

          <div v-if="showInterviewForm" class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-400 mb-1"
                >تاريخ ووقت المعاينة *</label
              >
              <input
                v-model="interviewForm.interview_date"
                type="datetime-local"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-100 text-right focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all shadow-sm"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-400 mb-1"
                >ملاحظات / موقع المعاينة للمتقدم</label
              >
              <input
                v-model="interviewForm.interview_notes"
                type="text"
                placeholder="مثال: الحضور لمقر الإدارة مع إحضار أصل الشهادات..."
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all shadow-sm"
              />
            </div>

            <div class="sm:col-span-2 flex justify-end">
              <button
                type="button"
                @click="handleScheduleInterview"
                :disabled="store.loading"
                class="px-4 py-2 rounded-xl text-xs font-black text-white bg-sky-600 hover:bg-sky-500 shadow-md transition-all disabled:opacity-50"
              >
                {{
                  store.loading
                    ? 'جاري الحفظ...'
                    : 'حفظ موعد المعاينة ونقل الطلب لقائمة المعاينات 🗓️'
                }}
              </button>
            </div>
          </div>
        </div>

        <!-- ======================================================= -->
        <!-- قسم الاعتماد لدخول فترة التدريب (متاح في pending و interview) -->
        <!-- ======================================================= -->
        <div
          v-if="statusType === 'pending' || statusType === 'interview'"
          class="border-t border-dashed border-slate-800 pt-4 space-y-4"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-1.5 h-3.5 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500/50"
            ></span>
            <h5 class="text-xs font-black text-slate-200">
              إجراءات الاعتماد والتعميد الإداري والمالي (بدء فترة التدريب)
            </h5>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppDropdown
              id="working_schedule_id"
              label="اختر الوردية وجدول العمل لضبط الحضور *"
              v-model="approvalForm.working_schedule_id"
              :options="schedules"
              option-label="name"
              option-value="id"
              placeholder="-- برجاء اختيار جدول العمل --"
              required
            />

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-400 mb-1"
                >المكافأة / الراتب المبدئي شهرياً *</label
              >
              <input
                v-model.number="approvalForm.basic_salary"
                type="number"
                min="0"
                placeholder="أدخل 0 إذا كان التدريب غير مدفوع..."
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-100 text-right focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-sm"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-400 mb-1"
                >تاريخ بدء التدريب المعتمد *</label
              >
              <input
                v-model="approvalForm.internship_start_date"
                type="date"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-100 text-right focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-sm"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-400 mb-1"
                >تاريخ انتهاء التدريب المعتمد *</label
              >
              <input
                v-model="approvalForm.internship_end_date"
                type="date"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-100 text-right focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-sm"
              />
            </div>

            <AppDropdown
              id="department_id"
              label="الإدارة / القسم (اختياري)"
              v-model="approvalForm.department_id"
              :options="flatDepartments"
              option-label="dropdownName"
              option-value="id"
              placeholder="-- لا يتبع لقسم محدد حالياً --"
            />

            <AppDropdown
              id="manager_id"
              label="المشرف / المدير المباشر (اختياري)"
              v-model="approvalForm.manager_id"
              :options="allEmployees"
              option-label="full_name"
              option-value="id"
              placeholder="-- بدون مشرف مباشر حالياً --"
            />
          </div>
        </div>

        <div
          v-if="statusType === 'approved' || statusType === 'completed'"
          class="border-t border-dashed border-slate-800 pt-4 space-y-4"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-1.5 h-3.5 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/50"
            ></span>
            <h5 class="text-xs font-black text-slate-200">تحديث وتمديد فترات التدريب المفتوح</h5>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-400 mb-1">تاريخ بدء التدريب *</label>
              <input
                v-model="approvalForm.internship_start_date"
                type="date"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-100 text-right focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all shadow-sm"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-400 mb-1"
                >تاريخ انتهاء التدريب / التمديد المعتمد *</label
              >
              <input
                v-model="approvalForm.internship_end_date"
                type="date"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-100 text-right focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        <!-- أزرار الإجراءات السفلية -->
        <div class="border-t border-slate-800 pt-4 mt-2 flex flex-wrap justify-end gap-3 shrink-0">
          <template v-if="statusType === 'approved' || statusType === 'completed'">
            <button
              @click="handleClose"
              type="button"
              class="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
              :disabled="store.loading"
            >
              إغلاق النافذة
            </button>

            <button
              @click="handleUpdateDates"
              :disabled="store.loading"
              type="button"
              class="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg
                v-if="store.loading"
                class="animate-spin h-3.5 w-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{ store.loading ? 'جاري الحفظ...' : 'حفظ التعديلات والتمديد 💾' }}</span>
            </button>
          </template>

          <button
            v-else-if="statusType === 'rejected'"
            @click="handleClose"
            type="button"
            class="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
          >
            إغلاق النافذة
          </button>

          <template v-else-if="statusType === 'pending' || statusType === 'interview'">
            <button
              @click="handleReject"
              :disabled="store.loading"
              type="button"
              class="px-4 py-2.5 text-xs font-extrabold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {{ store.loading ? 'جاري المعالجة...' : 'رفض الطلب فوراً ❌' }}
            </button>

            <button
              @click="handleApprove"
              :disabled="store.loading"
              type="button"
              class="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg
                v-if="store.loading"
                class="animate-spin h-3.5 w-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{
                store.loading ? 'جاري التوثيق...' : 'اعتماد وقبول المتقدم للتدريب 🟢'
              }}</span>
            </button>
          </template>
        </div>
      </div>

      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isPhotoZoomed && application?.photo_url"
          class="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
          @click="isPhotoZoomed = false"
        >
          <div
            class="relative max-w-xl w-full flex flex-col items-center justify-center transform scale-100 transition-all"
          >
            <img
              :src="application.photo_url"
              class="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border-2 border-slate-800 bg-slate-900 transform -scale-x-100"
              alt="معاينة الصورة المكبرة"
            />
            <button
              @click.stop="isPhotoZoomed = false"
              type="button"
              class="mt-4 px-4 py-2 text-xs font-black text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl shadow-md transition-all active:scale-95"
            >
              ✕ إغلاق المعاينة
            </button>
          </div>
        </div>
      </Transition>
    </AppDialog>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useInternshipStore } from '@/modules/hr/stores/internshipStore'
import { useDepartmentStore } from '@/modules/hr/stores/departmentStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import { useWorkingScheduleStore } from '@/modules/hr/stores/workingScheduleStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  application: { type: Object, default: null },
  statusType: { type: String, default: 'pending' },
})

const emit = defineEmits(['update:isOpen', 'refresh'])

const toast = useToast()
const authStore = useAuthStore()
const store = useInternshipStore()

const departmentStore = useDepartmentStore()
const { flatDepartments } = storeToRefs(departmentStore)

const employeeStore = useEmployeeStore()
const { allEmployees } = storeToRefs(employeeStore)

const scheduleStore = useWorkingScheduleStore()
const { schedules } = storeToRefs(scheduleStore)

const isPhotoZoomed = ref(false)
const showInterviewForm = ref(false)

const interviewForm = ref({
  interview_date: '',
  interview_notes: '',
})

const approvalForm = ref({
  working_schedule_id: '',
  basic_salary: 0,
  department_id: null,
  manager_id: null,
  internship_start_date: '',
  internship_end_date: '',
})

// دالة تهيئة المنبثقة وحقن البيانات الحالية بشكل تفاعلي ومفتوح
const initModal = async () => {
  isPhotoZoomed.value = false
  showInterviewForm.value = false

  interviewForm.value = {
    interview_date: props.application?.interview_date
      ? props.application.interview_date.replace(' ', 'T').slice(0, 16)
      : '',
    interview_notes: props.application?.interview_notes || '',
  }

  approvalForm.value = {
    working_schedule_id: '',
    basic_salary: 0,
    department_id: props.application?.department_id || null,
    manager_id: props.application?.manager_id || null,
    internship_start_date: props.application?.internship_start_date || '',
    internship_end_date: props.application?.internship_end_date || '',
  }

  if (props.statusType === 'pending' || props.statusType === 'interview') {
    try {
      await Promise.all([
        flatDepartments.value.length === 0 ? departmentStore.fetchDepartments() : null,
        !allEmployees.value || allEmployees.value.length === 0
          ? employeeStore.fetchAllEmployees()
          : null,
        schedules.value.length === 0 ? scheduleStore.fetchSchedules({ per_page: 100 }) : null,
      ])
    } catch (err) {
      console.error('Failed to load dropdowns for approval workflow', err)
    }
  }
}

onMounted(() => {
  if (props.isOpen) {
    initModal()
  }
})

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      initModal()
    }
  },
)

const handleClose = () => {
  if (store.loading) return
  emit('update:isOpen', false)
}

// جدولة موعد المعاينة ونقل الطلب لقائمة المعاينات
const handleScheduleInterview = async () => {
  if (!interviewForm.value.interview_date) {
    return toast.error('برجاء تحديد تاريخ ووقت المعاينة أولاً.')
  }

  try {
    await store.scheduleInterview(props.application.id, {
      interview_date: interviewForm.value.interview_date.replace('T', ' '),
      interview_notes: interviewForm.value.interview_notes || null,
    })
    toast.success(`تم تحديد موعد المعاينة للمتقدم (${props.application.full_name}) بنجاح.`)
    emit('refresh')
    emit('update:isOpen', false)
  } catch {
    toast.error(store.error || 'فشلت عملية جدولة المعاينة.')
  }
}

// دالة معالجة وحفظ تعديلات وتمديد فترات التدريب المفتوحة
const handleUpdateDates = async () => {
  if (!approvalForm.value.internship_start_date) {
    return toast.error('برجاء تحديد تاريخ بدء التدريب.')
  }
  if (!approvalForm.value.internship_end_date) {
    return toast.error('برجاء تحديد تاريخ انتهاء التدريب المعتمد.')
  }
  if (
    new Date(approvalForm.value.internship_end_date) <=
    new Date(approvalForm.value.internship_start_date)
  ) {
    return toast.error('تاريخ انتهاء التدريب يجب أن يكون بعد تاريخ البدء.')
  }

  try {
    const payload = {
      internship_start_date: approvalForm.value.internship_start_date,
      internship_end_date: approvalForm.value.internship_end_date,
    }
    await store.updateInternshipDates(props.application.id, payload)
    toast.success(`تم تحديث وتمديد فترة التدريب لـ (${props.application.full_name}) بنجاح.`)
    emit('refresh')
    emit('update:isOpen', false)
  } catch {
    toast.error(store.error || 'فشلت عملية حفظ التواريخ المحدثة.')
  }
}

const handleApprove = async () => {
  if (!approvalForm.value.working_schedule_id) {
    return toast.error('برجاء تحديد جدول العمل والوردية الخاصة بالمتدرب لربط نظام الحضور.')
  }
  if (
    approvalForm.value.basic_salary === null ||
    approvalForm.value.basic_salary === undefined ||
    approvalForm.value.basic_salary < 0
  ) {
    return toast.error('برجاء إدخال قيمة المكافأة / الراتب المبدئي.')
  }
  if (!approvalForm.value.internship_start_date) {
    return toast.error('برجاء تحديد تاريخ بدء التدريب المعتمد.')
  }
  if (!approvalForm.value.internship_end_date) {
    return toast.error('برجاء تحديد تاريخ انتهاء فترة التدريب المعتمدة.')
  }
  if (
    new Date(approvalForm.value.internship_end_date) <=
    new Date(approvalForm.value.internship_start_date)
  ) {
    return toast.error('تاريخ انتهاء التدريب يجب أن يكون بعد تاريخ البدء المعتمد.')
  }

  try {
    await store.approveIntern(props.application.id, approvalForm.value)
    toast.success(`تم قبول واعتماد (${props.application.full_name}) لدخول فترة التدريب بنجاح.`)
    emit('refresh')
    emit('update:isOpen', false)
  } catch {
    toast.error(store.error || 'فشلت عملية اعتماد الطلب.')
  }
}

const handleReject = async () => {
  try {
    await store.rejectIntern(props.application.id)
    toast.success(`تم رفض الطلب المقدم من (${props.application.full_name}).`)
    emit('refresh')
    emit('update:isOpen', false)
  } catch {
    toast.error(store.error || 'فشلت عملية رفض الطلب.')
  }
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
input[type='date']::-webkit-calendar-picker-indicator,
input[type='datetime-local']::-webkit-calendar-picker-indicator {
  filter: invert(0.7) sepia(1) saturate(5) hue-rotate(175deg);
  cursor: pointer;
}
</style>
