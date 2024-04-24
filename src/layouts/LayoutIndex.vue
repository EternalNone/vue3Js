<script setup>
import CockpitMenu from './CockpitMenu.vue'
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header height="60px">
        <h1>集中控制数字驾驶舱</h1>
      </el-header>
      <el-main>
        <router-view v-slot="{ Component, route }">
          <transition name="el-fade-in" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </el-main>
      <el-footer height="60px">
        <CockpitMenu />
      </el-footer>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.common-layout {
  width: 100%;
  height: 100%;
  background: url(../assets/images/bg_full.png) no-repeat;
  background-size: cover;
  .el-container {
    width: 100%;
    height: 100%;
    .el-header {
      background: url(../assets/images/header-bg.png) no-repeat center top;
      background-size: cover;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      h1 {
        font-size: 28px;
        color: #fff;
        font-weight: 600;
        letter-spacing: 4px;
        margin: 0;
      }
    }
    .el-footer {
      background: #02245b;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
