<script setup>
import { BackendRouter } from '@/router'
import BackendMenuItem from './BackendMenuItem.vue'
import { useAppStore } from '@/stores/app'

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
  margin: 0 5px;
  border-radius: 4px;
  color: #fff;
}
.el-menu-vertical-backend {
  height: calc(100% - $el-header-height);
  background-color: $theme-color;
  border: none;
  overflow: auto;
  @include scrollBar;
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
      background-color: $theme-color;
      border: none;
    }
  }
}
</style>
