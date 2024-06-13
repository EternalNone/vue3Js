<script setup>
import { useCssVar } from '@vueuse/core'
import { useAppStore } from '@/store/modules/app'
import AppMain from '../AppMain.vue'
import BackendMenu from './BackendMenu.vue'
import HeaderToolsBar from '../HeaderToolsBar.vue'

const elMainRef = ref(null)
const route = useRoute()
const appStore = useAppStore()
const { isCollapse } = storeToRefs(appStore)
const defaultPadding = useCssVar('--el-main-padding', elMainRef)
const elMainPadding = computed(() => {
  return route.meta?.noPadding ? '0' : defaultPadding.value
})
</script>

<template>
  <div class="layout-backend">
    <el-container>
      <el-header>
        <div class="header-left">
          <img
            class="logo"
            src="@/assets/images/logo.png"
            alt="logo"
            width="150"
            @click="$router.push('/')"
          />
        </div>
        <div class="header-right">
          <HeaderToolsBar />
        </div>
      </el-header>
      <el-container>
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <el-scrollbar>
            <BackendMenu />
          </el-scrollbar>
          <div class="sidebar-btn" @click="appStore.toggleSideBar">
            <SvgIcon :name="isCollapse ? 'expand' : 'fold'" />
          </div>
        </el-aside>
        <el-main ref="elMainRef">
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
      user-select: none;
      .header-left {
        width: 180px;
        height: 100%;
        @include flex;
        flex-shrink: 0;
        .logo {
          cursor: pointer;
        }
      }
      .header-right {
        flex: 1;
        height: 100%;
        @include flex($jc: flex-end);
      }
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
        height: 30px;
        @include flex;
        position: fixed;
        top: 50vh;
        left: calc(var(--el-aside-width) - 20px);
        transition: left 0.3s;
        cursor: pointer;
        .svg-icon {
          color: var(--el-color-primary);
          font-size: 30px;

          &:hover {
            filter: drop-shadow(2px 4px 5px #ffffff);
          }
        }
      }
    }
    .el-main {
      padding: v-bind(elMainPadding);
    }
  }
}
</style>
