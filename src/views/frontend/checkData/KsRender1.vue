<script setup name="KsRender1">
import { useIntersectionObserver, useMouseInElement, useTimeoutFn } from '@vueuse/core'
import { useWebWorker } from '@/hooks/useWebWorker.js'
import { useCanvasToolsBar } from '@/hooks/useCanvasToolsBar.js'
import { isRectOverlap } from '@/utils/canvas.js'
import FaultViewer from '@/components/FaultViewer.vue'
import KSFaultMark from '@/components/KSFaultMark.vue'
import ImgsSlider from '@/components/ImgsSlider.vue'
import CanvasToolsBar from '@/components/CanvasToolsBar.vue'
import Magnify from '@/components/Magnify.vue'

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

const ksContainerRef = ref(null)
const scrollContainerRef = ref(null) // canvas容器的模板引用
const showContainerRef = ref(null)
const picsWrapRef = ref(null)
const imgsRef = ref([]) // 图片的模板引用
const magnifyRef = ref(null)
const faultCanvasRefs = ref([]) // 故障canvas的模板引用
const faultViewerRef = ref(null)
const ksFaultMarkRef = ref(null)

const state = reactive({
  canvasList: [], // canvas列表
  handledList: [], // 处理好的列表
  imgW: 1228, // 图片宽度
  imgH: 600, // 图片高度
  imgInPortIdx: 0,
  magnifySize: 250
})

const { canvasList, handledList, imgW, imgH, imgInPortIdx, magnifySize } = toRefs(state)
// web worker
const { post, workerData, terminate } = useWebWorker(
  new URL('@/worker/drawImg.js', import.meta.url)
)
// canvas相关操作
const { compare, magnify, reverse, editMode, toggleFunc } = useCanvasToolsBar()
// 观察图片是否在可视区域
const { stop } = useIntersectionObserver(
  // 要观察的元素列表(这里是图片列表)
  imgsRef,
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target) {
          imgInPortIdx.value = Number(entry.target.getAttribute('data-idx'))
        }
      }
    })
  },
  {
    threshold: 0.8
  }
)
const { elementX, elementY, isOutside } = useMouseInElement(ksContainerRef)
// 重置滚动条
const { start, stop: clearTimeoutFn } = useTimeoutFn(() => {
  imgInPortIdx.value = 0
}, 50)
//异或运算符 ^,只有一个为true时才为true，其他场景都为false
const showVertical = computed(() => Boolean(isVertical.value ^ reverse.value)) // 利用位运算，判断到底横向展示还是纵向
const imgRatio = computed(() => imgW.value / imgH.value) // 图像宽高比
const thumbnails = computed(() =>
  handledList.value.map((item) => (reverse.value ? item.handledImg : item.fullPath))
) // 处理好的图片列表
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

onUnmounted(() => {
  terminate()
  stop()
  clearTimeoutFn()
})
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
    if (showVertical.value) {
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
  drawFaults()
}
// 绘制故障框
const drawFaults = () => {
  console.log('draw faults', allFaults.value)
  for (let j = 0, len = faultCanvasRefs.value.length; j < len; j++) {
    const curCanvas = faultCanvasRefs.value[j]
    const ctx = curCanvas.getContext('2d')
    const cStartX = showVertical.value ? 0 : Number(curCanvas.getAttribute('start')) // 当前canvas的起始x坐标
    const cEndX = showVertical.value ? imgW.value : Number(curCanvas.getAttribute('end')) // 当前canvas的结束x坐标
    const cStartY = showVertical.value ? Number(curCanvas.getAttribute('start')) : 0 // 当前canvas的起始y坐标
    const cEndY = showVertical.value ? Number(curCanvas.getAttribute('end')) : imgH.value // 当前canvas的结束y坐标

    // ctx.clearRect(0, 0, curCanvas.width, curCanvas.height) // 清空画布
    ctx.strokeStyle = faultStrokeStyle
    ctx.lineWidth = faultStrokeWidth
    const faultList = allFaults.value
    for (let i = 0, len = faultList.length; i < len; i++) {
      const curFault = faultList[i]
      const { w, h, gX, gY, revGx, revGy, revW, revH } = curFault
      const faultX = reverse.value ? revGx : gX
      const faultY = reverse.value ? revGy : gY
      const faultW = reverse.value ? revW : w
      const faultH = reverse.value ? revH : h
      // 判断故障框是否跟当前canvas重叠
      if (
        isRectOverlap(
          {
            startX: faultX,
            endX: faultX + faultW,
            startY: faultY,
            endY: faultY + faultH
          },
          {
            startX: cStartX,
            endX: cEndX,
            startY: cStartY,
            endY: cEndY
          }
        )
      ) {
        ctx.strokeRect(faultX - cStartX, faultY - cStartY, faultW, faultH)
      }
    }
  }
}

