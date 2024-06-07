<script setup>
import { BackendRouter } from '@/router'
import BackendMenuItem from './BackendMenuItem.vue'
import { useAppStore } from '@/store/modules/app'

const menuList = BackendRouter[0]?.children || []
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
    background-color="#02245b"
    text-color="#ffffff"
    active-text-color="#ffffff"
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
  color: #fff;
}
.el-menu-vertical-backend {
  width: 100%;
  height: calc(100% - $el-header-height);
  border: none;
  user-select: none;
  :deep(.el-menu-item) {
    margin-bottom: 8px;
    @extend %item-style;
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    &.el-menu-item.is-active {
      border: none;
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
  :deep(.el-sub-menu) {
    margin-bottom: 8px;
    .el-sub-menu__title {
      @extend %item-style;
      margin-bottom: 8px;
      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
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
