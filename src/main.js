import { createApp } from 'vue'
import 'virtual:svg-icons-register'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import { router } from '@/router'
import '@/router/permission'
import store from '@/store'
import { loadDirectives } from '@/directives'
import SvgIcon from '@/components/SvgIcon.vue'
import '@/assets/styles/index.css'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css' // 右键菜单样式

let elIcons = []
const app = createApp(App)
loadDirectives(app) // 加载指令
// 注册所有element plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
  elIcons.push(key)
}
app.config.globalProperties.$elIcons = elIcons
// 注册全局组件
app
  .component('SvgIcon', SvgIcon)
  .component('ComTable', () => import('@/components/ComTable/index.vue'))
// 使用pina、router等库
app.use(store).use(router)
app.mount('#app')
