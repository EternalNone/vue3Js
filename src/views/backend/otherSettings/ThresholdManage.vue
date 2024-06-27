<script setup name="ThresholdManage">
import '@/components/types'
import ThresholdDetail from './comp/ThresholdDetail.vue'
/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '阈值名称',
    prop: 'yzlx',
    minWidth: 150,
    showInSearch: true
  },
  {
    label: '最小值(mm)',
    prop: 'minVal',
    minWidth: 150
  },
  {
    label: '最大值(mm)',
    prop: 'maxVal',
    minWidth: 150
  },
  {
    label: '车型',
    prop: 'cx',
    minWidth: 200,
    slot: 'cx'
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
              cx: ['CRH380D', 'CRH1E'],
              yzlx: '闸片厚度',
              minVal: '10',
              maxVal: '16',
              operator: '张三',
              operateTime: '2023-03-01 12:00:00'
            },
            {
              cx: ['CRH380D'],
              yzlx: '排障器',
              minVal: '10',
              maxVal: '14',
              operator: '李四',
              operateTime: '2023-03-01 12:00:00'
            },
            {
              cx: ['CRH1B', 'CRH1E'],
              yzlx: '撒砂管',
              minVal: '10',
              maxVal: '16',
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
    ThresholdDetail,
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
      <template #cx="{ row }">
        {{ row.cx?.join(',') }}
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
