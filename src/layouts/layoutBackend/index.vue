<script setup>
import { useCssVar } from '@vueuse/core'
import { useAppStore } from '@/store/modules/app'
import AppMain from '../AppMain.vue'
import BackendMenu from './BackendMenu.vue'
import HeaderToolsBar from '../HeaderToolsBar.vue'

const elMainRef = ref(null)
const route = useRoute()
const appStore = useAppStore()
const { isCollapse } = storeToRefs(appStore)
const defaultPadding = useCssVar('--el-main-padding', elMainRef)
const elMainPadding = computed(() => {
  return route.meta?.noPadding ? '0' : defaultPadding.value
})
const matchedRoutes = computed(() => {
  return route.matched.filter((item) => item.meta?.title) || []
})
</script>

<template>
  <div class="layout-backend">
    <el-container>
      <el-header>
        <div class="header-left">
          <img
            class="logo"
            src="@/assets/images/logo.png"
            alt="logo"
            width="150"
            @click="$router.push('/')"
          />
        </div>
        <div class="header-right">
          <div class="breadcrumb-wrap">
            <div class="side-toggle-btn" @click="appStore.toggleSideBar">
              <SvgIcon :name="isCollapse ? 'Expand' : 'Fold'" color="#fff" :size="24" />
            </div>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item
                v-for="item in matchedRoutes"
                :key="item.path"
                :to="{ path: `${item.path}` }"
              >
                {{ item.meta?.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <HeaderToolsBar />
        </div>
      </el-header>
      <el-container>
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <el-scrollbar>
            <BackendMenu />
          </el-scrollbar>
        </el-aside>
        <el-main ref="elMainRef">
          <AppMain />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.layout-backend {
  width: 100%;
  height: 100%;
  .el-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    .el-header {
      width: 100%;
      height: $el-header-height;
      background: $theme-color;
      @include flex($jc: space-between);
      user-select: none;
      .header-left {
        width: 180px;
        height: 100%;
        @include flex;
        flex-shrink: 0;
        .logo {
          cursor: pointer;
        }
      }
      .header-right {
        flex: 1;
        height: 100%;
        @include flex($jc: space-between);
        .breadcrumb-wrap {
          @include flex($jc: flex-start);
          :deep(.el-breadcrumb) {
            .el-breadcrumb__item {
              .el-breadcrumb__inner {
                color: #fff;
                &.is-link:hover {
                  color: var(--el-color-primary);
                }
              }
              .el-breadcrumb__separator {
                color: rgba(255, 255, 255, 0.7);
              }
              &:last-child {
                .el-breadcrumb__inner {
                  color: rgba(255, 255, 255, 0.7);
                  &.is-link:hover {
                    color: rgba(255, 255, 255, 0.7);
                  }
                }
              }
            }
          }
        }
        .side-toggle-btn {
          @include flex;
          cursor: pointer;
          margin-right: 10px;
        }
      }
    }
    .el-aside {
      height: 100%;
      background: $theme-color;
      transition: width 0.3s;
      .el-scrollbar {
        height: 100%;
      }
    }
    .el-main {
      padding: v-bind(elMainPadding);
    }
  }
}
</style>
