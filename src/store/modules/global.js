import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', () => {
  const moduleType = ref('INSIDE') // 检测方式：库内检测、库外检测
  const setModuleType = (type) => {
    moduleType.value = type
  }

  return { moduleType, setModuleType }
})
