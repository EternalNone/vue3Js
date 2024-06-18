<script setup name="ThresholdManage">
import '@/components/types'
/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '车型',
    prop: 'cx',
    minWidth: 100
  },
  {
    label: '阈值类型',
    prop: 'yzlx',
    minWidth: 150,
    showInSearch: true
  },
  {
    label: '最小值（mm）',
    prop: 'minVal',
    minWidth: 150
  },
  {
    label: '最大值（mm)',
    prop: 'maxVal',
    minWidth: 150
  },
  {
    label: '操作时间',
    prop: 'operateTime',
    minWidth: 160
  },
  {
    label: '操作人',
    prop: 'operator',
    minWidth: 100
  },
  {
    label: '操作',
    prop: 'action',
    minWidth: 120,
    fixed: 'right',
    slot: 'action'
  }
]
/**
 * @type {Options}
 */
const options = {
  showIndex: true,
  selectionType: 'multiple',
  qFunc: null
}
</script>

<template>
  <div class="">
    <ComTable :columns="columns" :options="options">
      <template #tools>
        <el-button type="primary">新增</el-button>
        <el-button type="danger">批量删除</el-button>
      </template>
      <template #action>
        <el-button type="primary" link size="small">修改</el-button>
        <el-button type="danger" link size="small">删除</el-button>
      </template>
    </ComTable>
  </div>
</template>

<style lang="scss" scoped></style>
