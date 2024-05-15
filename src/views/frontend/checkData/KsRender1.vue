<script setup name="KsRender1">
import FaultViewer from '@/components/FaultViewer.vue'
import KSFaultMark from '@/components/KSFaultMark.vue'

const worker = new Worker(new URL('@/worker/handleImg.js', import.meta.url)) // 创建Web Worker
const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL // 对应环境的图片域名及端口
const batchSize = 10 // 每个canvas展示的图片数量
const faultStrokeStyle = '#FA6157' // 故障框线条颜色
const faultStrokeWidth = 3 // 故障框线条宽度

const props = defineProps({
  isVertical: {
    type: Boolean,
    default: true
  },
  list: {
    type: Array,
    default: () => [],
    required: true
  }
})

const { isVertical, list } = toRefs(props)
const scrollContainerRef = ref(null) // canvas容器的模板引用
const faultCanvasRefs = ref([]) // 故障canvas的模板引用
const faultViewerRef = ref(null)
const ksFaultMarkRef = ref(null)
const state = reactive({
  showViewer: false, // 是否显示查看器
  canvasList: [], // canvas列表
  curIdx: 0, // 当前图片查看器查看的图片索引
  handledList: [], // 处理好的列表
  imgW: 1228, // 图片宽度
  imgH: 600, // 图片高度
  isDrawing: false,
  editMode: true, // 是否开启标注模式
  mousexy: {
    point1: {
      x: 0,
      y: 0,
      idx: 0
    },
    point2: {
      x: 0,
      y: 0,
      idx: 0
    },
    location: []
  }
})
const { showViewer, canvasList, curIdx, handledList, imgW, imgH, isDrawing, editMode, mousexy } =
  toRefs(state)
const imgRatio = computed(() => imgW.value / imgH.value) // 图像宽高比
const handledImgs = computed(() => handledList.value.map((item) => item.handledImg)) // 处理好的图片列表
const allFaults = computed(() => {
  let itemRects = []
  const obj = {}
  handledList.value.forEach((item) => (itemRects = itemRects.concat(item.faultFrames)))
  itemRects = itemRects.reduce((cur, next) => {
    obj[next.id] ? '' : (obj[next.id] = true && cur.push(next))
    return cur
  }, [])
  return itemRects
})
const pointerEvents = computed(() => (editMode.value ? 'initial' : 'none'))
// 初始化画布
const initCanvas = () => {
  const leftImgs = list.value?.length % batchSize // 计算最后一个canvas中img数量
  let cStartX = 0 // 当前canvas的起始x坐标
  let cEndX = 0 // 当前canvas的结束x坐标
  let cStartY = 0 // 当前canvas的起始y坐标
  let cEndY = 0 // 当前canvas的结束y坐标
  for (let j = 0, len = faultCanvasRefs.value.length; j < len; j++) {
    const curCanvas = faultCanvasRefs.value[j]
    const totalImgsCount = j === len - 1 ? leftImgs + j * batchSize : (j + 1) * batchSize // 截止当前画布已经展示的图片数量
    if (isVertical.value) {
      curCanvas.width = imgW.value // 当前索引对应画布的宽度
      curCanvas.height = j === len - 1 ? imgH.value * leftImgs : imgH.value * batchSize // 当前索引对应画布的高度
      cEndX = imgW.value
      cEndY = imgH.value * totalImgsCount
      cStartY = cEndY - curCanvas.height
      curCanvas.setAttribute('start', cStartY)
      curCanvas.setAttribute('end', cEndY)
    } else {
      curCanvas.width = j === len - 1 ? imgW.value * leftImgs : imgW.value * batchSize
      curCanvas.height = imgH.value
      cEndY = imgH.value
      cEndX = imgW.value * totalImgsCount // 当前索引对应画布的结束位置
      cStartX = cEndX - curCanvas.width // 当前索引对应画布的起始位置
      curCanvas.setAttribute('start', cStartX)
      curCanvas.setAttribute('end', cEndX)
    }
  }
}
// 绘制故障框
const drawFaults = (isAdd = false) => {
  console.log('draw faults', allFaults.value)
  for (let j = 0, len = faultCanvasRefs.value.length; j < len; j++) {
    const curCanvas = faultCanvasRefs.value[j]
    const ctx = curCanvas.getContext('2d')
    const cStartX = isVertical.value ? 0 : Number(curCanvas.getAttribute('start')) // 当前canvas的起始x坐标
    const cEndX = isVertical.value ? imgW.value : Number(curCanvas.getAttribute('end')) // 当前canvas的结束x坐标
    const cStartY = isVertical.value ? Number(curCanvas.getAttribute('start')) : 0 // 当前canvas的起始y坐标
    const cEndY = isVertical.value ? Number(curCanvas.getAttribute('end')) : imgH.value // 当前canvas的结束y坐标

    ctx.clearRect(0, 0, curCanvas.width, curCanvas.height) // 清空画布
    ctx.strokeStyle = faultStrokeStyle
    ctx.lineWidth = faultStrokeWidth
    const faultList = isAdd ? allFaults.value.concat(mousexy.value.location) : allFaults.value
    for (let i = 0, len = faultList.length; i < len; i++) {
      const curFault = faultList[i]
      const { width, height, x, y } = curFault
      // 判断故障框是否跟当前canvas重叠
      if (
        isRectOverlap(
          {
            startX: x,
            endX: x + width,
            startY: y,
            endY: y + height
          },
          {
            startX: cStartX,
            endX: cEndX,
            startY: cStartY,
            endY: cEndY
          }
        )
      ) {
        ctx.strokeRect(x - cStartX, y - cStartY, width, height)
      }
    }
  }
}
watch([imgW, imgH, isVertical], () => {
  // 图片尺寸变化后需要重新初始化画布
  initCanvas()
})
// 数据变化，通知子进程处理数据
watch(
  list,
  (newVal) => {
    console.log('ksData', newVal)
    canvasList.value = Array.from({ length: Math.ceil(newVal?.length / batchSize) }, (_, i) => i) // 重置canvas列表
    worker.postMessage({
      list: toRaw(newVal),
      imgBaseUrl,
      isVertical: isVertical.value,
      w: imgW.value,
      h: imgH.value,
      isKs: true // 是否是快扫
    })
  },
  { deep: true, immediate: true }
)
// 故障变化后重新绘制故障框
watch(
  allFaults,
  (newVal) => {
    console.log('ksFaults', newVal)
    if (handledList.value.length === list.value.length) {
      nextTick(drawFaults)
    }
  },
  { immediate: true, deep: true }
)
// 监听Web Worker消息
worker.onmessage = function (event) {
  const { type, processedList, width, height } = event.data
  if (type === 'clear') {
    handledList.value = []
  } else if (type === 'update') {
    handledList.value = handledList.value?.concat(processedList)
    imgW.value = width || imgW.value
    imgH.value = height || imgH.value
  }
}

