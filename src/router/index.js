import { createRouter, createWebHistory } from 'vue-router'

const isDevelopment = import.meta.env.DEV
// 常驻路由
const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    name: 'login',
    meta: {
      title: '登录',
      icon: ''
    }
  }
]
// 动态路由
const activeRoutes = [
  {
    path: '/',
    component: () => import('@/layouts/layoutCockpit/index.vue'),
    redirect: '/cockpit',
    children: [
      {
        path: 'cockpit',
        component: () => import('@/views/frontend/cockpit/index.vue'),
        name: 'cockpit',
        meta: {
          title: '驾驶舱',
          fullTitle: '集控中心驾驶舱',
          icon: 'cockpit'
        }
      },
      {
        path: 'central',
        component: () => import('@/views/frontend/central/index.vue'),
        name: 'central',
        meta: {
          title: '集中控制',
          fullTitle: '集中控制平台',
          icon: 'central'
        }
      },
      {
        path: 'checkData',
        component: () => import('@/views/frontend/checkData/index.vue'),
        name: 'checkData',
        meta: {
          title: '检测数据',
          fullTitle: '检测数据中心',
          icon: 'checkData',
          scrollbar: false // 是否显示appMain区域的滚动条
        }
      },
      {
        path: 'statistics',
        component: () => import('@/views/frontend/statistics/index.vue'),
        name: 'statistics',
        meta: {
          title: '统计分析',
          fullTitle: '数据统计分析',
          icon: 'statistics'
        }
      }
    ]
  },
  {
    path: '/backend',
    component: () => import('@/layouts/layoutBackend/index.vue'),
    redirect: '/backend/home',
    meta: {
      title: '后台管理',
      icon: 'backend'
    },
    children: [
      {
        path: 'home',
        component: () => import('@/views/backend/index.vue'),
        name: 'home',
        meta: {
          title: '首页',
          icon: 'home'
        }
      },
      {
        path: 'checkInside',
        component: () => import('@/views/backend/checkInside/index.vue'),
        name: 'checkInside',
        meta: {
          title: '机器人检测',
          icon: 'robot'
        }
      },
      {
        path: 'checkOutside',
        component: () => import('@/views/backend/checkOutside/index.vue'),
        name: 'checkOutside',
        meta: {
          title: '360检测',
          icon: 'checkOutside'
        }
      },
      {
        path: 'vehManage',
        redirect: '/backend/vehManage/vehModelManage',
        meta: {
          title: '车辆管理',
          icon: 'train'
        },
        children: [
          {
            path: 'vehModelManage',
            component: () => import('@/views/backend/vehManage/VehModelManage.vue'),
            name: 'vehModelManage',
            meta: {
              title: '车型信息管理',
              icon: ''
            }
          },
          {
            path: 'pointsManage',
            component: () => import('@/views/backend/vehManage/PointsManage.vue'),
            name: 'pointsManage',
            meta: {
              title: '故障点位管理',
              icon: ''
            }
          },
          {
            path: 'faultTypeManage',
            component: () => import('@/views/backend/vehManage/FaultTypeManage.vue'),
            name: 'faultTypeManage',
            meta: {
              title: '故障类型管理',
              icon: ''
            }
          }
        ]
      },
      {
        path: 'otherSettings',
        redirect: '/backend/otherSettings/trackManage',
        meta: {
          title: '其他配置',
          icon: 'otherSetting'
        },
        children: [
          {
            path: 'trackManage',
            component: () => import('@/views/backend/otherSettings/TrackManage.vue'),
            name: 'trackManage',
            meta: {
              title: '股道管理',
              icon: ''
            }
          },
          {
            path: 'channelManage',
            component: () => import('@/views/backend/otherSettings/ChannelManage.vue'),
            name: 'channelManage',
            meta: {
              title: '通道管理',
              icon: ''
            }
          },
          {
            path: 'thresholdManage',
            component: () => import('@/views/backend/otherSettings/ThresholdManage.vue'),
            name: 'thresholdManage',
            meta: {
              title: '阈值管理',
              icon: ''
            }
          },
          {
            path: 'robotManage',
            component: () => import('@/views/backend/otherSettings/RobotManage.vue'),
            name: 'robotManage',
            meta: {
              title: '机器人管理',
              icon: ''
            }
          }
        ]
      },
      {
        path: 'settings',
        redirect: '/backend/settings/menuManage',
        meta: {
          title: '系统设置',
          icon: 'settings'
        },
        children: [
          {
            path: 'menuManage',
            component: () => import('@/views/backend/settings/MenuManage.vue'),
            name: 'menuManage',
            meta: {
              title: '菜单管理',
              icon: ''
            }
          },
          {
            path: 'userManage',
            component: () => import('@/views/backend/settings/UserManage.vue'),
            name: 'userManage',
            meta: {
              title: '用户管理',
              icon: ''
            }
          },
          {
            path: 'roleManage',
            component: () => import('@/views/backend/settings/RoleManage.vue'),
            name: 'roleManage',
            meta: {
              title: '角色管理',
              icon: ''
            }
          }
        ]
      },
      {
        path: 'devTools',
        redirect: '/backend/devTools/svgsManage',
        meta: {
          title: '开发工具',
          icon: 'devTools',
          hidden: !isDevelopment // 是否隐藏菜单
        },
        children: [
          {
            path: 'svgsManage',
            component: () => import('@/views/backend/devTools/SvgsMana.vue'),
            name: 'svgsManage',
            meta: {
              title: '图标管理',
              icon: '',
              noPadding: true // 内容区el-main是否不需要padding
            }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...constantRoutes, ...activeRoutes]
})

export { router, activeRoutes }
