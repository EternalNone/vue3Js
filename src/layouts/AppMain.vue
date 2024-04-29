<script setup></script>

<template>
  <div class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition v-if="!route.meta?.scrollbar" name="el-fade-in" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
      <el-scrollbar v-else>
        <transition name="el-fade-in" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </el-scrollbar>
    </router-view>
  </div>
</template>

<style lang="scss" scoped>
.app-main {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
