<script setup>
import { activeRoutes } from '@/router'
import BackendMenuItem from './BackendMenuItem.vue'
import { useAppStore } from '@/store/modules/app'

const menuList = activeRoutes[1]?.children || []
const route = useRoute()
const activeMenu = computed(() => route.path)
const appStore = useAppStore()
const { isCollapse } = storeToRefs(appStore)
</script>
<template>
  <el-menu
    :default-active="activeMenu"
    class="el-menu-vertical-backend"
    :collapse="isCollapse"
    unique-opened
    router
  >
    <BackendMenuItem
      v-for="menu in menuList"
      :key="menu.path"
      :menu="menu"
      :basePath="`/backend/${menu.path}`"
    />
  </el-menu>
</template>
<style lang="scss" scoped>
%item-style {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  background-color: transparent;
  border-radius: 4px;
}
$activeColor: rgba(255, 255, 255, 0.1);

.el-menu-vertical-backend {
  width: 100%;
  border: none;
  user-select: none;
  :deep(.el-menu-item) {
    margin-bottom: 8px;
    @extend %item-style;
    &:hover {
      background-color: $activeColor;
    }
    &.el-menu-item.is-active {
      border: none;
      background-color: $activeColor;
    }
  }
  :deep(.el-sub-menu) {
    margin-bottom: 8px;
    .el-sub-menu__title {
      @extend %item-style;
      margin-bottom: 8px;
      &:hover {
        background-color: $activeColor;
      }
    }
    .el-menu {
      border: none;
    }
  }
  &:not(.el-menu--collapse) {
    :deep(.menu-title-wrap) {
      padding-left: 5px;
    }
  }
}
</style>
