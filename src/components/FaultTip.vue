<script setup name="FaultTip">
const visible = ref(false)
const faultInfo = ref({})
const show = (obj) => {
  faultInfo.value = obj
  visible.value = true
}
const hide = () => {
  visible.value = false
}

defineExpose({
  show,
  hide
})
</script>

<template>
  <div v-show="visible" class="fault-tip">
    <div class="info">
      <div class="title">故障类型：</div>
      <div class="content"></div>
    </div>
    <div class="info">
      <div class="title">故障部位：</div>
      <div class="content"></div>
    </div>
    <div class="info">
      <div class="title">故障描述：</div>
      <div class="content">{{ faultInfo?.faultDesc }}</div>
    </div>
    <div class="info">
      <div class="title">故障状态：</div>
      <div class="content">
        {{ faultInfo?.affirm === '0' ? '待复核' : faultInfo?.affirm === '1' ? '正报' : '误报' }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fault-tip {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 103;
  padding: 15px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow);
  max-width: 250px;
  .info {
    @include flex($jc: flex-start, $al: flex-start);
    line-height: 20px;
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
    .content {
      flex: 1;
      text-align: left;
    }
  }
}
</style>
