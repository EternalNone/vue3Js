<script setup name="KsRender1">
import { ElMessageBox } from 'element-plus'
const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL // 对应环境的图片域名及端口
const batchSize = 10 // 每个canvas展示的图片数量
const faultStrokeStyle = '#FA6157' // 故障框线条颜色
const faultStrokeWidth = 3 // 故障框线条宽度

const props = defineProps({
  isVertical: {
    type: Boolean,
    default: true
  },
  ksData: {
    type: Object,
    default: () => {
      return {
        ksImgs: [],
        ksFaults: []
      }
    }
  }
})

const { isVertical, ksData } = toRefs(props)
const scrollContainerRef = ref(null) // canvas容器的模板引用
const showViewer = ref(false) // 是否显示查看器
const srcList = ref([]) // 查看器图片列表
const canvasList = ref([]) // canvas列表
const faultCanvasRefs = ref([]) // 故障canvas的模板引用
const imgW = ref(1228) // 图片宽度
const imgH = ref(600) // 图片高度
const imgRatio = computed(() => {
  // 图片宽高比
  return imgW.value / imgH.value
})
// 绘制故障框
const drawFaults = () => {
  console.log('draw faults')
  const leftImgs = ksData.value?.ksImgs.length % batchSize // 计算最后一个canvas中img数量
  let cStartX = 0 // 当前canvas的起始x坐标
  let cEndX = 0 // 当前canvas的结束x坐标
  let cStartY = 0 // 当前canvas的起始y坐标
  let cEndY = 0 // 当前canvas的结束y坐标
  for (let j = 0, len = faultCanvasRefs.value.length; j < len; j++) {
    const curCanvas = faultCanvasRefs.value[j]
    const ctx = curCanvas.getContext('2d')
    const totalImgsCount = j === len - 1 ? leftImgs + j * batchSize : (j + 1) * batchSize // 截止当前画布已经展示的图片数量

    if (isVertical.value) {
      curCanvas.width = imgW.value // 当前索引对应画布的宽度
      curCanvas.height = j === len - 1 ? imgH.value * leftImgs : imgH.value * batchSize // 当前索引对应画布的高度
      cEndX = imgW.value
      cEndY = imgH.value * totalImgsCount
      cStartY = cEndY - curCanvas.height
    } else {
      curCanvas.width = j === len - 1 ? imgW.value * leftImgs : imgW.value * batchSize
      curCanvas.height = imgH.value
      cEndY = imgH.value
      cEndX = imgW.value * totalImgsCount // 当前索引对应画布的结束位置
      cStartX = cEndX - curCanvas.width // 当前索引对应画布的起始位置
    }
    ctx.clearRect(0, 0, curCanvas.width, curCanvas.height) // 清空画布
    ctx.strokeStyle = faultStrokeStyle
    ctx.lineWidth = faultStrokeWidth
    for (let i = 0, len = ksData.value?.ksFaults.length; i < len; i++) {
      const curFault = ksData.value?.ksFaults[i]
      const { width, height, coordinateX, coordinateY } = curFault
      // 判断故障框是否跟当前canvas重叠
      if (
        isRectOverlap(
          {
            startX: coordinateX,
            endX: coordinateX + width,
            startY: coordinateY,
            endY: coordinateY + height
          },
          {
            startX: cStartX,
            endX: cEndX,
            startY: cStartY,
            endY: cEndY
          }
        )
      ) {
        ctx.strokeRect(coordinateX - cStartX, coordinateY - cStartY, width, height)
      }
    }
  }
}
// 获取一张正常的图片
const getExistImg = async (list) => {
  for (const url of list) {
    const res = await fetch(`${imgBaseUrl}${url}`)
    if (res.ok) {
      const blob = await res.blob()
      if (blob?.type?.includes('image')) {
        const img = await createImageBitmap(blob)
        if (img.width && img.height) {
          return img
        }
      }
    }
  }
}

