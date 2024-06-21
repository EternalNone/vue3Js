import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useIconsStore } from '@/store/modules/icons'

export const loadIcons = (app) => {
  const iconsStore = useIconsStore()
  let elIcons = []
  let svgs = []
  // 注册所有element plus图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
    elIcons.push(key)
  }
  // 读取所有自定义svg图标
  const svgMoudles = import.meta.glob('@/assets/svgs/*.svg', { eager: false, import: 'default' })
  for (const path in svgMoudles) {
    const svgName = path?.split('/').pop().replace('.svg', '')
    svgs.push(svgName)
  }
  // 全局数据
  iconsStore.elIcons = elIcons
  iconsStore.svgs = svgs
}
