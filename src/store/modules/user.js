import { defineStore } from 'pinia'
import store from '@/store'
import { Storage, STORAGE_KEY } from '@/utils/storage'
import { loginApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(Storage.getItem(STORAGE_KEY.USER_TOKEN) || '')
  const userInfo = ref(Storage.getItem(STORAGE_KEY.USER_INFO) || {})
  const roles = ref([])

  const resetToken = () => {
    token.value = ''
    userInfo.value = {}
    roles.value = []
  }
  const login = async ({ username, password }) => {
    const data = await loginApi({ username, password })
    Storage.setItem(STORAGE_KEY.USER_TOKEN, data?.token || '')
    Storage.setItem(STORAGE_KEY.USER_INFO, data?.user || {})
    Storage.setItem(STORAGE_KEY.USER_ROLES, [])
    token.value = data?.token || ''
    userInfo.value = data?.user || {}
    roles.value = []
  }
  const logout = () => {
    Storage.removeItem(STORAGE_KEY.USER_TOKEN)
    Storage.removeItem(STORAGE_KEY.USER_INFO)
    token.value = ''
    userInfo.value = {}
  }

  return { roles, login, logout, resetToken }
})

export const useUserStoreHook = () => {
  return useUserStore(store)
}
