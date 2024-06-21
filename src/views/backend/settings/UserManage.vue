<script setup name="UserManage">
import '@/components/types'
import UserDetail from './comp/UserDetail.vue'

/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '用户名',
    prop: 'userName',
    minWidth: 100,
    fixed: 'left',
    showInSearch: true
  },
  {
    label: '账号',
    prop: 'account',
    minWidth: 150,
    showInSearch: true
  },
  {
    label: '角色',
    prop: 'roles',
    minWidth: 250,
    slot: 'roles'
  },
  {
    label: '邮箱',
    prop: 'email',
    minWidth: 200
  },
  {
    label: '手机号',
    prop: 'mobile',
    minWidth: 150
  },
  {
    label: '状态',
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
const getUserList = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          total: 3,
          records: [
            {
              userName: '张三',
              account: 'zhangsan',
              roles: ['超级管理员'],
              email: '123@qq.com',
              mobile: '12345678901',
              status: 1,
              createTime: '2023-03-01 12:00:00'
            },
            {
              userName: '李四',
              account: 'lisi',
              roles: ['标图人员', '开发人员'],
              email: '123@qq.com',
              mobile: '12345678901',
              status: 1,
              createTime: '2023-03-01 12:00:00'
            },
            {
              userName: '王五',
              account: 'wangwu',
              roles: ['标图人员'],
              email: '123@qq.com',
              mobile: '12345678901',
              status: 1,
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
  qFunc: getUserList
}
const openDialog = (act, obj = {}) => {
  proxy.$dialog.show(
    UserDetail,
    {
      width: 500,
      title: act === 'view' ? '菜单详情' : act === 'new' ? '新增菜单' : '编辑菜单',
      showConfirm: act !== 'view'
    },
    { act, info: obj }
  )
}
</script>

<template>
  <div class="user-manage">
    <ComTable :columns="columns" :options="options">
      <template #tools>
        <el-button type="primary" @click="openDialog('new')">新增</el-button>
        <el-button type="danger">批量删除</el-button>
      </template>
      <template #status="{ row }">
        <el-tag :type="row?.status ? 'success' : 'danger'">
          {{ row?.status ? '启用' : '禁用' }}
        </el-tag>
      </template>
      <template #roles="{ row }">
        <el-tag v-for="item in row.roles" :key="item">
          {{ item }}
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

<style lang="scss" scoped>
.user-manage {
  .el-tag {
    & + .el-tag {
      margin-left: 5px;
    }
  }
}
</style>
