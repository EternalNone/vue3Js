// 在 request.js 中使用单例模式来确保只创建一个请求实例
import axios from 'axios'
import { STORAGE_KEY } from '@/constants/index'
import { ElMessage } from 'element-plus'
import { useUserStoreHook } from '@/store/modules/user'

let instance = null

const createInstance = () => {
  if (!instance) {
    instance = axios.create({
      baseURL: '',
      timeout: 10000
    })

    // 请求拦截器
    instance.interceptors.request.use(
      (config) => {
        // 在发送请求之前做些什么
        config.headers['Content-Type'] = 'application/json'
        config.headers['Authorization'] = localStorage.getItem(STORAGE_KEY.USER_TOKEN) || ''
        config.headers['Token'] = localStorage.getItem(STORAGE_KEY.USER_TOKEN) || ''
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
        const code = resData?.code
        // 二进制数据直接返回
        if (responseType === 'blob' || responseType === 'arraybuffer') return response
        switch (code) {
          case '200':
            // code === '200' 来表示没有业务错误
            return resData?.data
          case 'SYS-ERR-0003':
            // Token过期时
            useUserStoreHook().logout()
            return location.reload()
          default:
            // 其他错误码
            ElMessage.error({ message: resData?.msg || 'Error', grouping: true })
            return Promise.reject(resData?.msg || 'Error')
        }
      },
      (error) => {
        // 对响应错误做点什么
        ElMessage.error({ message: error.message, grouping: true })
        return Promise.reject(error)
      }
    )
  }

  return instance
}

export default createInstance()
