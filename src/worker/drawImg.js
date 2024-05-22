// worker.js

const imageCache = new Map() // 图片缓存

// 添加图像到缓存，并设置创建时间
const addToCache = (url, imgBitmap) => {
  imageCache.set(url, { imgBitmap, timestamp: Date.now() })
}

// 获取缓存时检查时间戳，决定是否清除，默认过期时间为14400000毫秒（4小时）
const getFromCache = (url, expirationTime = 14400000) => {
  const cacheItem = imageCache.get(url)
  if (cacheItem && Date.now() - cacheItem.timestamp < expirationTime) {
    return cacheItem.imgBitmap
  } else {
    imageCache.delete(url) // 清除过期的缓存
    return null
  }
}
// 将图片url转成bitmap、失败的场景返回null
const urlToBitmap = async (url) => {
  try {
    const response = await fetch(url, { mode: 'cors' })
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
// 将canvas转成图片
const canvasToBlob = async (canvas) => {
  const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.5 })
  const url = await new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => resolve(reader.result)
  })
  return url
}

class TaskQueue {
  constructor() {
    this.queue = []
    this.isProcessing = false
    this.shouldStop = false // 新增标志，用于控制是否停止当前任务
  }

  enqueue(task) {
    this.clearQueue() // 清空队列中的旧任务
    this.queue.push(task)
    this.processQueue()
  }
  clearQueue() {
    this.queue = [] // 清空队列
    this.shouldStop = true // 设置停止标志，用于中断正在执行的任务
  }
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return
    }
    this.isProcessing = true
    this.shouldStop = false // 重置停止标志
    // 每次执行新的任务，通知主线程，清空list
    self.postMessage({ type: 'clear' })
    const task = this.queue.shift()
    await this.processTask(task)
    this.isProcessing = false
    if (this.queue.length > 0) {
      this.processQueue() // 如果在处理当前任务时有新任务加入，继续处理
    }
  }

  async processTask(data) {
    const { list, imgBaseUrl, isVertical = false, w, h, batchSize = 10 } = data
    let batchNo = 0
    let offscreenCanvas = new OffscreenCanvas(0, 0)
    let offscreenCtx = offscreenCanvas.getContext('2d')
    let normalW = 0 // 原图的宽
    let normalH = 0 // 原图的高
    let reverseW = 0 // 反转之后图片的宽
    let reverseH = 0 // 反转之后图片的宽
    let processedList = []
    const angle = isVertical ? 1.5 * Math.PI : 0.5 * Math.PI // 反转的角度，竖图转横图，横图转竖图
    while (batchNo < list.length && !this.shouldStop) {
      const batchList = list.slice(batchNo, batchNo + batchSize) // 列表分批
      // 具体处理逻辑
      for (const [index, item] of batchList.entries()) {
        if (this.shouldStop) break // 在处理每个项目前检查是否应该停止
        let handledImg = `${imgBaseUrl}${item?.imgPath}` // 故障和图片绘制在一起的图片url，没有故障时，默认原图url
        const fullPath = `${imgBaseUrl}${item?.imgPath}` // 图片完整路径,包含域名和端口
        let imgBitmap = null
        const cachedImg = getFromCache(fullPath)
        if (cachedImg) {
          // 缓存中存在从缓存中获取
          imgBitmap = cachedImg
        } else {
          // 否则重新加载
          imgBitmap = await urlToBitmap(fullPath)
        }
        if (imgBitmap && imgBitmap.width && imgBitmap.height) {
          addToCache(fullPath, imgBitmap) // 添加到缓存中
          const { width, height } = imgBitmap
          // 图片宽高互换
          normalW = width
          normalH = height
          reverseW = height
          reverseH = width

          const imgStartX = isVertical ? 0 : (index + batchNo) * normalW // 图片的起始x坐标
          const imgStartY = isVertical ? (index + batchNo) * normalH : 0 // 图片的起始y坐标
          const reverseImgStartX = isVertical ? (index + batchNo) * reverseW : 0 // 反转图片的起始x坐标
          const reverseImgStartY = isVertical ? 0 : (index + batchNo) * reverseH // 反转图片的起始y坐标

          // 尝试从缓存中获取旋转后的图片
          const reverseUrl = getFromCache(`${fullPath}?reverse=1`)
          if (reverseUrl) {
            handledImg = reverseUrl
          } else {
            // 缓存中不存在，则重新在canvas中完成旋转
            // 绘制反转后的图片
            offscreenCanvas.width = height
            offscreenCanvas.height = width
            offscreenCtx.save()
            // 将绘图原点移动到画布中心
            offscreenCtx.translate(offscreenCanvas.width / 2, offscreenCanvas.height / 2)

            // 旋转rotateAngle度
            offscreenCtx.rotate(angle)

            // 绘制图片,以图片的中心为原点
            offscreenCtx.drawImage(imgBitmap, -width / 2, -height / 2, width, height)

            // 恢复之前保存的绘图状态
            offscreenCtx.restore()

            // 转成dataUrl用于主线程img展示
            const url = await canvasToBlob(offscreenCanvas)
            // 如果要用于主线程canvas中绘制，则按下述方式
            // const canvas = offscreenCanvas.transferToImageBitmap()
            addToCache(`${fullPath}?reverse=1`, url) // 将旋转后的图片添加到缓存中
            handledImg = url
          }
          // 格式化故障数据，分别计算原图、旋转图全局的坐标及相对于当前图的坐标
          item.faultFrames = item.faultFrames.map((fault) => {
            const { coordinateX, coordinateY } = fault
            // 图片旋转-90度时，故障宽高互换，坐标需要转换
            return {
              ...fault,
              gX: coordinateX, // 原图整图x坐标
              gY: coordinateY, // 原图整图y坐标
              cX: coordinateX - imgStartX, // 原图当前图片上的x坐标
              cY: coordinateY - imgStartY, // 原图当前图片上的y坐标
              w: fault.width, // 原图故障的宽
              h: fault.height, // 原图故障的高
              revGx: isVertical ? coordinateY : reverseW - fault.height - coordinateY, // 反转图整图x坐标
              revGy: isVertical ? reverseH - fault.width - coordinateX : coordinateX, // 反转图整图x坐标
              revCx: isVertical
                ? coordinateY - reverseImgStartX
                : reverseW - fault.height - coordinateY - reverseImgStartX, // 反转图当前图片上的x坐标
              revCy: isVertical
                ? reverseH - fault.width - coordinateX - reverseImgStartY
                : coordinateX - reverseImgStartY, // 反转图当前图片上的y坐标
              revW: fault.height, // 反转图故障的宽
              revH: fault.width // 反转图故障的高
            }
          })
        }

        processedList.push({ ...item, handledImg, fullPath })
      }
      if (!this.shouldStop) {
        // 处理每个图片的尺寸，如果所有图片都加载失败，则取主线程传过来的默认尺寸
        processedList = processedList.map((item) => {
          return {
            ...item,
            imgW: normalW || w,
            imgH: normalH || h,
            rImgW: reverseW || h,
            rImgH: reverseH || w
          }
        })
        self.postMessage({ type: 'update', processedList, normalW, normalH, reverseW, reverseH })
        processedList.length = 0
        batchNo += batchSize
      }
    }
    offscreenCanvas = null
    offscreenCtx = null
    batchNo = 0
    normalW = 0
    normalH = 0
    processedList.length = 0
  }
}

const taskQueue = new TaskQueue()

self.onmessage = (event) => {
  taskQueue.enqueue(event.data)
}
