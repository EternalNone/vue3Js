import { createRouter, createWebHistory } from 'vue-router'

const LayoutCockpit = () => import('@/layouts/LayoutCockpit.vue')
const LayoutBackend = () => import('@/layouts/LayoutBackend.vue')
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
          svgIcon: 'earth'
        }
      },
      {
        path: 'central',
        component: () => import('@/views/central/index.vue'),
        name: 'central',
        meta: {
          title: '集中控制',
          svgIcon: 'earth'
        }
      },
      {
        path: 'checkData',
        component: () => import('@/views/checkData/index.vue'),
        name: 'checkData',
        meta: {
          title: '检测数据',
          svgIcon: 'earth'
        }
      },
      {
        path: 'abrasion',
        component: () => import('@/views/abrasion/index.vue'),
        name: 'abrasion',
        meta: {
          title: '检测预警',
          svgIcon: 'earth'
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
          svgIcon: 'earth'
        }
      },
      {
        path: 'dataManage',
        redirect: '/backend/dataManage/faultAudit',
        component: () => import('@/views/backend/index.vue'),
        name: 'dataManage',
        meta: {
          title: '算法管理',
          svgIcon: 'earth'
        },
        children: [
          {
            path: 'faultAudit',
            component: () => import('@/views/backend/index.vue'),
            name: 'faultAudit',
            meta: {
              title: '故障审核',
              svgIcon: 'earth'
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
