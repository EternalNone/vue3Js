<script setup name="Monitor">
import { MONITOR_CONFIG_LIST } from '@/constants/index'
import MonitorItem from './MonitorItem.vue'

defineProps({
  trackOps: {
    type: Array,
    default: () => []
  }
})
const state = reactive({
  visible: false,
  curGd: '',
  configList: MONITOR_CONFIG_LIST
})

const { visible, curGd, configList } = toRefs(state)
const monitorList = computed(() => {
  return configList.value.filter((item) => item.gd.includes(curGd.value))
})

const show = () => {
  visible.value = true
}
defineExpose({
  show
})
</script>

<template>
  <el-drawer
    v-model="visible"
    title="视频监控"
    append-to-body
    lock-scroll
    direction="btt"
    destroy-on-close
    class="monitor-drawer"
    :close-on-click-modal="false"
  >
    <div class="monitor">
      <div class="gd-selector">
        <el-radio-group v-model="curGd">
          <el-radio-button key="" label="全部" value="" />
          <el-radio-button v-for="item in trackOps" :key="item" :label="item" :value="item" />
        </el-radio-group>
      </div>
      <div class="monitor-list">
        <MonitorItem v-for="item in monitorList" :key="item.gd" :info="item" />
      </div>
    </div>
  </el-drawer>
</template>

<style lang="scss">
.monitor-drawer {
  height: auto !important;
  background: #02245b;
  .el-drawer__header {
    margin-bottom: 0;
    color: #fff;
  }
  .el-drawer__body {
    padding: 20px 0;
  }
}
</style>
<style lang="scss" scoped>
.monitor {
  .gd-selector {
    margin-bottom: 20px;
    padding: 0 20px;
  }
  .monitor-list {
    height: 75vh;
    padding: 0 20px;
    overflow-y: auto;
    @include scrollBar;
    @include flex($jc: flex-start, $al: flex-start) {
      flex-wrap: wrap;
      gap: 20px;
    }
  }
}
</style>