onUnmounted(() => {
  worker.terminate()
})
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

// 预览图片
const handlePreview = async (e, idx) => {
  const currentItem = handledList.value[idx]
  const currentFaults = currentItem.faultFrames
  console.log('xxxxxxxxxxxx', currentItem)
  const containerW = scrollContainerRef.value.clientWidth
  const scale = imgW.value / containerW // 因为画面等比缩放，计算出缩放的比例
  const offsetX = e.offsetX * scale // 根据原图的尺寸算出x坐标
  const offsetY = e.offsetY * scale // 根据原图的尺寸算出y坐标
  // 找出鼠标当前置入的故障框
  const faultsContainPonit = currentFaults?.filter((item) => {
    const { coordinateX, coordinateY, width, height } = item
    if (
      isPointInRect(
        offsetX,
        offsetY,
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
    faultViewerRef.value.show({
      data: toRaw(handledList.value),
      idx
    })
    return
  }
  curIdx.value = idx
  showViewer.value = true
}

const addNewFault = () => {
  const { point1, point2 } = mousexy.value
  const container = document.querySelector('.faults-canvas')
  if (!container) return
  // 计算页面缩放比例
  const scale = isVertical.value
    ? imgW.value / container.clientWidth
    : imgH.value / container.clientHeight
  const can1 = faultCanvasRefs.value[point1.idx]
  const can2 = faultCanvasRefs.value[point2.idx]
  const can1Start = Number(can1.getAttribute('start'))
  const can2Start = Number(can2.getAttribute('start'))
  // 把第一个canvas中点的坐标转为全图坐标
  const sX = isVertical.value ? point1.x * scale : point1.x * scale + can1Start
  const sY = isVertical.value ? point1.y * scale + can1Start : point1.y * scale
  // 把第二个canvas中点的坐标转为全图坐标
  const eX = isVertical.value ? point2.x * scale : point2.x * scale + can2Start
  const eY = isVertical.value ? point2.y * scale + can2Start : point2.y * scale
  // 计算矩形的左上角坐标和宽度、高度
  const x = Math.min(sX, eX)
  const y = Math.min(sY, eY)
  const width = Math.abs(sX - eX)
  const height = Math.abs(sY - eY)
  mousexy.value.location = [{ x, y, width, height }]
  drawFaults(true)
}
// 标注-鼠标按下
const mousedownMark = (idx, e) => {
  if (mousexy.value.location.length) {
    mousexy.value.location = []
  }
  // 记录第一个点的坐标及所在canvas的索引
  mousexy.value.point1 = {
    x: e.offsetX,
    y: e.offsetY,
    idx
  }
  isDrawing.value = true
}
// 标注-鼠标移动
const mousemoveMark = (idx, e) => {
  console.error(isDrawing.value, e.buttons)
  // mouseup触发会有问题，isDrawing状态不一定能及时变更，结合e.buttons !== 1判断鼠标左键是否按下
  if (!isDrawing.value || !editMode.value || e.buttons !== 1) return
  // 记录第二个点的坐标及所在canvas的索引
  mousexy.value.point2 = {
    x: e.offsetX,
    y: e.offsetY,
    idx
  }
  addNewFault()
}
// 标注-鼠标抬起
const mouseupMark = () => {
  if (!isDrawing.value || !editMode.value) return
  const { point1, point2, location } = mousexy.value
  if ((point1.x === point2.x && point1.y === point2.y) || !location.length) return
  isDrawing.value = false
  // 根据location中的坐标和宽高，确定故障所在的图片
  const { x, y, width, height } = location[0]
  const imgsWithFault = handledList.value.filter((_, idx) => {
    const imgStartX = isVertical.value ? 0 : imgW.value * idx
    const imgStartY = isVertical.value ? imgH.value * idx : 0
    const imgEndX = imgStartX + imgW.value
    const imgEndY = imgStartY + imgH.value
    return isRectOverlap(
      {
        startX: x,
        endX: x + width,
        startY: y,
        endY: y + height
      },
      {
        startX: imgStartX,
        endX: imgEndX,
        startY: imgStartY,
        endY: imgEndY
      }
    )
  })
  if (imgsWithFault.length) {
    const firstImg = imgsWithFault[0]
    // 找到第一张图片的索引及起始位置
    const firstImgIdx = handledList.value.findIndex((item) => item.fullPath === firstImg.fullPath)
    const firstImgStart = isVertical.value ? firstImgIdx * imgH.value : firstImgIdx * imgW.value

    ksFaultMarkRef.value.show({
      data: toRaw(imgsWithFault),
      imgW: imgW.value,
      imgH: imgH.value,
      isVertical: isVertical.value,
      fault: {
        x,
        y,
        w: width,
        h: height
      },
      firstImgStart
    })
  }
}
</script>
<template>
  <div class="canvas-content" ref="scrollContainerRef" @wheel="handleScroll">
    <div :class="isVertical ? 'pics-wrap-v' : 'pics-wrap-h'">
      <el-image
        v-for="(item, index) in handledList"
        :key="item.fullPath"
        :src="item.fullPath"
        lazy
        crossorigin="anonymous"
        @click="handlePreview($event, index)"
        @dragover.prevent
        @drop.prevent
        @dragstart.prevent
      />
    </div>
    <div :class="isVertical ? 'fault-canvas-v faults-canvas' : 'fault-canvas-h faults-canvas'">
      <canvas
        v-for="(_, index) in canvasList"
        :ref="(el) => (faultCanvasRefs[index] = el)"
        :key="index"
        @mousedown="mousedownMark(index, $event)"
        @mouseup="mouseupMark(index, $event)"
        @mousemove="mousemoveMark(index, $event)"
      />
    </div>
  </div>

  <ElImageViewer
    v-if="showViewer"
    @close="() => (showViewer = false)"
    :url-list="handledImgs"
    :initial-index="curIdx"
  />
  <FaultViewer ref="faultViewerRef" />
  <KSFaultMark ref="ksFaultMarkRef" />
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
      user-select: none;
      cursor: pointer;
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
    pointer-events: v-bind(pointerEvents);
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
