import { createApp, markRaw } from 'vue'
import ComDialog from '@/components/ComDialog/index.vue'
import { loadIcons } from '@/config/loadIcons'

const mountNode = document.createElement('div')
document.body.appendChild(mountNode)

const plugin = {
  install(app) {
    let appInstance = createApp(ComDialog, { mountNode })
    let vm = appInstance.mount(mountNode)
    loadIcons(appInstance)
    app.config.globalProperties.$dialog = {
      show(component, diaProps = {}, comProps = {}, cb = null) {
        vm.show(markRaw(component), diaProps, comProps, cb)
      }
    }
    // 热更新后重新加载弹框组件
    if (import.meta.hot) {
      import.meta.hot.accept(() => {
        appInstance.unmount()
        appInstance = createApp(markRaw(ComDialog), { mountNode })
        vm = appInstance.mount(mountNode)
      })
    }
  }
}

export default plugin
