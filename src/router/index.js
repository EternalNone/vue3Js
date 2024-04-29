import { createRouter, createWebHistory } from 'vue-router'

const LayoutCockpit = () => import('@/layouts/layoutCockpit/index.vue')
const LayoutBackend = () => import('@/layouts/layoutBackend/index.vue')
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
    redirect: '/statistics',
    children: [
      {
        path: 'statistics',
        component: () => import('@/views/statistics/index.vue'),
        name: 'statistics',
        meta: {
          title: '统计分析',
          svgIcon: 'statistics'
        }
      },
      {
        path: 'central',
        component: () => import('@/views/central/index.vue'),
        name: 'central',
        meta: {
          title: '集中控制',
          svgIcon: 'central'
        }
      },
      {
        path: 'checkData',
        component: () => import('@/views/checkData/index.vue'),
        name: 'checkData',
        meta: {
          title: '检测数据',
          svgIcon: 'checkData',
          scrollbar: false
        }
      },
      {
        path: 'abrasion',
        component: () => import('@/views/abrasion/index.vue'),
        name: 'abrasion',
        meta: {
          title: '检测预警',
          svgIcon: 'abrasion'
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
        path: 'dataManage',
        redirect: '/backend/dataManage/faultAudit',
        component: () => import('@/views/backend/index.vue'),
        name: 'dataManage',
        meta: {
          title: '算法管理',
          svgIcon: 'algorithm'
        },
        children: [
          {
            path: 'faultAudit',
            component: () => import('@/views/backend/index.vue'),
            name: 'faultAudit',
            meta: {
              title: '故障审核',
              svgIcon: ''
            }
          },
          {
            path: 'faultMana',
            component: () => import('@/views/backend/index.vue'),
            name: 'faultMana',
            meta: {
              title: '故障管理',
              svgIcon: ''
            }
          }
        ]
      },
      {
        path: 'checkManage',
        redirect: '/backend/checkManage/checkOutside',
        component: () => import('@/views/backend/index.vue'),
        name: 'checkManage',
        meta: {
          title: '检车管理',
          svgIcon: 'train'
        },
        children: [
          {
            path: 'checkOutside',
            component: () => import('@/views/backend/index.vue'),
            name: 'checkOutside',
            meta: {
              title: '库外检测',
              svgIcon: ''
            }
          },
          {
            path: 'checkInside',
            component: () => import('@/views/backend/index.vue'),
            name: 'checkInside',
            meta: {
              title: '库内检测',
              svgIcon: ''
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
