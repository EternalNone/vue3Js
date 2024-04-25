<script setup>
import { Expand, Fold } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()
const { isCollapse } = storeToRefs(appStore)
</script>

<template>
  <el-icon :size="20" class="icon" color="#ffffff" @click="appStore.toggleSideBar">
    <Expand v-if="isCollapse" />
    <Fold v-else />
  </el-icon>
</template>

<style lang="scss" scoped></style>