// 数据变化，通知子进程处理数据
watch(
  list,
  (newVal) => {
    console.log('ksData', newVal)
    canvasList.value = Array.from({ length: Math.ceil(newVal?.length / batchSize) }, (_, i) => i) // 重置canvas列表
    post({
      list: toRaw(newVal),
      imgBaseUrl,
      isVertical: isVertical.value,
      w: imgW.value,
      h: imgH.value
    })
  },
  { deep: true, immediate: true }
)
// 监听web worker数据变化
watch(workerData, (newVal) => {
  const { type, processedList, normalW, normalH, reverseW, reverseH } = newVal
  if (type === 'clear') {
    handledList.value = []
  } else if (type === 'update') {
    handledList.value = handledList.value?.concat(processedList)
    imgW.value = reverse.value ? reverseW || imgW.value : normalW || imgW.value
    imgH.value = reverse.value ? reverseH || imgH.value : normalH || imgH.value
  }
  initCanvas()
})
// 看图方式切换，图片宽高需要互换，重新绘制故障
watch(reverse, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    imgInPortIdx.value = 0
    const temp = imgW.value
    imgW.value = imgH.value
    imgH.value = temp
    initCanvas()
    if (showVertical.value) {
      scrollContainerRef.value.scrollTop = 0
    } else {
      scrollContainerRef.value.scrollLeft = 0
    }
    start()
  }
})
// 切换显示历史图，重置滚动条
watch(compare, () => {
  if (showVertical.value) {
    scrollContainerRef.value.scrollTop = 0
  } else {
    scrollContainerRef.value.scrollLeft = 0
  }
  start()
})
// 鼠标离开图片区域，则关掉放大镜
// watch(isOutside, (newVal) => {
//   if (newVal) {
//     toggleFunc('magnify', false)
//   }
// })
// 横向滚动事件
const handleScroll = (e) => {
  if (showVertical.value) {
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

// 预览图片
const handlePreview = async (idx) => {
  faultViewerRef.value.show({
    data: toRaw(handledList.value),
    idx
  })
}

// 滑块定位
const sliderChange = (idx) => {
  const ele = imgsRef.value[idx]
  if (ele) {
    ele?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
// 放大镜功能
const handleMousemove = (idx, e) => {
  if (!magnify.value) return
  const curImg = reverse.value
    ? handledList.value[idx]?.handledImg
    : handledList.value[idx]?.fullPath
  const realW = picsWrapRef.value.clientWidth
  const realH = picsWrapRef.value.clientHeight
  const scale = reverse.value ? realH / imgH.value : realW / imgW.value // 因为画面等比缩放，计算出缩放的比例
  const magnifyScale = scale * 1.5
  let x = (e.offsetX / scale) * magnifyScale - magnifySize.value / 2 // 根据原图的尺寸算出x坐标
  let y = (e.offsetY / scale) * magnifyScale - magnifySize.value / 2 // 根据原图的尺寸算出y坐标
  x = Math.max(x, 0)
  y = Math.max(y, 0)
  x = Math.min(x, imgW.value * magnifyScale - magnifySize.value)
  y = Math.min(y, imgH.value * magnifyScale - magnifySize.value)
  let left = elementX.value - magnifySize.value / 2
  let top = elementY.value - magnifySize.value / 2
  left = Math.max(left, 0)
  top = Math.max(top, 0)
  left = Math.min(left, realW - magnifySize.value)
  top = Math.min(top, realH - magnifySize.value)
  magnifyRef.value.$el.style.left = `${left}px`
  magnifyRef.value.$el.style.top = `${top}px`
  magnifyRef.value.$el.style.backgroundImage = `url(${curImg})`
  magnifyRef.value.$el.style.backgroundPosition = `-${x}px -${y}px`
  magnifyRef.value.$el.style.backgroundSize = `${imgW.value * magnifyScale}px ${imgH.value * magnifyScale}px`
}
</script>
<template>
  <div
    :class="showVertical ? 'ks-container ks-container-v' : 'ks-container ks-container-h'"
    ref="ksContainerRef"
  >
    <CanvasToolsBar
      :showVertical="showVertical"
      :compare="compare"
      :magnify="magnify"
      :editMode="editMode"
      :fullScreenContainer="ksContainerRef"
      @toggleFunc="toggleFunc"
    />
    <Magnify v-show="magnify" ref="magnifyRef" :size="magnifySize" />
    <div class="scroll-container" ref="scrollContainerRef" @wheel="handleScroll">
      <div v-show="compare" :class="compare ? 'compare-wrap' : ''">
        <div class="pics-wrap">
          <div
            class="img-wrap"
            v-for="(item, index) in handledList"
            :key="reverse ? item.handledImg : item.fullPath"
            :data-idx="index"
          >
            <el-image
              :src="reverse ? item.handledImg : item.fullPath"
              lazy
              crossorigin="anonymous"
              @mousemove.passive="handleMousemove(index, $event)"
              @dragover.prevent
              @drop.prevent
              @dragstart.prevent
            />
          </div>
        </div>
      </div>
      <div :class="compare ? 'compare-wrap' : ''" ref="showContainerRef">
        <div class="pics-wrap" ref="picsWrapRef">
          <div
            class="img-wrap"
            v-for="(item, index) in handledList"
            :key="reverse ? item.handledImg : item.fullPath"
            :ref="(el) => (imgsRef[index] = el)"
            :data-idx="index"
          >
            <el-image
              :src="reverse ? item.handledImg : item.fullPath"
              lazy
              crossorigin="anonymous"
              @click="handlePreview(index)"
              @mousemove.passive="handleMousemove(index, $event)"
              @dragover.prevent
              @drop.prevent
              @dragstart.prevent
            />
          </div>
        </div>
        <div class="faults-canvas">
          <canvas
            v-for="(_, index) in canvasList"
            :ref="(el) => (faultCanvasRefs[index] = el)"
            :key="index"
          />
        </div>
      </div>
    </div>
    <FaultViewer ref="faultViewerRef" />
    <KSFaultMark ref="ksFaultMarkRef" />
    <ImgsSlider
      :images="thumbnails"
      :step="10"
      v-model="imgInPortIdx"
      :vertical="showVertical"
      :scrollRef="scrollContainerRef"
      @change="sliderChange"
    />
  </div>
</template>

<style lang="scss" scoped>
.ks-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  &.ks-container-v {
    .tools-bar {
      width: calc(100% - 8px);
    }
    .scroll-container {
      width: 100%;
      height: 100%;
      overflow: auto;
      @include scrollBar($color: rgba(17, 209, 251, 0.5), $activeColor: rgba(17, 209, 251, 1));
      @include flex($jc: flex-start, $al: flex-start);
      > div {
        width: 100%;
        height: auto;
        position: relative;
        &.compare-wrap {
          width: 50%;
          height: auto;
          border-right: 2px solid var(--el-color-primary);
        }
        .pics-wrap {
          width: 100%;
          height: auto;
          .img-wrap {
            width: 100%;
            height: auto;
            aspect-ratio: v-bind(imgRatio);
            .el-image {
              display: block;
              width: 100%;
              height: 100%;
              // aspect-ratio: v-bind(imgRatio);
              border: none;
              user-select: none;
              cursor: pointer;
            }
          }
        }
        .faults-canvas {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 100;
          width: 100%;
          height: auto;
          pointer-events: none;
          canvas {
            margin: 0;
            border: 0;
            padding: 0;
            display: block;
            width: 100%;
            height: auto;
          }
        }
      }
    }
  }
  &.ks-container-h {
    .tools-bar {
      width: 100%;
    }
    .scroll-container {
      width: 100%;
      height: 100%;
      overflow: auto;
      @include scrollBar($color: rgba(17, 209, 251, 0.5), $activeColor: rgba(17, 209, 251, 1));
      @include flex($dir: column, $jc: flex-start, $al: flex-start);
      > div {
        width: auto;
        height: 100%;
        position: relative;
        &.compare-wrap {
          width: auto;
          height: 50%;
          border-bottom: 2px solid var(--el-color-primary);
        }
        .pics-wrap {
          width: auto;
          height: 100%;
          @include flex($jc: flex-start);
          .img-wrap {
            width: auto;
            height: 100%;
            aspect-ratio: v-bind(imgRatio);
            .el-image {
              display: block;
              // width: auto;
              width: 100%;
              height: 100%;
              // aspect-ratio: v-bind(imgRatio);
              flex-shrink: 0;
            }
          }
        }
        .faults-canvas {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 100;
          height: auto;
          height: 100%;
          pointer-events: none;
          @include flex($jc: flex-start);
          canvas {
            margin: 0;
            border: 0;
            padding: 0;
            display: block;
            width: auto;
            height: 100%;
          }
        }
      }
    }
  }
}
</style>
