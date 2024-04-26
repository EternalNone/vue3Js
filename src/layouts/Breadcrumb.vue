<script setup>
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()
const { isCollapse } = storeToRefs(appStore)
</script>

<template>
  <div class="sidebar-btn" @click="appStore.toggleSideBar">
    <SvgIcon v-show="isCollapse" name="expand" />
    <SvgIcon v-show="!isCollapse" name="fold" />
  </div>
</template>

<style lang="scss" scoped>
.sidebar-btn {
  cursor: pointer;
  .svg-icon {
    font-size: 20px;
    color: #fff;
  }
}
</style>
