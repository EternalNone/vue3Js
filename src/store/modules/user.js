import { defineStore } from 'pinia'
import store from '@/store'
import { Storage, StorageKey } from '@/utils/storage'
import { loginApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(Storage.getItem(StorageKey.USER_TOKEN) || '')
  const userInfo = ref(Storage.getItem(StorageKey.USER_INFO) || {})
  const roles = ref([])

  const resetToken = () => {
    token.value = ''
    userInfo.value = {}
    roles.value = []
  }
  const login = async ({ username, password }) => {
    const data = await loginApi({ username, password })
    Storage.setItem(StorageKey.USER_TOKEN, data?.token || '')
    Storage.setItem(StorageKey.USER_INFO, data?.user || {})
    Storage.setItem(StorageKey.USER_ROLES, [])
    token.value = data?.token || ''
    userInfo.value = data?.user || {}
    roles.value = []
  }
  const logout = () => {
    Storage.removeItem(StorageKey.USER_TOKEN)
    Storage.removeItem(StorageKey.USER_INFO)
    token.value = ''
    userInfo.value = {}
  }

  return { roles, login, logout, resetToken }
})

export const useUserStoreHook = () => {
  return useUserStore(store)
}
