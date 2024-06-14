<script setup name="MenuManage">
import ComTable from '@/components/ComTable/index.vue'
import '@/components/types'
/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '名称',
    prop: 'title',
    minWidth: 150,
    fixed: 'left',
    slot: 'title'
  },
  {
    label: '路由',
    prop: 'path',
    minWidth: 200
  },
  {
    label: '类型',
    prop: 'type',
    minWidth: 100,
    slot: 'type'
  },
  {
    label: '标识',
    prop: 'name',
    minWidth: 150
  },
  {
    label: '是否隐藏',
    prop: 'hidden',
    minWidth: 100
  },
  {
    label: '图标',
    prop: 'svgIcon',
    minWidth: 100,
    slot: 'svgIcon'
  },
  {
    label: '组件路径',
    prop: 'component',
    minWidth: 200
  },
  {
    label: '操作',
    prop: 'action',
    minWidth: 120,
    fixed: 'right',
    slot: 'action'
  }
]
const getMenu = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        total: 1,
        data: {
          records: [
            {
              title: '车辆管理',
              path: 'vehManage',
              name: 'vehManage',
              meta: {
                title: '车辆管理',
                svgIcon: 'train',
                hidden: false
              },
              children: [
                {
                  title: '车型信息管理',
                  path: '/vehManage/vehModelManage',
                  name: 'vehModelManage',
                  component: '@/views/backend/vehManage/VehModelManage.vue',
                  meta: {
                    title: '车型信息管理',
                    svgIcon: '',
                    hidden: false
                  }
                }
              ]
            }
          ]
        }
      })
    }, 1000)
  })
}
/**
 * @type {Options}
 */
const options = {
  rowKey: 'path',
  showPagination: false,
  qFunc: getMenu
}
</script>

<template>
  <div class="">
    <ComTable :columns="columns" :options="options">
      <template #tools>
        <el-button type="primary">新增</el-button>
        <el-button type="danger">批量删除</el-button>
      </template>
      <template #title="{ row }">
        {{ row?.meta?.title || '--' }}
      </template>
      <template #type="{ row }">
        {{ row?.children?.length ? '目录' : '菜单' }}
      </template>
      <template #svgIcon="{ row }">
        <SvgIcon
          v-show="row?.meta?.svgIcon"
          :name="row?.meta?.svgIcon || ''"
          color="var(--el-color-primary)"
        />
      </template>
      <template #action>
        <el-button type="primary" link size="small">修改</el-button>
        <el-button type="danger" link size="small">删除</el-button>
      </template>
    </ComTable>
  </div>
</template>

<style lang="scss" scoped></style>
