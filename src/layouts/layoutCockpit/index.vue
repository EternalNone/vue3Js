<script setup>
import AppMain from '../AppMain.vue'
import CockpitMenu from './CockpitMenu.vue'
import HeaderToolsBar from '../HeaderToolsBar.vue'
</script>

<template>
  <div class="layout-cockpit">
    <el-container>
      <el-header height="70px">
        <div class="logo">
          <img src="@/assets/images/logo.png" alt="logo" width="150" />
        </div>
        <h1>集中控制数字驾驶舱</h1>
        <HeaderToolsBar />
      </el-header>
      <el-main>
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
  background: url(../../assets/images/bg_full.png) no-repeat;
  background-size: cover;
  .el-container {
    width: 100%;
    height: 100%;
    .el-header {
      position: relative;
      background: url(../../assets/images/header-bg.png) no-repeat center center;
      background-size: 100% 70px;
      @include flex($al: flex-start);
      user-select: none;
      .logo {
        position: absolute;
        height: 100%;
        left: 20px;
        top: 0;
        @include flex($jc: flex-start);
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
    .el-footer {
      background: $theme-color;
      @include flex();
    }
  }
}
</style>
