<script setup name="UserManage">
import '@/components/types'

/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '用户名',
    prop: 'userName',
    align: 'left',
    minWidth: 100,
    fixed: 'left',
    showInSearch: true
  },
  {
    label: '账号',
    prop: 'account',
    align: 'left',
    minWidth: 150,
    showInSearch: true
  },
  {
    label: '角色',
    prop: 'roles',
    align: 'left',
    minWidth: 200
  },
  {
    label: '邮箱',
    prop: 'email',
    align: 'left',
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
  <div class="user-manage">
    <ComTable :columns="columns" :options="options">
      <template #tools>
        <el-button type="primary">新增</el-button>
        <el-button type="danger">批量删除</el-button>
      </template>
      <template #status="{ row }">
        <el-tag :type="row?.meta?.status ? 'success' : 'danger'">
          {{ row?.meta?.status ? '启用' : '禁用' }}
        </el-tag>
      </template>
      <template #action>
        <el-button type="success" link size="small">详情</el-button>
        <el-button type="primary" link size="small">编辑</el-button>
        <el-button type="danger" link size="small">删除</el-button>
      </template>
    </ComTable>
  </div>
</template>

<style lang="scss" scoped></style>
