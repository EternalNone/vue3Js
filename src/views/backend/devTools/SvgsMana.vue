<script setup name="SvgsMana">
import { useClipboard } from '@vueuse/core'

const source = ref('2222')
const svgs = ref([])
const modules = import.meta.glob('@/assets/svgs/*.svg')
for (const path in modules) {
  const svgName = path?.split('/').pop().replace('.svg', '')
  svgs.value.push(svgName)
}
const { copy, isSupported } = useClipboard({ source })
const clickSvg = async (name) => {
  source.value = name
  await copy(source)
  console.log('aaaaaaaaaaa', isSupported.value)
}
</script>

<template>
  <div class="svgs-list">
    <div v-for="name in svgs" :key="name" class="svg-item" @click="clickSvg(name)">
      <SvgIcon :name="name" />
      <div class="title">{{ name }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.svgs-list {
  @include flex($jc: flex-start, $al: flex-start) {
    flex-wrap: wrap;
    gap: 15px;
  }
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
