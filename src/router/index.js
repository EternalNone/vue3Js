import { createRouter, createWebHistory } from 'vue-router'

const Layouts = () => import('@/layouts/LayoutIndex.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layouts,
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
    },
    {
      path: '/backend',
      component: () => import('@/views/backend/index.vue'),
      name: 'backend',
      meta: {
        title: '后台管理',
        svgIcon: 'earth'
      }
    },
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
})

export default router
