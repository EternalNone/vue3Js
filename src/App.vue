<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn.mjs'

const route = useRoute()

// 监听路由变化
watch(
  () => route.path,
  async (newPath) => {
    // 根据路由应用不同的样式类
    const body = document.body
    if (newPath.includes('/backend')) {
      body.classList.add('backend')
      body.classList.remove('cockpit')
    } else {
      body.classList.add('cockpit')
      body.classList.remove('backend')
    }
  },
  { immediate: true }
)
</script>

<template>
  <el-config-provider :locale="zhCn">
    <RouterView />
  </el-config-provider>
</template>

<style lang="scss" scoped></style>
