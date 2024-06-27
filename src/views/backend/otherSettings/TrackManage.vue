<script setup name="TrackManage">
import '@/components/types'
import TrackDetail from './comp/TrackDetail.vue'
/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '股道名称',
    prop: 'gdmc',
    minWidth: 150,
    showInSearch: true
  },
  {
    label: '股道编号',
    prop: 'gdbh',
    minWidth: 100,
    showInSearch: true
  },
  {
    label: '所属车库',
    prop: 'ssck',
    minWidth: 100
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
const getTracks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          total: 3,
          records: [
            {
              gdmc: 'D50',
              gdbh: 'D50',
              operateTime: '2023-03-01 12:00:00',
              operator: '张三'
            },
            {
              gdmc: 'D51',
              gdbh: 'D51',
              operateTime: '2023-03-01 12:00:00',
              operator: '张三'
            },
            {
              gdmc: 'D52',
              gdbh: 'D52',
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
    TrackDetail,
    {
      width: 500,
      title: act === 'view' ? '股道详情' : act === 'new' ? '新增股道' : '编辑股道',
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
  qFunc: getTracks
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
