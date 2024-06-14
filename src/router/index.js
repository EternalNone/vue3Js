import { createRouter, createWebHistory } from 'vue-router'

const LayoutCockpit = () => import('@/layouts/layoutCockpit/index.vue')
const LayoutBackend = () => import('@/layouts/layoutBackend/index.vue')
const isDevelopment = import.meta.env.DEV
// 常驻路由
const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    name: 'login',
    meta: {
      title: '登录',
      svgIcon: ''
    }
  }
]
// 驾驶舱路由
const CockpitRouter = [
  {
    path: '/',
    component: LayoutCockpit,
    redirect: '/cockpit',
    children: [
      {
        path: 'cockpit',
        component: () => import('@/views/frontend/cockpit/index.vue'),
        name: 'cockpit',
        meta: {
          title: '驾驶舱',
          fullTitle: '集控中心驾驶舱',
          svgIcon: 'cockpit'
        }
      },
      {
        path: 'central',
        component: () => import('@/views/frontend/central/index.vue'),
        name: 'central',
        meta: {
          title: '集中控制',
          fullTitle: '集中控制平台',
          svgIcon: 'central'
        }
      },
      {
        path: 'checkData',
        component: () => import('@/views/frontend/checkData/index.vue'),
        name: 'checkData',
        meta: {
          title: '检测数据',
          fullTitle: '检测数据中心',
          svgIcon: 'checkData',
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
          svgIcon: 'statistics'
        }
      }
    ]
  }
]
// 后台管理路由
const BackendRouter = [
  {
    path: '/backend',
    component: LayoutBackend,
    redirect: '/backend/home',
    children: [
      {
        path: 'home',
        component: () => import('@/views/backend/index.vue'),
        name: 'home',
        meta: {
          title: '首页',
          svgIcon: 'home'
        }
      },
      {
        path: 'checkOutside',
        component: () => import('@/views/backend/checkOutside/index.vue'),
        name: 'checkOutside',
        meta: {
          title: '机器人检测',
          svgIcon: 'robot'
        }
      },
      {
        path: 'checkInside',
        component: () => import('@/views/backend/checkInside/index.vue'),
        name: 'checkInside',
        meta: {
          title: '360检测',
          svgIcon: '360'
        }
      },
      {
        path: 'vehManage',
        redirect: '/backend/vehManage/vehModelManage',
        name: 'vehManage',
        meta: {
          title: '车辆管理',
          svgIcon: 'train'
        },
        children: [
          {
            path: 'vehModelManage',
            component: () => import('@/views/backend/vehManage/VehModelManage.vue'),
            name: 'vehModelManage',
            meta: {
              title: '车型信息管理',
              svgIcon: ''
            }
          },
          {
            path: 'compManage',
            component: () => import('@/views/backend/vehManage/CompManage.vue'),
            name: 'compManage',
            meta: {
              title: '区域部件管理',
              svgIcon: ''
            }
          },
          {
            path: 'faultTypeManage',
            component: () => import('@/views/backend/vehManage/FaultTypeManage.vue'),
            name: 'faultTypeManage',
            meta: {
              title: '故障类型管理',
              svgIcon: ''
            }
          }
        ]
      },
      {
        path: 'otherSettings',
        redirect: '/backend/otherSettings/trackManage',
        name: 'otherSettings',
        meta: {
          title: '其他配置',
          svgIcon: 'otherSetting'
        },
        children: [
          {
            path: 'trackManage',
            component: () => import('@/views/backend/otherSettings/TrackManage.vue'),
            name: 'trackManage',
            meta: {
              title: '股道管理',
              svgIcon: ''
            }
          },
          {
            path: 'channelManage',
            component: () => import('@/views/backend/otherSettings/ChannelManage.vue'),
            name: 'channelManage',
            meta: {
              title: '通道管理',
              svgIcon: ''
            }
          },
          {
            path: 'thresholdManage',
            component: () => import('@/views/backend/otherSettings/ThresholdManage.vue'),
            name: 'thresholdManage',
            meta: {
              title: '阈值管理',
              svgIcon: ''
            }
          },
          {
            path: 'robotManage',
            component: () => import('@/views/backend/otherSettings/RobotManage.vue'),
            name: 'robotManage',
            meta: {
              title: '机器人管理',
              svgIcon: ''
            }
          }
        ]
      },
      {
        path: 'settings',
        redirect: '/backend/settings/menuManage',
        name: 'settings',
        meta: {
          title: '系统设置',
          svgIcon: 'settings'
        },
        children: [
          {
            path: 'menuManage',
            component: () => import('@/views/backend/settings/MenuManage.vue'),
            name: 'menuManage',
            meta: {
              title: '菜单管理',
              svgIcon: ''
            }
          },
          {
            path: 'userManage',
            component: () => import('@/views/backend/settings/UserManage.vue'),
            name: 'userManage',
            meta: {
              title: '用户管理',
              svgIcon: ''
            }
          },
          {
            path: 'roleManage',
            component: () => import('@/views/backend/settings/RoleManage.vue'),
            name: 'roleManage',
            meta: {
              title: '角色管理',
              svgIcon: ''
            }
          }
        ]
      },
      {
        path: 'devTools',
        redirect: '/backend/devTools/svgsManage',
        name: 'devTools',
        meta: {
          title: '开发工具',
          svgIcon: 'devTools',
          hidden: !isDevelopment // 是否隐藏菜单
        },
        children: [
          {
            path: 'svgsManage',
            component: () => import('@/views/backend/devTools/SvgsMana.vue'),
            name: 'svgsManage',
            meta: {
              title: '图标管理',
              svgIcon: '',
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
  routes: [...constantRoutes, ...CockpitRouter, ...BackendRouter]
})

export { router, CockpitRouter, BackendRouter }
