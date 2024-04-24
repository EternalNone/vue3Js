<script setup>
import { useMenu } from '@/hooks/useMenu'
const { curMenu, menuList, setMenu } = useMenu()
const handleSelect = (key) => {
  setMenu(key)
}
</script>
<template>
  <el-menu
    :default-active="curMenu"
    class="cockpit-menu"
    mode="horizontal"
    background-color="transparent"
    text-color="#11d1fb"
    active-text-color="#fff"
    :ellipsis="false"
    router
    @select="handleSelect"
  >
    <el-menu-item v-for="item in menuList" :index="item.name" :key="item.name">
      <span>{{ item.title }}</span>
    </el-menu-item>
  </el-menu>
</template>
<style lang="scss" scoped>
.el-menu {
  height: 40px;
  border: none;
  .el-menu-item {
    height: 40px;
    line-height: 40px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    background-color: rgba(255,255,255,0.1);
    margin: 0 5px;
    border-radius: 4px;
    &.el-menu-item.is-active {
      border: none;
      background-color: #1770F6;
    }
  }
}
</style>
