import './assets/main.css'

import { createApp } from 'vue'
import 'virtual:svg-icons-register'
import App from './App.vue'
import { router } from '@/router'
import store from "@/store"
import SvgIcon from '@/components/SvgIcon.vue'
import "@/styles/element-plus.css"

const app = createApp(App)

app.use(store).use(router)
app.component('SvgIcon', SvgIcon)


app.mount('#app')
