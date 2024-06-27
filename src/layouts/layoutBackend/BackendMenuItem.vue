<script setup>
import { useAppStore } from '@/store/modules/app'
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
// 当前菜单是否不展示，hudden为true或者有子菜单但是子菜单都不可见时，当前菜单不展示
const isItemHidden = computed(() => {
  const allChildren = props.menu.children
  const showChildren = allChildren?.filter((child) => !child.meta?.hidden) ?? []
  return props.menu.meta.hidden || (allChildren?.length > 0 && showChildren.length === 0)
})
// 是否展示子菜单,当前菜单可见，并且有可见的子菜单时才展示子菜单
const showSubMenu = computed(() => {
  const showChildren = props.menu.children?.filter((child) => !child.meta?.hidden) ?? []
  return !props.menu.meta.hidden && showChildren.length > 0
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
  <el-sub-menu v-if="showSubMenu" :index="resolvePath(menu.path)">
    <template #title>
      <SvgIcon :name="menu.meta.icon" :size="20" />
      <span class="menu-title-wrap">{{ menu.meta.title }}</span>
    </template>
    <BackendMenuItem
      v-for="subMenu in menu.children"
      :key="subMenu.path"
      :menu="subMenu"
      :basePath="resolvePath(subMenu.path)"
    />
  </el-sub-menu>
  <el-menu-item v-else-if="!isItemHidden" :index="basePath">
    <el-tooltip
      v-if="menu.meta.icon"
      :disabled="!isCollapse"
      effect="light"
      :content="isCollapse ? menu.meta.title : null"
      placement="right"
    >
      <SvgIcon :name="menu.meta.icon" :size="20" />
    </el-tooltip>
    <span class="menu-title-wrap">{{ menu.meta.title }}</span>
  </el-menu-item>
</template>
<style lang="scss" scoped>
.el-menu-item,
.el-sub-menu__title {
  .svg-icon {
    color: var(--el-menu-text-color);
  }
  &.is-active {
    .svg-icon {
      color: var(--el-menu-active-color);
    }
  }
}
.el-menu--collapse {
  .el-sub-menu {
    &.is-active {
      .svg-icon {
        color: var(--el-menu-active-color);
      }
    }
  }
}
</style>
