<script setup name="RobotManage">
import '@/components/types'
import RobotDetail from './comp/RobotDetail.vue'
/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '机器人名称',
    prop: 'jqrmc',
    minWidth: 100
  },
  {
    label: '机器人编号',
    prop: 'jqrbh',
    minWidth: 100
  },
  {
    label: '所属股道',
    prop: 'ssgd',
    minWidth: 100,
    showInSearch: true
  },
  {
    label: '所属列位',
    prop: 'sslw',
    minWidth: 100
  },
  {
    label: 'IP',
    prop: 'ip',
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
const getList = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          total: 3,
          records: [
            {
              jqrmc: '智能机器人1',
              jqrbh: '101',
              ssgd: '50',
              sslw: '1',
              ip: '192.168.1.1',
              operator: '张三',
              operateTime: '2023-03-01 12:00:00'
            },
            {
              jqrmc: '智能机器人2',
              jqrbh: '102',
              ssgd: '51',
              sslw: '1',
              ip: '192.168.1.1',
              operator: '李四',
              operateTime: '2023-03-01 12:00:00'
            },
            {
              jqrmc: '智能机器人3',
              jqrbh: '103',
              ssgd: '52',
              sslw: '1',
              ip: '192.168.1.1',
              operator: '王五',
              operateTime: '2023-03-01 12:00:00'
            }
          ]
        }
      })
    })
  })
}

const openDialog = (act, obj = {}) => {
  proxy.$dialog.show(
    RobotDetail,
    {
      width: 500,
      title: act === 'view' ? '阈值详情' : act === 'new' ? '新增阈值' : '编辑阈值',
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
