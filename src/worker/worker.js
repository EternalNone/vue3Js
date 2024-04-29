// worker.js

self.onmessage = async (event) => {
  const { list, imgBaseUrl, batchSize } = event.data
  let offscreenCanvas = new OffscreenCanvas(0, 0) // 创建离屏canvas
  let offscreenCtx = offscreenCanvas.getContext('2d')
  let curIdx = 0 // 当前处理到的索引
  let processedImages = [] // 存放处理好的图片

  while (curIdx < list.length) {
    const batchUrls = list.slice(curIdx, curIdx + batchSize)
    const batchData = await Promise.all(
      batchUrls.map(async (url) => {
        try {
          const response = await fetch(`${imgBaseUrl}${url}`)
          if (!response.ok) {
            console.error(`Error loading image: ${url}`)
            return null
          }
          const blob = await response.blob()
          if (blob?.type?.includes('image')) {
            return createImageBitmap(blob)
          } else {
            console.error(`createImageBitmap failed,not image or image not found`)
            return null
          }
        } catch (error) {
          console.error(`Error loading image: ${url}`, error)
          return null // 返回null表示图片加载失败
        }
      })
    )
    const existImage = batchData.find((item) => item && item.width && item.height)
    if (existImage) {
      const { width, height } = existImage
      offscreenCanvas.width = existImage.width
      offscreenCanvas.height = existImage.height
      batchData.forEach((image) => {
        let canvas = null
        // 清空离屏Canvas
        offscreenCtx.clearRect(0, 0, width, height)
        if (image) {
          // 绘制图片
          offscreenCtx.drawImage(image, 0, 0, width, height)
          image = null // 释放图片资源
        } else {
          // 图片加载失败，绘制默认图片
          offscreenCtx.fillStyle = '#f5f7fa'
          offscreenCtx.fillRect(0, 0, width, height)
          // 图片加载失败，绘制提示文字
          const text = '图片加载失败'
          offscreenCtx.fillStyle = '#a8abb2'
          offscreenCtx.font = '30px Arial'
          const textWidth = offscreenCtx.measureText(text).width
          const textX = (width - textWidth) / 2
          const textY = height / 2
          offscreenCtx.fillText(text, textX, textY)
        }
        canvas = offscreenCanvas.transferToImageBitmap()
        processedImages.push(canvas)
        canvas = null // 释放离屏canvas
      })
      self.postMessage({ processedImages, curIdx })
    }

    processedImages.length = 0 // 批处理完后清空处理好的图片
    curIdx += batchSize
  }
  // 处理完所有图片后释放离屏canvas及其他变量
  offscreenCanvas = null
  offscreenCtx = null
  curIdx = null
  processedImages = null
}
