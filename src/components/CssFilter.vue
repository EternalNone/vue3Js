<script setup name="CssFilter">
const props = defineProps({
  selector: {
    type: String,
    default: ''
  }
})
const state = reactive({
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0
})
const { brightness, contrast, saturate, grayscale } = toRefs(state)

const changeFilter = () => {
  const filter = `brightness(${brightness.value}%) contrast(${contrast.value}%) saturate(${saturate.value}%) grayscale(${grayscale.value}%)`
  document.querySelector(props.selector).style.filter = filter
}

const resetFilter = () => {
  state.brightness = 100
  state.contrast = 100
  state.saturate = 100
  state.grayscale = 0
  changeFilter()
}

defineExpose({
  resetFilter
})
</script>

<template>
  <div class="css-filter">
    <div class="">
      <span style="letter-spacing: 1em">亮度</span>
      <el-slider v-model="brightness" :min="0" :max="500" @change="changeFilter('brightness')" />
    </div>
    <div class="">
      <span>对比度</span>
      <el-slider v-model="contrast" :min="0" :max="500" @change="changeFilter('contrast')" />
    </div>
    <div class="">
      <span>饱和度</span>
      <el-slider v-model="saturate" :min="0" :max="500" @change="changeFilter('saturate')" />
    </div>
    <div class="">
      <span style="letter-spacing: 1em">灰度</span>
      <el-slider v-model="grayscale" :min="0" :max="100" @change="changeFilter('grayscale')" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.css-filter {
  width: min(100%, 300px);
  padding-right: 12px;
  > div {
    width: 100%;
    @include flex($jc: flex-start);
    margin-top: 10px;
    > span {
      width: 60px;
      font-size: 14px;
      text-align: left;
    }
    .el-slider {
      width: calc(100% - 60px);
    }
  }
}
</style>
