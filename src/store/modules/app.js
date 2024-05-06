import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const isCollapse = ref(false) // 后台管理菜单是否关闭
  const toggleSideBar = () => {
    isCollapse.value = !isCollapse.value
  }

  return { isCollapse, toggleSideBar }
})
