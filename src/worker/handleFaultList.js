// worker.js

const faultStrokeStyle = '#FA6157' // 故障框线条颜色
const faultStrokeWidth = 3 // 故障框线条宽度
const imageCache = new Map()

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
// 绘制默认的图片
const drawDefaultImg = (ctx, w, h, startX = 0, startY = 0) => {
  ctx.fillStyle = '#f5f7fa'
  ctx.fillRect(startX, startY, w, h)
  const text = '加载失败'
  ctx.fillStyle = '#a8abb2'
  ctx.font = '30px Arial'
  const textWidth = ctx.measureText(text).width
  const textX = (w - textWidth) / 2
  const textY = h / 2
  ctx.fillText(text, textX, textY)
}
self.onmessage = async (event) => {
  const { list, imgBaseUrl, isVertical = false } = event.data
  let offscreenCanvas = new OffscreenCanvas(0, 0) // 创建离屏canvas
  let offscreenCtx = offscreenCanvas.getContext('2d')
  const processedList = []
  
  for (const item of list) {
    let existW = 1228 // 默认的图片宽度
    let existH = 600 // 默认的图片高度
    let width = 0
    let height = 0
    let startX = 0
    let startY = 0
    let url = ''
    let fullPath = ''
    const itemImgs = item?.faultImages || []
    // 将所有的图片转化为bitmap格式，请求或者转换失败，则返回null
    const itemBitmapImgs = await Promise.all(
      itemImgs.map(async (imgPath) => {
        const cachedImg = getFromCache(`${imgBaseUrl}${imgPath}`) // 过期时间为1小时
        if (cachedImg) {
          // 缓存中存在从缓存中获取
          existW = cachedImg.width
          existH = cachedImg.height
          return cachedImg
        } else {
          // 否则重新加载
          const imgBitmap = await urlToBitmap(`${imgBaseUrl}${imgPath}`)
          if (imgBitmap && imgBitmap.width && imgBitmap.height) {
            existW = imgBitmap.width
            existH = imgBitmap.height
            addToCache(`${imgBaseUrl}${imgPath}`, imgBitmap) // 添加到缓存中
          }
          return imgBitmap
        }
      })
    )
    // 根据拼接方式，计算画布的宽高，对于图片不存在的场景，取默认的宽高
    itemBitmapImgs.forEach((item) => {
      if (isVertical) {
        height += item?.height || existH
        width = Math.max(width, item?.width || existW)
      } else {
        width += item?.width || existW
        height = Math.max(height, item?.height || existH)
      }
    })
    // 设置画布尺寸
    offscreenCanvas.width = width
    offscreenCanvas.height = height
    offscreenCtx.clearRect(0, 0, width, height)

    if (itemBitmapImgs.some((item) => item?.width && item?.height)) {
      // 绘制图片、图片为null时绘制默认的图片及提示文字
      itemBitmapImgs.forEach((item) => {
        if (item?.width && item?.height) {
          if (isVertical) {
            startX = 0
            offscreenCtx.drawImage(item, startX, startY, item?.width, item?.height)
            startY += item?.height || existH
          } else {
            startY = 0
            offscreenCtx.drawImage(item, startX, startY, item?.width, item?.height)
            startX += item?.width || existW
          }
        } else {
          drawDefaultImg(offscreenCtx, existW, existH, startX, startY)
        }
      })
      fullPath = await canvasToBlob(offscreenCanvas) // 将拼好的图片转成dataUrl
      // 至少有一个图片正常时才绘制故障
      offscreenCtx.strokeStyle = faultStrokeStyle
      offscreenCtx.lineWidth = faultStrokeWidth
      offscreenCtx.strokeRect(Number(item.x), Number(item.y), Number(item.w), Number(item.h))
      url = await canvasToBlob(offscreenCanvas) // 将绘制好的图片及故障一起转成dataUrl
    } else {
      fullPath = `${imgBaseUrl}${item?.faultImages[0]}`
      url = `${imgBaseUrl}${item?.faultImages[0]}`
      item.imgLoadFailed = true
    }

    item.handledImg = url
    item.fullPath = fullPath
    item.imgPath = itemImgs.join(';')
    item.imgW = width
    item.imgH = height
    item.faultFrames = [
      {
        affirm: item.faultAffirm,
        coordinateX: Number(item.x),
        coordinateY: Number(item.y),
        faultDesc: item.faultDescribe,
        handleUser: null,
        height: Number(item.h),
        id: item.id,
        width: Number(item.w)
      }
    ]
    processedList.push(item)
  }
  self.postMessage({ processedList })

  // 处理完所有图片后释放离屏canvas及其他变量
  offscreenCanvas = null
  offscreenCtx = null
  processedList.length = 0
}
