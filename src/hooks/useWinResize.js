import { useWindowSize } from '@vueuse/core'
import { debounce } from 'radash'

export const useWinResize = (cb, delay = 0) => {
  const { width, height } = useWindowSize()
  const debounceCb = debounce({ delay }, () => {
    cb && cb()
  })
  const func = delay ? debounceCb : cb
  watch([width, height], func)
}