watch(
  ksData,
  (newVal) => {
    console.log('ksData', newVal)
    canvasList.value = Array.from(
      { length: Math.ceil(newVal?.ksImgs.length / batchSize) },
      (_, i) => i
    ) // 重置canvas列表
    if (Array.isArray(newVal?.ksImgs) && newVal?.ksImgs.length) {
      getExistImg(newVal?.ksImgs).then((existImg) => {
        imgW.value = existImg.width
        imgH.value = existImg.height
      })
    }
    nextTick(() => {
      drawFaults()
    })
  },
  { immediate: true, deep: true }
)

// 横向滚动事件
const handleScroll = (e) => {
  if (isVertical.value) {
    return
  }
  // 检查是否按住了水平滚动条，如果是则不处理
  if (e.shiftKey) {
    return
  }
  // 阻止默认的垂直滚动行为
  e.preventDefault()
  // 获取滚动容器元素
  const scrollContainer = scrollContainerRef.value
  // 横向滚动距离
  const delta = e.deltaY
  // 设置横向滚动条位置
  scrollContainer.scrollLeft += delta
}
// 判断一个点是否在矩形区域内
const isPointInRect = (x, y, startX, startY, endX, endY) => {
  console.log('isPointInRect', x, y, startX, startY, endX, endY)
  return x >= startX && x <= endX && y >= startY && y <= endY
}
// 判断两个矩形是否有重叠
const isRectOverlap = (rect1, rect2) => {
  return (
    rect1.startX <= rect2.endX &&
    rect1.endX >= rect2.startX &&
    rect1.startY <= rect2.endY &&
    rect1.endY >= rect2.startY
  )
}
// 绘制默认图片
const drawDefaultImg = () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = imgW.value // 设置宽度
  canvas.height = imgH.value // 设置高度
  // 图片加载失败，绘制默认图片
  ctx.fillStyle = '#f5f7fa'
  ctx.fillRect(0, 0, imgW.value, imgH.value)
  // 图片加载失败，绘制提示文字
  const text = '图片加载失败'
  ctx.fillStyle = '#a8abb2'
  ctx.font = '30px Arial'
  const textWidth = ctx.measureText(text).width
  const textX = (imgW.value - textWidth) / 2
  const textY = imgH.value / 2
  ctx.fillText(text, textX, textY)
  return canvas.toDataURL('image/jpeg', 0.8)
}
// 预览图片
const showBigImg = async (e, idx, url) => {
  console.log('showBigImg', e.offsetX, e.offsetY, idx)
  const containerW = scrollContainerRef.value.clientWidth
  const scale = imgW.value / containerW // 因为画面等比缩放，计算出缩放的比例
  const offsetX = e.offsetX * scale // 根据原图的尺寸算出x坐标
  const offsetY = e.offsetY * scale // 根据原图的尺寸算出y坐标
  const imgStartX = isVertical.value ? 0 : idx * imgW.value // 图片的起始x坐标
  const imgStartY = isVertical.value ? idx * imgH.value : 0 // 图片的起始y坐标
  const imgEndX = imgStartX + imgW.value // 图片的结束x坐标
  const imgEndY = imgStartY + imgH.value // 图片的结束y坐标
  // 计算出鼠标的位置在整个容器中的坐标
  const cursorX = isVertical.value ? offsetX : imgStartX + offsetX
  const cursorY = isVertical.value ? imgStartY + offsetY : offsetY
  // 找出鼠标当前置入的故障框
  const faultsContainPonit = ksData.value?.ksFaults?.filter((item) => {
    const { coordinateX, coordinateY, width, height } = item
    if (
      isPointInRect(
        cursorX,
        cursorY,
        coordinateX,
        coordinateY,
        coordinateX + width,
        coordinateY + height
      )
    ) {
      return item
    }
  })
  if (faultsContainPonit.length) {
    // 鼠标当前置入的故障框
    ElMessageBox({
      title: '故障详情',
      showCancelButton: false,
      showConfirmButton: false,
      distinguishCancelAndClose: true,
      message: h(
        'div',
        null,
        faultsContainPonit.map((fault, index) => [
          h('h3', { style: 'margin: 10px 0;color:rgba(17, 209, 251, 1)' }, `故障${index + 1}`),
          h('p', null, `宽度：${fault.width}`),
          h('p', null, `高度：${fault.height}`),
          h('p', null, `顶点坐标：(${fault.coordinateX}，${fault.coordinateY})`),
          h('p', null, `故障描述：${fault.description}`)
        ])
      )
    }).catch(() => {
      console.log('close fault detail box')
    })
    return
  }
  // 找出故障中与当前图片重叠的故障框
  const faultsInPics = ksData.value?.ksFaults?.filter((item) => {
    const { coordinateX, coordinateY, width, height } = item
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
      return item
    }
  })

  console.log('faultsInPic', faultsInPics)
  if (faultsInPics.length) {
    // 需要把故障绘制到图片中
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = imgW.value // 设置宽度
    canvas.height = imgH.value // 设置高度
    ctx.strokeStyle = faultStrokeStyle
    ctx.lineWidth = faultStrokeWidth
    const res = await fetch(`${imgBaseUrl}${url}`)
    console.log('res', res)
    if (res.ok) {
      const blob = await res.blob()
      console.log('blob', blob)
      if (blob?.type?.includes('image')) {
        const img = await createImageBitmap(blob)
        if (img.width && img.height) {
          ctx.drawImage(img, 0, 0, imgW.value, imgH.value)
          faultsInPics.forEach((item) => {
            const { coordinateX, coordinateY, width, height } = item
            ctx.strokeRect(coordinateX - imgStartX, coordinateY - imgStartY, width, height)
          })
          const src = canvas.toDataURL('image/jpeg', 0.8)
          showViewer.value = true
          srcList.value = [src]
          return
        }
      }
    }
    const src = drawDefaultImg()
    srcList.value = [src]
    showViewer.value = true
  } else {
    // 点击的图片中没有故障，直接用rul预览
    srcList.value = [`${imgBaseUrl}${url}`]
    showViewer.value = true
  }
}
</script>
<template>
  <div class="canvas-content" ref="scrollContainerRef" @wheel="handleScroll">
    <div :class="isVertical ? 'pics-wrap-v' : 'pics-wrap-h'">
      <el-image
        v-for="(url, index) in ksData.ksImgs"
        :key="url"
        :src="`${imgBaseUrl}${url}`"
        lazy
        @click="showBigImg($event, index, url)"
      />
    </div>
    <div :class="isVertical ? 'fault-canvas-v faults-canvas' : 'fault-canvas-h faults-canvas'">
      <canvas
        v-for="(_, index) in canvasList"
        :ref="(el) => (faultCanvasRefs[index] = el)"
        :key="index"
      ></canvas>
    </div>
  </div>

  <ElImageViewer v-if="showViewer" @close="() => (showViewer = false)" :url-list="srcList" />
</template>

<style lang="scss" scoped>
.canvas-content {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
  @include scrollBar($color: rgba(17, 209, 251, 0.5), $activeColor: rgba(17, 209, 251, 1));
  .pics-wrap-v {
    width: 100%;
    height: auto;
    .el-image {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: v-bind(imgRatio);
      border: none;
    }
  }
  .pics-wrap-h {
    width: auto;
    height: 100%;
    @include flex($jc: flex-start);
    .el-image {
      display: block;
      width: auto;
      height: 100%;
      aspect-ratio: v-bind(imgRatio);
      flex-shrink: 0;
    }
  }
  .faults-canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    pointer-events: none;
    canvas {
      margin: 0;
      border: 0;
      padding: 0;
      display: block;
    }
    &.fault-canvas-v {
      width: 100%;
      height: auto;
      canvas {
        width: 100%;
        height: auto;
      }
    }
    &.fault-canvas-h {
      height: auto;
      height: 100%;
      @include flex($jc: flex-start);
      canvas {
        width: auto;
        height: 100%;
      }
    }
  }
}
</style>
