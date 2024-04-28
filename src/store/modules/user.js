import { defineStore } from 'pinia'
import store from '@/store'
import { Storage, StorageKey } from '@/utils/storage'
import { loginApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const isCollapse = ref(false)
  const login = async ({ username, password }) => {
    const data = await loginApi({ username, password })
    Storage.setItem(StorageKey.USER_TOKEN, data?.token || '')
    Storage.setItem(StorageKey.USER_INFO, data?.user || {})
  }
  const logout = () => {}

  return { isCollapse, login, logout }
})

export const useUserStoreHook = () => {
  return useUserStore(store)
}
