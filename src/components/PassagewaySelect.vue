<!-- 通道选择组件 -->
<script setup name="PassagewaySelect">
import { useVModel } from '@vueuse/core'
const props = defineProps({
  list: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(['update:modelValue', 'change'])
const selected = useVModel(props, 'modelValue', emits)
const quickSelect = (val) => {
  if (val === selected.value) return
  selected.value = val
  emits('change', val)
}
</script>

<template>
  <div class="passageway-select">
    <div class="quick-select" v-if="list.length <= 2">
      <div
        v-for="item in list"
        :key="item.code"
        :class="item.code === selected ? 'quick-select-item active' : 'quick-select-item'"
        @click="quickSelect(item.code)"
      >
        {{ item.name }}
      </div>
    </div>

    <el-select v-else v-model="selected" placeholder="请选择" @change="quickSelect">
      <el-option v-for="item in list" :key="item.code" :label="item.name" :value="item.code" />
    </el-select>
  </div>
</template>

<style lang="scss" scoped>
.passageway-select {
  flex-shrink: 0;
  .quick-select {
    @include flex;
    height: 32px;
    line-height: 32px;
    border-radius: 4px;
    overflow: hidden;
    font-size: 14px;
    flex-shrink: 0;
    .quick-select-item {
      width: 50%;
      height: 100%;
      text-align: center;
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
  .el-select {
    width: 100px;
  }
}
</style>
