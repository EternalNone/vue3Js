<script setup name="JsRender">
import FaultViewer from '@/components/FaultViewer.vue'
import JSFaultMark from '@/components/JSFaultMark.vue'

const worker = new Worker(new URL('@/worker/handleImg.js', import.meta.url)) // 创建Web Worker
const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL // 对应环境的图片域名及端口

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
    required: true
  }
})
const { list } = toRefs(props)
const faultViewerRef = ref(null)
const jsFaultMarkRef = ref(null)
const state = reactive({
  handledList: [],
  imgW: 2048,
  imgH: 1536
})
const { handledList, imgW, imgH } = toRefs(state)
const imgRatio = computed(() => imgW.value / imgH.value)

watch(
  list,
  async (newVal) => {
    console.log('kkkkkkkkkkkk',newVal)
    worker.postMessage({
      list: toRaw(newVal),
      imgBaseUrl,
      w: imgW.value,
      h: imgH.value,
      temp: new Date().getTime()
    })
  },
  { immediate: true, deep: true }
)
// 监听Web Worker消息
worker.onmessage = function (event) {
  const { type, processedList, width, height } = event.data
  if (type === 'clear') {
    handledList.value = []
  } else if (type === 'update') {
    handledList.value = handledList.value?.concat(processedList)
    imgW.value = width || imgW.value
    imgH.value = height || imgH.value
  }
}
onUnmounted(() => {
  worker.terminate()
})

// 打开故障查看器
const openFaultViewer = (idx) => {
  // faultViewerRef.value.show({
  //   data: toRaw(handledList.value),
  //   idx
  // })
  jsFaultMarkRef.value.show({
    data: toRaw(handledList.value),
    idx
  })
}
</script>

<template>
  <div class="js-render">
    <el-row :gutter="20">
      <el-col
        v-for="(item, idx) in handledList"
        :key="item.handledImg"
        class="js-item"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="4"
        @click="openFaultViewer(idx)"
      >
        <div class="img">
          <el-image
            :src="item.handledImg"
            crossorigin="anonymous"
            lazy
            @dragover.prevent
            @drop.prevent
            @dragstart.prevent
          />
        </div>
        <div v-if="item.faultFrames.length" class="title">
          <div
            v-for="it in item.faultFrames"
            :key="it.id"
            :class="item.faultFrames.length > 1 ? 'fault-item fault-item-single' : 'fault-item'"
          >
            <span class="fault" :class="it.affirm === '1' ? '' : 'not-fault'">
              {{ it.affirm === '1' ? '正报' : '误报' }}
            </span>
            <span>{{ it.faultDesc }}</span>
          </div>
        </div>
        <div v-else class="title">{{ `图片路径：${item.imgPath}` }}</div>
        <div class="status" :class="item.faultFrames.length ? '' : 'normal'">
          {{ item.faultFrames.length ? '异常' : '正常' }}
        </div>
      </el-col>
    </el-row>
  </div>
  <FaultViewer ref="faultViewerRef" />
  <JSFaultMark ref="jsFaultMarkRef" />
</template>

<style lang="scss" scoped>
.js-render {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  @include scrollBar(
    $color: var(--el-color-primary-light-5),
    $activeColor: var(--el-color-primary)
  );
  @include flex() {
    flex-wrap: wrap;
    gap: 20px;
  }
  .el-row {
    width: calc(100% + 20px);
    height: 100%;
    .js-item {
      margin: 10px 0;
      position: relative;
      cursor: pointer;
      .img {
        width: 100%;
        overflow: hidden;
        aspect-ratio: v-bind(imgRatio);
        .el-image {
          display: block;
          width: 100%;
          height: 100%;
          transition: all 0.3s;
          &:hover {
            transform: scale(1.1);
          }
        }
      }
      .title {
        width: 100%;
        height: 60px;
        background: #ffffff;
        padding: 6px;
        font-size: 14px;
        line-height: 24px;
        font-weight: 400;
        color: #666;
        word-break: break-all;
        @include multiTextEllipsis(2);
        .fault-item {
          vertical-align: baseline;
          text-align: left;
          &.fault-item-single {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        .fault {
          padding: 0 6px;
          border-radius: 12px;
          background: var(--el-color-danger);
          line-height: 24px;
          text-align: center;
          font-size: 12px;
          font-weight: 400;
          color: #ffffff;
          margin-right: 6px;
          vertical-align: baseline;
          &.not-fault {
            background: var(--el-color-success);
          }
        }
      }
      .status {
        position: absolute;
        top: 6px;
        right: 10px;
        width: 50px;
        height: 24px;
        border-radius: 12px 0 0 12px;
        background: var(--el-color-danger);
        line-height: 24px;
        text-align: center;
        font-size: 14px;
        font-weight: 400;
        color: #ffffff;
        &.normal {
          background: var(--el-color-success);
        }
      }
    }
  }
}
</style>
