<script setup name="KsRender2">
import { h } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Remove, Edit, RefreshRight, CircleCheck } from '@element-plus/icons-vue'
import {
  useIntersectionObserver,
  useMouseInElement,
  useTimeoutFn,
  useArrayFind,
  useElementBounding
} from '@vueuse/core'

import { useWebWorker } from '@/hooks/useWebWorker.js'
import { useCanvasToolsBar } from '@/hooks/useCanvasToolsBar.js'
import ContextMenu from '@imengyu/vue3-context-menu'
import { Rect } from '@/utils/canvas.js'
import { deleteFault } from '@/api/checkData'
import FaultViewer from '@/components/FaultViewer.vue'
import ImgsSlider from '@/components/ImgsSlider.vue'
import CanvasToolsBar from '@/components/CanvasToolsBar.vue'
import Magnify from '@/components/Magnify.vue'
import KSFaultMark from '@/components/KSFaultMark.vue'
import FaultTip from '@/components/FaultTip.vue'

const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL // 对应环境的图片域名及端口
const batchSize = 10 // 每个canvas展示的图片数量
let animateId = null
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
const emits = defineEmits(['refresh'])
const { isVertical, list } = toRefs(props)

const ksContainerRef = ref(null) // 快扫看图容器区域
const scrollContainerRef = ref(null) // 滚动容器区域
const imgsRef = ref([]) // 图片的模板引用
const magnifyRef = ref(null) // 放大镜
const faultCanvasRefs = ref([]) // 故障canvas的模板引用
const faultViewerRef = ref(null) // 故障查看器
const ksFaultMarkRef = ref(null) // 快扫故障标注表单
const faultTipRef = ref(null) // 故障提示框

const state = reactive({
  canvasList: [], // canvas列表
  handledList: [], // 处理好的列表
  imgW: 1228, // 图片宽度
  imgH: 600, // 图片高度
  imgInPortIdx: 0, // 当前可视区域的图片索引
  magnifySize: 250, // 放大镜尺寸
  isDrawing: false,
  newFaults: [] // 新增故障框
})

const { canvasList, handledList, imgW, imgH, imgInPortIdx, magnifySize, isDrawing, newFaults } =
  toRefs(state)
// web worker
const { post, workerData, terminate } = useWebWorker(
  new URL('@/worker/handleKsData.js', import.meta.url)
)
// 获取滚动容器尺寸
const { width, height } = useElementBounding(scrollContainerRef)
// 获取故障提示框尺寸
const { width: tipW, height: tipH } = useElementBounding(faultTipRef)
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
    threshold: 0.6,
    root: scrollContainerRef
  }
)
const { elementX, elementY, isOutside, stop: stopWatchMouseIn } = useMouseInElement(ksContainerRef)
// 重置滚动条
const { start, stop: clearTimeoutFn } = useTimeoutFn(() => {
  imgInPortIdx.value = 0
}, 50)

//异或运算符 ^,只有一个为true时才为true，其他场景都为false
const showVertical = computed(() => Boolean(isVertical.value ^ reverse.value)) // 利用位运算，判断到底横向展示还是纵向
const imgRatio = computed(() => imgW.value / imgH.value) // 图像宽高比
// 计算页面缩放比例
const scale = computed(() => {
  const containerW = compare.value ? width.value / 2 : width.value
  const containerH = compare.value ? height.value / 2 : height.value
  return showVertical.value ? containerW / imgW.value : containerH / imgH.value
})
const pointerEvents = computed(() => (editMode.value && !magnify.value ? 'initial' : 'none'))
// 图片滚动条的图片
const thumbnails = computed(() =>
  handledList.value.map((item) => (reverse.value ? item.handledImg : item.fullPath))
)
// 已有故障
const existingFaults = computed(() => {
  const rects = []
  handledList.value.forEach((item) => {
    item.faultFrames.forEach((fault) => {
      if (rects?.findIndex((f) => f.info?.id === fault.id) === -1) {
        const { w, h, gX, gY, revGx, revGy, revW, revH } = fault
        const faultX = reverse.value ? revGx : gX
        const faultY = reverse.value ? revGy : gY
        const faultW = reverse.value ? revW : w
        const faultH = reverse.value ? revH : h
        const react = new Rect(faultX, faultY)
        react.endX = faultX + faultW
        react.endY = faultY + faultH
        react.info = fault
        rects.push(react)
      }
    })
  })
  return rects
})
const allFaults = computed(() => existingFaults.value.concat(newFaults.value))

