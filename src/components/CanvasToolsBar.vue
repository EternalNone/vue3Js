<script setup name="CanvasToolsBar">
import { ElMessage } from 'element-plus'
import { useFullscreen } from '@vueuse/core'

const props = defineProps({
  showVertical: {
    type: Boolean,
    default: true
  },
  showEditMode: {
    type: Boolean,
    default: false
  },
  compare: {
    type: Boolean,
    default: false
  },
  magnify: {
    type: Boolean,
    default: false
  },
  editMode: {
    type: Boolean,
    default: false
  },
  fullScreenContainer: {
    type: [Object, null],
    required: false
  }
})
const { showVertical, compare, magnify, editMode, fullScreenContainer } = toRefs(props)
const emits = defineEmits(['toggleFunc'])

const { isFullscreen, toggle } = useFullscreen(fullScreenContainer)

const toggleMagnify = () => {
  if (editMode.value) {
    ElMessage.warning('请先退出故障标记模式')
    return
  }
  emits('toggleFunc', 'magnify')
}
const toggleReverse = () => {
  if (editMode.value) {
    ElMessage.warning('请先退出故障标记模式')
    return
  }
  emits('toggleFunc', 'reverse')
}
const toggleEditMode = () => {
  if (!editMode.value) {
    // 开启标图模式，则关闭反转看图功能和放大镜功能
    emits('toggleFunc', 'reverse', false)
    emits('toggleFunc', 'magnify', false)
  }
  emits('toggleFunc', 'editMode')
}
</script>

<template>
  <div class="tools-bar">
    <div
      v-if="showEditMode"
      :class="editMode ? 'tool-item tool-item-active' : 'tool-item'"
      @click="toggleEditMode"
    >
      <el-tooltip effect="dark" content="故障标记" placement="bottom">
        <SvgIcon name="markFault" :size="20" />
      </el-tooltip>
    </div>
    <div
      :class="compare ? 'tool-item tool-item-active' : 'tool-item'"
      @click="$emit('toggleFunc', 'compare')"
    >
      <el-tooltip effect="dark" content="历史图" placement="bottom">
        <SvgIcon name="compare" :size="20" />
      </el-tooltip>
    </div>
    <div :class="magnify ? 'tool-item tool-item-active' : 'tool-item'" @click="toggleMagnify">
      <el-tooltip effect="dark" content="放大镜" placement="bottom">
        <SvgIcon name="zoomIn" :size="20" />
      </el-tooltip>
    </div>
    <div class="tool-item" @click="toggleReverse">
      <el-tooltip
        effect="dark"
        :content="showVertical ? '横向看图' : '纵向看图'"
        placement="bottom"
      >
        <SvgIcon name="horizontal" :class="showVertical ? '' : 'svg-icon-v'" :size="18" />
      </el-tooltip>
    </div>
    <div class="tool-item" @click="toggle">
      <el-tooltip
        effect="dark"
        :content="isFullscreen ? '退出全屏' : '全屏看图'"
        placement="bottom"
      >
        <SvgIcon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" :size="20" />
      </el-tooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tools-bar {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 101;
  @include flex;
  pointer-events: none;
  .tool-item {
    background-color: rgba(64, 158, 255, 0.5);
    padding: 2px 10px;
    margin: 0 2px;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    pointer-events: initial;
    border-radius: 4px;
    transition: all 0.3s;
    .tool-item-title {
      color: #fff;
      font-size: 14px;
      padding-right: 8px;
    }
    .svg-icon {
      color: #fff;
      &:focus {
        outline: none;
      }
      &.svg-icon-v {
        transform: rotate(90deg);
      }
    }
    &:hover,
    &.tool-item-active {
      background-color: var(--el-color-primary);
    }
  }
}
</style>
