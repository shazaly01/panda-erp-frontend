<!-- src/modules/hr/views/disciplinary/components/ViolationTypeModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="dialogTitle"
    size="5xl"
    border-color="border-primary"
    :loading="isSubmitting"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <!-- مؤشر التحميل عند جلب بيانات اللائحة للتعديل -->
    <div v-if="isLoadingData" class="flex flex-col items-center justify-center py-16 gap-3">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <span class="text-xs text-text-muted font-bold"
        >جاري تحميل بيانات اللائحة وسلم التدرج...</span
      >
    </div>

    <!-- نموذج اللائحة وسلم التدرج العقابي -->
    <form
      v-else
      @submit.prevent="handleSubmit"
      @keydown.ctrl.enter.prevent="handleSubmit"
      class="space-y-4 font-sans text-right"
      dir="rtl"
    >
      <!-- تنبيه أخطاء الخادم العامة إن وجدت -->
      <div
        v-if="generalError"
        class="px-3.5 py-2.5 rounded-xl bg-danger/10 border border-danger/35 text-danger text-xs font-bold"
      >
        {{ generalError }}
      </div>

      <!-- =========================================================
             البطاقة 1: البيانات الأساسية للائحة وشروط الرصد
             ========================================================= -->
      <div
        class="violation-card bg-surface-section/70 border border-surface-border p-4 rounded-xl space-y-3.5 transition-all duration-200"
      >
        <div class="flex items-center justify-between border-b border-surface-border/70 pb-2">
          <h3 class="text-xs font-black text-text-primary flex items-center gap-2">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>البيانات الأساسية للائحة وآلية الرصد</span>
          </h3>
          <span class="text-[11px] text-text-muted font-medium">
            الحقول المميزة بـ (*) إلزامية
          </span>
        </div>

        <!-- الصف الأول: اسم اللائحة + الكود + طريقة الرصد -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
          <!-- اسم اللائحة -->
          <div class="md:col-span-5">
            <label for="vt-name" class="block text-xs font-bold text-text-secondary mb-1.5">
              اسم اللائحة / نوع المخالفة *
            </label>
            <AppInput
              id="vt-name"
              type="text"
              v-model="form.name"
              placeholder="مثال: التأخير الصباحي عن موعد بدء الوردية"
              class="bg-surface-card"
              required
            />
            <p v-if="getFieldError('name')" class="mt-1 text-[11px] text-danger font-bold">
              {{ getFieldError('name') }}
            </p>
          </div>

          <!-- الكود المرجعي -->
          <div class="md:col-span-3">
            <label for="vt-code" class="block text-xs font-bold text-text-secondary mb-1.5">
              الكود المرجعي *
            </label>
            <AppInput
              id="vt-code"
              type="text"
              v-model="form.code"
              @blur="normalizeCode"
              placeholder="مثال: LATE_ARRIVAL"
              class="bg-surface-card font-mono font-bold uppercase"
              dir="ltr"
              required
            />
            <p v-if="getFieldError('code')" class="mt-1 text-[11px] text-danger font-bold">
              {{ getFieldError('code') }}
            </p>
          </div>

          <!-- طريقة الرصد -->
          <div class="md:col-span-4">
            <label for="vt-detection" class="block text-xs font-bold text-text-secondary mb-1.5">
              طريقة الرصد والتفعيل *
            </label>
            <div class="relative w-full h-[40px] flex items-center">
              <select
                id="vt-detection"
                v-model="form.detection_mode"
                @change="handleDetectionModeChange"
                class="w-full h-[40px] pr-3 pl-8 bg-surface-card border border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg text-text-primary text-xs font-bold outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="manual" class="bg-surface-section text-text-primary">
                  رصد يدوي / إداري (بواسطة المشرف أو HR)
                </option>
                <option value="attendance_late" class="bg-surface-section text-text-primary">
                  آلي من البصمة - التأخير الصباحي
                </option>
                <option value="attendance_early_leave" class="bg-surface-section text-text-primary">
                  آلي من البصمة - الانصراف المبكر
                </option>
                <option value="attendance_absent" class="bg-surface-section text-text-primary">
                  آلي من البصمة - الغياب بدون إذن
                </option>
              </select>
              <span
                class="absolute left-3 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
              >
                ▼
              </span>
            </div>
            <p
              v-if="getFieldError('detection_mode')"
              class="mt-1 text-[11px] text-danger font-bold"
            >
              {{ getFieldError('detection_mode') }}
            </p>
          </div>
        </div>

        <!-- الصف الثاني (يظهر فقط عند اختيار رصد آلي من البصمة) -->
        <div
          v-if="isAutomatedMode"
          class="grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-3 rounded-xl bg-info/8 border border-info/25"
        >
          <!-- آلية التفعيل -->
          <div class="md:col-span-4">
            <label for="vt-trigger" class="block text-xs font-bold text-text-secondary mb-1.5">
              آلية احتساب المخالفة *
            </label>
            <div class="relative w-full h-[40px] flex items-center">
              <select
                id="vt-trigger"
                v-model="form.trigger_mode"
                class="w-full h-[40px] pr-3 pl-8 bg-surface-card border border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg text-text-primary text-xs font-bold outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="per_incident" class="bg-surface-section text-text-primary">
                  لكل مخالفة / حادثة مستقلة
                </option>
                <option value="cumulative_monthly" class="bg-surface-section text-text-primary">
                  تراكمي خلال الفترة المالية
                </option>
              </select>
              <span
                class="absolute left-3 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
              >
                ▼
              </span>
            </div>
            <p v-if="getFieldError('trigger_mode')" class="mt-1 text-[11px] text-danger font-bold">
              {{ getFieldError('trigger_mode') }}
            </p>
          </div>

          <!-- الحد الأدنى للدقائق أو الأيام -->
          <div class="md:col-span-4">
            <label for="vt-threshold" class="block text-xs font-bold text-text-secondary mb-1.5">
              {{
                form.detection_mode === 'attendance_absent'
                  ? 'الحد الأدنى لأيام الغياب *'
                  : 'الحد الأدنى للدقائق (بعد السماح) *'
              }}
            </label>
            <AppInput
              id="vt-threshold"
              type="number"
              min="0"
              max="10000"
              v-model.number="form.threshold_minutes"
              class="bg-surface-card font-mono font-bold text-center"
              dir="ltr"
              required
            />
            <p
              v-if="getFieldError('threshold_minutes')"
              class="mt-1 text-[11px] text-danger font-bold"
            >
              {{ getFieldError('threshold_minutes') }}
            </p>
          </div>

          <!-- الحد الأقصى للدقائق (اختياري لشرائح التأخير) -->
          <div v-if="form.detection_mode !== 'attendance_absent'" class="md:col-span-4">
            <label
              for="vt-max-threshold"
              class="block text-xs font-bold text-text-secondary mb-1.5"
            >
              الحد الأقصى للدقائق (اختياري)
            </label>
            <AppInput
              id="vt-max-threshold"
              type="number"
              min="1"
              max="10000"
              v-model.number="form.max_threshold_minutes"
              placeholder="مفتوح (بدون سقف)"
              class="bg-surface-card font-mono font-bold text-center"
              dir="ltr"
            />
            <p
              v-if="getFieldError('max_threshold_minutes')"
              class="mt-1 text-[11px] text-danger font-bold"
            >
              {{ getFieldError('max_threshold_minutes') }}
            </p>
          </div>
        </div>

        <!-- الصف الثالث: الوصف + خيارات الاعتماد والتفعيل -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <!-- الوصف -->
          <div class="md:col-span-6">
            <label for="vt-desc" class="block text-xs font-bold text-text-secondary mb-1.5">
              وصف اللائحة ونطاق تطبيقها
            </label>
            <AppInput
              id="vt-desc"
              type="text"
              v-model="form.description"
              placeholder="شرح مختصر يظهر للمشرفين والموظفين..."
              class="bg-surface-card"
            />
          </div>

          <!-- يتطلب اعتماد مسبق -->
          <div class="md:col-span-3 pt-0 md:pt-5">
            <label
              class="flex items-center gap-2.5 h-[40px] px-3 rounded-lg bg-surface-card border border-surface-border hover:border-primary/50 cursor-pointer select-none transition-colors"
            >
              <input
                type="checkbox"
                v-model="form.requires_approval"
                class="w-4 h-4 rounded border-surface-border text-primary focus:ring-primary/25 accent-primary cursor-pointer"
              />
              <span class="text-xs font-bold text-text-primary">يتطلب اعتماد HR</span>
            </label>
          </div>

          <!-- حالة التفعيل -->
          <div class="md:col-span-3 pt-0 md:pt-5">
            <label
              class="flex items-center gap-2.5 h-[40px] px-3 rounded-lg bg-surface-card border border-surface-border hover:border-primary/50 cursor-pointer select-none transition-colors"
            >
              <input
                type="checkbox"
                v-model="form.is_active"
                class="w-4 h-4 rounded border-surface-border text-primary focus:ring-primary/25 accent-primary cursor-pointer"
              />
              <span class="text-xs font-bold text-text-primary">اللائحة نشطة ومفعّلة</span>
            </label>
          </div>
        </div>
      </div>

      <!-- =========================================================
             البطاقة 2: بناء سلم التدرج العقابي (الدرجات المتسلسلة)
             ========================================================= -->
      <div
        class="bg-surface-card/85 border border-primary/35 p-4 rounded-xl shadow-2xs space-y-3 transition-all duration-200"
      >
        <div
          class="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border/70 pb-2.5"
        >
          <div>
            <h3 class="text-xs font-black text-text-primary flex items-center gap-2">
              <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
              <span>سلم التدرج العقابي (حسب تكرار المخالفة خلال فترة السريان)</span>
            </h3>
            <p class="text-[11px] text-text-muted mt-0.5 pr-3.5">
              يُصعّد النظام الموظف تلقائياً من الدرجة (1) إلى الدرجة التالية عند تكرار المخالفة قبل
              انقضاء مدة السقوط بالتقادم.
            </p>
          </div>

          <button
            type="button"
            @click="addStep"
            class="h-8 px-3 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/35 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>إضافة درجة جديدة</span>
          </button>
        </div>

        <p v-if="getFieldError('steps')" class="text-xs text-danger font-bold">
          {{ getFieldError('steps') }}
        </p>

        <!-- جدول درجات التدرج -->
        <div class="overflow-x-auto rounded-xl border border-surface-border">
          <table class="w-full border-collapse text-right text-xs">
            <thead
              class="bg-surface-ground text-text-secondary border-b border-surface-border select-none"
            >
              <tr>
                <th class="px-2.5 py-2.5 w-20 text-center font-black">الدرجة</th>
                <th class="px-2.5 py-2.5 min-w-[185px] font-black">نوع العقوبة *</th>
                <th class="px-2.5 py-2.5 min-w-[140px] font-black">نوع الخصم المالي</th>
                <th class="px-2.5 py-2.5 w-28 text-center font-black">قيمة الخصم</th>
                <th class="px-2.5 py-2.5 w-28 text-center font-black">أيام الإيقاف</th>
                <th class="px-2.5 py-2.5 w-28 text-center font-black">السقوط (أشهر) *</th>
                <th class="px-2.5 py-2.5 min-w-[160px] font-black">ملاحظة / نص القرار</th>
                <th class="px-2.5 py-2.5 w-12 text-center font-bold">حذف</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-surface-border/70 bg-surface-section">
              <tr
                v-for="(step, index) in form.steps"
                :key="step._key"
                class="hover:bg-primary/5 transition-colors align-top"
              >
                <!-- 1. رقم الدرجة -->
                <td class="px-2.5 py-2.5 text-center align-middle">
                  <span
                    class="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-primary/12 text-primary border border-primary/30 font-mono font-black text-xs"
                  >
                    {{ index + 1 }}
                  </span>
                </td>

                <!-- 2. نوع العقوبة -->
                <td class="px-2.5 py-2.5">
                  <div class="relative w-full h-9 flex items-center">
                    <select
                      v-model="step.action_type"
                      @change="handleStepActionTypeChange(step)"
                      class="w-full h-9 pr-2.5 pl-7 bg-surface-card border border-surface-border focus:border-primary rounded-lg text-text-primary text-xs font-bold outline-none appearance-none cursor-pointer"
                    >
                      <option value="verbal_warning" class="bg-surface-section text-text-primary">
                        إنذار شفهي
                      </option>
                      <option value="written_warning" class="bg-surface-section text-text-primary">
                        إنذار كتابي
                      </option>
                      <option value="salary_deduction" class="bg-surface-section text-text-primary">
                        خصم مالي من الراتب
                      </option>
                      <option value="suspension" class="bg-surface-section text-text-primary">
                        إيقاف مؤقت عن العمل
                      </option>
                      <option value="termination" class="bg-surface-section text-text-primary">
                        توصية بإنهاء الخدمة
                      </option>
                    </select>
                    <span
                      class="absolute left-2 inset-y-0 flex items-center text-text-muted pointer-events-none text-[8px]"
                    >
                      ▼
                    </span>
                  </div>
                  <p
                    v-if="getFieldError(`steps.${index}.action_type`)"
                    class="mt-1 text-[10px] text-danger font-bold"
                  >
                    {{ getFieldError(`steps.${index}.action_type`) }}
                  </p>
                </td>

                <!-- 3. نوع الخصم المالي -->
                <td class="px-2.5 py-2.5">
                  <div
                    v-if="step.action_type !== 'termination'"
                    class="relative w-full h-9 flex items-center"
                  >
                    <select
                      v-model="step.deduction_type"
                      @change="handleStepDeductionTypeChange(step)"
                      class="w-full h-9 pr-2.5 pl-7 bg-surface-card border border-surface-border focus:border-primary rounded-lg text-text-primary text-xs font-bold outline-none appearance-none cursor-pointer"
                    >
                      <option
                        v-if="step.action_type !== 'salary_deduction'"
                        value="none"
                        class="bg-surface-section text-text-muted"
                      >
                        بدون خصم مالي
                      </option>
                      <option value="days" class="bg-surface-section text-text-primary">
                        خصم بالأيام
                      </option>
                      <option value="fixed" class="bg-surface-section text-text-primary">
                        مبلغ مقطوع
                      </option>
                      <option value="percentage" class="bg-surface-section text-text-primary">
                        نسبة من الأساسي (%)
                      </option>
                    </select>
                    <span
                      class="absolute left-2 inset-y-0 flex items-center text-text-muted pointer-events-none text-[8px]"
                    >
                      ▼
                    </span>
                  </div>
                  <div
                    v-else
                    class="h-9 px-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-[10px] font-bold flex items-center justify-center text-center"
                  >
                    يتطلب اعتماد HR
                  </div>
                </td>

                <!-- 4. قيمة الخصم -->
                <td class="px-2.5 py-2.5">
                  <template
                    v-if="step.action_type !== 'termination' && step.deduction_type !== 'none'"
                  >
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      v-model.number="step.deduction_value"
                      :placeholder="step.deduction_type === 'days' ? '0.5' : '0'"
                      class="w-full h-9 px-2 bg-surface-card border border-surface-border focus:border-primary rounded-lg text-primary font-mono font-black text-xs text-center outline-none"
                      dir="ltr"
                    />
                    <p
                      v-if="getFieldError(`steps.${index}.deduction_value`)"
                      class="mt-1 text-[10px] text-danger font-bold"
                    >
                      {{ getFieldError(`steps.${index}.deduction_value`) }}
                    </p>
                  </template>
                  <div
                    v-else
                    class="h-9 flex items-center justify-center text-text-muted/40 font-mono select-none"
                  >
                    —
                  </div>
                </td>

                <!-- 5. أيام الإيقاف المؤقت -->
                <td class="px-2.5 py-2.5">
                  <template v-if="step.action_type === 'suspension'">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      v-model.number="step.suspension_days"
                      @input="handleSuspensionDaysInput(step)"
                      class="w-full h-9 px-2 bg-surface-card border border-orange-500/40 focus:border-primary rounded-lg text-orange-600 dark:text-orange-300 font-mono font-black text-xs text-center outline-none"
                      dir="ltr"
                    />
                    <p
                      v-if="getFieldError(`steps.${index}.suspension_days`)"
                      class="mt-1 text-[10px] text-danger font-bold"
                    >
                      {{ getFieldError(`steps.${index}.suspension_days`) }}
                    </p>
                  </template>
                  <div
                    v-else
                    class="h-9 flex items-center justify-center text-text-muted/40 font-mono select-none"
                  >
                    —
                  </div>
                </td>

                <!-- 6. مدة السقوط بالتقادم (أشهر) -->
                <td class="px-2.5 py-2.5">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    v-model.number="step.validity_months"
                    class="w-full h-9 px-2 bg-surface-card border border-surface-border focus:border-primary rounded-lg text-text-primary font-mono font-bold text-xs text-center outline-none"
                    dir="ltr"
                    required
                  />
                  <p
                    v-if="getFieldError(`steps.${index}.validity_months`)"
                    class="mt-1 text-[10px] text-danger font-bold"
                  >
                    {{ getFieldError(`steps.${index}.validity_months`) }}
                  </p>
                </td>

                <!-- 7. ملاحظات الدرجة -->
                <td class="px-2.5 py-2.5">
                  <input
                    type="text"
                    v-model="step.notes"
                    placeholder="وصف القرار..."
                    class="w-full h-9 px-2.5 bg-surface-card border border-surface-border focus:border-primary rounded-lg text-text-primary text-xs font-medium outline-none"
                  />
                </td>

                <!-- 8. زر حذف الدرجة -->
                <td class="px-2.5 py-2.5 text-center align-middle">
                  <button
                    type="button"
                    @click="removeStep(index)"
                    :disabled="form.steps.length <= 1"
                    class="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="حذف هذه الدرجة"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- =========================================================
             شريط الأزرار السفلي
             ========================================================= -->
      <div class="flex items-center justify-between gap-3 pt-2 border-t border-surface-border">
        <span class="text-[11px] text-text-muted hidden sm:inline">
          اختصار الحفظ السريع:
          <kbd
            class="px-1.5 py-0.5 rounded bg-surface-section border border-surface-border font-mono text-[10px]"
            >Ctrl + Enter</kbd
          >
        </span>

        <div class="flex items-center gap-2.5 mr-auto">
          <AppButton
            type="button"
            variant="secondary"
            @click="handleClose"
            :disabled="isSubmitting"
          >
            إلغاء
          </AppButton>

          <AppButton type="submit" :disabled="isSubmitting">
            <span v-if="isSubmitting">جاري حفظ اللائحة...</span>
            <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'حفظ اللائحة وسلم الجزاءات' }}</span>
          </AppButton>
        </div>
      </div>
    </form>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useViolationTypeStore } from '@/modules/hr/stores/violationTypeStore'

