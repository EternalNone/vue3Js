import { createApp } from 'vue'
import 'virtual:svg-icons-register'
import App from './App.vue'
import { router } from '@/router'
import '@/router/permission'
import store from '@/store'
import { loadDirectives } from '@/directives'
import { loadIcons, loadComponents } from '@/config/index'
import comDialogPlugin from '@/plugins/comDialog'
import '@/assets/styles/index.css'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css' // 右键菜单样式

const app = createApp(App)
// 使用pina、router等插件
app.use(store).use(router)
// 加载指令
loadDirectives(app)
// 加载图标
loadIcons(app)
// 注册全局组件
loadComponents(app)
// 使用自定义插件
app.use(comDialogPlugin)
app.mount('#app')
