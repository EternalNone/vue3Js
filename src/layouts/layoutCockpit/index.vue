<script setup>
import { useCssVar } from '@vueuse/core'
import AppMain from '../AppMain.vue'
import CockpitMenu from './CockpitMenu.vue'
import HeaderToolsBar from '../HeaderToolsBar.vue'

const elMainRef = ref(null)
const route = useRoute()
const title = computed(() => {
  return route.meta?.fullTitle || ''
})
const defaultPadding = useCssVar('--el-main-padding', elMainRef)
const elMainPadding = computed(() => {
  return route.meta?.noPadding ? '0' : defaultPadding.value
})
</script>

<template>
  <div class="layout-cockpit">
    <el-container>
      <el-header height="70px">
        <div class="header-left">
          <div class="logo">
            <img src="@/assets/images/logo.png" alt="logo" width="150" />
          </div>
        </div>
        <h1>{{ title }}</h1>
        <HeaderToolsBar />
      </el-header>
      <el-main ref="elMainRef">
        <AppMain />
      </el-main>
      <el-footer height="60px">
        <CockpitMenu />
      </el-footer>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.layout-cockpit {
  width: 100%;
  height: 100%;
  background: url(@/assets/images/bg_full.png) no-repeat;
  background-size: cover;
  .el-container {
    width: 100%;
    height: 100%;
    .el-header {
      position: relative;
      background: url(@/assets/images/header-bg.png) no-repeat center center;
      background-size: 100% 70px;
      @include flex($al: flex-start);
      user-select: none;
      .header-left {
        width: 330px;
        height: 100%;
        position: absolute;
        height: 100%;
        left: 20px;
        top: 0;
        @include flex($jc: flex-start);
        .logo {
          margin-right: 20px;
          @include flex($jc: flex-start);
        }
      }
      h1 {
        font-size: 30px;
        color: #fff;
        font-weight: 600;
        letter-spacing: 4px;
        margin: 0;
        line-height: 65px;
      }
      .header-tools-bar {
        position: absolute;
        right: 20px;
        top: 0;
        height: 100%;
      }
    }
    .el-main {
      padding: v-bind(elMainPadding);
    }
    .el-footer {
      background: $theme-color;
      @include flex();
    }
  }
}
</style>