import AppDialog from '@/components/ui/AppDialog.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  violationTypeId: { type: [Number, String], default: null },
})

const emit = defineEmits(['update:modelValue', 'close', 'saved'])

const toast = useToast()
const violationTypeStore = useViolationTypeStore()

const isEditMode = computed(() => Boolean(props.violationTypeId))
const isLoadingData = ref(false)
const isSubmitting = ref(false)
const generalError = ref('')
const validationErrors = ref({})

const dialogTitle = computed(() =>
  isEditMode.value ? 'تعديل لائحة المخالفة وسلم التدرج العقابي' : 'إضافة لائحة مخالفة جديدة',
)

const createDefaultStep = (stepNumber = 1) => ({
  _key: Date.now() + Math.random(),
  step_order: stepNumber,
  action_type:
    stepNumber === 1 ? 'verbal_warning' : stepNumber === 2 ? 'written_warning' : 'salary_deduction',
  deduction_type: stepNumber >= 3 ? 'days' : 'none',
  deduction_value: stepNumber >= 3 ? 0.5 : 0,
  suspension_days: 0,
  validity_months: stepNumber === 1 ? 3 : stepNumber === 2 ? 6 : 12,
  notes: '',
})

const buildInitialForm = () => ({
  name: '',
  code: '',
  description: '',
  detection_mode: 'manual',
  trigger_mode: 'per_incident',
  threshold_minutes: 0,
  max_threshold_minutes: null,
  requires_approval: true,
  is_active: true,
  steps: [createDefaultStep(1), createDefaultStep(2), createDefaultStep(3)],
})

