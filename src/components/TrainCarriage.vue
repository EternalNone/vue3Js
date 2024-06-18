<script setup name="TrainCarriage">
import { useVModel } from '@vueuse/core'
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
    default: ''
  },
  list: {
    type: Array,
    default: () => [],
    required: true
  },
  // 是否可以取消选中
  cancleSelect: {
    type: Boolean,
    default: false
  },
  showSatus: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['change', 'update:modelValue'])
const selected = useVModel(props, 'modelValue', emits)

const selectItem = (val) => {
  let selVal = ''
  if (props.cancleSelect) {
    selVal = selected.value === val ? '' : val
  } else if (val !== selected.value) {
    selVal = val
  }
  selected.value = selVal
  emits('change', selVal)
}
</script>

<template>
  <div
    :class="{
      'train-carriage-empty': list.length === 0,
      'train-carriage': true
    }"
  >
    <div
      v-for="(item, idx) in list"
      :key="item.fullCarNo"
      @click="selectItem(item.fullCarNo)"
      :class="{
        active: modelValue === item.fullCarNo,
        'train-item': idx !== 0 && idx !== list.length - 1,
        'train-header': idx === 0 || idx === list.length - 1
      }"
    >
      <div class="no">{{ `${item.carriageNo}车` }}</div>
      <div v-if="showSatus" :class="['status', item.count !== 0 ? 'error' : '']">
        <SvgIcon v-if="item.count === 0" name="circleCheck" />
        <span v-else>{{ item.count > 99 ? '99+' : item.count }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.train-carriage {
  width: 100%;
  height: 50px;
  @include flex($jc: flex-start) {
    gap: 5px;
  }
  user-select: none;
  transition: opacity 0.3s;
  &.train-carriage-empty {
    opacity: 0;
  }
  .no {
    color: #666;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
  }
  .status {
    width: 20px;
    height: 20px;
    font-size: 12px;
    color: #ffffff;
    border-radius: 50%;
    background: var(--el-color-success);
    @include flex;
    &.error {
      background: var(--el-color-danger);
    }
  }
  .train-item {
    flex: 1;
    max-width: 140px;
    @include flex($dir: column);
    height: 50px;
    background: #f2f3f5;
    cursor: pointer;
    transition: all 0.3s linear;
    &.active,
    &:hover {
      background: var(--el-color-primary);
      .no {
        color: #fff;
      }
    }
  }
  .train-header {
    width: 120px;
    height: 50px;
    flex-shrink: 0;
    flex-grow: 0;
    color: #666;
    cursor: pointer;
    &:first-child {
      position: relative;
      @include flex($dir: column, $al: flex-end);
      padding-right: 20px;
      background: url(@/assets/svgs/train-left.svg) no-repeat center center / cover;
      &.active,
      &:hover {
        background: url(@/assets/svgs/train-left-blue.svg) no-repeat center center / cover;
        .no {
          color: #fff;
        }
      }
    }
    &:last-child {
      @include flex($dir: column, $al: flex-start);
      padding-left: 20px;
      background: url(@/assets/svgs/train-right.svg) no-repeat center center / cover;
      &.active,
      &:hover {
        background: url(@/assets/svgs/train-right-blue.svg) no-repeat center center / cover;
        .no {
          color: #fff;
        }
      }
    }
  }
}
</style>
