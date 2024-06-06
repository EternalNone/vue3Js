<script setup name="ElectricQuantity">
const props = defineProps({
  quantity: {
    type: [Number, undefined]
  },
  rotate: {
    type: Number,
    default: 0
  },
  showText: {
    type: Boolean,
    default: true
  }
})
const bgClass = computed(() => {
  if (props.quantity === undefined) {
    return 'info'
  }
  return props.quantity >= 50 ? 'success' : props.quantity >= 30 ? 'warning' : 'danger'
})
</script>

<template>
  <div class="electric-panel" :class="bgClass">
    <div class="panel" :style="{ transform: `rotate(${rotate}deg)` }">
      <div class="remainder" :style="{ width: quantity + '%' }" />
    </div>
    <div
      v-show="showText && quantity !== undefined"
      :style="{ marginLeft: (parseFloat(rotate) ? 0 : '8') + 'px' }"
      class="text"
    >
      {{ quantity }}%
    </div>
  </div>
</template>

<style lang="scss" scoped>
$status: success, warning, danger, info;
@mixin panel($color) {
  .panel {
    border: 1px solid #{$color};
    &:before {
      background: #{$color};
    }
    .remainder {
      background: #{$color};
    }
  }
  .text {
    color: #{$color};
  }
}
.electric-panel {
  @include flex;
  .panel {
    box-sizing: border-box;
    width: 30px;
    height: 14px;
    position: relative;
    padding: 1px;
    border-radius: 3px;
    &::before {
      content: '';
      border-radius: 0 1px 1px 0;
      height: 6px;
      width: 4px;
      position: absolute;
      top: 50%;
      right: -4px;
      transform: translateY(-50%);
    }
    .remainder {
      border-radius: 1px;
      position: relative;
      height: 100%;
      width: 0%;
      left: 0;
      top: 0;
    }
  }
  @each $item in $status {
    &.#{$item} {
      @include panel(var(--el-color-#{$item}));
    }
  }
}
</style>
