<script setup name="JSFaultMark">
import { Refresh, DArrowLeft, DArrowRight, ZoomIn, Edit, Delete } from '@element-plus/icons-vue'
import { onKeyStroke, useArrayFindLast } from '@vueuse/core'
import { ElMessageBox } from 'element-plus'
import { useWinResize } from '@/hooks/index'
import { Rect } from '@/utils/canvas.js'
import CssFilter from '@/components/CssFilter.vue'
import Magnify from '@/components/Magnify.vue'
import FaultCard from '@/components/FaultCard.vue'
import FaultMarkDialog from '@/components/FaultMarkDialog.vue'

let animateId = null

const containerRef = ref(null)
const innerRef = ref(null)
const canvasRef = ref(null)
const cssFilterRef = ref(null) // 滤镜组件
const magnifyRef = ref(null) // 放大镜组件
const faultMarkRef = ref(null)
const props = defineProps({
  list: {
    type: Array,
    default: () => []
  }
})
const { list } = toRefs(props)
const state = reactive({
  curIdx: 0,
  visible: false, // 弹框是否显示
  disabled: false, // 是否禁用滤镜等功能
  cssScale: 1, // css缩放比例
  magnify: false, // 是否显示放大镜
  hasEditRight: false, // 是否显示编辑按钮
  editMode: false, // 是否开始标注模式
  isDrawing: false, // 是否正在标注
  existingFaults: [], // 已有故障
  newFaults: [], // 新增故障
  msgBoxShow: false
})

const {
  curIdx,
  visible,
  disabled,
  cssScale,
  magnify,
  hasEditRight,
  editMode,
  isDrawing,
  existingFaults,
  newFaults,
  msgBoxShow
} = toRefs(state)
const magnifySize = computed(() => 200 / cssScale.value)
const currentItem = computed(() => list.value[curIdx.value])
const currentFaults = computed(() => currentItem.value?.faultFrames ?? [])
const currentPath = computed(() => currentItem.value?.fullPath)
const imgW = computed(() => currentItem.value?.imgW)
const imgH = computed(() => currentItem.value?.imgH)
// 所有故障列表
const allFaults = computed(() => [...existingFaults.value, ...newFaults.value])
// 选中的故障列表
const selectedFaults = computed(() => existingFaults.value.filter((rect) => rect.selected))
const pointerEvents = computed(() => (editMode.value && !magnify.value ? 'initial' : 'none'))

