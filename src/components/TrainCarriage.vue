<script setup name="TrainCarriage">
const props = defineProps({
  selectedCarNo: {
    type: String,
    required: true,
    default: ''
  },
  trainCarList: {
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
const emits = defineEmits(['selectLw'])
const selectItem = (sId) => {
  emits('selectLw', sId)
}
const selectAll = () => {
  if (props.showAll) {
    emits('selectLw', '')
  }
}
</script>

<template>
  <div class="train-carriage">
    <div
      :class="selectedCarNo === '' ? 'train-header train-header-active' : 'train-header'"
      @click="selectAll"
    >
      <span v-if="showAll">全部</span>
    </div>
    <div
      v-for="item in trainCarList"
      :key="item.fullCarNo"
      @click="selectItem(item.fullCarNo)"
      :class="['train-item', selectedCarNo === item.fullCarNo ? 'active' : '']"
    >
      <div class="no">{{ `${item.carriageNo}车` }}</div>
      <div v-if="showSatus" :class="['status', item.count !== 0 ? 'error' : '']">
        <SvgIcon v-if="item.count === 0" name="circleCheck" />
        <span v-else>{{ item.count > 99 ? '99+' : item.count }}</span>
      </div>
    </div>
    <div class="train-header"></div>
  </div>
</template>

<style lang="scss" scoped>
.train-carriage {
  @include flex($jc: flex-start);
  gap: 2px;
  > div {
    &.train-header {
      width: 120px;
      height: 50px;
      flex-shrink: 0;
      flex-grow: 0;
      @include flex;
      color: #666;
      cursor: pointer;
      &.train-header-active {
        color: var(--el-color-primary);
      }
    }
    &:first-child {
      background: url(../assets/images/train_left.png) no-repeat;
      background-size: cover;
    }
    &:last-child {
      background: url(../assets/images/train_right.png) no-repeat;
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
    }
  }
}
</style>
