<script setup>
import { Menu } from '@element-plus/icons-vue'
const props = defineProps({
  menu: {
    type: Object,
    default: () => {}
  },
  basePath: {
    type: String,
    default: ''
  }
})

/** 解析路径 */
const resolvePath = (routePath) => {
  if (props.basePath.includes(routePath)) {
    return props.basePath
  }
  return `${props.basePath}/${routePath}`
}
</script>

<template>
  <el-sub-menu v-if="menu?.children" :index="resolvePath(menu.path)">
    <template #title>
      <el-icon><Menu /></el-icon>
      <span>{{ menu.meta.title }}</span>
    </template>
    <BackendMenuItem
      v-for="subMenu in menu.children"
      :key="subMenu.path"
      :menu="subMenu"
      :basePath="resolvePath(subMenu.path)"
    />
  </el-sub-menu>
  <el-menu-item v-else :index="basePath">
    <el-icon><Menu /></el-icon>
    <span>{{ menu.meta.title }}</span>
  </el-menu-item>
</template>
<style lang="scss" scoped>
.el-menu-vertical-backend {
  width: 100%;
  height: 100%;
  background-color: $theme-color;
  overflow-y: auto;
}
</style>
