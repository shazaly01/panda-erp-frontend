<!---src\modules\hr\views\internships\components\ManualApplicationModal.vue--->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
    @click.self="closeModal"
  >
    <div
      class="relative max-w-2xl w-full max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl text-right"
      dir="rtl"
    >
      <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div>
          <h2 class="text-lg font-black text-slate-100">إدخال طلب جديد يدوياً (محلي)</h2>
          <p class="text-xs text-slate-400 mt-0.5">
            تسجيل طلب توظيف أو تدريب مباشرة من المكتب وإصدار كود متابعة فوري للمتقدم.
          </p>
        </div>

        <button
          @click="closeModal"
          type="button"
          class="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-colors"
        >
          ✕
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- اختيار نوع الطلب -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-2">نوع الطلب *</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="form.application_type = 'employment'"
              :class="[
                'py-2.5 px-4 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-2',
                form.application_type === 'employment'
                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700',
              ]"
            >
              <span>💼 طلب توظيف مباشر</span>
            </button>

            <button
              type="button"
              @click="form.application_type = 'internship'"
              :class="[
                'py-2.5 px-4 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-2',
                form.application_type === 'internship'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700',
              ]"
            >
              <span>🎓 تدريب أكاديمي</span>
            </button>
          </div>
        </div>

        <!-- البيانات الأساسية -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">الاسم الكامل *</label>
            <input
              v-model="form.full_name"
              type="text"
              required
              placeholder="الاسم الرباعي للمتقدم"
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">رقم الهاتف *</label>
            <input
              v-model="form.phone"
              type="text"
              required
              dir="ltr"
              placeholder="09xxxxxxxx"
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 text-right focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5"
              >الرقم الوطني / الإقامة</label
            >
            <input
              v-model="form.national_id"
              type="text"
              placeholder="اختياري"
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني</label>
            <input
              v-model="form.email"
              type="email"
              dir="ltr"
              placeholder="example@domain.com"
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 text-right focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <!-- حقول طلب التوظيف -->
        <div
          v-if="form.application_type === 'employment'"
          class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-sky-950/10 border border-sky-900/30"
        >
          <div>
            <label class="block text-xs font-bold text-sky-300 mb-1.5">الوظيفة المستهدفة</label>
            <select
              v-model="form.position_id"
              class="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option :value="null">-- اختر الوظيفة (اختياري) --</option>
              <option v-for="pos in positions" :key="pos.id" :value="pos.id">
                {{ pos.title || pos.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-sky-300 mb-1.5">المؤهل العلمي</label>
            <input
              v-model="form.qualification"
              type="text"
              placeholder="مثال: بكالوريوس محاسبة"
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-sky-300 mb-1.5">سنوات الخبرة</label>
            <input
              v-model.number="form.experience_years"
              type="number"
              min="0"
              max="60"
              placeholder="0"
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <!-- حقول التدريب الأكاديمي -->
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-emerald-950/10 border border-emerald-900/30"
        >
          <div>
            <label class="block text-xs font-bold text-emerald-300 mb-1.5">الجامعة / المعهد</label>
            <input
              v-model="form.academic_institution"
              type="text"
              placeholder="اسم المؤسسة التعليمية"
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-emerald-300 mb-1.5">التخصص الدراسي</label>
            <input
              v-model="form.academic_major"
              type="text"
              placeholder="مثال: تقنية معلومات"
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-emerald-300 mb-1.5">الساعات المطلوبة</label>
            <input
              v-model.number="form.required_training_hours"
              type="number"
              min="1"
              max="999"
              placeholder="اختياري"
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <!-- المرفقات الاختيارية -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">
              صورة شخصية (اختياري)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              @change="onPhotoSelected"
              class="w-full text-xs text-slate-400 file:ml-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">
              السيرة الذاتية CV (PDF / صورة - اختياري)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/jpeg,image/png,image/jpg"
              @change="onCvSelected"
              class="w-full text-xs text-slate-400 file:ml-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
            />
          </div>
        </div>

        <!-- ملاحظات -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5">ملاحظات إضافية</label>
          <textarea
            v-model="form.notes"
            rows="2"
            placeholder="أي ملاحظات حول المتقدم أو جهة التزكية..."
            class="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            @click="closeModal"
            type="button"
            class="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            إلغاء
          </button>

          <button
            type="submit"
            :disabled="submitting"
            class="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
          >
            {{ submitting ? 'جاري الحفظ...' : 'حفظ الطلب وإصدار كود المتابعة' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useInternshipStore } from '@/modules/hr/stores/internshipStore'
import apiClient from '@/services/apiClient'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:isOpen', 'created'])

const internshipStore = useInternshipStore()
const toast = useToast()

const positions = ref([])
const submitting = ref(false)
const photoFile = ref(null)
const cvFile = ref(null)

const form = ref({
  application_type: 'employment',
  full_name: '',
  phone: '',
  email: '',
  national_id: '',
  position_id: null,
  qualification: '',
  experience_years: null,
  academic_institution: '',
  academic_major: '',
  required_training_hours: null,
  notes: '',
})

const onPhotoSelected = (e) => {
  photoFile.value = e.target.files?.[0] || null
}

const onCvSelected = (e) => {
  cvFile.value = e.target.files?.[0] || null
}

const closeModal = () => {
  emit('update:isOpen', false)
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('application_type', form.value.application_type)
    fd.append('full_name', form.value.full_name)
    fd.append('phone', form.value.phone)

    if (form.value.email) fd.append('email', form.value.email)
    if (form.value.national_id) fd.append('national_id', form.value.national_id)

    if (form.value.application_type === 'employment') {
      if (form.value.position_id) fd.append('position_id', String(form.value.position_id))
      if (form.value.qualification) fd.append('qualification', form.value.qualification)
      if (form.value.experience_years !== null && form.value.experience_years !== '') {
        fd.append('experience_years', String(form.value.experience_years))
      }
    } else {
      if (form.value.academic_institution) {
        fd.append('academic_institution', form.value.academic_institution)
      }
      if (form.value.academic_major) fd.append('academic_major', form.value.academic_major)
      if (form.value.required_training_hours) {
        fd.append('required_training_hours', String(form.value.required_training_hours))
      }
    }

    if (photoFile.value) fd.append('photo', photoFile.value)
    if (cvFile.value) fd.append('cv', cvFile.value)
    if (form.value.notes) fd.append('notes', form.value.notes)

    const created = await internshipStore.submitManualApplication(fd)
    toast.success(`تم حفظ الطلب بنجاح! كود المتابعة للمتقدم: ${created.tracking_code}`)
    emit('created', created)
    closeModal()
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      Object.values(err.response?.data?.errors || {})?.[0]?.[0] ||
      'تعذر حفظ الطلب، يرجى التحقق من البيانات.'
    toast.error(msg)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const res = await apiClient.get('/hr/positions', { params: { per_page: 100 } })
    positions.value = res.data?.data || res.data || []
  } catch {
    positions.value = []
  }
})
</script>
