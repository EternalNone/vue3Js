<script setup name="RoleManage">
import '@/components/types'
import RoleDetail from './comp/RoleDetail.vue'

/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '角色名称',
    prop: 'roleName',
    minWidth: 150,
    fixed: 'left',
    showInSearch: true
  },
  {
    label: '角色状态',
    prop: 'status',
    minWidth: 100,
    slot: 'status'
  },
  {
    label: '创建时间',
    prop: 'createTime',
    minWidth: 160
  },
  {
    label: '操作',
    prop: 'action',
    minWidth: 150,
    ellipsis: false,
    fixed: 'right',
    slot: 'action'
  }
]
const { proxy } = getCurrentInstance()
const getRoles = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          total: 3,
          records: [
            {
              roleName: '超级管理员',
              status: 1,
              createTime: '2023-03-01 12:00:00'
            },
            {
              roleName: '开发人员',
              status: 1,
              createTime: '2023-03-01 12:00:00'
            },
            {
              roleName: '标图人员',
              status: 0,
              createTime: '2023-03-01 12:00:00'
            }
          ]
        }
      })
    })
  })
}
/**
 * @type {Options}
 */
const options = {
  showIndex: true,
  selectionType: 'multiple',
  qFunc: getRoles
}
const openDialog = (act, obj = {}) => {
  proxy.$dialog.show(
    RoleDetail,
    {
      width: 500,
      title: act === 'view' ? '角色详情' : act === 'new' ? '新增角色' : '编辑角色',
      showConfirm: act !== 'view'
    },
    { act, info: obj }
  )
}
</script>

<template>
  <div class="role-manage">
    <ComTable :columns="columns" :options="options">
      <template #tools>
        <el-button type="primary" @click="openDialog('new')">新增</el-button>
        <el-button type="danger">批量删除</el-button>
      </template>
      <template #status="{ row }">
        <el-tag :type="row.status ? 'success' : 'danger'">
          {{ row.status ? '启用' : '禁用' }}
        </el-tag>
      </template>
      <template #action="{ row }">
        <el-button type="success" link size="small" @click="openDialog('view', row)">
          详情
        </el-button>
        <el-button type="primary" link size="small" @click="openDialog('edit', row)">
          编辑
        </el-button>
        <el-button type="danger" link size="small">删除</el-button>
      </template>
    </ComTable>
  </div>
</template>

<style lang="scss" scoped></style>
