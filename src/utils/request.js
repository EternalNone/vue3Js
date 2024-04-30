// 在 request.js 中使用单例模式来确保只创建一个请求实例
import axios from 'axios'
import { Storage, StorageKey } from '@/utils/storage'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStoreHook } from '@/store/modules/user'

let instance = null

const createInstance = () => {
  if (!instance) {
    instance = axios.create({
      baseURL: '',
      timeout: 5000
    })

    // 请求拦截器
    instance.interceptors.request.use(
      (config) => {
        // 在发送请求之前做些什么
        config.headers['Content-Type'] = 'application/json'
        config.headers['Authorization'] = Storage.getItem(StorageKey.USER_TOKEN) || ''
        config.headers['Token'] = Storage.getItem(StorageKey.USER_TOKEN) || ''
        return config
      },
      (error) => {
        // 对请求错误做些什么
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    instance.interceptors.response.use(
      (response) => {
        // 二进制数据则直接返回
        const resData = response.data
        const responseType = response?.request?.responseType
        const code = Number(resData?.code)
        if (responseType === 'blob' || responseType === 'arraybuffer') return response
        if (
          (code === 500 ||
            code === 1011006 ||
            code === 1011007 ||
            code === 1011008 ||
            code === 1011009) &&
          !resData.isSuccess
        ) {
          ElMessageBox.alert(resData.message, '提示', {
            confirmButtonText: '重新登录',
            callback: () => {
              useUserStoreHook().logout()
              location.reload()
            }
          })
        }
        if (code === 1013002 || code === 1016002 || code === 1015002) {
          ElMessage.error(resData.message)
        }
        return resData
      },
      (error) => {
        // 对响应错误做点什么
        return Promise.reject(error)
      }
    )
  }

  return instance
}

export default createInstance()
