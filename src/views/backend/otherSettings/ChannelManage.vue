<script setup name="ChannelManage">
import '@/components/types'
import ChannelDetail from './comp/ChannelDetail.vue'
/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '通道名称',
    prop: 'tdmc',
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
              tdmc: '底中',
              tddm: 'dz',
              mklx: '库外',
              smlx: '快扫',
              tdlx: '1',
              zsfx: 'vertical',
              isShow: 1
            },
            {
              tdmc: '右辅',
              tddm: 'yf',
              mklx: '库外',
              smlx: '快扫',
              tdlx: '1',
              zsfx: 'vertical',
              isShow: 1
            },
            {
              tdmc: '左辅',
              tddm: 'zf',
              mklx: '库外',
              smlx: '快扫',
              tdlx: '1',
              zsfx: 'horizontal',
              isShow: 1
            }
          ]
        }
      })
    })
  })
}
const openDialog = (act, obj = {}) => {
  proxy.$dialog.show(
    ChannelDetail,
    {
      width: 500,
      title: act === 'view' ? '通道详情' : act === 'new' ? '新增通道' : '编辑通道',
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
