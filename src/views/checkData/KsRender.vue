<script setup name="KsRender">
// 创建Web Worker
const worker = new Worker(new URL('@/worker/worker.js', import.meta.url))
const batchSize = 10
const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL

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
const canvasList = ref([])
const picCanvasRefs = ref([])
const faultCanvasRefs = ref([])
const scrollContainerRef = ref(null)

onMounted(() => {
  // 初始化canvas列表
  canvasList.value = Array.from({ length: Math.ceil(ksImgs.value.length / batchSize) }, (_, i) => i)
})

watch(ksImgs, (newVal) => {
  console.log('ksImgs')
  if (Array.isArray(newVal) && newVal.length > 0) {
    canvasList.value = Array.from({ length: Math.ceil(newVal.length / batchSize) }, (_, i) => i) // 重置canvas列表
    worker.postMessage({ list: toRaw(newVal), imgBaseUrl, batchSize })
  }
})
watch(ksFaults, (newVal) => {
  console.log('ksFaults', newVal)
  updateFaults()
})

// 监听Web Worker消息
worker.onmessage = function (event) {
  const { processedImages, curIdx } = event.data
  const canvasIdx = curIdx / batchSize // canvas的索引
  const totalImgsCount = curIdx + processedImages.length // 当前已加载的图片总数
  const existImg = processedImages.find((item) => item && item.width && item.height)
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
  drawImage(processedImages, canvasIdx, canvasW, canvasH)
  // 故障框图层设置
  const canvas = faultCanvasRefs.value[canvasIdx]
  canvas.width = canvasW
  canvas.height = canvasH
  canvas.setAttribute('start', start)
  canvas.setAttribute('end', end)
  drawFaults(canvasIdx)
}
const drawImage = (processedImages, canvasIdx, canvasW, canvasH) => {
  const canvas = picCanvasRefs.value[canvasIdx]
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')
  processedImages.forEach((item, idx) => {
    if (item) {
      const { width, height } = item
      if (isVertical.value) {
        ctx.drawImage(item, 0, idx * height, width, height)
      } else {
        ctx.drawImage(item, idx * width, 0, width, height)
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

onUnmounted(() => {
  worker.terminate()
})
const handleScroll = (event) => {
  if(isVertical.value){
    return;
  }
  // 检查是否按住了水平滚动条，如果是则不处理
  if (event.shiftKey) {
    return
  }
  // 阻止默认的垂直滚动行为
  event.preventDefault()
  // 获取滚动容器元素
  const scrollContainer = scrollContainerRef.value
  // 横向滚动距离
  const delta = event.deltaY
  // 设置横向滚动条位置
  scrollContainer.scrollLeft += delta
}
</script>
<template>
  <div class="canvas-content" ref="scrollContainerRef" @wheel="handleScroll">
    <div :class="isVertical ? 'verticalContainer' : 'canvasContainer'">
      <canvas
        v-for="(item, index) in canvasList"
        :ref="(el) => (picCanvasRefs[index] = el)"
        :key="index"
        width="0"
      ></canvas>
    </div>
    <div :class="isVertical ? 'verticalContainer faults-canvas' : 'canvasContainer faults-canvas'">
      <canvas
        v-for="(item, index) in canvasList"
        :ref="(el) => (faultCanvasRefs[index] = el)"
        :key="index"
        width="0"
      ></canvas>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.canvas-content {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
  @include scrollBar($color: rgba(17, 209, 251, 0.5),$activeColor:rgba(17, 209, 251, 1));
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
