<script setup name="CarriageViewModel">
import testPic from '@/assets/images/11-1.jpg'
defineProps({
  list: {
    type: Array,
    default: () => []
  }
})

const emits = defineEmits(['change'])

const selectCarriage = (val) => {
  emits('change', val)
}
</script>

<template>
  <div class="carriage-view-model">
    <div v-for="item in list" :key="item.fullCarNo" class="carriage-item">
      <div class="text-wrap">ZY104401</div>
      <el-image
        :src="testPic"
        lazy
        crossorigin="anonymous"
        @click="selectCarriage(item.fullCarNo)"
        @dragover.prevent
        @drop.prevent
        @dragstart.prevent
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.carriage-view-model {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  @include scrollBar($color: rgba(17, 209, 251, 0.5), $activeColor: rgba(17, 209, 251, 1));
  .carriage-item {
    position: relative;
    width: 100%;
    cursor: pointer;
    .text-wrap {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 100;
      width: 30px;
      height: 100%;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-size: 14px;
      text-align: center;
      line-height: 30px;
      color: #11d1fb;
    }
    .el-image {
      display: block;
      width: 100%;
      height: 70px;
      margin-bottom: 5px;
    }
  }
}
</style>
