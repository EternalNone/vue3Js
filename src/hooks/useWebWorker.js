export const useWebWorker = (url) => {
  const worker = new Worker(new URL(url, import.meta.url)) // 创建Web Worker
  const workerData = ref({})
  const post = (data) => {
    if (worker) {
      worker.postMessage(data)
    }
  }
  const terminate = () => {
    if (worker) {
      worker.terminate()
    }
  }
  worker.onmessage = function (event) {
    workerData.value = event.data
  }
  onUnmounted(() => {
    if (worker) {
      worker.terminate()
    }
  })
  return { worker, workerData, post, terminate }
}
