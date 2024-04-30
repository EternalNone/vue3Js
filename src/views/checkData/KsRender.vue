<script setup name="KsRender">
// 创建Web Worker
const worker = new Worker(new URL('@/worker/worker.js', import.meta.url))
const batchSize = 10
const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL // 对应环境的图片域名及端口
const allProcessedPics = [] // 所有分批处理好的图片列表（二维数组）

const props = defineProps({
  isVertical: {
    type: Boolean,
    default: true
  },
  ksImgs: {
    type: Array,
    default: () => []
  },
  ksFaults: {
    type: Array,
    default: () => []
  }
})
const { isVertical, ksImgs, ksFaults } = toRefs(props)
const canvasList = ref([]) // canvas列表
const picCanvasRefs = ref([]) // 图片canvas的模板引用
const faultCanvasRefs = ref([]) // 故障canvas的模板引用
const scrollContainerRef = ref(null) // canvas容器的模板引用
const showViewer = ref(false) // 是否显示查看器
const srcList = ref([]) // 查看器图片列表

watch(ksImgs, (newVal) => {
  console.log('ksImgs')
  if (Array.isArray(newVal) && newVal.length > 0) {
    canvasList.value = Array.from({ length: Math.ceil(newVal.length / batchSize) }, (_, i) => i) // 重置canvas列表
    allProcessedPics.length = 0
    worker.postMessage({ list: toRaw(newVal), imgBaseUrl, batchSize, isVertical: isVertical.value })
  }
})
watch(ksFaults, (newVal) => {
  console.log('ksFaults', newVal)
  nextTick(()=>{
    updateFaults()
  })

})

onUnmounted(() => {
  worker.terminate()
})

// 监听Web Worker消息
worker.onmessage = function (event) {
  const { processedImages, curIdx } = event.data
  const canvasIdx = curIdx / batchSize // canvas的索引
  const totalImgsCount = curIdx + processedImages.length // 当前已加载的图片总数
  const existImg = processedImages.find((item) => item.pic && item.pic?.width && item.pic?.height)
  let canvasW = 0,
    canvasH = 0,
    start = 0,
    end = 0
  if (isVertical.value) {
    canvasW = existImg.width // 当前索引对应画布的宽度
    canvasH = existImg.height * processedImages.length // 当前索引对应画布的高度
    start = existImg.height * totalImgsCount - canvasH // 当前索引对应画布的起始位置
    end = existImg.height * totalImgsCount // 当前索引对应画布的结束位置
  } else {
    canvasW = existImg.width * processedImages.length
    canvasH = existImg.height
    start = existImg.width * totalImgsCount - canvasW // 当前索引对应画布的起始位置
    end = existImg.width * totalImgsCount // 当前索引对应画布的结束位置
  }
  // 存储已经处理好的图片
  allProcessedPics.push(processedImages)
  // 图片图层设置
  const pCanvas = picCanvasRefs.value[canvasIdx]
  pCanvas.width = canvasW
  pCanvas.height = canvasH
  pCanvas.setAttribute('start', start)
  pCanvas.setAttribute('end', end)
  drawImage(processedImages, canvasIdx)
  // 故障框图层设置
  const fCanvas = faultCanvasRefs.value[canvasIdx]
  fCanvas.width = canvasW
  fCanvas.height = canvasH
  fCanvas.setAttribute('start', start)
  fCanvas.setAttribute('end', end)
  drawFaults(canvasIdx)
}
// 绘制图片
const drawImage = (processedImages, canvasIdx) => {
  const canvas = picCanvasRefs.value[canvasIdx]
  const ctx = canvas.getContext('2d')
  processedImages.forEach((item, idx) => {
    if (item.pic) {
      const { width, height } = item.pic
      if (isVertical.value) {
        ctx.drawImage(item.pic, 0, idx * height, width, height)
      } else {
        ctx.drawImage(item.pic, idx * width, 0, width, height)
      }
    }
  })
}
const drawFaults = (canvasIdx) => {
  const canvas = faultCanvasRefs.value[canvasIdx]
  const ctx = canvas.getContext('2d')
  ctx.strokeStyle = '#FA6157'
  ctx.lineWidth = 3
  const start = Number(canvas.getAttribute('start'))
  const end = Number(canvas.getAttribute('end'))
  ksFaults.value.forEach((item) => {
    if (item) {
      const { width, height, coordinateX, coordinateY } = item
      if (isVertical.value) {
        if (
          (coordinateY > start && coordinateY < end) ||
          (coordinateY + height > start && coordinateY + height < end)
        ) {
          ctx.strokeRect(coordinateX, coordinateY - start, width, height)
        }
      } else {
        if (
          (coordinateX > start && coordinateX < end) ||
          (coordinateX + width > start && coordinateX + width < end)
        ) {
          ctx.strokeRect(coordinateX - start, coordinateY, width, height)
        }
      }
    }
  })
}
const updateFaults = () => {
  console.log('update faults')
  console.log('xxxxxxxxsssssss',faultCanvasRefs.value.length)
  for (let j = 0, len = faultCanvasRefs.value.length; j < len; j++) {
    const curCanvas = faultCanvasRefs.value[j]
    const ctx = curCanvas.getContext('2d')
    ctx.clearRect(0, 0, curCanvas.width, curCanvas.height)
    ctx.strokeStyle = 'green'
    ctx.lineWidth = 3
    const start = Number(curCanvas.getAttribute('start'))
    const end = Number(curCanvas.getAttribute('end'))
    for (let i = 0, len = ksFaults.value.length; i < len; i++) {
      const curFault = ksFaults.value[i]
      const { width, height, coordinateX, coordinateY } = curFault
      if (isVertical.value) {
        if (
          (coordinateY > start && coordinateY < end) ||
          (coordinateY + height > start && coordinateY + height < end)
        ) {
          ctx.strokeRect(coordinateX, coordinateY - start, width, height)
        }
      } else {
        if (
          (coordinateX > start && coordinateX < end) ||
          (coordinateX + width > start && coordinateX + width < end)
        ) {
          ctx.strokeRect(coordinateX - start, coordinateY, width, height)
        }
      }
    }
  }
}

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
// 根据点击的坐标，判断是否在某个范围内
const isInRange = (x, y, startX, startY, endX, endY) => {
  return x >= startX && x <= endX && y >= startY && y <= endY
}

