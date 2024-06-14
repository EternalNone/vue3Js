<script setup name="VehModelManage">
import ComTable from '@/components/ComTable/index.vue'
import '@/components/types'
/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '车型',
    prop: 'vehicleModel',
    minWidth: 100,
    showInSearch: true
  },
  {
    label: '编组类型',
    prop: 'bzType',
    minWidth: 100,
    slot: 'bzType'
  },
  {
    label: '车厢数',
    prop: 'cxs',
    minWidth: 80
  },
  {
    label: '轴数',
    prop: 'zs',
    minWidth: 100
  },
  {
    label: '配属单位',
    prop: 'unit',
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