const form = ref(buildInitialForm())

const isAutomatedMode = computed(() => form.value.detection_mode !== 'manual')

const normalizeCode = () => {
  if (!form.value.code) return
  form.value.code = form.value.code.trim().replace(/\s+/g, '_').toUpperCase()
}

const handleDetectionModeChange = () => {
  if (form.value.detection_mode === 'manual') {
    form.value.trigger_mode = 'per_incident'
    form.value.threshold_minutes = 0
    form.value.max_threshold_minutes = null
  } else if (form.value.detection_mode === 'attendance_absent') {
    form.value.threshold_minutes = 1
    form.value.max_threshold_minutes = null
  } else if (Number(form.value.threshold_minutes) === 0) {
    form.value.threshold_minutes = 15
  }
}

const handleStepActionTypeChange = (step) => {
  if (step.action_type === 'termination') {
    step.deduction_type = 'none'
    step.deduction_value = 0
    step.suspension_days = 0
    return
  }

  if (step.action_type === 'salary_deduction') {
    step.suspension_days = 0
    if (step.deduction_type === 'none') {
      step.deduction_type = 'days'
    }
    if (!step.deduction_value || Number(step.deduction_value) <= 0) {
      step.deduction_value = 0.5
    }
    return
  }

  if (step.action_type === 'suspension') {
    if (!step.suspension_days || Number(step.suspension_days) < 1) {
      step.suspension_days = 3
    }
    step.deduction_type = 'days'
    step.deduction_value = Number(step.suspension_days)
    return
  }

  // الإنذار الشفهي أو الكتابي: افتراضياً بدون خصم مالي مع إبقائه قابلاً للتعديل
  step.suspension_days = 0
  step.deduction_type = 'none'
  step.deduction_value = 0
}

