<script setup name="JSFaultMark">
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
  disabled: false, // 是否禁用滤镜等功能
  scale: 1, // 容器中刚好完整显示图片全部内容的缩放比例，该值用于重置cssScale
  cssScale: 1, // 容器的css缩放比例，跟绘制图片无关，纯css缩放效果
  mousexy: {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    location: []
  },
  isDrawing: false,
  formData: {
    caimid: '',
    part: '',
    desc: '',
    faultType: ''
  },
  formRules: {
    caimid: [
      {
        required: true,
        message: '请选择图片通道'
      }
    ],
    faultType: [
      {
        required: true,
        message: '请选择故障类型'
      }
    ]
  }
})

const cssFilterRef = ref(null)
const innerRef = ref(null)
const canvasRef = ref(null)
const formRef = ref(null)
const {
  list,
  curIdx,
  visible,
  viewerVisible,
  scale,
  disabled,
  cssScale,
  formData,
  formRules,
  mousexy,
  isDrawing
} = toRefs(state)
const currentItem = computed(() => list.value[curIdx.value])
const handledImgs = computed(() => list.value.map((item) => item.handledImg)) // 处理好的图片列表

watch(cssScale, (newVal) => {
  if (!innerRef.value) {
    return
  }
  innerRef.value.style.transform = `scale(${newVal})`
})

const show = (obj) => {
  visible.value = true
  list.value = obj?.data || []
  curIdx.value = obj?.idx || 0
  cssScale.value = 1
  cssFilterRef.value?.resetFilter()
  nextTick(initAndDraw)
}
const initAndDraw = () => {
  if (visible.value) {
    const container = document.querySelector('.fault-img-wrapper')
    const inner = innerRef.value
    const canvas = canvasRef.value
    const width = container?.clientWidth
    const height = container?.clientHeight
    const imgW = currentItem.value?.imgW || 0
    const imgH = currentItem.value?.imgH || 0
    if (imgW === 0 || imgH === 0) {
      // 图片加载失败，尺寸获取不到的情况下
      return
    }
    const containerRatio = width / height
    const imgRatio = imgW / imgH
    const left = (width - imgW) / 2
    const top = (height - imgH) / 2

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
    scale.value = drawW / imgW
    cssScale.value = drawW / imgW
    console.log('xxxxxxxxxxxx', drawW / imgW)
    if (inner) {
      inner.style.width = `${imgW}px`
      inner.style.height = `${imgH}px`
      inner.style.left = `${left}px`
      inner.style.top = `${top}px`
      canvas.width = imgW
      canvas.height = imgH
    }
    initFaults()
  }
}
const initFaults = () => {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const imgW = currentItem.value?.imgW || 0
  const imgH = currentItem.value?.imgH || 0
  ctx.clearRect(0, 0, imgW, imgH)
  ctx.strokeStyle = faultStrokeStyle
  ctx.lineWidth = faultStrokeWidth
  if (currentItem.value?.faultFrames?.length > 0) {
    currentItem.value?.faultFrames?.forEach((fault) => {
      const { coordinateX, coordinateY, width, height } = fault
      ctx.strokeRect(coordinateX, coordinateY, width, height)
    })
  }
}

