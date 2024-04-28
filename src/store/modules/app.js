import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const isCollapse = ref(false)
  const toggleSideBar = () => {
    isCollapse.value = !isCollapse.value
  }

  return { isCollapse, toggleSideBar }
})
