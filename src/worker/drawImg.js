// worker.js

const faultStrokeStyle = '#FA6157' // 故障框线条颜色
const faultStrokeWidth = 3 // 故障框线条宽度
// 判断两个矩形是否有重叠
const isRectOverlap = (rect1, rect2) => {
  return (
    rect1.startX <= rect2.endX &&
    rect1.endX >= rect2.startX &&
    rect1.startY <= rect2.endY &&
    rect1.endY >= rect2.startY
  )
}
self.onmessage = async (event) => {
  const { imgs, faults, imgBaseUrl, batchSize, isVertical } = event.data
  let offscreenCanvas = new OffscreenCanvas(0, 0) // 创建离屏canvas
  let offscreenCtx = offscreenCanvas.getContext('2d')
  let curIdx = 0 // 当前分批处理图片的批次号
  let processedImages = [] // 存放处理好的图片

  while (curIdx < imgs.length) {
    const batchUrls = imgs.slice(curIdx, curIdx + batchSize) // 图片分批
    const batchData = await Promise.all(
      batchUrls.map(async (url) => {
        try {
          const response = await fetch(`${imgBaseUrl}${url}`)
          if (!response.ok) {
            // 图片请求失败
            console.error(`Error loading image: ${url}`)
            return null
          }
          const blob = await response.blob()
          if (blob?.type?.includes('image')) {
            return createImageBitmap(blob)
          } else {
            // 非图片文件
            console.error(`createImageBitmap failed,not image or image not found`)
            return null
          }
        } catch (error) {
          console.error(`Error loading image: ${url}`, error)
          return null // 返回null表示图片加载失败
        }
      })
    )
    const existImage = batchData.find((item) => item && item.width && item.height) // 找到一张存在的图片
    if (existImage) {
      const { width, height } = existImage
      offscreenCanvas.width = width
      offscreenCanvas.height = height
      processedImages = await Promise.all(
        batchData.map(async (image, index) => {
          const curImgIdx = curIdx + index // 当前图片的索引
          if (image) {
            const imgStartX = isVertical ? 0 : curImgIdx * width // 图片的起始x坐标
            const imgStartY = isVertical ? curImgIdx * height : 0 // 图片的起始y坐标
            const imgEndX = imgStartX + width // 图片的结束x坐标
            const imgEndY = imgStartY + height // 图片的结束y坐标
            // 找出故障中与当前图片重叠的故障框
            const faultsInPics = faults.filter((fault) => {
              const { coordinateX, coordinateY, width, height } = fault
              if (
                isRectOverlap(
                  {
                    startX: coordinateX,
                    endX: coordinateX + width,
                    startY: coordinateY,
                    endY: coordinateY + height
                  },
                  {
                    startX: imgStartX,
                    endX: imgEndX,
                    startY: imgStartY,
                    endY: imgEndY
                  }
                )
              ) {
                return fault
              }
            })
            if (faultsInPics.length) {
              // 图片中存在故障，需要把图片和故障绘制到一张图中
              offscreenCtx.drawImage(image, 0, 0, width, height)
              // 绘制故障
              offscreenCtx.strokeStyle = faultStrokeStyle
              offscreenCtx.lineWidth = faultStrokeWidth
              faultsInPics.forEach((item) => {
                const { coordinateX, coordinateY, width, height } = item
                offscreenCtx.strokeRect(
                  coordinateX - imgStartX,
                  coordinateY - imgStartY,
                  width,
                  height
                )
              })
            } else {
              // 图片中没有故障，则无需绘制，直接返回原url
              return `${imgBaseUrl}${imgs[curImgIdx]}`
            }
          } else {
            // 所有图片获取失败的场景，绘制一张默认的图片及提示文字
            // offscreenCtx.fillStyle = '#f5f7fa'
            // offscreenCtx.fillRect(0, 0, width, height)
            // const text = '图片加载失败'
            // offscreenCtx.fillStyle = '#a8abb2'
            // offscreenCtx.font = '30px Arial'
            // const textWidth = offscreenCtx.measureText(text).width
            // const textX = (width - textWidth) / 2
            // const textY = height / 2
            // offscreenCtx.fillText(text, textX, textY)
            // 所有图片获取失败的场景，直接返回原url
            return `${imgBaseUrl}${imgs[curImgIdx]}`
          }
          // 转成dataUrl用于主线程img展示
          const blob = await new Promise((resolve) => {
            offscreenCanvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 }).then(resolve)
          })
          const url = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = () => {
              resolve(reader.result)
            }
          })
          return url
          // 如果要用于主线程canvas中绘制，则按下述方式
          // const canvas = offscreenCanvas.transferToImageBitmap()
          // return canvas
        })
      )
      console.log('processedImages', processedImages)
      self.postMessage({ processedImages, width, height })
    }

    processedImages.length = 0 // 批处理完后清空处理好的图片
    curIdx += batchSize
  }
  // 处理完所有图片后释放离屏canvas及其他变量
  offscreenCanvas = null
  offscreenCtx = null
  curIdx = null
  processedImages.length = 0
}
