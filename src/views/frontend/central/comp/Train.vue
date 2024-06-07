<script setup name="Train">
import { TRAIN_TYPE } from '@/constants/index.js'
const props = defineProps({
  list: {
    type: Array,
    default: () => []
  },
  active: {
    type: Boolean,
    default: false
  },
  trainType: {
    type: String,
    default: 'LONG'
  }
})

const defaultLength = computed(() => (props.trainType === TRAIN_TYPE.SHORT ? 8 : 16))
</script>

<template>
  <div class="train" :class="active ? 'train-checked' : ''">
    <template v-if="list.length">
      <div
        v-for="(train, idx) in list"
        :key="train.carNo"
        class="train-item"
        :class="{
          'train-item-left': idx === 0,
          'train-item-right': idx === list.length - 1
        }"
      >
        <div
          class="top"
          :style="{
            background: train.count.top > 0 ? 'var(--el-color-danger)' : 'var(--el-color-success)'
          }"
        >
          {{ train.count.top ? (train.count.top > 99 ? 99 : train.count.top) : '' }}
        </div>
        <div
          class="bottom"
          :style="{
            background:
              train.count.bottom > 0 ? 'var(--el-color-danger)' : 'var(--el-color-success)'
          }"
        >
          {{ train.count.bottom ? (train.count.bottom > 99 ? '99+' : train.count.bottom) : '' }}
        </div>
      </div>
    </template>
    <template v-else>
      <!-- 没有车厢时显示空车 -->
      <div
        v-for="(train, idx) in defaultLength"
        :key="idx"
        class="train-item"
        :class="{
          'train-item-left': idx === 0,
          'train-item-right': idx === defaultLength - 1
        }"
      ></div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@keyframes glow {
  0% {
    border-color: rgb(34, 128, 156);
    box-shadow:
      0 0 5px rgba(0, 140, 255, 0.2),
      inset 0 0 5px rgba(0, 140, 255, 0.1),
      0 1px 0 rgb(34, 128, 156);
  }

  100% {
    border-color: rgb(102, 194, 255);
    box-shadow:
      0 0 20px rgba(102, 194, 255, 0.6),
      inset 0 0 10px rgba(102, 194, 255, 0.4),
      0 1px 0 rgb(102, 194, 255);
  }
}
@keyframes shake {
  0% {
    transform: translateX(-10px);
  }

  100% {
    transform: translateX(0);
  }
}
.train {
  width: 100%;
  cursor: pointer;
  @include flex($jc: flex-start) {
    gap: 5px;
  }
  &:hover {
    animation: shake 800ms ease-out infinite alternate;
  }
  .train-item {
    flex: 1;
    height: 60px;
    background: #f2f3f5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    &.train-item-left {
      flex: 0 0 146px;
      background: url(@/assets/svgs/train-left.svg) no-repeat;
      background-size: cover;
      align-items: end;
      padding-right: 20px;
    }

    &.train-item-right {
      flex: 0 0 146px;
      background: url(@/assets/svgs/train-right.svg) no-repeat right;
      background-size: cover;
      align-items: start;
      padding-left: 20px;
    }
    .top,
    .bottom {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
      color: #fff;
    }
    .top {
      margin-bottom: 5px;
    }
  }
  &.train-checked {
    &:hover {
      animation: none;
    }
    .train-item {
      background: rgba(17, 209, 251, 0.4);
      border: 2px solid #66ccff;
      animation: glow 800ms ease-out infinite alternate;
      &.train-item-left {
        border: none;
        animation: none;
        background: url(@/assets/svgs/train-left-blue.svg) no-repeat;
        background-size: cover;
      }
      &.train-item-right {
        border: none;
        animation: none;
        background: url(@/assets/svgs/train-right-blue.svg) no-repeat;
        background-size: cover;
      }
    }
  }
}
</style>
