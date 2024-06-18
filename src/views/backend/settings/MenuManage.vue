<script setup name="MenuManage">
import '@/components/types'
/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '菜单名称',
    prop: 'title',
    align: 'left',
    minWidth: 200,
    fixed: 'left',
    slot: 'title'
  },
  {
    label: '类型',
    prop: 'type',
    minWidth: 100,
    slot: 'type'
  },
  {
    label: '菜单标识',
    prop: 'name',
    minWidth: 150
  },
  {
    label: '路径',
    prop: 'path',
    align: 'left',
    minWidth: 200
  },
  {
    label: '图标',
    prop: 'icon',
    minWidth: 80,
    slot: 'icon'
  },
  {
    label: '组件',
    prop: 'component',
    align: 'left',
    minWidth: 300
  },
  {
    label: '状态',
    prop: 'status',
    minWidth: 100,
    slot: 'status'
  },
  {
    label: '是否隐藏',
    prop: 'hidden',
    minWidth: 100,
    slot: 'hidden'
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
const getMenu = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        total: 1,
        data: {
          records: [
            {
              path: '/',
              redirect: '/cockpit',
              component: 'LayoutCockpit',
              meta: {
                title: '驾驶舱',
                icon: '',
                hidden: 0,
                status: 1
              },
              children: [
                {
                  path: 'cockpit',
                  name: 'cockpit',
                  component: 'views/frontend/cockpit/index.vue',
                  meta: {
                    title: '驾驶舱',
                    icon: 'cockpit',
                    hidden: 0,
                    status: 1
                  }
                },
                {
                  path: 'central',
                  component: 'views/frontend/central/index.vue',
                  name: 'central',
                  meta: {
                    title: '集中控制',
                    icon: 'central',
                    hidden: 0,
                    status: 1
                  }
                },
                {
                  path: 'checkData',
                  component: 'views/frontend/checkData/index.vue',
                  name: 'checkData',
                  meta: {
                    title: '检测数据',
                    icon: 'checkData',
                    hidden: 0,
                    status: 1
                  }
                },
                {
                  path: 'statistics',
                  component: 'views/frontend/statistics/index.vue',
                  name: 'statistics',
                  meta: {
                    title: '统计分析',
                    icon: 'statistics',
                    hidden: 0,
                    status: 1
                  }
                }
              ]
            },
            {
              path: '/backend',
              redirect: '/backend/checkOutside',
              component: 'LayoutBackend',
              meta: {
                title: '管理后台',
                icon: '',
                hidden: 0,
                status: 1
              },
              children: [
                {
                  path: 'checkOutside',
                  name: 'checkOutside',
                  component: 'views/backend/checkOutside/index.vue',
                  meta: {
                    title: '机器人检测',
                    icon: 'robot',
                    hidden: 0,
                    status: 1
                  }
                },
                {
                  path: 'checkInside',
                  component: 'views/backend/checkInside/index.vue',
                  name: 'checkInside',
                  meta: {
                    title: '360检测',
                    icon: '360',
                    hidden: 0,
                    status: 1
                  }
                },
                {
                  path: 'vehManage',
                  redirect: '/backend/vehManage/vehModelManage',
                  meta: {
                    title: '车辆管理',
                    icon: 'train',
                    hidden: 0,
                    status: 1
                  },
                  children: [
                    {
                      path: 'vehModelManage',
                      component: 'views/backend/vehManage/VehModelManage.vue',
                      name: 'vehModelManage',
                      meta: {
                        title: '车型信息管理',
                        icon: '',
                        hidden: 0,
                        status: 1
                      }
                    },
                    {
                      path: 'pointsManage',
                      component: 'views/backend/vehManage/PointsManage.vue',
                      name: 'pointsManage',
                      meta: {
                        title: '故障点位管理',
                        icon: '',
                        hidden: 0,
                        status: 1
                      }
                    },
                    {
                      path: 'faultTypeManage',
                      component: 'views/backend/vehManage/FaultTypeManage.vue',
                      name: 'faultTypeManage',
                      meta: {
                        title: '故障类型管理',
                        icon: '',
                        hidden: 0,
                        status: 1
                      }
                    }
                  ]
                },
                {
                  path: 'otherSettings',
                  redirect: '/backend/otherSettings/trackManage',
                  meta: {
                    title: '其他配置',
                    icon: 'otherSetting',
                    hidden: 0,
                    status: 1
                  },
                  children: [
                    {
                      path: 'trackManage',
                      component: 'views/backend/otherSettings/TrackManage.vue',
                      name: 'trackManage',
                      meta: {
                        title: '股道管理',
                        icon: '',
                        hidden: 0,
                        status: 1
                      }
                    },
                    {
                      path: 'channelManage',
                      component: 'views/backend/otherSettings/ChannelManage.vue',
                      name: 'channelManage',
                      meta: {
                        title: '通道管理',
                        icon: '',
                        hidden: 0,
                        status: 1
                      }
                    },
                    {
                      path: 'thresholdManage',
                      component: 'views/backend/otherSettings/ThresholdManage.vue',
                      name: 'thresholdManage',
                      meta: {
                        title: '阈值管理',
                        icon: '',
                        hidden: 0,
                        status: 1
                      }
                    },
                    {
                      path: 'robotManage',
                      component: 'views/backend/otherSettings/RobotManage.vue',
                      name: 'robotManage',
                      meta: {
                        title: '机器人管理',
                        icon: '',
                        hidden: 0,
                        status: 1
                      }
                    }
                  ]
                },
                {
                  path: 'settings',
                  redirect: '/backend/settings/menuManage',
                  meta: {
                    title: '系统设置',
                    icon: 'settings',
                    hidden: 0,
                    status: 1
                  },
                  children: [
                    {
                      path: 'menuManage',
                      component: 'views/backend/settings/MenuManage.vue',
                      name: 'menuManage',
                      meta: {
                        title: '菜单管理',
                        icon: '',
                        hidden: 0,
                        status: 1
                      }
                    },
                    {
                      path: 'userManage',
                      component: 'views/backend/settings/UserManage.vue',
                      name: 'userManage',
                      meta: {
                        title: '用户管理',
                        icon: '',
                        hidden: 0,
                        status: 1
                      }
                    },
                    {
                      path: 'roleManage',
                      component: 'views/backend/settings/RoleManage.vue',
                      name: 'roleManage',
                      meta: {
                        title: '角色管理',
                        icon: '',
                        hidden: 0,
                        status: 1
                      }
                    }
                  ]
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
  expandRowKeys: ['/', '/backend'],
  qFunc: getMenu
}
</script>

<template>
  <div class="menu-manage">
    <ComTable :columns="columns" :options="options">
      <template #tools>
        <el-button type="primary">新增</el-button>
      </template>
      <template #title="{ row }">
        {{ row?.meta?.title || '--' }}
      </template>
      <template #type="{ row }">
        <el-tag :type="row?.children?.length ? 'success' : 'danger'">
          {{ row?.children?.length ? '目录' : '菜单' }}
        </el-tag>
      </template>
      <template #icon="{ row }">
        <SvgIcon
          v-if="row.meta.icon"
          :name="row.meta.icon"
          :size="24"
          color="var(--el-text-color-regular)"
        />
      </template>
      <template #status="{ row }">
        <el-tag :type="row?.meta?.status ? 'success' : 'danger'">
          {{ row?.meta?.status ? '启用' : '禁用' }}
        </el-tag>
      </template>
      <template #hidden="{ row }">
        <el-tag :type="row?.meta?.hidden ? 'success' : 'danger'">
          {{ row?.meta?.hidden ? '是' : '否' }}
        </el-tag>
      </template>
      <template #action="{ row }">
        <el-button type="success" link size="small">详情</el-button>
        <el-button
          v-if="row.path !== '/' && row.path !== '/backend'"
          type="primary"
          link
          size="small"
        >
          编辑
        </el-button>
        <el-button
          v-if="row.path !== '/' && row.path !== '/backend'"
          type="danger"
          link
          size="small"
        >
          删除
        </el-button>
      </template>
    </ComTable>
  </div>
</template>

<style lang="scss" scoped></style>
