<script setup name="FaultViewer">
import { ZoomIn, Refresh, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import { useWinResize } from '@/hooks/useWinResize'
import CssFilter from './CssFilter.vue'

const faultStrokeStyle = '#FA6157' // 故障框线条颜色
const faultStrokeWidth = 3 // 故障框线条宽度

const state = reactive({
  list: [],
  curIdx: 0,
  visible: false, // 弹框是否显示
  viewerVisible: false, // 图片查看器是否显示
  scale: 1 // 实际显示的图片跟原图的缩放比例
})

const cssFilterRef = ref(null)
const canvasRef = ref(null)
const { list, curIdx, visible, viewerVisible, scale } = toRefs(state)
const currentItem = computed(() => list.value[curIdx.value])
const handledImgs = computed(() => list.value.map((item) => item.handledImg)) // 处理好的图片列表
const show = (obj) => {
  visible.value = true
  list.value = obj?.data || []
  curIdx.value = obj?.idx || 0
  cssFilterRef.value?.resetFilter()
  nextTick(init)
}
const init = () => {
  if (visible.value) {
    const container = document.querySelector('.fault-img-wrapper')
    const inner = document.querySelector('.inner-wrapper')
    const width = container?.clientWidth
    const height = container?.clientHeight
    const containerRatio = width / height
    if (currentItem.value?.imgW === 0 || currentItem.value?.imgH === 0) {
      // 图片加载失败，尺寸获取不到的情况下
      return
    }
    console.log('nnnnnnnnn', currentItem.value)
    const imgRatio = currentItem.value?.imgW / currentItem.value?.imgH
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

    scale.value = drawW / currentItem.value?.imgW // 实际绘制的图片占原图的比例
    if (inner) {
      inner.style.width = `${drawW}px`
      inner.style.height = `${drawH}px`
      canvasRef.value.width = drawW
      canvasRef.value.height = drawH
    }
    if (currentItem.value?.imgLoadFail) {
      // 加载失败的场景不绘制故障
      return
    }
    drawFault()
  }
}
const drawFault = () => {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = faultStrokeStyle
  ctx.lineWidth = faultStrokeWidth
  if (currentItem.value?.faultFrames?.length > 0) {
    currentItem.value?.faultFrames?.forEach((fault) => {
      const { coordinateX, coordinateY, width, height } = fault
      console.log(
        'eeeeeeeeee',
        canvas.width,
        canvas.height,
        coordinateX * scale.value,
        coordinateY * scale.value,
        width * scale.value,
        height * scale.value
      )
      ctx.strokeRect(
        coordinateX * scale.value,
        coordinateY * scale.value,
        width * scale.value,
        height * scale.value
      )
    })
  }
}

const next = () => {
  if (curIdx.value < list.value.length - 1) {
    curIdx.value++
    init()
  }
}
const prev = () => {
  if (curIdx.value > 0) {
    curIdx.value--
    init()
  }
}

useWinResize(init, 300) // 监听窗口变化，重新绘制

defineExpose({
  show
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="故障详情"
    width="80%"
    lock-scroll
    destroy-on-close
    :close-on-click-modal="false"
    style="min-width: 650px"
  >
    <div class="fault-viewer">
      <div class="left-content">
        <div class="fault-img-wrapper">
          <div class="inner-wrapper">
            <el-image :src="currentItem?.fullPath" class="img-wrap" />
            <canvas ref="canvasRef" class="fault-canvas"></canvas>
          </div>
        </div>
        <div class="toggle-action">
          <el-button type="primary" link :disabled="curIdx <= 0" @click="prev">
            <el-icon><DArrowLeft /></el-icon>
            <span style="margin-left: 6px">上一张</span>
          </el-button>
          <div class="img-path">{{ currentItem?.imgPath }}</div>
          <el-button type="primary" link :disabled="curIdx >= list.length - 1" @click="next">
            <span style="margin-right: 6px">下一张</span>
            <el-icon><DArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="right-content">
        <div class="fault-info">
          <div v-if="currentItem?.faultFrames?.length" class="info-title">
            <span>故障描述：</span>
          </div>
          <div v-for="item in currentItem?.faultFrames" :key="item?.id">
            <span :class="item?.affirm === '1' ? 'has-fault' : 'no-fault'">{{
              item?.affirm === '1' ? '正报' : '误报'
            }}</span>
            <span>{{ item?.faultDesc }}</span>
          </div>
        </div>
        <div class="fault-operation">
          <div class="btns">
            <el-button
              type="primary"
              :icon="ZoomIn"
              Round
              auto-insert-space
              @click="viewerVisible = true"
              >查看</el-button
            >
            <el-button
              type="info"
              :icon="Refresh"
              Round
              auto-insert-space
              @click="cssFilterRef?.resetFilter()"
              >重置</el-button
            >
          </div>
          <CssFilter ref="cssFilterRef" selector=".img-wrap" />
        </div>
      </div>
    </div>
  </el-dialog>
  <el-image-viewer
    v-if="viewerVisible"
    teleported
    :url-list="handledImgs"
    :initial-index="curIdx"
    @close="viewerVisible = false"
  />
</template>

<style lang="scss" scoped>
.fault-viewer {
  width: 100%;
  height: 68vh;
  overflow: hidden;
  @include flex;
  > div {
    height: 100%;
    &.left-content {
      width: calc(100% - 300px);
      min-width: 300px;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 6px;
      padding: 15px 0;
      .fault-img-wrapper {
        width: 100%;
        height: calc(100% - 45px);
        @include flex;
        .inner-wrapper {
          position: relative;
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
          }
        }
      }
      .toggle-action {
        width: 100%;
        padding: 15px 15px 0;
        flex-shrink: 0;
        @include flex($jc: space-between);
        .img-path {
          width: calc(100% - 150px);
          color: #fff;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
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
      width: 300px;
      margin-left: 20px;
      flex-shrink: 0;
      @include flex($dir: column, $jc: space-between);
      .fault-info {
        width: 100%;
        text-align: left;
        line-height: 30px;
        font-size: 14px;
        .info-title {
          font-size: 16px;
          color: var(--el-color-primary);
        }
        div > span {
          &:first-child {
            padding-right: 10px;
            font-weight: 600;
          }
          &.has-fault {
            color: var(--el-color-danger);
          }
          &.no-fault {
            color: var(--el-color-success);
          }
        }
      }
      .btns {
        @include flex;
        .el-button {
          width: 50%;
        }
      }
      .fault-operation {
        width: 100%;
      }
    }
  }
}
</style>
