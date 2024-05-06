<script setup name="KsRender2">
import { ElMessageBox } from 'element-plus'

const worker = new Worker(new URL('@/worker/drawImg.js', import.meta.url)) // 创建Web Worker
const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL // 对应环境的图片域名及端口
const batchSize = 10 // 批处理的图片数量

const props = defineProps({
  isVertical: {
    type: Boolean,
    default: true
  },
  ksData: {
    type: Object,
    default: () => {
      return {
        ksImgs: [],
        ksFaults: []
      }
    }
  }
})

const { isVertical, ksData } = toRefs(props)
const scrollContainerRef = ref(null) // 整个容器的模板引用
const showViewer = ref(false) // 是否显示查看器
const srcList = ref([]) // 查看器图片列表
const handledImgs = ref([]) // 处理好的图片列表
const imgW = ref(1228) // 图片宽度
const imgH = ref(600) // 图片高度
const imgRatio = computed(() => {
  // 图片宽高比
  return imgW.value / imgH.value
})

watch(
  ksData,
  (newVal) => {
    console.log('ksData', newVal)
    handledImgs.value = []
    if (newVal.ksFaults.length > 0) {
      worker.postMessage({
        imgs: toRaw(newVal.ksImgs),
        faults: toRaw(newVal.ksFaults),
        imgBaseUrl,
        batchSize,
        isVertical: isVertical.value
      })
    } else {
      handledImgs.value = newVal.ksImgs.map((i) => `${imgBaseUrl}${i}`)
    }
  },
  { deep: true }
)
// 监听Web Worker消息
worker.onmessage = function (event) {
  const { processedImages, width, height } = event.data
  handledImgs.value.push(...processedImages)
  imgW.value = width
  imgH.value = height
}
// 横向滚动事件
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
// 判断一个点是否在矩形区域内
const isPointInRect = (x, y, startX, startY, endX, endY) => {
  return x >= startX && x <= endX && y >= startY && y <= endY
}

// 预览图片
const showBigImg = async (e, idx, url) => {
  console.log('showBigImg', e.offsetX, e.offsetY, idx)
  const containerW = scrollContainerRef.value.clientWidth
  const scale = imgW.value / containerW // 因为画面等比缩放，计算出缩放的比例
  const offsetX = e.offsetX * scale // 根据原图的尺寸算出x坐标
  const offsetY = e.offsetY * scale // 根据原图的尺寸算出y坐标
  const imgStartX = isVertical.value ? 0 : idx * imgW.value // 图片的起始x坐标
  const imgStartY = isVertical.value ? idx * imgH.value : 0 // 图片的起始y坐标
  // 计算出鼠标的位置在整个容器中的坐标
  const cursorX = isVertical.value ? offsetX : imgStartX + offsetX
  const cursorY = isVertical.value ? imgStartY + offsetY : offsetY
  // 找出鼠标当前置入的故障框
  const faultsContainPonit = ksData.value.ksFaults?.filter((item) => {
    const { coordinateX, coordinateY, width, height } = item
    if (
      isPointInRect(
        cursorX,
        cursorY,
        coordinateX,
        coordinateY,
        coordinateX + width,
        coordinateY + height
      )
    ) {
      return item
    }
  })
  if (faultsContainPonit.length) {
    // 鼠标当前置入的故障框
    ElMessageBox({
      title: '故障详情',
      showCancelButton: false,
      showConfirmButton: false,
      distinguishCancelAndClose: true,
      message: h(
        'div',
        null,
        faultsContainPonit.map((fault, index) => [
          h('h3', { style: 'margin: 10px 0;color:rgba(17, 209, 251, 1)' }, `故障${index + 1}`),
          h('p', null, `宽度：${fault.width}`),
          h('p', null, `高度：${fault.height}`),
          h('p', null, `顶点坐标：(${fault.coordinateX}，${fault.coordinateY})`),
          h('p', null, `故障描述：${fault.faultDesc}`)
        ])
      )
    }).catch(() => {
      console.log('close fault detail box')
    })
    return
  }
  srcList.value = [url]
  showViewer.value = true
}
</script>
<template>
  <div class="imgs-content" ref="scrollContainerRef" @wheel="handleScroll">
    <div :class="isVertical ? 'pics-wrap-v' : 'pics-wrap-h'">
      <el-image
        v-for="(url, index) in handledImgs"
        :key="url"
        :src="url"
        lazy
        @click="showBigImg($event, index, url)"
      />
    </div>
  </div>

  <ElImageViewer v-if="showViewer" @close="() => (showViewer = false)" :url-list="srcList" />
</template>

<style lang="scss" scoped>
.imgs-content {
  width: 100%;
  height: 100%;
  overflow: auto;
  @include scrollBar($color: var(--el-color-primary-light-5), $activeColor: var(--el-color-primary));
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
    @include flex($jc: flex-start);
    .el-image {
      display: block;
      width: auto;
      height: 100%;
      aspect-ratio: v-bind(imgRatio);
      flex-shrink: 0;
    }
  }
}
</style>
