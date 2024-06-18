<script setup name="SvgsMana">
import { ElMessage } from 'element-plus'
import { useClipboard } from '@vueuse/core'

const source = ref('') // 剪切板内容
const svgs = ref([]) // svg图标列表
const elIcons = getCurrentInstance().appContext.config.globalProperties.$elIcons // element-plus图标列表

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
  <div class="icons-show">
    <el-alert title="自定义SVG图标（点击复制使用）" type="success" :closable="false" />
    <ul class="svgs-list">
      <li v-for="name in svgs" :key="name" class="svg-item" @click="clickSvg(name)">
        <SvgIcon :name="name" color="var(--el-color-primary)" :size="32" />
        <div class="title">{{ name }}</div>
      </li>
    </ul>
    <el-alert title="Element-plus图标（点击复制使用）" type="error" :closable="false" />
    <ul class="svgs-list">
      <li v-for="name in elIcons" :key="name" class="svg-item" @click="clickSvg(name)">
        <SvgIcon :name="name" color="var(--el-color-primary)" :size="32" />
        <div class="title">{{ name }}</div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.icons-show {
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow: auto;
  @include scrollBar;
  .svgs-list {
    padding: 20px 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    .svg-item {
      width: 100px;
      background-color: #fff;
      padding: 10px;
      border-radius: 8px;
      box-shadow: var(--el-box-shadow-light);
      text-align: center;
      cursor: pointer;
      transition: all 0.3s linear;
      .title {
        width: 100%;
        line-height: 24px;
        @include textEllipsis;
        font-size: 14px;
        color: var(--el-color-primary);
        margin-top: 10px;
      }
      &:hover {
        background-color: var(--el-color-primary-light-7);
      }
    }
  }
}
</style>
