<script setup>
import { activeRoutes } from '@/router'
const menuList = activeRoutes[0]?.children.concat(activeRoutes[1])
const route = useRoute()
const activeMenu = computed(() => route.path)
</script>
<template>
  <el-menu
    :default-active="activeMenu"
    class="cockpit-menu"
    mode="horizontal"
    background-color="transparent"
    text-color="#11d1fb"
    active-text-color="#fff"
    :ellipsis="false"
    router
  >
    <el-menu-item v-for="item in menuList" :index="`${item.path}`" :key="item.path">
      <SvgIcon v-if="item.meta.icon" :name="item.meta.icon" :size="20" />
      <span>{{ item.meta.title }}</span>
    </el-menu-item>
  </el-menu>
</template>
<style lang="scss" scoped>
.el-menu {
  height: 40px;
  border: none;
  user-select: none;
  .el-menu-item {
    height: 40px;
    line-height: 40px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    background-color: rgba(255, 255, 255, 0.1);
    margin: 0 5px;
    border-radius: 4px;
    .svg-icon {
      margin-right: 5px;
      color: #11d1fb;
    }
    &.el-menu-item.is-active {
      border: none;
      background-color: var(--el-color-primary);
      .svg-icon {
        color: #fff;
      }
    }
  }
}
</style>
