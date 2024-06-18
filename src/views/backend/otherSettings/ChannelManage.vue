<script setup name="ChannelManage">
import '@/components/types'
/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '通道名称',
    prop: 'tdmc',
    align: 'left',
    minWidth: 150,
    showInSearch: true
  },
  {
    label: '通道代码',
    prop: 'tddm',
    minWidth: 100
  },
  {
    label: '模块类型',
    prop: 'mklx',
    minWidth: 100,
    showInSearch: true
  },
  {
    label: '扫描类型',
    prop: 'smlx',
    minWidth: 100,
    showInSearch: true
  },
  {
    label: '通道类型',
    prop: 'tdlx',
    minWidth: 100
  },
  {
    label: '展示方向',
    prop: 'zsfx',
    minWidth: 100
  },
  {
    label: '是否展示',
    prop: 'isShow',
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
