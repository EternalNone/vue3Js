// 判断一个点是否在矩形区域内
export const isPointInRect = (x, y, startX, startY, endX, endY) => {
  console.log('isPointInRect', x, y, startX, startY, endX, endY)
  return x >= startX && x <= endX && y >= startY && y <= endY
}

// 判断两个矩形是否有重叠
export const isRectOverlap = (rect1, rect2) => {
  return (
    rect1.startX <= rect2.endX &&
    rect1.endX >= rect2.startX &&
    rect1.startY <= rect2.endY &&
    rect1.endY >= rect2.startY
  )
}
