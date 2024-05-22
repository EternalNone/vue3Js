<!-- 图片滑块组件 -->
<script setup name="ImgsSlider">
import { useScroll } from '@vueuse/core'
import { useElementBounding, useElementSize } from '@vueuse/core'

const props = defineProps({
  scrollRef: {
    type: [Object, null],
    required: true
  },
  modelValue: {
    type: Number,
    default: 0
  },
  images: {
    type: Array,
    required: true,
    default: () => []
  },
  vertical: {
    type: Boolean,
    default: true
  },
  step: {
    type: Number,
    default: 30
  },
  space: {
    type: Number,
    default: 10
  }
})

const { scrollRef, modelValue, images, vertical, step, space } = toRefs(props)
const emits = defineEmits(['change', 'update:modelValue'])
const container = ref(null) // 容器
const slider = ref(null) // 滑块
const thumbnails = ref(null) // 缩略图
const position = ref(space.value) // 滑块位置
const imgIdx = ref(0) // 当前视口中的图片索引
const { isScrolling } = useScroll(scrollRef)
const { left, top } = useElementBounding(container) // 响应式的获取容器位置
const { width, height } = useElementSize(thumbnails) // 获取缩略图尺寸
const imgSize = computed(() => `${step.value}px`)
const containerW = computed(() => `${width.value + space.value * 2}px`)
const containerH = computed(() => `${height.value + space.value * 2}px`)
const containerPadding = computed(() => `${space.value}px`)
const positionWithUnit = computed(() => `${position.value}px`)

// 监听滚动条状态及当前图片的索引，停止滚动时计算滑块距离
watch([isScrolling, modelValue], ([newFlag, newVal]) => {
  if (!newFlag) {
    imgIdx.value = newVal
    position.value = space.value + newVal * step.value
  }
})
// 更新滑块位置
const updateSlider = (dis) => {
  let offset = 0
  if (vertical.value) {
    const maxDis = height.value - step.value + space.value
    if (dis < space.value) {
      offset = space.value
      imgIdx.value = 0
    } else if (dis > maxDis) {
      offset = maxDis
      imgIdx.value = images.value.length - 1
    } else {
      imgIdx.value = Math.min(Math.round(dis / step.value), images.value.length - 1)
      offset = imgIdx.value * step.value + space.value
    }
    position.value = offset
  } else {
    const maxDis = width.value - step.value + space.value
    if (dis < space.value) {
      offset = space.value
      imgIdx.value = 0
    } else if (dis > maxDis) {
      offset = maxDis
      imgIdx.value = images.value.length - 1
    } else {
      imgIdx.value = Math.min(Math.round(dis / step.value), images.value.length - 1)
      offset = imgIdx.value * step.value + space.value
    }
    position.value = offset
  }
}
// 鼠标按下、开始滑动
const mousedown = (e) => {
  const dis = vertical.value
    ? e.clientY - top.value - slider.value.offsetHeight / 2
    : e.clientX - left.value - slider.value.offsetWidth / 2
  updateSlider(dis)

  document.addEventListener('mousemove', moveSlider)
  document.addEventListener('mouseup', stopMoveSlider)
}
// 移动滑块
const moveSlider = (e) => {
  if (e.buttons !== 1) return
  const dis = vertical.value
    ? e.clientY - top.value - slider.value.offsetHeight / 2
    : e.clientX - left.value - slider.value.offsetWidth / 2
  updateSlider(dis)
}
// 停止滑动
const stopMoveSlider = () => {
  emits('change', imgIdx.value)
  emits('update:modelValue', imgIdx.value)
  document.removeEventListener('mousemove', moveSlider)
  document.removeEventListener('mouseup', stopMoveSlider)
}
// 事件卸载
onUnmounted(() => {
  document.removeEventListener('mousemove', moveSlider)
  document.removeEventListener('mouseup', stopMoveSlider)
})
</script>
<template>
  <div
    :class="
      vertical ? 'thumbnail-slider thumbnail-slider-v' : 'thumbnail-slider thumbnail-slider-h'
    "
    ref="container"
    @mousedown="mousedown"
  >
    <div class="thumbnails" ref="thumbnails">
      <img
        v-for="(image, index) in images"
        :key="index"
        :src="image"
        crossorigin="anonymous"
        @dragover.prevent
        @drop.prevent
        @dragstart.prevent
      />
    </div>
    <div class="slider" ref="slider" @dragover.prevent @drop.prevent @dragstart.prevent></div>
  </div>
</template>

<style lang="scss" scoped>
.thumbnail-slider {
  position: fixed;
  width: v-bind(containerW);
  height: v-bind(containerH);
  padding: v-bind(containerPadding);
  border-radius: 8px;
  background-color: rgba(64, 158, 255, 0.5);
  @include flex;

  .slider {
    position: absolute;
    background-color: var(--el-color-danger);
    opacity: 0.5;
    cursor: pointer;
    &:hover,
    &:focus {
      opacity: 0.8;
    }
  }
  &.thumbnail-slider-v {
    right: 30px;
    bottom: 80px;
    .thumbnails {
      @include flex($dir: column);
      img {
        width: auto;
        height: v-bind(imgSize);
        user-select: none;
      }
    }
    .slider {
      top: v-bind(positionWithUnit);
      left: 0;
      width: 100%;
      height: v-bind(imgSize);
    }
  }
  &.thumbnail-slider-h {
    bottom: 90px;
    right: 0;
    transform: translateX(-50%);
    .thumbnails {
      @include flex;
      img {
        width: v-bind(imgSize);
        height: auto;
        user-select: none;
      }
    }
    .slider {
      top: 0;
      left: v-bind(positionWithUnit);
      width: v-bind(imgSize);
      height: 100%;
    }
  }
}
</style>
