import { createFetch } from '@vueuse/core'
import { Storage, StorageKey } from '@/utils/storage'
export const fetchRequest = ({ url, method, data }) => {
  console.log('xxxxxxx', url)
  const useFetch = createFetch({
    baseUrl: '',
    combination: 'overwrite',
    options: {
      immediate: false,
      timeout: 3000,
      afterFetch: (response) => {
        // 响应拦截器
        console.log('Received response:', response)
        return response
      },
      onFetchError: (ctx) => {
        console.log('error:', ctx)
        ctx.error = new Error(ctx.error)
        return ctx
      }
    },
    fetchOptions: {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Storage.getItem(StorageKey.USER_TOKEN) || ''
      },
      body: JSON.stringify(data)
    }
  })
  return useFetch(url).json()
}
