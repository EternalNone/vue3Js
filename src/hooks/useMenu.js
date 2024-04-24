export const useMenu = () => {
  const curMenu = ref('statistics')
  const menuList = ref([
    {
      name: 'statistics',
      type: 'area-chart',
      title: '统计分析',
      url: '/statistics'
    },

    {
      name: 'central',
      type: 'control',
      title: '集中控制',
      url: '/central'
    },
    {
      name: 'checkData',
      type: 'profile',
      title: '检测数据',
      url: '/checkData'
    },
    {
      name: 'abrasion',
      type: 'bell',
      title: '检测预警',
      url: '/abrasion'
    },
    {
      name: 'backend',
      type: 'setting',
      title: '后台管理',
      url: '/backend'
    },
  ])
  const setMenu = (key) => {
    curMenu.value = key
  }
  return { curMenu, menuList, setMenu }
}
