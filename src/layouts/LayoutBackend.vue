<script setup>
import { useAppStore } from '@/store/modules/app'
import AppMain from './AppMain.vue'
import BackendMenu from './BackendMenu.vue'
import HeaderToolsBar from './HeaderToolsBar.vue'

const appStore = useAppStore()
const { isCollapse } = storeToRefs(appStore)
</script>

<template>
  <div class="layout-backend">
    <el-container>
      <el-header>
        <img src="@/assets/images/logo.png" alt="logo" width="150" />
        <HeaderToolsBar />
      </el-header>
      <el-container>
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <el-scrollbar>
            <BackendMenu />
          </el-scrollbar>
          <div class="sidebar-btn" @click="appStore.toggleSideBar">
            <SvgIcon v-show="isCollapse" name="trainBtn" />
            <SvgIcon v-show="!isCollapse" class="fold-icon" name="trainBtn" />
          </div>
        </el-aside>
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
      @include flex($jc: space-between);
    }
    .el-aside {
      height: 100%;
      background: $theme-color;
      transition: width 0.3s;
      .el-scrollbar {
        height: 100%;
      }
      .sidebar-btn {
        width: 30px;
        height: 40px;
        border-radius: 30px;
        @include flex;
        position: fixed;
        top: 50%;
        left: calc(var(--el-aside-width) - 20px);
        transition: left 0.3s;
        cursor: pointer;
        .svg-icon {
          color: rgb(17, 209, 251);
          font-size: 30px;
          &.fold-icon {
            transform: scaleX(-1);
          }
          &:hover {
            filter: drop-shadow(2px 4px 5px #ffffff);
          }
        }
      }
    }
  }
}
</style>