watch(list, () => {
  getFaults()
})
onUnmounted(() => {
  if (animateId) {
    cancelAnimationFrame(animateId)
    animateId = null
  }
})
// 打开弹框
const show = (obj) => {
  curIdx.value = obj?.idx ?? 0
  magnify.value = false
  hasEditRight.value = obj?.hasEditRight ?? false
  editMode.value = false
  isDrawing.value = false
  newFaults.value = []
  cssFilterRef.value?.resetFilter()
  visible.value = true
  getFaults()
  nextTick(init)
}
// 关闭弹框
const close = () => {
  visible.value = false
}
const handleBeforeClose = (done) => {
  newFaultsWarning(done)
}
// 获取已有故障
const getFaults = () => {
  const curFaults = [...currentFaults.value].reverse()
  let rects = []
  curFaults?.forEach((item, idx) => {
    const { coordinateX, coordinateY, width, height } = item
    const rect = new Rect(coordinateX, coordinateY)
    rect.endX = coordinateX + width
    rect.endY = coordinateY + height
    rect.info = item
    rect.showNo = true
    rect.faultNo = idx + 1
    rects.push(rect)
  })
  existingFaults.value = rects
}
// 新增故障未保存提醒
const newFaultsWarning = async (done) => {
  if (newFaults.value.length > 0) {
    if (msgBoxShow.value) {
      return
    }
    msgBoxShow.value = true
    try {
      await ElMessageBox.confirm('新增故障未保存，执行本操作后将会丢失，是否确认？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      newFaults.value = []
      done()
    } catch (error) {
      console.log('用户取消了操作')
    } finally {
      msgBoxShow.value = false
    }
  } else {
    done()
  }
}

// 初始化容器
const init = () => {
  if (visible.value) {
    const container = containerRef.value
    const inner = innerRef.value
    const width = container?.clientWidth
    const height = container?.clientHeight
    const containerRatio = width / height
    const imgRatio = imgW.value / imgH.value
    const left = (width - imgW.value) / 2
    const top = (height - imgH.value) / 2
    let drawW = 0,
      drawH = 0
    if (imgRatio - containerRatio > 0) {
      // 原图宽度更宽，按照画布宽度来画
      drawW = width
      drawH = drawW / imgRatio
    } else {
      drawH = height
      drawW = drawH * imgRatio
    }
    cssScale.value = drawW / imgW.value
    if (inner) {
      Object.assign(inner.style, {
        width: `${imgW.value}px`,
        height: `${imgH.value}px`,
        transform: `translate(${left}px, ${top}px) scale(${cssScale.value})`
      })
      drawFaults()
    }
  }
}
// 绘制故障
const drawFaults = () => {
  if (isDrawing.value && editMode.value && !animateId) {
    animateId = requestAnimationFrame(drawFaults)
  }
  const canvas = canvasRef.value
  canvas.width = imgW.value
  canvas.height = imgH.value
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, imgW.value, imgH.value)
  if (allFaults.value?.length > 0) {
    allFaults.value?.forEach((fault) => {
      fault.draw(ctx)
    })
  }
}
// 下一张
const next = () => {
  if (curIdx.value < list.value.length - 1) {
    newFaultsWarning(() => {
      curIdx.value++
      getFaults()
      reset()
      drawFaults()
    })
  }
}
// 上一张
const prev = () => {
  if (curIdx.value > 0) {
    newFaultsWarning(() => {
      curIdx.value--
      getFaults()
      reset()
      drawFaults()
    })
  }
}
// 回到第一张或者最后一张
const toggleStartOrEnd = (start = true) => {
  curIdx.value = start ? 0 : list.value.length - 1
  getFaults()
  reset()
  drawFaults()
}
// 当前图片加载失败的时候，禁用滤镜等操作
const handleLoadErr = () => {
  disabled.value = true
}
// 当前图片加载成功的时候，启用滤镜等操作
const handleLoadSuggess = () => {
  disabled.value = false
}
// 重置滤镜
const reset = () => {
  cssFilterRef.value?.resetFilter()
}
// 键盘事件
onKeyStroke(['ArrowLeft', 'ArrowUp'], (e) => {
  e.preventDefault()
  prev()
})
onKeyStroke(['ArrowRight', 'ArrowDown'], (e) => {
  e.preventDefault()
  next()
})
onKeyStroke('Home', (e) => {
  e.preventDefault()
  toggleStartOrEnd()
})
onKeyStroke('End', (e) => {
  e.preventDefault()
  toggleStartOrEnd(false)
})
const imgClick = () => {
  if (editMode.value && magnify.value) {
    magnify.value = false
  }
}
// 放大镜功能
const handleMousemove = (e) => {
  if (!magnify.value) return
  const magnifyScale = 1.5
  const largeW = imgW.value * magnifyScale
  const largeH = imgH.value * magnifyScale
  let x = e.offsetX * magnifyScale - magnifySize.value / 2 // 根据原图的尺寸算出x坐标
  let y = e.offsetY * magnifyScale - magnifySize.value / 2 // 根据原图的尺寸算出y坐标
  x = Math.max(x, 0)
  y = Math.max(y, 0)
  x = Math.min(x, largeW - magnifySize.value)
  y = Math.min(y, largeH - magnifySize.value)
  let left = e.offsetX - magnifySize.value / 2
  let top = e.offsetY - magnifySize.value / 2
  left = Math.max(left, 0)
  top = Math.max(top, 0)
  left = Math.min(left, imgW.value - magnifySize.value)
  top = Math.min(top, imgH.value - magnifySize.value)
  const style = {
    transform: `translate(${left}px, ${top}px)`,
    backgroundPosition: `-${x}px -${y}px`,
    backgroundSize: `${largeW}px ${largeH}px`
  }
  Object.assign(magnifyRef.value.$el.style, style)
}
// 开始标注-鼠标按下
const startMark = (e) => {
  // e.button !== 0判断鼠标左键是否按下,只要右键按下才开启故障绘制功能
  if (!editMode.value || e.button !== 0) return
  isDrawing.value = true
  const rect = new Rect(e.offsetX, e.offsetY, true)
  newFaults.value.push(rect)
}
// 标注-鼠标移动
const mousemoveMark = (e) => {
  // mouseup触发会有问题，isDrawing状态不一定能及时变更，结合e.button !== 0判断鼠标左键是否按下
  if (!isDrawing.value || !editMode.value || e.button !== 0 || newFaults.value.length === 0) return
  const curRect = newFaults.value[newFaults.value.length - 1]
  curRect.endX = e.offsetX
  curRect.endY = e.offsetY
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
      faultMarkRef.value.show()
    }
  }
}
// 单击列表选中已有的故障框
const selectFaultByList = (idx) => {
  if (!editMode.value || disabled.value) return
  const curFault = existingFaults.value[idx]
  if (curFault) {
    curFault.selected = !curFault.selected
    drawFaults()
  }
}
// 单击故障框选中已有故障
const selectFaultByRect = (e) => {
  if (!editMode.value || disabled.value) return
  const curFault = useArrayFindLast(existingFaults, (rect) => rect.isInSide(e.offsetX, e.offsetY))
  if (curFault.value) {
    curFault.value.selected = !curFault.value.selected
    drawFaults()
  }
}
// 编辑故障
const editFault = (idx) => {
  if (!editMode.value || disabled.value) return
  existingFaults.value.forEach((rect, index) => {
    if (index === idx) {
      rect.selected = true
    } else {
      rect.selected = false
    }
  })
  drawFaults()
  faultMarkRef.value.show()
}
// 删除故障
const deleteFault = (idx) => {
  if (!editMode.value || disabled.value) return
  existingFaults.value.forEach((rect, index) => {
    if (index === idx) {
      rect.selected = true
    } else {
      rect.selected = false
    }
  })
  drawFaults()
}

