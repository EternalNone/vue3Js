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
  showAll: {
    type: Boolean,
    default: true
  },
  showSatus: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['change', 'update:modelValue'])
const selected = useVModel(props, 'modelValue', emits)
const selectItem = (val) => {
  if (val !== selected.value) {
    selected.value = val
    emits('change', val)
  }
}
const selectAll = () => {
  if (props.showAll && '' !== selected.value) {
    selected.value = ''
    emits('change', '')
  }
}
</script>

<template>
  <div
    :class="{
      'train-carriage-empty': list.length === 0,
      'train-carriage': true,
      'train-carriage-all-selected': showAll && modelValue === ''
    }"
  >
    <div class="train-header" @click="selectAll">
      <span v-if="showAll">全部</span>
    </div>
    <div
      v-for="item in list"
      :key="item.fullCarNo"
      @click="selectItem(item.fullCarNo)"
      :class="['train-item', modelValue === item.fullCarNo ? 'active' : '']"
    >
      <div class="no">{{ `${item.carriageNo}车` }}</div>
      <div v-if="showSatus" :class="['status', item.count !== 0 ? 'error' : '']">
        <SvgIcon v-if="item.count === 0" name="circleCheck" />
        <span v-else>{{ item.count > 99 ? '99+' : item.count }}</span>
      </div>
    </div>
    <div class="train-header" @click="selectAll"></div>
  </div>
</template>

<style lang="scss" scoped>
.train-carriage {
  @include flex($jc: flex-start) {
    gap: 2px;
  }
  user-select: none;
  transition: opacity 0.3s;
  &.train-carriage-empty {
    opacity: 0;
  }
  > div {
    &.train-header {
      width: 120px;
      height: 50px;
      flex-shrink: 0;
      flex-grow: 0;
      @include flex;
      color: #666;
      cursor: pointer;
    }
    &:first-child {
      background: url(@/assets/svgs/train-left.svg) no-repeat;
      background-size: cover;
      > span {
        color: var(--el-color-primary);
      }
    }
    &:last-child {
      background: url(@/assets/svgs/train-right.svg) no-repeat;
      background-size: cover;
    }
    &.train-item {
      flex: 1;
      @include flex($dir: column);
      height: 50px;
      background: #f2f3f5;
      cursor: pointer;
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
        display: flex;
        align-items: center;
        justify-content: center;
        &.error {
          background: var(--el-color-danger);
        }
      }
      &.active {
        background: var(--el-color-primary);
        .no {
          color: #fff;
        }
      }
      &:hover {
        background: var(--el-color-primary-light-5);
        .no {
          color: #fff;
        }
      }
    }
  }
  &.train-carriage-all-selected {
    > div {
      &:first-child {
        background: url(@/assets/svgs/train-left-blue.svg) no-repeat;
        background-size: cover;
        > span {
          color: #fff;
        }
      }
      &:last-child {
        background: url(@/assets/svgs/train-right-blue.svg) no-repeat;
        background-size: cover;
      }
      &.train-item {
        background: var(--el-color-primary);
        .no {
          color: #fff;
        }
      }
    }
  }
}
</style>
