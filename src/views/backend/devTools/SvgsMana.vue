<script setup name="SvgsMana">
import { ElMessage } from 'element-plus'
import { useClipboard } from '@vueuse/core'

const source = ref('') // 剪切板内容
const svgs = ref([]) // svg图标列表
const modules = import.meta.glob('@/assets/svgs/*.svg')
for (const path in modules) {
  const svgName = path?.split('/').pop().replace('.svg', '')
  svgs.value.push(svgName)
}

const { copy, isSupported } = useClipboard()
const clickSvg = async (name) => {
  if (isSupported.value) {
    source.value = `<SvgIcon name="${name}" />`
    try {
      await copy(source.value)
      ElMessage.success('复制成功！')
    } catch (e) {
      ElMessage.error('复制失败！')
    }
  } else {
    ElMessage.warning('不支持剪贴板功能！')
  }
}
</script>

<template>
  <ul class="svgs-list">
    <li v-for="name in svgs" :key="name" class="svg-item" @click="clickSvg(name)">
      <SvgIcon :name="name" />
      <div class="title">{{ name }}</div>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.svgs-list {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 10px;
  overflow: auto;
  @include scrollBar;
  .svg-item {
    width: 100px;
    background-color: #fff;
    padding: 10px;
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);
    text-align: center;
    cursor: pointer;
    .title {
      width: 100%;
      line-height: 24px;
      @include textEllipsis;
      font-size: 14px;
      color: var(--el-color-primary);
    }
    .svg-icon {
      font-size: 32px;
      color: var(--el-color-primary);
      margin-bottom: 10px;
    }
  }
}
</style>
