import './assets/main.css'

import { createApp } from 'vue'
import 'virtual:svg-icons-register'
import App from './App.vue'
import { router } from '@/router'
import '@/router/permission'
import store from '@/store'
import { loadDirectives } from '@/directives'
import SvgIcon from '@/components/SvgIcon.vue'
import '@/styles/element-plus.css'

const app = createApp(App)
loadDirectives(app)
app.use(store).use(router).component('SvgIcon', SvgIcon).mount('#app')
