import { createFetch } from '@vueuse/core'
export const fetchRequest = ({ url, method, data }) => {
  console.log('xxxxxxx', url)
  const useFetch = createFetch({
    baseUrl: url,
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
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(data)
    }
  })
  return useFetch(url).json()
}
