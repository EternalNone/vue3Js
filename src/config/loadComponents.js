import { defineAsyncComponent } from 'vue'
export const loadComponents = (app) => {
  // 注册全局组件
  const SvgIcon = defineAsyncComponent(() => import('@/components/SvgIcon.vue'))
  const ComTable = defineAsyncComponent(() => import('@/components/ComTable/index.vue'))
  app.component('SvgIcon', SvgIcon).component('ComTable', ComTable)
}