const handleStepDeductionTypeChange = (step) => {
  if (step.deduction_type === 'none') {
    step.deduction_value = 0
  } else if (!step.deduction_value || Number(step.deduction_value) <= 0) {
    step.deduction_value = step.deduction_type === 'days' ? 0.5 : 0
  }
}

const handleSuspensionDaysInput = (step) => {
  const days = Number(step.suspension_days) || 0
  if (step.action_type === 'suspension' && step.deduction_type === 'days') {
    step.deduction_value = days
  }
}

const addStep = () => {
  const nextNumber = form.value.steps.length + 1
  form.value.steps.push(createDefaultStep(nextNumber))
}

const removeStep = (index) => {
  if (form.value.steps.length <= 1) return
  form.value.steps.splice(index, 1)
}

const getFieldError = (path) => {
  return validationErrors.value?.[path]?.[0] || null
}

const populateFormFromData = (data) => {
  const incomingSteps =
    Array.isArray(data.steps) && data.steps.length > 0
      ? data.steps.map((s, idx) => ({
          _key: Date.now() + idx + Math.random(),
          step_order: idx + 1,
          action_type: s.action_type || 'verbal_warning',
          deduction_type: s.deduction_type || 'none',
          deduction_value: Number(s.deduction_value) || 0,
          suspension_days: Number(s.suspension_days) || 0,
          validity_months: Number(s.validity_months) || 3,
          notes: s.notes || '',
        }))
      : [createDefaultStep(1)]

  form.value = {
    name: data.name || '',
    code: data.code || '',
    description: data.description || '',
    detection_mode: data.detection_mode || 'manual',
    trigger_mode: data.trigger_mode || 'per_incident',
    threshold_minutes: Number(data.threshold_minutes) || 0,
    max_threshold_minutes:
      data.max_threshold_minutes !== null && data.max_threshold_minutes !== undefined
        ? Number(data.max_threshold_minutes)
        : null,
    requires_approval: Boolean(data.requires_approval),
    is_active: Boolean(data.is_active),
    steps: incomingSteps,
  }
}

