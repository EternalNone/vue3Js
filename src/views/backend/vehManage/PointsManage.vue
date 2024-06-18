<script setup name="PointsManage">
import '@/components/types'
/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '点位编号',
    prop: 'dwbh',
    minWidth: 100
  },
  {
    label: '车型',
    prop: 'vehicleModel',
    minWidth: 100
  },
  {
    label: '点位名称',
    prop: 'dwmc',
    align: 'left',
    minWidth: 200,
    showInSearch: true
  },
  {
    label: '显示排序',
    prop: 'xspx',
    minWidth: 100
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
