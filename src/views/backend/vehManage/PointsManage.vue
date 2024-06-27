<script setup name="PointsManage">
import '@/components/types'
import PointsDetail from './comp/PointsDetail.vue'

/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '点位名称',
    prop: 'dwmc',
    align: 'left',
    minWidth: 200,
    showInSearch: true
  },
  {
    label: '点位编号',
    prop: 'dwbh',
    minWidth: 100
  },
  {
    label: '车型',
    prop: 'vehicleModel',
    minWidth: 150
  },
  {
    label: '显示排序',
    prop: 'xspx',
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
              dwmc: '车底',
              dwbh: '0001',
              vehicleModel: ['CRH380D', 'CRH1E'],
              xspx: 1,
              unit: '南翔动车所',
              operateTime: '2023-03-01 12:00:00',
              operator: '张三',
              children: [
                {
                  dwmc: '撒砂区域',
                  dwbh: '00011',
                  vehicleModel: ['CRH380D', 'CRH1E'],
                  xspx: 2,
                  unit: '南翔动车所',
                  operateTime: '2023-03-01 12:00:00',
                  operator: '张三',
                  children: [
                    {
                      dwmc: '撒砂管',
                      dwbh: '000111',
                      vehicleModel: ['CRH380D', 'CRH1E'],
                      xspx: 1,
                      unit: '南翔动车所',
                      operateTime: '2023-03-01 12:00:00',
                      operator: '张三'
                    },
                    {
                      dwmc: '螺栓',
                      dwbh: '000112',
                      vehicleModel: ['CRH380D', 'CRH1E'],
                      xspx: 2,
                      unit: '南翔动车所',
                      operateTime: '2023-03-01 12:00:00',
                      operator: '张三'
                    }
                  ]
                }
              ]
            }
          ]
        }
      })
    })
  })
}
const openDialog = (act, obj = {}) => {
  proxy.$dialog.show(
    PointsDetail,
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
  rowKey: 'dwbh',
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
