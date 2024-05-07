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
const urlToBitmap = async (url) => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      // 图片请求失败
      console.error(`Error fetch image: ${url}`)
      return null
    }
    const blob = await response.blob()
    if (blob?.type?.includes('image')) {
      const imgBitmap = await createImageBitmap(blob)
      return imgBitmap
    } else {
      console.error(`Invalid image type: ${url}`)
      return null
    }
  } catch (error) {
    console.error(`Error creating image bitmap: ${error}`)
    return null
  }
}
self.onmessage = async (event) => {
  const { imgs, faults, imgBaseUrl, isVertical } = event.data
  let offscreenCanvas = new OffscreenCanvas(0, 0) // 创建离屏canvas
  let offscreenCtx = offscreenCanvas.getContext('2d')
  let existW = 0
  let existH = 0
  const processedImages = []
  for (const [index, curImg] of imgs.entries()) {
    if (curImg.includes('withFault=1')) {
      // 该图片中有故障
      const imgBitmap = await urlToBitmap(`${imgBaseUrl}${curImg}`)
      if (imgBitmap && imgBitmap.width && imgBitmap.height) {
        const { width, height } = imgBitmap
        existW = width
        existH = height
        offscreenCanvas.width = width
        offscreenCanvas.height = height
        offscreenCtx.drawImage(imgBitmap, 0, 0, width, height) // 绘制图片
        // 绘制故障
        offscreenCtx.strokeStyle = faultStrokeStyle
        offscreenCtx.lineWidth = faultStrokeWidth

        const imgStartX = isVertical ? 0 : index * width // 图片的起始x坐标
        const imgStartY = isVertical ? index * height : 0 // 图片的起始y坐标
        const imgEndX = imgStartX + width // 图片的结束x坐标
        const imgEndY = imgStartY + height // 图片的结束y坐标
        // 找出故障中与当前图片重叠的故障框
        faults.forEach((fault) => {
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
            offscreenCtx.strokeRect(coordinateX - imgStartX, coordinateY - imgStartY, width, height)
          }
        })
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
        processedImages.push(url)
      } else {
        processedImages.push(`${imgBaseUrl}${curImg}`)
      }
    } else {
      // 没有故障返回原图
      if (existW === 0 && existH === 0) {
        const imgBitmap = await urlToBitmap(`${imgBaseUrl}${curImg}`)
        if (imgBitmap && imgBitmap.width && imgBitmap.height) {
          existW = imgBitmap.width
          existH = imgBitmap.height
        }
      }
      processedImages.push(`${imgBaseUrl}${curImg}`)
    }
  }

  self.postMessage({ processedImages, width: existW, height: existH })

  // 处理完所有图片后释放离屏canvas及其他变量
  offscreenCanvas = null
  offscreenCtx = null
  processedImages.length = 0
}
