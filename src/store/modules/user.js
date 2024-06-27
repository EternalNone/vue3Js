import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import store from '@/store'
import { STORAGE_KEY } from '@/constants/index'
import { loginApi, logOutApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = useStorage(STORAGE_KEY.USER_TOKEN, '')
  const userInfo = useStorage(STORAGE_KEY.USER_INFO, {})
  const roles = useStorage(STORAGE_KEY.USER_ROLES, [])

  const resetToken = () => {
    token.value = ''
    userInfo.value = {}
    roles.value = []
  }
  const login = async ({ userName, password }) => {
    const data = await loginApi({ userName, password })
    token.value = data?.token || ''
    userInfo.value = data?.user || {}
    roles.value = []
  }
  const logout = async () => {
    await logOutApi()
    token.value = ''
    userInfo.value = {}
    roles.value = []
  }

  return { roles, login, logout, resetToken }
})

export const useUserStoreHook = () => {
  return useUserStore(store)
}
