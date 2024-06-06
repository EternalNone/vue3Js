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
export class Rect {
  constructor(startX, startY, add = false) {
    this.startX = startX
    this.startY = startY
    this.endX = startX
    this.endY = startY
    this.offsetX = 0 // canvas偏移量x,用于将全图坐标转换为当前canvas的坐标
    this.offsetY = 0 // canvas偏移量y,用于将全图坐标转换为当前canvas的坐标
    this.info = {}
    this.add = add // 是否是新增故障
    this.selected = false // 是否被选中
    this.faultNo = '' // 故障编号
    this.showNo = false // 是否显示故障编号
    this.strokeColor = 'rgba(245,108,108,1)'
    this.fillColor = 'rgba(245,108,108,0.3)'
    this.strokeColorAdd = 'rgba(103,194,58,1)'
    this.fillColorAdd = 'rgba(103,194,58,0.3)'
    this.faultStrokeWidth = 3
  }
  get minX() {
    return Math.min(this.startX, this.endX)
  }
  get maxX() {
    return Math.max(this.startX, this.endX)
  }
  get minY() {
    return Math.min(this.startY, this.endY)
  }
  get maxY() {
    return Math.max(this.startY, this.endY)
  }
  get width() {
    return this.maxX - this.minX
  }
  get height() {
    return this.maxY - this.minY
  }
  // 判断点是否在矩形内
  isInSide(x, y) {
    return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY
  }
  // 判断当前矩形是否与其他矩形重叠
  isRectOverlap(rect) {
    return (
      this.minX <= rect.endX &&
      this.maxX >= rect.startX &&
      this.minY <= rect.endY &&
      this.maxY >= rect.startY
    )
  }
  draw(ctx) {
    ctx.strokeStyle = this.add ? this.strokeColorAdd : this.strokeColor
    ctx.lineWidth = this.faultStrokeWidth
    ctx.strokeRect(this.minX - this.offsetX, this.minY - this.offsetY, this.width, this.height)
    if (this.selected) {
      ctx.fillStyle = this.add ? this.fillColorAdd : this.fillColor
      ctx.fillRect(this.minX - this.offsetX, this.minY - this.offsetY, this.width, this.height)
    }
    if (this.showNo) {
      ctx.font = '30px Arial'
      ctx.fillStyle = this.add ? this.strokeColorAdd : this.strokeColor
      ctx.fillText(this.faultNo, this.minX - this.offsetX + 5, this.minY - this.offsetY + 25)
    }
  }
}
