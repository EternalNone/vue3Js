<script setup name="KsFaultViewer">
import { Refresh, DArrowLeft, DArrowRight, ZoomIn } from '@element-plus/icons-vue'
import { onKeyStroke } from '@vueuse/core'
import { useWinResize } from '@/hooks/useWinResize'
import CssFilter from './CssFilter.vue'
import Magnify from '@/components/Magnify.vue'

const faultStrokeStyle = '#FA6157' // 故障框线条颜色
const faultStrokeWidth = 3 // 故障框线条宽度
const columns = [
  {
    label: '故障类型',
    prop: 'type',
    minWidth: 100,
    align: 'center',
    ellipsis: true
  },
  {
    label: '故障部位',
    prop: 'checkItem',
    minWidth: 150,
    align: 'center',
    ellipsis: true
  },
  {
    label: '故障描述',
    prop: 'faultDesc',
    minWidth: 150,
    align: 'center',
    ellipsis: true
  },
  {
    label: '故障状态',
    prop: 'affirm',
    minWidth: 100,
    align: 'center',
    ellipsis: true,
    slotName: 'affirm'
  }
]

const containerRef = ref(null)
const innerRef = ref(null)
const canvasRef = ref(null)
const cssFilterRef = ref(null) // 滤镜组件
const magnifyRef = ref(null) // 放大镜组件

const state = reactive({
  list: [],
  curIdx: 0,
  imgW: 1228, // 图片宽度
  imgH: 600, // 图片宽度
  reverse: false, // 是否反转看图
  visible: false, // 弹框是否显示
  disabled: false, // 是否禁用滤镜等功能
  cssScale: 1, // css缩放比例
  magnify: false, // 是否显示放大镜
  magnifySize: 250 // 放大镜尺寸
})

const { list, curIdx, imgW, imgH, reverse, visible, disabled, cssScale, magnify, magnifySize } =
  toRefs(state)

const currentItem = computed(() => list.value[curIdx.value])
const currentPath = computed(() =>
  reverse.value ? currentItem.value?.handledImg : currentItem.value?.fullPath
)

const show = (obj) => {
  visible.value = true
  list.value = obj?.data || []
  curIdx.value = obj?.idx ?? 0
  imgW.value = obj?.imgW ?? imgW.value
  imgH.value = obj?.imgH ?? imgH.value
  reverse.value = obj?.reverse ?? false
  magnify.value = false
  cssFilterRef.value?.resetFilter()
  nextTick(init)
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
        left: `${left}px`,
        top: `${top}px`,
        transform: `scale(${cssScale.value})`
      })
      drawFaults()
    }
  }
}
// 绘制故障
const drawFaults = () => {
  const canvas = canvasRef.value
  canvas.width = imgW.value
  canvas.height = imgH.value
  const ctx = canvas.getContext('2d')
  // ctx.clearRect(0, 0, imgW.value, imgH.value)
  ctx.strokeStyle = faultStrokeStyle
  ctx.lineWidth = faultStrokeWidth
  if (currentItem.value?.faultFrames?.length > 0) {
    currentItem.value?.faultFrames?.forEach((fault) => {
      const { w, h, cX, cY, revCx, revCy, revW, revH } = fault
      const faultX = reverse.value ? revCx : cX
      const faultY = reverse.value ? revCy : cY
      const faultW = reverse.value ? revW : w
      const faultH = reverse.value ? revH : h
      ctx.strokeRect(faultX, faultY, faultW, faultH)
    })
  }
}
// 下一张
const next = () => {
  if (curIdx.value < list.value.length - 1) {
    curIdx.value++
    reset()
    drawFaults()
  }
}
// 上一张
const prev = () => {
  if (curIdx.value > 0) {
    curIdx.value--
    reset()
    drawFaults()
  }
}
// 回到第一张或者最后一张
const toggleStartOrEnd = (start = true) => {
  curIdx.value = start ? 0 : list.value.length - 1
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
    left: `${left}px`,
    top: `${top}px`,
    backgroundPosition: `-${x}px -${y}px`,
    backgroundSize: `${largeW}px ${largeH}px`
  }
  Object.assign(magnifyRef.value.$el.style, style)
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
    :close-on-click-modal="false"
  >
    <div class="fault-viewer">
      <div class="left-content">
        <div class="info-wrapper">
          <div>编组号：xxx</div>
          <div>车厢号：xxx</div>
          <div class="img-path">图片路径：{{ currentItem?.imgPath }}</div>
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
            />
            <canvas ref="canvasRef" class="fault-canvas"></canvas>
            <Magnify v-show="magnify" ref="magnifyRef" :size="magnifySize" :bgPath="currentPath" />
          </div>
        </div>
        <div class="effect-wrapper">
          <el-tooltip effect="light" content="放大镜" placement="top">
            <el-button
              :type="magnify ? 'primary' : 'info'"
              :icon="ZoomIn"
              circle
              :disabled="disabled"
              @click="magnify = !magnify"
            />
          </el-tooltip>
          <div>
            <CssFilter ref="cssFilterRef" selector=".img-wrap" :disabled="disabled" />
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
          <el-button type="primary" link :disabled="curIdx >= list.length - 1" @click="next">
            <span style="margin-right: 6px">下一张</span>
            <el-icon><DArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="right-content">
        <el-table :data="currentItem?.faultFrames" stripe :border="true" width="100%">
          <el-table-column
            v-for="item in columns"
            :key="item.prop"
            :prop="item.prop"
            :label="item.label"
            :width="item.minWidth"
            :fixed="item.fixed"
            :align="item.align"
            :show-overflow-tooltip="item.ellipsis"
          >
            <template #default="{ row }">
              <template v-if="item.slotName">
                <span v-if="item.slotName === 'affirm'">
                  {{ row[item.prop] === '0' ? '待复核' : row[item.prop] === '1' ? '正报' : '误报' }}
                </span>
              </template>
              <template v-else>
                {{ row[item.prop] }}
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
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
      // width: calc(100% - 520px);
      // min-width: 500px;
      flex: 1;
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
        .img-path {
          color: #fff;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }
      }

      .fault-img-wrapper {
        width: 100%;
        height: calc(100% - 130px);
        position: relative;
        overflow: hidden;
        .inner-wrapper {
          position: absolute;
          width: 100%;
          height: 100%;
          .fault-canvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
          }
          .el-image {
            display: block;
            width: 100%;
            height: 100%;
            &.img-wrap {
              :deep(.el-image__error) {
                font-size: 40px;
              }
            }
          }
        }
      }
      .effect-wrapper {
        padding: 0 15px;
        margin-top: 15px;
        @include flex($jc: space-between);
        > div {
          max-width: 800px;
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
        .el-button {
          color: #fff;
          &.is-disabled {
            color: rgba(255, 255, 255, 0.5);
          }
        }
      }
    }
    &.right-content {
      width: 500px;
      margin-left: 20px;
      flex-shrink: 0;
    }
  }
}
</style>
