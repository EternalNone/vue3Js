<script setup name="KsRender2">
import FaultViewer from '@/components/FaultViewer.vue'

const worker = new Worker(new URL('@/worker/handleImg.js', import.meta.url)) // 创建Web Worker
const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL // 对应环境的图片域名及端口
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
const scrollContainerRef = ref(null) // 整个容器的模板引用
const faultViewerRef = ref(null)
const state = reactive({
  showViewer: false, // 是否显示查看器
  curIdx: 0, // 当前图片查看器查看的图片索引
  handledList: [], // 处理好的列表
  imgW: 1228, // 图片宽度
  imgH: 600 // 图片高度
})
const { showViewer, curIdx, handledList, imgW, imgH } = toRefs(state)
const imgRatio = computed(() => imgW.value / imgH.value) // 图像宽高比
const handledImgs = computed(() => handledList.value.map((item) => item.handledImg)) // 处理好的图片列表

watch(
  list,
  (newVal) => {
    console.log('ksData', newVal)
    worker.postMessage({
      list: toRaw(newVal),
      imgBaseUrl,
      isVertical: isVertical.value,
      isKs: true // 是否是快扫
    })
  },
  { deep: true, immediate: true }
)

// 监听Web Worker消息
worker.onmessage = function (event) {
  const { processedList, width, height } = event.data
  handledList.value = processedList
  imgW.value = width || imgW.value
  imgH.value = height || imgH.value
}
onUnmounted(() => {
  worker.terminate()
})
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

// 预览图片及故障
const handlePreview = async (e, idx) => {
  const currentItem = handledList.value[idx]
  const currentFaults = currentItem.faultFrames
  const containerW = scrollContainerRef.value.clientWidth
  const scale = imgW.value / containerW // 因为画面等比缩放，计算出缩放的比例
  const offsetX = e.offsetX * scale // 根据原图的尺寸算出x坐标
  const offsetY = e.offsetY * scale // 根据原图的尺寸算出y坐标

  // 找出鼠标当前置入的故障框
  const faultsContainPonit = currentFaults?.filter((item) => {
    const { coordinateX, coordinateY, width, height } = item
    if (
      isPointInRect(
        offsetX,
        offsetY,
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
    faultViewerRef.value.show({
      data: toRaw(handledList.value),
      idx
    })
    return
  }
  curIdx.value = idx
  showViewer.value = true
}
</script>
<template>
  <div class="imgs-content" ref="scrollContainerRef" @wheel="handleScroll">
    <div :class="isVertical ? 'pics-wrap-v' : 'pics-wrap-h'">
      <el-image
        v-for="(item, index) in handledList"
        :key="item.handledImg"
        :src="item.handledImg"
        lazy
        @click="handlePreview($event, index)"
      />
    </div>
  </div>

  <ElImageViewer
    v-if="showViewer"
    teleported
    :url-list="handledImgs"
    :initial-index="curIdx"
    @close="showViewer = false"
  />
  <FaultViewer ref="faultViewerRef" />
</template>

<style lang="scss" scoped>
.imgs-content {
  width: 100%;
  height: 100%;
  overflow: auto;
  @include scrollBar(
    $color: var(--el-color-primary-light-5),
    $activeColor: var(--el-color-primary)
  );
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
