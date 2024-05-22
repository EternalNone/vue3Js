<script setup name="CanvasToolsBar">
import { useFullscreen } from '@vueuse/core'

const props = defineProps({
  showVertical: {
    type: Boolean,
    default: true
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
defineEmits(['toggleFunc'])

const { isFullscreen, toggle } = useFullscreen(fullScreenContainer)
</script>

<template>
  <div class="tools-bar">
    <div class="tool-item">
      <span class="tool-item-title">历史图</span>
      <el-switch :model-value="compare" size="small" @change="$emit('toggleFunc', 'compare')" />
    </div>
    <div class="tool-item">
      <span class="tool-item-title">放大镜</span>
      <el-switch :model-value="magnify" size="small" @change="$emit('toggleFunc', 'magnify')" />
    </div>
    <div class="tool-item">
      <span class="tool-item-title">标记故障</span>
      <el-switch :model-value="editMode" size="small" @change="$emit('toggleFunc', 'editMode')" />
    </div>
    <div class="tool-item" @click="$emit('toggleFunc', 'reverse')">
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
  height: 30px;
  background-color: rgba(64, 158, 255, 0.5);
  z-index: 101;
  @include flex;
  .tool-item {
    padding: 0 10px;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
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
  }
}
</style>
