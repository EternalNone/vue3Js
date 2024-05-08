<script setup name="FaultViewer">
import { ZoomIn, Refresh, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import CssFilter from './CssFilter.vue'

const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL // 对应环境的图片域名及端口
const faultStrokeStyle = '#FA6157' // 故障框线条颜色
const faultStrokeWidth = 3 // 故障框线条宽度

const state = reactive({
  list: [],
  curIdx: 0,
  visible: false,
  imgW: 2048, // 图片宽度
  imgH: 1536, // 图片高度
  scale: 1 // 实际显示的图片跟原图的缩放比例
})

const cssFilterRef = ref(null)
const canvasRef = ref(null)
const { list, curIdx, visible, imgW, imgH, scale } = toRefs(state)

const show = (obj) => {
  visible.value = true
  list.value = obj?.data || []
  curIdx.value = obj?.idx || 0
  imgW.value = obj?.imgW || imgW.value
  imgH.value = obj?.imgH || imgH.value
  cssFilterRef.value?.resetFilter()
  nextTick(init)
}
const init = () => {
  const container = document.querySelector('.fault-img-wrapper')
  const inner = document.querySelector('.inner-wrapper')
  const width = container.clientWidth
  const height = container.clientHeight
  const containerRatio = width / height
  const imgRatio = imgW.value / imgH.value
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
  inner.style.width = `${drawW}px`
  inner.style.height = `${drawH}px`
  canvasRef.value.width = drawW
  canvasRef.value.height = drawH
  scale.value = drawW / imgW.value // 实际绘制的图片占原图的比例
  drawFault()
}
const drawFault = () => {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  ctx.strokeStyle = faultStrokeStyle
  ctx.lineWidth = faultStrokeWidth
  const curItem = list.value[curIdx.value]
  if (curItem?.faultFrames?.length > 0) {
    curItem?.faultFrames?.forEach((fault) => {
      const { coordinateX, coordinateY, width, height } = fault
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
    drawFault()
  }
}
const prev = () => {
  if (curIdx.value > 0) {
    curIdx.value--
    drawFault()
  }
}
defineExpose({
  show
})
</script>

<template>
  <el-dialog v-model="visible" title="故障详情" width="80%" lock-scroll destroy-on-close>
    <div class="fault-viewer">
      <div class="left-content">
        <div class="fault-img-wrapper">
          <div class="inner-wrapper">
            <el-image :src="imgBaseUrl + list[curIdx]?.imgPath" class="img-wrap" />
            <canvas ref="canvasRef" class="fault-canvas"></canvas>
          </div>
        </div>
        <div class="toggle-action">
          <el-button type="primary" link :disabled="curIdx <= 0" @click="prev">
            <el-icon><DArrowLeft /></el-icon>
            <span style="margin-left: 6px">上一张</span>
          </el-button>
          <el-button type="primary" link :disabled="curIdx >=list.length - 1" @click="next">
            <span style="margin-right: 6px">下一张</span>
            <el-icon><DArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="right-content">
        <div class="fault-info"></div>
        <div class="fault-operation">
          <div class="btns">
            <el-button type="primary" :icon="ZoomIn" Round auto-insert-space>查看</el-button>
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
</template>

<style lang="scss" scoped>
.fault-viewer {
  width: 100%;
  height: 65vh;
  overflow: hidden;
  @include flex;
  > div {
    height: 100%;
    &.left-content {
      flex: 1;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 10px;
      padding: 15px;
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
        padding-top: 15px;
        flex-shrink: 0;
        @include flex($jc: space-between);
      }
    }
    &.right-content {
      width: 300px;
      margin-left: 20px;
      flex-shrink: 0;
      @include flex($dir: column, $jc: space-between);
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
