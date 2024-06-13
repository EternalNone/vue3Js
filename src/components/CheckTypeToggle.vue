<script setup name="CheckTypeToggle">
import { useGlobalStore } from '@/store/modules/global'
import { CHECK_TYPE_LIST } from '@/constants/index'

const globalStore = useGlobalStore()
const { moduleType } = storeToRefs(globalStore)
const handleChange = (val) => {
  globalStore.setModuleType(val)
}
</script>

<template>
  <div class="check-type-wrap">
    <div
      v-for="item in CHECK_TYPE_LIST"
      :key="item.value"
      :class="moduleType === item.value ? 'check-type-item active' : 'check-type-item'"
      @click="handleChange(item.value)"
    >
      {{ item.title }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.check-type-wrap {
  width: 100%;
  height: 34px;
  line-height: 34px;
  border-radius: 4px;
  overflow: hidden;
  @include flex;
  .check-type-item {
    width: 50%;
    height: 100%;
    text-align: center;
    font-size: 14px;
    background-color: rgba(255, 255, 255, 0.2);
    color: #fff;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      color: var(--el-color-primary);
    }
    &.active {
      background-color: var(--el-color-primary);
      color: #fff;
    }
    &:last-child {
      border-left: 1px solid #fff;
    }
  }
}
</style>
