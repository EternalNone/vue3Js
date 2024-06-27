<script setup name="ColumnsSet">
import { ClickOutside as vClickOutside } from 'element-plus'
import { Menu } from '@element-plus/icons-vue'
import { watchImmediate } from '@vueuse/core'
const props = defineProps({
  selColsKeys: {
    type: Array,
    default: () => []
  },
  ops: {
    type: Array,
    default: () => []
  }
})
const emits = defineEmits(['change'])
const buttonRef = ref(null)
const popoverRef = ref(null)
const checkAll = ref(true)
const isIndeterminate = ref(false)
const checkedList = ref([])
const allKeys = computed(() => {
  return props.ops.map((col) => col.prop)
})
watchImmediate(props.selColsKeys, (newVal) => {
  checkedList.value = newVal || []
})
const onClickOutside = () => {
  unref(popoverRef).popperRef?.delayHide?.()
}
const handleCheckAllChange = (val) => {
  checkedList.value = val ? allKeys.value : []
  isIndeterminate.value = false
}
const checkedColumnsChange = (value) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === allKeys.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < allKeys.value.length
}
const reset = () => {
  checkedList.value = allKeys.value
  isIndeterminate.value = false
  checkAll.value = true
  emits('change', checkedList.value)
  popoverRef.value?.hide()
}
const confirm = () => {
  emits('change', checkedList.value)
  popoverRef.value?.hide()
}
</script>

<template>
  <el-button :icon="Menu" circle ref="buttonRef" v-click-outside="onClickOutside" />
  <el-popover
    ref="popoverRef"
    :virtual-ref="buttonRef"
    placement="bottom"
    virtual-triggering
    :width="200"
    trigger="click"
  >
    <div class="columns-set">
      <div class="columns-set-header">
        <el-checkbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >
          全部
        </el-checkbox>
      </div>
      <div class="columns-set-content">
        <el-checkbox-group v-model="checkedList" @change="checkedColumnsChange">
          <el-checkbox v-for="col in ops" :key="col.prop" :label="col.label" :value="col.prop">
            {{ col.label }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="columns-set-footer">
        <el-button type="info" Round auto-insert-space @click="reset"> 重置 </el-button>
        <el-button type="primary" Round auto-insert-space @click="confirm"> 确定 </el-button>
      </div>
    </div>
  </el-popover>
</template>

<style lang="scss" scoped>
.columns-set {
  .columns-set-header {
  }
  .columns-set-content {
    border-top: 1px solid var(--el-border-color-light);
    border-bottom: 1px solid var(--el-border-color-light);
    height: 300px;
    overflow-y: auto;
    @include scrollBar;
    .el-checkbox-group {
      @include flex($dir: column, $jc: flex-start, $al: flex-start);
    }
  }
  .columns-set-footer {
    @include flex($jc: space-between);
    padding-top: var(--el-popover-padding);
  }
}
</style>