// 查看大图
const showBigImg = async (e, idx) => {
  const curCanvasPics = allProcessedPics[idx] // 点击的canvas里面绘制的图片列表
  const curCanvas = faultCanvasRefs.value[idx] // 点击的canvas
  const start = Number(curCanvas.getAttribute('start'))
  // const containerW = canvasOuter?.clientWidth
  // const containerH = canvasOuter?.clientHeight
  const offsetX = e.offsetX * (curCanvas.width / curCanvas.clientWidth)
  const offsetY = e.offsetY * (curCanvas.width / curCanvas.clientWidth)
  const x = isVertical.value ? offsetX : offsetX + start
  const y = isVertical.value ? offsetY + start : offsetY

  const clickPic = curCanvasPics.find((item) => {
    const { width, height, startX, startY } = item // 每张图片的起始坐标及宽高
    return isInRange(x, y, startX, startY, startX + width, startY + height)
  })
  console.log('kkkkkkk', curCanvas.width / curCanvas.clientWidth, curCanvas.height / curCanvas.clientHeight)
  const offscreenCanvas = document.createElement('canvas') // 创建离屏canvas
  const offscreenCtx = offscreenCanvas.getContext('2d')
  offscreenCanvas.width = clickPic.pic.width
  offscreenCanvas.height = clickPic.pic.height
  offscreenCtx.drawImage(clickPic.pic, 0, 0, clickPic.pic.width, clickPic.pic.height) // 将点击的图片绘制到离屏canvas上
  const url = offscreenCanvas.toDataURL('image/jpeg', 0.5)

  showViewer.value = true
  srcList.value = [url]
}
</script>
<template>
  <div class="canvas-content" ref="scrollContainerRef" @wheel="handleScroll">
    <div :class="isVertical ? 'verticalContainer' : 'canvasContainer'">
      <canvas
        v-for="(_, index) in canvasList"
        :ref="(el) => (picCanvasRefs[index] = el)"
        :key="index"
      ></canvas>
    </div>
    <div :class="isVertical ? 'verticalContainer faults-canvas' : 'canvasContainer faults-canvas'">
      <canvas
        v-for="(_, index) in canvasList"
        :ref="(el) => (faultCanvasRefs[index] = el)"
        :key="index"
        @click="showBigImg($event, index)"
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
  canvas {
    margin: 0;
    border: 0;
    padding: 0;
    display: block;
  }
  .canvasContainer {
    width: auto;
    height: 100%;
    @include flex($jc: flex-start);
    canvas {
      height: 100%;
    }
  }
  .verticalContainer {
    width: 100%;
    height: auto;
    canvas {
      width: 100%;
    }
  }
  .faults-canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
  }
}
</style>