const loadModalData = async () => {
  generalError.value = ''
  validationErrors.value = {}

  if (!isEditMode.value) {
    form.value = buildInitialForm()
    isLoadingData.value = false
    return
  }

  // قراءة سريعة من المخزن إن كانت البيانات محمّلة مسبقاً، مع التحديث من الخادم
  const cached = violationTypeStore.violationTypes.find(
    (item) => String(item.id) === String(props.violationTypeId),
  )

  if (cached && Array.isArray(cached.steps)) {
    populateFormFromData(cached)
    isLoadingData.value = false
    return
  }

  isLoadingData.value = true
  try {
    const fetched = await violationTypeStore.fetchViolationTypeById(props.violationTypeId)
    if (fetched) {
      populateFormFromData(fetched)
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'تعذر تحميل بيانات اللائحة المطلوبة.')
    handleClose(true)
  } finally {
    isLoadingData.value = false
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      await loadModalData()
    } else {
      validationErrors.value = {}
      generalError.value = ''
    }
  },
  { immediate: true },
)

const handleSubmit = async () => {
  generalError.value = ''
  validationErrors.value = {}
  normalizeCode()

  if (!form.value.name?.trim()) {
    toast.warning('يرجى إدخال اسم اللائحة أو نوع المخالفة.')
    return
  }

  if (!form.value.code?.trim()) {
    toast.warning('يرجى إدخال الكود المرجعي للائحة.')
    return
  }

  if (!Array.isArray(form.value.steps) || form.value.steps.length === 0) {
    toast.warning('يجب إضافة درجة واحدة على الأقل في سلم التدرج العقابي.')
    return
  }

  const maxThreshold =
    isAutomatedMode.value &&
    form.value.detection_mode !== 'attendance_absent' &&
    form.value.max_threshold_minutes !== '' &&
    form.value.max_threshold_minutes !== null &&
    Number(form.value.max_threshold_minutes) > 0
      ? Number(form.value.max_threshold_minutes)
      : null

  const payload = {
    name: form.value.name.trim(),
    code: form.value.code.trim(),
    description: form.value.description?.trim() || null,
    detection_mode: form.value.detection_mode,
    trigger_mode: isAutomatedMode.value ? form.value.trigger_mode : 'per_incident',
    threshold_minutes: isAutomatedMode.value ? Number(form.value.threshold_minutes) || 0 : 0,
    max_threshold_minutes: maxThreshold,
    requires_approval: Boolean(form.value.requires_approval),
    is_active: Boolean(form.value.is_active),
    steps: form.value.steps.map((step, index) => ({
      step_order: index + 1,
      action_type: step.action_type,
      deduction_type: step.action_type === 'termination' ? 'none' : step.deduction_type,
      deduction_value:
        step.action_type === 'termination' || step.deduction_type === 'none'
          ? 0
          : Number(step.deduction_value) || 0,
      suspension_days:
        step.action_type === 'suspension' ? Math.max(1, Number(step.suspension_days) || 1) : 0,
      validity_months: Math.max(1, Number(step.validity_months) || 3),
      notes: step.notes?.trim() || null,
    })),
  }

  isSubmitting.value = true
  try {
    let savedItem = null
    if (isEditMode.value) {
      savedItem = await violationTypeStore.updateViolationType(props.violationTypeId, payload)
      toast.success('تم تحديث لائحة المخالفة وسلم التدرج العقابي بنجاح.')
    } else {
      savedItem = await violationTypeStore.createViolationType(payload)
      toast.success('تم إنشاء لائحة المخالفة وسلم التدرج العقابي بنجاح.')
    }

    emit('saved', savedItem)
    handleClose(true)
  } catch (err) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors
      generalError.value = err.response.data.message || 'يرجى مراجعة الحقول الموضحة أدناه.'
    } else {
      generalError.value = err.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات اللائحة.'
    }
    toast.error(generalError.value)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = (force = false) => {
  if (isSubmitting.value && !force) return
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.violation-card :deep(input),
.violation-card :deep(select) {
  height: 40px !important;
  min-height: 40px !important;
  border-radius: 0.5rem !important;
  box-sizing: border-box !important;
}

.violation-card :deep(input) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
}
</style>
