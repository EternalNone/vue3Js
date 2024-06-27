<script setup name="FaultTypeManage">
import '@/components/types'
import FaultTypeDetail from './comp/FaultTypeDetail.vue'
/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '故障类型',
    prop: 'gzlx',
    minWidth: 150,
    showInSearch: true
  },
  {
    label: '故障代码',
    prop: 'gzdm',
    minWidth: 100,
    showInSearch: true
  },
  {
    label: '操作人',
    prop: 'operator',
    minWidth: 100
  },
  {
    label: '操作时间',
    prop: 'operateTime',
    minWidth: 160
  },
  {
    label: '操作',
    prop: 'action',
    minWidth: 150,
    fixed: 'right',
    slot: 'action'
  }
]
const { proxy } = getCurrentInstance()
const getList = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          total: 3,
          records: [
            {
              gzlx: '异常',
              gzdm: '0001',
              operateTime: '2023-03-01 12:00:00',
              operator: '张三'
            },
            {
              gzlx: '断裂',
              gzdm: '0002',
              operateTime: '2023-03-01 12:00:00',
              operator: '张三'
            },
            {
              gzlx: '破损',
              gzdm: '0003',
              operateTime: '2023-03-01 12:00:00',
              operator: '张三'
            }
          ]
        }
      })
    })
  })
}
const openDialog = (act, obj = {}) => {
  proxy.$dialog.show(
    FaultTypeDetail,
    {
      width: 500,
      title: act === 'view' ? '故障类型详情' : act === 'new' ? '新增故障类型' : '编辑故障类型',
      showConfirm: act !== 'view'
    },
    { act, info: obj }
  )
}
/**
 * @type {Options}
 */
const options = {
  showIndex: true,
  selectionType: 'multiple',
  qFunc: getList
}
</script>

<template>
  <div class="">
    <ComTable :columns="columns" :options="options">
      <template #tools>
        <el-button type="primary" @click="openDialog('new')">新增</el-button>
        <el-button type="danger">批量删除</el-button>
      </template>
      <template #action="{ row }">
        <el-button type="success" link size="small" @click="openDialog('view', row)">
          详情
        </el-button>
        <el-button type="primary" link size="small" @click="openDialog('edit', row)">
          修改
        </el-button>
        <el-button type="danger" link size="small">删除</el-button>
      </template>
    </ComTable>
  </div>
</template>

<style lang="scss" scoped></style>
