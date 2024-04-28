// 在 request.js 中使用单例模式来确保只创建一个请求实例
import axios from 'axios'
import { Storage, StorageKey } from '@/utils/storage'

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
        // 对响应数据做点什么
        return response.data
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
