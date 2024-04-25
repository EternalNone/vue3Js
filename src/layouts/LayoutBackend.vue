<script setup>
import { useAppStore } from '@/stores/app'
import AppMain from './AppMain.vue'
import BackendMenu from './BackendMenu.vue'
import Breadcrumb from './Breadcrumb.vue'

const appStore = useAppStore()
const { isCollapse } = storeToRefs(appStore)
</script>

<template>
  <div class="layout-backend">
    <el-container>
      <el-aside :width="isCollapse ? '65px' : '200px'">
        <div class="logo"></div>
        <BackendMenu />
      </el-aside>
      <el-container>
        <el-header>
          <Breadcrumb />
        </el-header>
        <el-main>
          <AppMain />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.layout-backend {
  width: 100%;
  height: 100%;
  .el-container {
    width: 100%;
    height: 100%;
    overflow: hidden;

    .el-header {
      width: 100%;
      height: $el-header-height;
      background: $theme-color;
      @include flexRow(space-between, center);
    }
    .el-aside {
      height: 100%;
      background: $theme-color;
      transition: width 0.3s;
      .logo {
        height: $el-header-height;
      }
    }
  }
}
</style>
