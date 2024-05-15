// 将图片url转成bitmap、失败的场景返回null
export const urlToBitmap = async (url) => {
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

// 将离屏canvas转成图片
export const canvasToBlob = async (canvas, type = 'image/webp') => {
  const blob = await canvas.convertToBlob({ type, quality: 0.5 })
  const url = await new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => resolve(reader.result)
  })
  return url
}
