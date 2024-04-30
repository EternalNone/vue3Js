<script setup name="KsRender1">
const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL // 对应环境的图片域名及端口
const batchSize = 10
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
const scrollContainerRef = ref(null) // canvas容器的模板引用
const showViewer = ref(false) // 是否显示查看器
const srcList = ref([]) // 查看器图片列表
const canvasList = ref([]) // canvas列表
const faultCanvasRefs = ref([]) // 故障canvas的模板引用
const imgW = ref(1228)
const imgH = ref(600)
const imgRatio = computed(() => {
  return imgW.value / imgH.value
})

watch(ksImgs, (newVal) => {
  console.log('ksImgs')
  canvasList.value = Array.from({ length: Math.ceil(newVal.length / batchSize) }, (_, i) => i) // 重置canvas列表
  if (Array.isArray(newVal) && newVal.length) {
    getExistImg(newVal).then((existImg) => {
      imgW.value = existImg.width
      imgH.value = existImg.height
    })
  }
})
watch(ksFaults, (newVal) => {
  console.log('ksFaults', newVal)
  nextTick(() => {
    updateFaults()
  })
})
const updateFaults = () => {
  console.log('update faults')
  const leftImgs = ksImgs.value.length % batchSize // 计算最后一个canvas中img数量
  let start = 0
  let end = 0
  for (let j = 0, len = faultCanvasRefs.value.length; j < len; j++) {
    const curCanvas = faultCanvasRefs.value[j]
    const ctx = curCanvas.getContext('2d')
    const totalImgsCount = j === len - 1 ? leftImgs + j * batchSize : (j + 1) * batchSize // 截止当前画布已经展示的图片数量

    if (isVertical.value) {
      curCanvas.width = imgW.value // 当前索引对应画布的宽度
      curCanvas.height = j === len - 1 ? leftImgs * imgH.value : imgH.value * batchSize // 当前索引对应画布的高度
      start = imgH.value * totalImgsCount - curCanvas.height // 当前索引对应画布的起始位置
      end = imgH.value * totalImgsCount // 当前索引对应画布的结束位置
    } else {
      curCanvas.width = j === len - 1 ? leftImgs * imgW.value : imgW.value * batchSize
      curCanvas.height = imgH.value
      start = imgW.value * totalImgsCount - curCanvas.width // 当前索引对应画布的起始位置
      end = imgW.value * totalImgsCount // 当前索引对应画布的结束位置
    }
    curCanvas.setAttribute('start', start)
    curCanvas.setAttribute('end', end)
    ctx.clearRect(0, 0, curCanvas.width, curCanvas.height)
    ctx.strokeStyle = '#FA6157'
    ctx.lineWidth = 3
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
const showBigImg = (e, idx) => {
  const curCanvas = faultCanvasRefs.value[idx] // 点击的canvas
  const scale = isVertical.value
    ? curCanvas.width / curCanvas.clientWidth
    : curCanvas.height / curCanvas.clientHeight
  const start = Number(curCanvas.getAttribute('start'))
  const offsetX = e.offsetX * scale
  const offsetY = e.offsetY * scale
  const offset = isVertical.value ? offsetY : offsetX
  const url = ksImgs.value[Math.floor((start + offset) / imgH.value)]
  const isClickFault = ksFaults.value.some((item) => {
    const { coordinateX, coordinateY, width, height } = item
    return isInRange(
      offsetX,
      offsetY,
      coordinateX,
      coordinateY,
      coordinateX + width,
      coordinateY + height
    )
  })
  if(isClickFault) {
    console.log('点击故障框')
    return;
  }
  srcList.value = [`${imgBaseUrl}${url}`]
  showViewer.value = true
}
</script>
<template>
  <div class="canvas-content" ref="scrollContainerRef" @wheel="handleScroll">
    <div :class="isVertical ? 'pics-wrap-v' : 'pics-wrap-h'">
      <el-image v-for="url in ksImgs" :key="url" :src="`${imgBaseUrl}${url}`" lazy />
    </div>
    <div :class="isVertical ? 'fault-canvas-v faults-canvas' : 'fault-canvas-h faults-canvas'">
      <canvas
        v-for="(_, index) in canvasList"
        :ref="(el) => (faultCanvasRefs[index] = el)"
        :key="index"
        @click.self="showBigImg($event, index)"
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
    @include flex;
    .el-image {
      display: block;
      width: auto;
      height: 100%;
      aspect-ratio: v-bind(imgRatio);
    }
  }
  .faults-canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    // pointer-events: none;
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
      width: 100%;
      height: auto;
      width: auto;
      height: 100%;
      @include flex;
      canvas {
        width: auto;
        height: 100%;
      }
    }
  }
}
</style>
