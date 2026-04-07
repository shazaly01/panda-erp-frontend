<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          class="p-2 rounded-lg bg-surface-section border border-surface-border hover:bg-surface-border transition-colors"
          title="العودة للقائمة"
        >
          <svg class="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-text-primary">
            {{ isEditMode ? 'تعديل هيكل الراتب' : 'إنشاء هيكل راتب جديد' }}
          </h1>
          <p class="text-sm text-text-muted mt-1">
            يتم هنا تجميع قواعد الرواتب (الأساسي، البدلات، الخصم) في قالب واحد يُربط بعقود الموظفين.
          </p>
        </div>
      </div>
    </div>

    <div v-if="isLoadingData" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>

    <div v-else class="space-y-6">
      <AppCard class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="md:col-span-2">
            <AppInput
              id="struct-name"
              label="اسم الهيكل *"
              v-model="form.name"
              placeholder="مثلاً: هيكل موظفي الإدارة، هيكل العمال، هيكل السودان..."
              required
            />
          </div>
          <div>
            <div class="flex items-center gap-3 pt-8">
              <AppCheckbox v-model="form.is_active" label="الهيكل نشط ومتاح للاستخدام" />
            </div>
          </div>
          <div class="md:col-span-3">
            <AppTextarea
              id="struct-desc"
              label="الوصف"
              v-model="form.description"
              placeholder="وصف إضافي لهذا الهيكل..."
              rows="2"
            />
          </div>
        </div>
      </AppCard>

      <AppCard class="p-6">
        <div class="flex justify-between items-center mb-5 border-b border-surface-border pb-3">
          <h2 class="text-lg font-bold text-text-primary flex items-center gap-2">
            <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            القواعد المدرجة في هذا الهيكل
          </h2>
          <AppButton size="sm" variant="secondary" @click="addRuleRow" icon="plus">
            إضافة قاعدة للهيكل
          </AppButton>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-surface-border">
            <thead>
              <tr class="text-right text-xs font-medium text-text-muted uppercase">
                <th class="px-4 py-2">الترتيب (Seq)</th>
                <th class="px-4 py-2">قاعدة الراتب</th>
                <th class="px-4 py-2 text-left">إجراء</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-border">
              <tr v-for="(ruleRow, index) in form.rules" :key="index">
                <td class="px-4 py-3 w-32">
                  <AppInput
                    type="number"
                    v-model="ruleRow.sequence"
                    class="font-mono text-center"
                    required
                  />
                </td>
                <td class="px-4 py-3">
                  <AppDropdown
                    v-model="ruleRow.rule_id"
                    :options="salaryRuleStore.rules"
                    option-label="name"
                    option-value="id"
                    placeholder="-- اختر القاعدة --"
                  />
                </td>
                <td class="px-4 py-3 text-left w-20">
                  <button
                    @click="removeRuleRow(index)"
                    class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <tr v-if="form.rules.length === 0">
                <td colspan="3" class="px-4 py-8 text-center text-text-muted italic">
                  لا توجد قواعد مضافة بعد. اضغط على "إضافة قاعدة" للبدء.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppCard>

      <div class="flex justify-end gap-3 pt-2">
        <AppButton variant="secondary" @click="goBack" :disabled="isSaving"> إلغاء </AppButton>
        <AppButton @click="submit" :disabled="isSaving">
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>{{ isEditMode ? 'تحديث الهيكل' : 'اعتماد وحفظ الهيكل' }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

import { useSalaryStructureStore } from '@/modules/hr/stores/salaryStructureStore'
import { useSalaryRuleStore } from '@/modules/hr/stores/salaryRuleStore'

import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const structureStore = useSalaryStructureStore()
const salaryRuleStore = useSalaryRuleStore()

const isEditMode = computed(() => route.name === 'salary-structures.edit')
const structureId = computed(() => route.params.id)

const isLoadingData = ref(false)
const isSaving = ref(false)

// --- نموذج البيانات (Form State) ---
const form = ref({
  name: '',
  description: '',
  is_active: true,
  rules: [], // مصفوفة تحتوي على { rule_id, sequence }
})

onMounted(async () => {
  isLoadingData.value = true
  try {
    // جلب القواعد المتاحة للاختيار منها
    await salaryRuleStore.fetchRules({ per_page: 100 })

    if (isEditMode.value) {
      const data = await structureStore.fetchStructureById(structureId.value)
      form.value = {
        name: data.name,
        description: data.description || '',
        is_active: !!data.is_active,
        rules: data.rules
          ? data.rules.map((r) => ({
              rule_id: r.id,
              sequence: r.pivot?.sequence || 1, // Pivot إذا كان قادماً من علاقة Many-to-Many
            }))
          : [],
      }
    }
  } catch (error) {
    toast.error('حدث خطأ أثناء تحميل البيانات.')
    goBack()
  } finally {
    isLoadingData.value = false
  }
})

// --- إدارة صفوف القواعد ---
const addRuleRow = () => {
  const nextSequence =
    form.value.rules.length > 0
      ? Math.max(...form.value.rules.map((r) => parseInt(r.sequence))) + 1
      : 1

  form.value.rules.push({
    rule_id: null,
    sequence: nextSequence,
  })
}

const removeRuleRow = (index) => {
  form.value.rules.splice(index, 1)
}

// --- الإجراءات العامة ---
const goBack = () => {
  router.push({ name: 'SalaryStructuresList' })
}

const submit = async () => {
  if (!form.value.name.trim()) return toast.error('اسم الهيكل مطلوب.')

  // التأكد من أن جميع القواعد المضافة تم اختيارها
  const hasEmptyRule = form.value.rules.some((r) => !r.rule_id)
  if (hasEmptyRule) return toast.error('يرجى اختيار قاعدة الراتب لكل الصفوف المضافة.')

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await structureStore.updateStructure(structureId.value, form.value)
      toast.success('تم تحديث هيكل الراتب بنجاح.')
    } else {
      await structureStore.createStructure(form.value)
      toast.success('تم إنشاء هيكل الراتب بنجاح.')
    }
    goBack()
  } catch (error) {
    toast.error(error.response?.data?.message || 'فشل حفظ الهيكل.')
  } finally {
    isSaving.value = false
  }
}
</script>