onUnmounted(() => {
  terminate()
  stop()
  clearTimeoutFn()
  stopWatchMouseIn()
  if (animateId) {
    cancelAnimationFrame(animateId)
    animateId = null
  }
})

// 数据变化，通知子进程处理数据
watch(
  list,
  (newVal) => {
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
    clearNewFault()
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
watch(isOutside, (newVal) => {
  if (newVal) {
    toggleFunc('magnify', false)
  }
})
watch(editMode, () => {
  // 清空新增的故障列表，重置故障状态为未选中
  newFaults.value = []
  existingFaults.value.forEach((i) => (i.selected = false))
  drawFaults()
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
  if (isDrawing.value && editMode.value && !animateId) {
    animateId = requestAnimationFrame(drawFaults)
  }
  for (let j = 0, len = faultCanvasRefs.value.length; j < len; j++) {
    const cvs = faultCanvasRefs.value[j]
    const ctx = cvs.getContext('2d')
    const cStartX = showVertical.value ? 0 : Number(cvs.getAttribute('start')) // 当前canvas的起始x坐标
    const cEndX = showVertical.value ? imgW.value : Number(cvs.getAttribute('end')) // 当前canvas的结束x坐标
    const cStartY = showVertical.value ? Number(cvs.getAttribute('start')) : 0 // 当前canvas的起始y坐标
    const cEndY = showVertical.value ? Number(cvs.getAttribute('end')) : imgH.value // 当前canvas的结束y坐标

    ctx.clearRect(0, 0, cvs.width, cvs.height)
    allFaults.value.forEach((rect) => {
      if (
        rect.isRectOverlap({
          startX: cStartX,
          endX: cEndX,
          startY: cStartY,
          endY: cEndY
        })
      ) {
        rect.offsetX = cStartX
        rect.offsetY = cStartY
        rect.draw(ctx)
      }
    })
  }
}
// 横向滚动事件
const handleScroll = (e) => {
  // 滚动时隐藏提示框
  faultTipRef.value.hide()
  if (showVertical.value) {
    return
  }
  // 检查是否按住了水平滚动条，如果是则不处理
  if (e.shiftKey) {
    return
  }
  // 获取滚动容器元素
  const scrollContainer = scrollContainerRef.value
  // 横向滚动距离
  const delta = e.deltaY
  // 设置横向滚动条位置
  scrollContainer.scrollLeft += delta
}

// 预览图片
const handlePreview = async (idx) => {
  if (editMode.value && magnify.value) {
    toggleFunc('magnify', false)
    return
  }
  faultViewerRef.value.show({
    data: toRaw(handledList.value),
    idx,
    reverse: reverse.value,
    isKs: true
  })
}

// 滑块定位
const sliderChange = (idx) => {
  const ele = imgsRef.value[idx]
  if (ele) {
    ele?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
// 放大镜功能、故障详情查看
const handleMousemove = (idx, e) => {
  if (magnify.value) {
    const curImg = reverse.value
      ? handledList.value[idx]?.handledImg
      : handledList.value[idx]?.fullPath
    const magnifyScale = Math.max(scale.value * 1.5, 1)
    const largeW = imgW.value * magnifyScale
    const largeH = imgH.value * magnifyScale
    let x = (e.offsetX / scale.value) * magnifyScale - magnifySize.value / 2 // 根据原图的尺寸算出x坐标
    let y = (e.offsetY / scale.value) * magnifyScale - magnifySize.value / 2 // 根据原图的尺寸算出y坐标
    x = Math.max(x, 0)
    y = Math.max(y, 0)
    x = Math.min(x, largeW - magnifySize.value)
    y = Math.min(y, largeH - magnifySize.value)
    let left = elementX.value - magnifySize.value / 2
    let top = elementY.value - magnifySize.value / 2
    left = Math.max(left, 0)
    top = Math.max(top, 0)
    left = Math.min(left, width.value - magnifySize.value)
    top = Math.min(top, height.value - magnifySize.value)
    const style = {
      transform: `translate(${left}px, ${top}px)`,
      backgroundImage: `url(${curImg})`,
      backgroundPosition: `-${x}px -${y}px`,
      backgroundSize: `${largeW}px ${largeH}px`
    }
    Object.assign(magnifyRef.value.$el.style, style)
  } else {
    const imgStart = showVertical.value ? idx * imgH.value : idx * imgW.value
    const x = showVertical.value ? e.offsetX / scale.value : e.offsetX / scale.value + imgStart
    const y = showVertical.value ? e.offsetY / scale.value + imgStart : e.offsetY / scale.value
    const curFault = useArrayFind(existingFaults.value.reverse(), (rect) => rect.isInSide(x, y))
    if (curFault.value) {
      let left = elementX.value - tipW.value / 2 + curFault.value.width
      let top = elementY.value - tipH.value / 2
      left = Math.max(left, 0)
      top = Math.max(top, 0)
      left = Math.min(left, width.value - tipW.value)
      top = Math.min(top, height.value - tipH.value)
      faultTipRef.value.show(curFault.value.info)
      Object.assign(faultTipRef.value.$el.style, {
        transform: `translate(${left}px, ${top}px)`
      })
    } else {
      faultTipRef.value.hide()
    }
  }
}
// 根据canvas的索引，及其上一个点的坐标获取相对于全图的坐标
const getGlobalPosition = (cvsIdx, offsetX, offsetY) => {
  const cvs = faultCanvasRefs.value[cvsIdx]
  const cvsStart = Number(cvs.getAttribute('start'))
  // 局部坐标转全图坐标
  const x = showVertical.value ? offsetX / scale.value : offsetX / scale.value + cvsStart
  const y = showVertical.value ? offsetY / scale.value + cvsStart : offsetY / scale.value
  return { x, y }
}
// 开始标注-鼠标按下
const startMark = (idx, e) => {
  // e.button !== 0判断鼠标左键是否按下,只要右键按下才开启故障绘制功能
  if (!editMode.value || e.button !== 0) return
  isDrawing.value = true
  const { x, y } = getGlobalPosition(idx, e.offsetX, e.offsetY)
  const rect = new Rect(x, y, true)
  newFaults.value.push(rect)
}
// 标注-鼠标移动
const mousemoveMark = (idx, e) => {
  // mouseup触发会有问题，isDrawing状态不一定能及时变更，结合e.button !== 0判断鼠标左键是否按下
  if (!isDrawing.value || !editMode.value || e.button !== 0 || newFaults.value.length === 0) return
  // 局部坐标转全图坐标
  const curRect = newFaults.value[newFaults.value.length - 1]
  const { x, y } = getGlobalPosition(idx, e.offsetX, e.offsetY)
  curRect.endX = x
  curRect.endY = y
  drawFaults()
}
// 停止标注-鼠标抬起
const stopMark = () => {
  if (!editMode.value || !isDrawing.value) {
    return
  }
  isDrawing.value = false
  if (animateId) {
    cancelAnimationFrame(animateId)
    animateId = null
  }
  if (newFaults.value.length > 0) {
    // 太小的故障框直接删除
    const curRect = newFaults.value[newFaults.value.length - 1]
    if (curRect.width <= 10 || curRect.height <= 10) {
      newFaults.value.pop()
      drawFaults()
    } else {
      ksFaultMarkRef.value.show()
    }
  }
}
// 关闭新增故障弹框清空新增故障
const clearNewFault = () => {
  newFaults.value = []
  drawFaults()
}
// 单击选中已有的故障框
const selectFault = (idx, e) => {
  if (!editMode.value) return
  const { x, y } = getGlobalPosition(idx, e.offsetX, e.offsetY)
  const curFault = useArrayFind(existingFaults.value.reverse(), (rect) => rect.isInSide(x, y))
  if (curFault.value) {
    curFault.value.selected = !curFault.value.selected
    drawFaults()
  }
}
// 删除故障
const deleteFaults = async (id, isBatch = false) => {
  try {
    await ElMessageBox.confirm(isBatch ? '确定删除所有选中的故障？' : '确定删除该故障？', '', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'error',
      customStyle: { width: '300px' }
    })

    if (isBatch) {
      console.log('批量删除')
    } else {
      // 单个删除
      deleteFault(id).then((res) => {
        if (res.result) {
          ElMessage.success('删除成功')
          emits('refresh')
        } else {
          ElMessage.error(res.message)
        }
      })
    }
  } catch (error) {
    console.log('用户取消了操作')
  }
}
// 右键菜单
const showRightMenu = (idx, e) => {
  e.preventDefault()
  const { x, y } = getGlobalPosition(idx, e.offsetX, e.offsetY)
  const curFault = useArrayFind(existingFaults.value.reverse(), (rect) => rect.isInSide(x, y))
  const selectedFaults = existingFaults.value.filter((rect) => rect.selected)
  if (curFault.value) {
    existingFaults.value.forEach((i) => (i.selected = false))
    curFault.value.selected = true
    drawFaults()
    ContextMenu.showContextMenu({
      x: elementX.value,
      y: elementY.value,
      clickCloseOnOutside: true,
      getContainer: () => document.querySelector('.ks-container'),
      items: [
        {
          label: '编辑故障',
          icon: h(Edit),
          divided: 'down',
          onClick: () => {
            ksFaultMarkRef.value.show(curFault.value?.info)
          }
        },
        {
          label: '删除故障',
          icon: h(Remove),
          onClick: () => deleteFaults(curFault.value?.info?.id)
        }
      ]
    })
  } else {
    ContextMenu.showContextMenu({
      x: elementX.value,
      y: elementY.value,
      clickCloseOnOutside: true,
      getContainer: () => document.querySelector('.ks-container'),
      items: [
        {
          label: '全部选中',
          divided: 'down',
          disabled: selectedFaults.length >= existingFaults.value.length,
          icon: h(CircleCheck),
          onClick: () => {
            existingFaults.value.forEach((i) => (i.selected = true))
            drawFaults()
          }
        },
        {
          label: '全部取消',
          icon: h(RefreshRight),
          divided: 'down',
          disabled: selectedFaults.length === 0,
          onClick: () => {
            existingFaults.value.forEach((i) => (i.selected = false))
            drawFaults()
          }
        },
        {
          label: '批量删除',
          disabled: selectedFaults.length === 0,
          icon: h(Delete),
          onClick: () => {
            console.log('批量删除')
          }
        }
      ]
    })
  }
}
</script>
<template>
  <div
    :class="showVertical ? 'ks-container ks-container-v' : 'ks-container ks-container-h'"
    ref="ksContainerRef"
  >
    <div class="scroll-container" ref="scrollContainerRef" @wheel.passive="handleScroll">
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
              scroll-container=".scroll-container"
              crossorigin="anonymous"
              @mousemove.passive="handleMousemove(index, $event)"
              @dragover.prevent
              @drop.prevent
              @dragstart.prevent
            />
          </div>
        </div>
      </div>
      <div :class="compare ? 'compare-wrap' : ''">
        <div class="pics-wrap">
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
              scroll-container=".scroll-container"
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
            @mousedown.passive="startMark(index, $event)"
            @mouseup.passive="stopMark"
            @mousemove="mousemoveMark(index, $event)"
            @click="selectFault(index, $event)"
            @contextmenu="showRightMenu(index, $event)"
          />
        </div>
      </div>
    </div>
    <CanvasToolsBar
      :showVertical="showVertical"
      :compare="compare"
      :magnify="magnify"
      :editMode="editMode"
      showEditMode
      :fullScreenContainer="ksContainerRef"
      @toggleFunc="toggleFunc"
    />
    <Magnify v-show="magnify" ref="magnifyRef" :size="magnifySize" />
    <ImgsSlider
      :images="thumbnails"
      :step="10"
      v-model="imgInPortIdx"
      :vertical="showVertical"
      :scrollRef="scrollContainerRef"
      @change="sliderChange"
    />
    <FaultViewer ref="faultViewerRef" />
    <KSFaultMark ref="ksFaultMarkRef" @close="clearNewFault" />
    <FaultTip ref="faultTipRef" />
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
          pointer-events: v-bind(pointerEvents);
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
          pointer-events: v-bind(pointerEvents);
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
  :deep(.mx-context-menu-item) {
    .label {
      font-size: 12px;
    }
    .mx-icon-placeholder {
      svg {
        width: 16px;
        height: 16px;
      }
    }
  }
}
</style>
