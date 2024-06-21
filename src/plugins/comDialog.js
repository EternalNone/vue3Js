import { createApp, markRaw } from 'vue'
import ComDialog from '@/components/ComDialog/index.vue'
import { loadIcons } from '@/config/loadIcons'

const mountNode = document.createElement('div')
document.body.appendChild(mountNode)

const plugin = {
  install(app) {
    const appInstance = createApp(ComDialog, { mountNode })
    const vm = appInstance.mount(mountNode)
    loadIcons(appInstance)
    app.config.globalProperties.$dialog = {
      show(component, diaProps = {}, comProps = {}, cb = null) {
        vm.show(markRaw(component), diaProps, comProps, cb)
      }
    }
  }
}

export default plugin
