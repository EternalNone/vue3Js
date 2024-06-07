import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', () => {
  const moduleType = ref('INSIDE') // 检测方式：360检测、机器人检测
  const setModuleType = (type) => {
    moduleType.value = type
  }

  return { moduleType, setModuleType }
})