// 关闭新增故障弹框清空新增故障
const clearNewFault = () => {
  newFaults.value = []
  drawFaults()
}
// 监听窗口变化，重新绘制
useWinResize(init, 300)

defineExpose({
  show
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="故障详情"
    fullscreen
    lock-scroll
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
    :before-close="handleBeforeClose"
    @close="close"
  >
    <div class="fault-viewer">
      <div class="left-content">
        <div class="info-wrapper">
          <div class="info">
            <span>编组号：xxx</span>
            <span>车厢号：xxx</span>
          </div>
          <div class="tools">
            <el-tooltip effect="light" content="放大镜" placement="bottom">
              <el-button
                :type="magnify ? 'primary' : 'info'"
                :icon="ZoomIn"
                circle
                :disabled="disabled"
                @click="magnify = !magnify"
              />
            </el-tooltip>
            <el-tooltip v-if="hasEditRight" effect="light" content="编辑模式" placement="bottom">
              <el-button
                :type="editMode ? 'primary' : 'info'"
                :icon="Edit"
                circle
                :disabled="disabled"
                @click="editMode = !editMode"
              />
            </el-tooltip>
          </div>
        </div>
        <div class="fault-img-wrapper" ref="containerRef">
          <div class="inner-wrapper" ref="innerRef">
            <el-image
              :src="currentPath"
              class="img-wrap"
              crossorigin="anonymous"
              @error="handleLoadErr"
              @load="handleLoadSuggess"
              @mousemove.passive="handleMousemove"
              @dragover.prevent
              @drop.prevent
              @dragstart.prevent
              @click="imgClick"
            />
            <canvas
              ref="canvasRef"
              class="fault-canvas"
              @mousedown.passive="startMark"
              @mouseup.passive="stopMark"
              @mousemove.passive="mousemoveMark"
              @click="selectFaultByRect"
              :style="`pointer-events:${pointerEvents}`"
            />
            <Magnify v-show="magnify" ref="magnifyRef" :size="magnifySize" :bgPath="currentPath" />
          </div>
        </div>
        <div class="effect-wrapper">
          <div>
            <CssFilter
              ref="cssFilterRef"
              :selectors="['.img-wrap', '.zoom-layer']"
              :disabled="disabled"
            />
          </div>
          <el-tooltip effect="light" content="重置" placement="top">
            <el-button type="info" :icon="Refresh" circle :disabled="disabled" @click="reset" />
          </el-tooltip>
        </div>
        <div class="toggle-action">
          <el-button type="primary" link :disabled="curIdx <= 0" @click="prev">
            <el-icon><DArrowLeft /></el-icon>
            <span style="margin-left: 6px">上一张</span>
          </el-button>
          <div class="img-path">图片路径：{{ currentItem?.imgPath }}</div>
          <el-button type="primary" link :disabled="curIdx >= list.length - 1" @click="next">
            <span style="margin-right: 6px">下一张</span>
            <el-icon><DArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="right-content">
        <div class="card-list">
          <FaultCard
            v-for="(fault, index) in existingFaults"
            :key="fault.info?.id"
            :selected="fault.selected"
            :fault="fault.info"
            :index="index + 1"
            @click="selectFaultByList(index)"
          >
            <template v-if="editMode" #actions>
              <el-button
                type="primary"
                :icon="Edit"
                :disabled="disabled"
                circle
                @click.stop="editFault(index)"
              />
              <el-button
                type="danger"
                :icon="Delete"
                :disabled="disabled"
                circle
                @click.stop="deleteFault(index)"
              />
            </template>
          </FaultCard>
        </div>
        <div class="actions">
          <el-button
            v-if="editMode && currentFaults.length > 1"
            type="danger"
            :disabled="selectedFaults.length === 0 || disabled"
          >
            批量删除
          </el-button>
          <el-button v-if="editMode" type="primary">保存并继续</el-button>
          <el-button type="info" @click="close">取消</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
  <FaultMarkDialog ref="faultMarkRef" @close="clearNewFault" />
</template>

<style lang="scss" scoped>
.fault-viewer {
  width: 100%;
  height: calc(100vh - var(--el-dialog-padding-primary) * 3 - 30px);
  overflow: hidden;
  @include flex;
  > div {
    height: 100%;
    &.left-content {
      width: calc(60% - 20px);
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 6px;
      padding: 15px 0;
      .info-wrapper {
        width: 100%;
        height: 30px;
        line-height: 30px;
        padding: 0 15px;
        margin-bottom: 15px;
        @include flex($jc: space-between);
        color: #fff;
        font-size: 14px;
        .info {
          > span {
            & + span {
              padding-left: 15px;
            }
          }
        }
      }

      .fault-img-wrapper {
        width: 100%;
        height: calc(100% - 130px);
        position: relative;
        overflow: hidden;
        .inner-wrapper {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          .fault-canvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
          }
          .el-image {
            display: block;
            width: 100%;
            height: 100%;
            user-select: none;
            &.img-wrap {
              :deep(.el-image__error) {
                font-size: 40px;
              }
            }
          }
        }
      }
      .effect-wrapper {
        padding-right: 15px;
        margin-top: 15px;
        @include flex($jc: space-between);
        > div {
          flex: 1;
          padding: 0 15px;
        }
        .el-button {
          flex-shrink: 0;
        }
      }
      .toggle-action {
        width: 100%;
        padding: 15px 15px 0;
        flex-shrink: 0;
        @include flex($jc: space-between);
        .img-path {
          width: calc(100% - 160px);
          color: #fff;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
          word-break: break-all;
        }
        .el-button {
          color: #fff;
          &.is-disabled {
            color: rgba(255, 255, 255, 0.5);
          }
        }
      }
    }
    &.right-content {
      width: 40%;
      margin-left: 20px;
      flex-shrink: 0;
      .card-list {
        height: calc(100% - 47px);
        overflow-y: auto;
        @include scrollBar;
        :deep(.fault-card) {
          & + .fault-card {
            margin-top: 15px;
          }
        }
      }
      .actions {
        height: 47px;
        @include flex($al: flex-end);
      }
    }
  }
}
</style>
