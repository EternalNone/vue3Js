<script setup>
import { useAppStore } from '@/stores/app'
const props = defineProps({
  menu: {
    type: Object,
    default: () => {}
  },
  basePath: {
    type: String,
    default: ''
  }
})
const appStore = useAppStore()
const { isCollapse } = storeToRefs(appStore)

/** 显示的子菜单 */
const showingChildren = computed(() => {
  return props.menu.children?.filter((child) => !child.meta?.hidden) ?? []
})
/** 唯一的子菜单项 */
const theOnlyOneChild = computed(() => {
  const number = showingChildren.value.length
  switch (true) {
    case number > 1:
      return null
    case number === 1:
      return showingChildren.value[0]
    default:
      return { ...props.item, path: '' }
  }
})
/** 解析路径 */
const resolvePath = (routePath) => {
  if (props.basePath.includes(routePath)) {
    return props.basePath
  }
  return `${props.basePath}/${routePath}`
}
</script>

<template>
  <el-menu-item v-if="theOnlyOneChild && !theOnlyOneChild.children" :index="basePath">
    <el-tooltip v-if="menu.meta.svgIcon" effect="dark" :content="isCollapse ? menu.meta.title : null" placement="right">
      <SvgIcon :name="menu.meta.svgIcon" :size="20" />
    </el-tooltip>
    <span class="menu-title-wrap">{{ menu.meta.title }}</span>
  </el-menu-item>
  <el-sub-menu v-else :index="resolvePath(menu.path)">
    <template #title>
      <SvgIcon v-if="menu.meta.svgIcon" :name="menu.meta.svgIcon" :size="20" />
      <span class="menu-title-wrap">{{ menu.meta.title }}</span>
    </template>
    <BackendMenuItem
      v-for="subMenu in menu.children"
      :key="subMenu.path"
      :menu="subMenu"
      :basePath="resolvePath(subMenu.path)"
    />
  </el-sub-menu>
</template>
<style lang="scss" scoped></style>
