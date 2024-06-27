<script setup name="VehModelManage">
import '@/components/types'
import VehModelDetail from './comp/VehModelDetail.vue'
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
              vehicleModel: 'CRH380D',
              bzType: '长编',
              cxs: 16,
              zs: 64,
              unit: '南翔动车所',
              operateTime: '2023-03-01 12:00:00',
              operator: '张三'
            },
            {
              vehicleModel: 'CRH1E',
              bzType: '短编',
              cxs: 8,
              zs: 32,
              unit: '南翔动车所',
              operateTime: '2023-03-01 12:00:00',
              operator: '张三'
            },
            {
              vehicleModel: 'CRH1B',
              bzType: '重连',
              cxs: 16,
              zs: 64,
              unit: '南翔动车所',
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
    VehModelDetail,
    {
      width: 500,
      title: act === 'view' ? '车型详情' : act === 'new' ? '新增车型' : '编辑车型',
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
