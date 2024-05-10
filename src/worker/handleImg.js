// worker.js

const faultStrokeStyle = '#FA6157' // 故障框线条颜色
const faultStrokeWidth = 3 // 故障框线条宽度
const imageCache = new Map()

// 添加图像到缓存，并设置创建时间
const addToCache = (url, imgBitmap) => {
  imageCache.set(url, { imgBitmap, timestamp: Date.now() })
}

// 获取缓存时检查时间戳，决定是否清除
const getFromCache = (url, expirationTime = 3600000) => {
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
self.onmessage = async (event) => {
  const { list, imgBaseUrl, isKs = false, isVertical = false } = event.data
  let offscreenCanvas = new OffscreenCanvas(0, 0) // 创建离屏canvas
  let offscreenCtx = offscreenCanvas.getContext('2d')
  let existW = 0
  let existH = 0
  let processedList = []
  for (const [index, item] of list.entries()) {
    if (item.faultFrames.length) {
      // 该图片中有故障
      let imgBitmap = null
      const cachedImg = getFromCache(`${imgBaseUrl}${item?.imgPath}`) // 过期时间为1小时
      if (cachedImg) {
        // 缓存中存在从缓存中获取
        imgBitmap = cachedImg
      } else {
        // 否则重新加载
        imgBitmap = await urlToBitmap(`${imgBaseUrl}${item?.imgPath}`)
      }

      if (imgBitmap && imgBitmap.width && imgBitmap.height) {
        addToCache(`${imgBaseUrl}${item?.imgPath}`, imgBitmap) // 添加到缓存中
        const { width, height } = imgBitmap
        existW = width
        existH = height
        const imgStartX = isKs ? (isVertical ? 0 : index * width) : 0 // 图片的起始x坐标
        const imgStartY = isKs ? (isVertical ? index * height : 0) : 0 // 图片的起始y坐标
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
          offscreenCtx.strokeRect(coordinateX - imgStartX, coordinateY - imgStartY, width, height)
          return {
            ...fault,
            coordinateX: coordinateX - imgStartX,
            coordinateY: coordinateY - imgStartY
          }
        })
        // 转成dataUrl用于主线程img展示
        const url = await canvasToBlob(offscreenCanvas)
        processedList.push({ ...item, handledImg: url })
      } else {
        processedList.push({ ...item, handledImg: `${imgBaseUrl}${item?.imgPath}` })
      }
    } else {
      // 没有故障返回原图
      if (existW === 0 && existH === 0) {
        let imgBitmap = null
        const cachedImg = getFromCache(`${imgBaseUrl}${item?.imgPath}`) // 过期时间为1小时
        if (cachedImg) {
          // 缓存中存在从缓存中获取
          imgBitmap = cachedImg
        } else {
          // 否则重新加载
          imgBitmap = await urlToBitmap(`${imgBaseUrl}${item?.imgPath}`)
        }
        if (imgBitmap && imgBitmap.width && imgBitmap.height) {
          existW = imgBitmap.width
          existH = imgBitmap.height
        }
      }
      processedList.push({ ...item, handledImg: `${imgBaseUrl}${item?.imgPath}` })
    }
  }

  processedList = processedList.map((item) => {
    return { ...item, fullPath: `${imgBaseUrl}${item?.imgPath}`, imgW: existW, imgH: existH }
  })
  console.log('processedList', processedList)
  self.postMessage({ processedList, width: existW, height: existH })

  // 处理完所有图片后释放离屏canvas及其他变量
  offscreenCanvas = null
  offscreenCtx = null
  existW = 0
  existH = 0
  processedList.length = 0
}
