// worker.js

const faultStrokeStyle = '#FA6157' // 故障框线条颜色
const faultStrokeWidth = 3 // 故障框线条宽度
const imageCache = new Map() // 图片缓存

// 添加图像到缓存，并设置创建时间
const addToCache = (url, imgBitmap) => {
  imageCache.set(url, { imgBitmap, timestamp: Date.now() })
}

// 获取缓存时检查时间戳，决定是否清除，默认过期时间为86400000毫秒（24小时）
const getFromCache = (url, expirationTime = 86400000) => {
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
    const { list, imgBaseUrl, isKs = false, isVertical = false, w, h, batchSize = 10 } = data
    let batchNo = 0
    let offscreenCanvas = new OffscreenCanvas(0, 0)
    let offscreenCtx = offscreenCanvas.getContext('2d')
    let existW = 0
    let existH = 0
    let processedList = []
    while (batchNo < list.length && !this.shouldStop) {
      const batchList = list.slice(batchNo, batchNo + batchSize) // 列表分批
      // 具体处理逻辑
      for (const [index, item] of batchList.entries()) {
        if (this.shouldStop) break // 在处理每个项目前检查是否应该停止
        let handledImg = `${imgBaseUrl}${item?.imgPath}` // 故障和图片绘制在一起的图片url，没有故障时，默认原图url
        let fullPath = `${imgBaseUrl}${item?.imgPath}` // 图片完整路径,包含域名和端口
        if (item.faultFrames.length) {
          // 该图片中有故障
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
            existW = width
            existH = height
            const imgStartX = isKs ? (isVertical ? 0 : (index + batchNo) * width) : 0 // 图片的起始x坐标
            const imgStartY = isKs ? (isVertical ? (index + batchNo) * height : 0) : 0 // 图片的起始y坐标
            // 绘制图片
            offscreenCanvas.width = width
            offscreenCanvas.height = height
            offscreenCtx.clearRect(0, 0, width, height)
            offscreenCtx.drawImage(imgBitmap, 0, 0, width, height)
            // 绘制故障
            offscreenCtx.strokeStyle = faultStrokeStyle
            offscreenCtx.lineWidth = faultStrokeWidth
            // 绘制故障，并且把快扫的故障坐标换算成当前图片的坐标
            item.faultFrames = item.faultFrames.map((fault) => {
              const { coordinateX, coordinateY, width, height } = fault
              offscreenCtx.strokeRect(
                coordinateX - imgStartX,
                coordinateY - imgStartY,
                width,
                height
              )
              return {
                ...fault,
                x: coordinateX, // 整图上的x坐标
                y: coordinateY, // 整图上的y坐标
                coordinateX: coordinateX - imgStartX, // 当前图片上的x坐标
                coordinateY: coordinateY - imgStartY // 当前图片上的y坐标
              }
            })
            // 转成dataUrl用于主线程img展示
            const url = await canvasToBlob(offscreenCanvas)
            // 如果要用于主线程canvas中绘制，则按下述方式
            // const canvas = offscreenCanvas.transferToImageBitmap()
            handledImg = url
          }
        } else {
          // 没有故障返回原图
          if (existW === 0 && existH === 0) {
            // 防止图片的尺寸未获取到，这里再次获取
            let imgBitmap = null
            const cachedImg = getFromCache(fullPath) // 过期时间为1小时
            if (cachedImg) {
              // 缓存中存在从缓存中获取
              imgBitmap = cachedImg
            } else {
              // 否则重新加载
              imgBitmap = await urlToBitmap(fullPath)
            }
            if (imgBitmap && imgBitmap.width && imgBitmap.height) {
              existW = imgBitmap.width
              existH = imgBitmap.height
            }
          }
        }
        processedList.push({ ...item, handledImg, fullPath })
      }
      if (!this.shouldStop) {
        // 处理每个图片的尺寸，如果所有图片都加载失败，则取主线程传过来的默认尺寸
        processedList = processedList.map((item) => {
          return { ...item, imgW: existW || w, imgH: existH || h }
        })
        console.log(list.length)
        self.postMessage({ type: 'update', processedList, width: existW, height: existH })
        processedList.length = 0
        batchNo += batchSize
      }
    }
    offscreenCanvas = null
    offscreenCtx = null
    batchNo = 0
    existW = 0
    existH = 0
    processedList.length = 0
  }
}

const taskQueue = new TaskQueue()

self.onmessage = (event) => {
  taskQueue.enqueue(event.data)
}
