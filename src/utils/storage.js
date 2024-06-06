const STORAGE_KEY = {
  // 用户信息
  USER_INFO: 'user_info',
  // 用户token
  USER_TOKEN: 'user_token',
  // 用户角色
  USER_ROLES: 'user_roles'
}
const Storage = {
  getItem(key) {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  },
  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  removeItem(key) {
    localStorage.removeItem(key)
  },
  clear() {
    localStorage.clear()
  }
}

export { Storage, STORAGE_KEY }
