<script setup name="RoleManage">
import '@/components/types'
/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '角色名称',
    prop: 'roleName',
    align: 'left',
    minWidth: 150,
    fixed: 'left',
    showInSearch: true
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
  <div class="role-manage">
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
