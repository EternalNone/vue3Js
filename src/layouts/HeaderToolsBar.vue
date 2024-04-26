<script setup>
import { useFullscreen } from '@vueuse/core'
const { isFullscreen, toggle } = useFullscreen()
</script>

<template>
  <div class="header-tools-bar">
    <div v-if="$route.path.includes('backend')" class="tool-item" @click="$router.push('/')">
      <el-tooltip effect="dark" content="返回驾驶舱" placement="bottom">
        <SvgIcon name="back" />
      </el-tooltip>
    </div>
    <div class="tool-item" @click="toggle">
      <el-tooltip
        effect="dark"
        :content="isFullscreen ? '退出全屏' : '全屏'"
        placement="bottom"
      >
        <SvgIcon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" />
      </el-tooltip>
    </div>
    <div class="tool-item">
      <el-tooltip effect="dark" content="退出登录" placement="bottom">
        <SvgIcon name="logout" />
      </el-tooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header-tools-bar {
  @include flex($jc: flex-end, $al: center) {
    flex-wrap: wrap;
  }
  .tool-item {
    padding: 10px;
    cursor: pointer;
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
    .svg-icon {
      font-size: 20px;
      color: #fff;
      &:focus {
        outline: none;
      }
    }
  }
}
</style>
