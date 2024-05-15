<script setup name="KSFaultMark">
import { ZoomIn, Refresh, CircleCheck } from '@element-plus/icons-vue'
import { useWinResize } from '@/hooks/useWinResize'
import { urlToBitmap, canvasToBlob } from '@/utils/img'
import CssFilter from './CssFilter.vue'

const faultStrokeStyle = '#FA6157' // 故障框线条颜色
const faultStrokeWidth = 3 // 故障框线条宽度

const state = reactive({
  list: [],
  previewList: [], // 预览图
  visible: false, // 弹框是否显示
  viewerVisible: false, // 图片查看器是否显示
  disabled: false, // 是否禁用滤镜等功能
  scale: 1, // 容器中刚好完整显示图片全部内容的缩放比例，该值用于重置cssScale
  cssScale: 1, // 容器的css缩放比例，跟绘制图片无关，纯css缩放效果
  imgW: 1228, // 图片宽度
  imgH: 600, // 图片高度
  isVertical: true,
  firstImgStart: 0,
  mousexy: {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    location: []
  },
  isDrawing: false,
  formData: {
    part: '',
    desc: '',
    faultType: ''
  },
  formRules: {
    part: [
      {
        required: true,
        message: '请选择故障部位'
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
  previewList,
  visible,
  viewerVisible,
  scale,
  disabled,
  cssScale,
  imgW,
  imgH,
  formData,
  formRules,
  mousexy,
  isDrawing,
  isVertical,
  firstImgStart
} = toRefs(state)
const imgRatio = computed(() => imgW.value / imgH.value) // 图像宽高比
const imgPaths = computed(() => list.value.map((item) => item.imgPath)?.join(' ; '))
watch(cssScale, (newVal) => {
  if (!innerRef.value) {
    return
  }
  innerRef.value.style.transform = `scale(${newVal})`
})
// 打开弹框
const show = (obj) => {
  visible.value = true
  list.value = obj?.data || []
  imgW.value = obj?.imgW || imgW.value
  imgH.value = obj?.imgH || imgH.value
  isVertical.value = obj?.isVertical
  mousexy.value.location = obj?.fault ? [obj?.fault] : []
  firstImgStart.value = obj?.firstImgStart || 0
  cssScale.value = 1
  cssFilterRef.value?.resetFilter()
  nextTick(init)
}
// 初始化容器及画布
const init = () => {
  if (visible.value) {
    const container = document.querySelector('.fault-img-wrapper')
    const inner = innerRef.value
    const canvas = canvasRef.value
    const width = container?.clientWidth
    const height = container?.clientHeight
    const innerW = isVertical.value ? imgW.value : imgW.value * list.value.length
    const innerH = isVertical.value ? imgH.value * list.value.length : imgH.value
    const containerRatio = width / height
    const innerRatio = innerW / innerH
    const left = (width - innerW) / 2
    const top = (height - innerH) / 2

    let drawW = 0,
      drawH = 0
    if (innerRatio - containerRatio > 0) {
      // 原图宽度更宽，按照画布宽度来画
      drawW = width
      drawH = drawW / innerRatio
    } else {
      drawH = height
      drawW = drawH * innerRatio
    }
    scale.value = drawW / imgW.value
    cssScale.value = drawW / innerW
    if (inner) {
      inner.style.width = `${innerW}px`
      inner.style.height = `${innerH}px`
      inner.style.left = `${left}px`
      inner.style.top = `${top}px`
      canvas.width = innerW
      canvas.height = innerH
    }
    drawFault()
  }
}
// 绘制故障
const drawFault = () => {
  const { location } = mousexy.value
  if (!location.length) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = faultStrokeStyle
  ctx.lineWidth = faultStrokeWidth
  location.forEach((item) => {
    const { x, y, w, h } = item
    const startX = isVertical.value ? x : x - firstImgStart.value
    const startY = isVertical.value ? y - firstImgStart.value : y
    ctx.strokeRect(startX, startY, w, h)
  })
}

// 当前图片加载失败的时候，禁用滤镜等操作
const handleLoadErr = () => {
  disabled.value = true
}
// 当前图片加载成功的时候，启用滤镜等操作
const handleLoadSuggess = () => {
  disabled.value = false
}
// 点击预览图片和故障
const handlePreview = async () => {
  const { location } = mousexy.value
  let offscreenCanvas = new OffscreenCanvas(0, 0)
  let offscreenCtx = offscreenCanvas.getContext('2d')
  offscreenCanvas.width = isVertical.value ? imgW.value : imgW.value * list.value.length
  offscreenCanvas.height = isVertical.value ? imgH.value * list.value.length : imgH.value
  offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height)
  // 请求当前故障涉及的图片
  const imgs = await Promise.all(
    list.value.map(async (item) => {
      const imgBitmap = await urlToBitmap(item.fullPath)
      return imgBitmap
    })
  )
  // 根据布局绘制图片
  imgs.forEach(async (item, index) => {
    if (item && item.width && item.height) {
      const imgStartX = isVertical.value ? 0 : index * imgW.value // 图片的起始x坐标
      const imgStartY = isVertical.value ? index * imgH.value : 0 // 图片的起始y坐标
      offscreenCtx.drawImage(item, imgStartX, imgStartY, imgW.value, imgH.value)
    }
  })

  // 故障存在则绘制故障框
  if (location.length) {
    offscreenCtx.strokeStyle = faultStrokeStyle
    offscreenCtx.lineWidth = faultStrokeWidth
    location.forEach((item) => {
      const { x, y, w, h } = item
      // 故障框的坐标是相对于整体的，要转换成相对于当前绘制图片的坐标
      const startX = isVertical.value ? x : x - firstImgStart.value
      const startY = isVertical.value ? y - firstImgStart.value : y
      offscreenCtx.strokeRect(startX, startY, w, h)
    })
  }
  // canvas转图片用于预览
  const url = await canvasToBlob(offscreenCanvas)
  previewList.value = [url]
  viewerVisible.value = true
  offscreenCanvas = null
  offscreenCtx = null
}

// 重置滤镜及缩放
const reset = () => {
  cssScale.value = scale.value
  cssFilterRef.value?.resetFilter()
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
  if (mousexy.value.location.length) {
    mousexy.value.location = []
  }
  isDrawing.value = true
  mousexy.value.startX = e.offsetX
  mousexy.value.startY = e.offsetY
}
// 标注-鼠标移动
const mousemoveMark = (e) => {
  if (!isDrawing.value || e.buttons !== 1) return
  const { startX, startY } = mousexy.value
  const endX = e.offsetX
  const endY = e.offsetY
  mousexy.value.endX = endX
  mousexy.value.endY = endY
  const minX = Math.min(startX, endX)
  const minY = Math.min(startY, endY)
  const x = isVertical.value ? minX : firstImgStart.value + minX
  const y = isVertical.value ? firstImgStart.value + minY : minY
  const w = Math.abs(endX - startX)
  const h = Math.abs(endY - startY)
  mousexy.value.location = [{ x, y, w, h }]
  drawFault()
}
// 标注-鼠标抬起
const mouseupMark = () => {
  if (!isDrawing.value) return
  isDrawing.value = false
}
// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}
// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
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
    title="精扫故障标记"
    fullscreen
    lock-scroll
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div class="fault-viewer">
      <div class="left-content">
        <div class="fault-img-wrapper" @mousewheel="mousewheel">
          <div
            :class="isVertical ? 'inner-wrapper inner-wrapper-v' : 'inner-wrapper inner-wrapper-h'"
            ref="innerRef"
          >
            <el-image
              v-for="item in list"
              :key="item.imgPath"
              :src="item?.fullPath"
              class="img-wrap"
              crossorigin="anonymous"
              @error="handleLoadErr"
              @load="handleLoadSuggess"
              @dragover.prevent
              @drop.prevent
              @dragstart.prevent
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
        <div class="img-path-list">图片路径：{{ imgPaths }}</div>
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
            <el-form-item label="图片通道" prop="part">
              <el-select v-model="formData.part" placeholder="请选择">
                <el-option label="部位1" value="1" />
                <el-option label="部位1" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="故障类型" prop="faultType">
              <el-select v-model="formData.faultType" placeholder="请选择">
                <el-option label="异常" value="1" />
                <el-option label="松动" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="故障描述" prop="desc">
              <el-input v-model="formData.desc" type="textarea" />
            </el-form-item>
            <el-form-item class="btns-wrap">
              <el-button type="info" :icon="Refresh" Round auto-insert-space @click="resetForm">
                重置
              </el-button>
              <el-button
                type="primary"
                :icon="CircleCheck"
                Round
                auto-insert-space
                @click="submitForm"
              >
                保存
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="fault-operation">
          <div class="btns">
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
            <el-button
              type="primary"
              :icon="ZoomIn"
              Round
              auto-insert-space
              :disabled="disabled"
              @click="handlePreview"
            >
              查看
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
    :url-list="previewList"
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
      width: calc(100% - 370px);
      min-width: 350px;
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
          &.inner-wrapper-v {
            .el-image {
              display: block;
              width: 100%;
              height: auto;
              aspect-ratio: v-bind(imgRatio);
              &.img-wrap {
                :deep(.el-image__error) {
                  font-size: 40px;
                }
              }
            }
          }
          &.inner-wrapper-h {
            @include flex;
            .el-image {
              display: block;
              width: auto;
              height: 100%;
              aspect-ratio: v-bind(imgRatio);
              &.img-wrap {
                :deep(.el-image__error) {
                  font-size: 40px;
                }
              }
            }
          }
        }
      }
      .img-path-list {
        width: 100%;
        padding: 15px 15px 0;
        color: #fff;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
      }
    }
    &.right-content {
      width: 350px;
      margin-left: 20px;
      flex-shrink: 0;
      @include flex($dir: column, $jc: space-between);
      .fault-info {
        width: 100%;
        text-align: left;
        line-height: 30px;
        font-size: 14px;
        .btns-wrap {
          :deep(.el-form-item__content) {
            width: 100%;
            @include flex {
              flex-wrap: nowrap;
            }
            .el-button {
              width: 50%;
            }
          }
        }
      }

      .fault-operation {
        width: 100%;
        .btns {
          @include flex;
          .el-button {
            width: 50%;
          }
        }
      }
    }
  }
}
</style>
