<script setup>
import { ElMessageBox } from 'element-plus'
import { useFullscreen, useNow, useDateFormat } from '@vueuse/core'
import { useUserStore } from '@/store/modules/user'
import TextAvartar from '@/components/TextAvartar.vue'

const formattedTime = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss')
const { isFullscreen, toggle } = useFullscreen()
const router = useRouter()
const userStore = useUserStore()

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
    <TextAvartar />
    <div v-if="$route.path.includes('backend')" class="tool-item" @click="$router.push('/')">
      <el-tooltip effect="dark" content="返回驾驶舱" placement="bottom">
        <SvgIcon name="back" />
      </el-tooltip>
    </div>
    <div class="tool-item" @click="toggle">
      <el-tooltip effect="dark" :content="isFullscreen ? '退出全屏' : '全屏'" placement="bottom">
        <SvgIcon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" />
      </el-tooltip>
    </div>
    <div class="tool-item" @click="logout">
      <el-tooltip effect="dark" content="退出登录" placement="bottom">
        <SvgIcon name="logout" />
      </el-tooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header-tools-bar {
  @include flex($jc: flex-end, $al: center) {
    flex-wrap: wrap;
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
  }
}
</style>
