// src/stores/appStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // النظام الافتراضي عند فتح التطبيق هو المحاسبة
  const activeModule = ref('accounting')

  function setActiveModule(moduleName) {
    activeModule.value = moduleName
  }

  return { activeModule, setActiveModule }
})
