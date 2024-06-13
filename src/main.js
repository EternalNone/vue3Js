
import { createApp } from 'vue'
import 'virtual:svg-icons-register'
import App from './App.vue'
import { router } from '@/router'
import '@/router/permission'
import store from '@/store'
import { loadDirectives } from '@/directives'
import SvgIcon from '@/components/SvgIcon.vue'
import '@/assets/styles/index.css'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css' // 右键菜单样式

const app = createApp(App)
loadDirectives(app) // 加载指令
app.use(store).use(router).component('SvgIcon', SvgIcon).mount('#app')
