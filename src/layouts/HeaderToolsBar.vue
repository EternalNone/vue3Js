<script setup>
import { ElMessageBox } from 'element-plus'
import {
  useFullscreen,
  useNow,
  useDateFormat,
  useDark,
  watchImmediate,
  useStorage
} from '@vueuse/core'
import { useUserStore } from '@/store/modules/user'
import { STORAGE_KEY } from '@/constants/index'
import Avatar from '@/components/Avatar.vue'

const formattedTime = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss')
const { isFullscreen, toggle } = useFullscreen()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isDarkStorage = useStorage(STORAGE_KEY.IS_DARK_THEME, false)
const isDark = useDark()

// 监听localStorage变化,切换主题
watchImmediate([isDarkStorage, () => route.path], ([newVal, newPath]) => {
  if (!newPath.includes('/backend')) {
    isDark.value = false
  } else {
    isDark.value = newVal
  }
})
// 切换主题
const toggleTheme = ({ clientX, clientY }) => {
  const maxRadius = Math.hypot(
    Math.max(clientX, window.innerWidth - clientX),
    Math.max(clientY, window.innerHeight - clientY)
  )
  const style = document.documentElement.style
  style.setProperty('--theme-x', `${clientX}px`)
  style.setProperty('--theme-y', `${clientY}px`)
  style.setProperty('--theme-r', `${maxRadius}px`)
  const handler = () => {
    isDarkStorage.value = !isDarkStorage.value
  }
  document.startViewTransition ? document.startViewTransition(handler) : handler()
}
// 退出登录
const logout = () => {
  ElMessageBox.confirm('是否退出登录？', '', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
    customStyle: { width: '300px' }
  }).then(() => {
    userStore.logout()
    router.replace('/login')
  })
}
</script>

<template>
  <div class="header-tools-bar">
    <div class="tool-item tool-item-datetime">
      {{ formattedTime }}
    </div>
    <Avatar />
    <el-tooltip
      v-if="$route.path.includes('backend')"
      effect="light"
      content="返回驾驶舱"
      placement="bottom"
      :auto-close="800"
    >
      <div class="tool-item" @click="$router.push('/')">
        <SvgIcon name="backIndex" />
      </div>
    </el-tooltip>
    <el-tooltip
      v-if="$route.path.includes('backend')"
      effect="light"
      :content="isDark ? '正常模式' : '暗黑模式'"
      placement="bottom"
      :auto-close="800"
    >
      <div class="tool-item" @click="toggleTheme($event)">
        <SvgIcon :name="isDark ? 'Sunny' : 'Moon'" />
      </div>
    </el-tooltip>
    <el-tooltip
      effect="light"
      :content="isFullscreen ? '退出全屏' : '全屏'"
      placement="bottom"
      :auto-close="800"
    >
      <div class="tool-item" @click="toggle">
        <SvgIcon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" />
      </div>
    </el-tooltip>
    <el-tooltip effect="light" content="退出登录" placement="bottom" :auto-close="800">
      <div class="tool-item" @click="logout">
        <SvgIcon name="logout" />
      </div>
    </el-tooltip>
  </div>
</template>

<style lang="scss" scoped>
.header-tools-bar {
  @include flex($jc: flex-end, $al: center) {
    flex-wrap: nowrap;
  }
  .text-avartar {
    margin-right: 10px;
  }
  .tool-item {
    padding: 10px;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    &:not(.tool-item-datetime):hover {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
    .svg-icon {
      font-size: 20px;
      color: #fff;
      &:focus {
        outline: none;
      }
    }
    &.tool-item-datetime {
      font-size: 12px;
    }
  }
}
</style>