const next = () => {
  if (curIdx.value < list.value.length - 1) {
    reset()
    curIdx.value++
    initAndDraw()
  }
}
const prev = () => {
  if (curIdx.value > 0) {
    reset()
    curIdx.value--
    initAndDraw()
  }
}
// 当前图片加载失败的时候，禁用滤镜等操作
const handleLoadErr = () => {
  disabled.value = true
}
// 当前图片加载成功的时候，启用滤镜等操作
const handleLoadSuggess = () => {
  disabled.value = false
}
// 重置滤镜及缩放
const reset = () => {
  cssScale.value = scale.value
  cssFilterRef.value?.resetFilter()
}
const drawFault = () => {
  const { startX, startY, endX, endY } = mousexy.value
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height) // 清除之前的绘制
  initFaults()
  ctx.beginPath()
  // 计算矩形的左上角坐标和宽度、高度
  const x = Math.min(startX, endX)
  const y = Math.min(startY, endY)
  const w = Math.abs(endX - startX)
  const h = Math.abs(endY - startY)
  ctx.rect(x, y, w, h)
  ctx.strokeStyle = faultStrokeStyle
  ctx.lineWidth = faultStrokeWidth
  ctx.stroke()
  if (!isDrawing.value) {
    mousexy.value.location = [x, y, w, h]
  }
}
// 鼠标滚轮缩放
const mousewheel = (e) => {
  if (disabled.value) {
    return
  }
  e.preventDefault()
  if (e.deltaY < 0) {
    cssScale.value = cssScale.value + 0.2 <= 4 ? cssScale.value + 0.2 : cssScale.value
  } else {
    cssScale.value = cssScale.value - 0.2 >= 0 ? cssScale.value - 0.2 : cssScale.value
  }
}
// 标注-鼠标按下
const mousedownMark = (e) => {
  isDrawing.value = true
  mousexy.value.startX = e.offsetX
  mousexy.value.startY = e.offsetY
}
// 标注-鼠标移动
const mousemoveMark = (e) => {
  if (!isDrawing.value) return
  console.log('mousemoveMark', e.offsetX, e.offsetY)
  mousexy.value.endX = e.offsetX
  mousexy.value.endY = e.offsetY
  drawFault()
}
// 标注-鼠标抬起
const mouseupMark = () => {
  isDrawing.value = false
  drawFault() // 最后绘制一次以固定最终框
}

const submitForm = async (formEl) => {
  console.log('dddddddddd',mousexy.value.location)
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
}
useWinResize(initAndDraw, 300) // 监听窗口变化，重新绘制

defineExpose({
  show
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="精扫故障标记"
    fullscreen
    lock-scroll
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div class="fault-viewer">
      <div class="left-content">
        <div class="fault-img-wrapper" @mousewheel="mousewheel">
          <div class="inner-wrapper" ref="innerRef">
            <el-image
              :src="currentItem?.fullPath"
              class="img-wrap"
              crossorigin="anonymous"
              @error="handleLoadErr"
              @load="handleLoadSuggess"
            />
            <canvas
              ref="canvasRef"
              class="fault-canvas"
              @mousedown="mousedownMark"
              @mouseup="mouseupMark"
              @mousemove="mousemoveMark"
            />
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
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="auto"
            label-position="right"
            class="demo-ruleForm"
            status-icon
          >
            <el-form-item label="检测时间"> 2024-04-07 09:28:10 </el-form-item>
            <el-form-item label="车型车号"> CRH1E-1071 </el-form-item>
            <el-form-item label="图片通道" prop="caimid">
              <el-select v-model="formData.caimid" placeholder="请选择">
                <el-option label="精扫1" value="1" />
                <el-option label="精扫2" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="故障类型" prop="faultType">
              <el-select v-model="formData.faultType" placeholder="请选择">
                <el-option label="异常" value="1" />
                <el-option label="松动" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm(formRef)"> 保存 </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="fault-operation">
          <div class="btns">
            <el-button
              type="primary"
              :icon="ZoomIn"
              Round
              auto-insert-space
              :disabled="disabled"
              @click="viewerVisible = true"
            >
              查看
            </el-button>
            <el-button
              type="info"
              :icon="Refresh"
              Round
              auto-insert-space
              :disabled="disabled"
              @click="reset"
            >
              重置
            </el-button>
          </div>
          <CssFilter ref="cssFilterRef" selector=".img-wrap" :disabled="disabled" />
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
  height: calc(100vh - var(--el-dialog-padding-primary) * 3 - 25px);
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
        overflow: hidden;
        position: relative;
        .inner-wrapper {
          position: absolute;
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
