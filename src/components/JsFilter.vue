<script setup name="JsFilter">
const activeName = ref('1')
</script>

<template>
  <div class="js-filter">
    <el-collapse v-model="activeName" accordion>
      <el-collapse-item title="故障类型" name="1">
        <div>丢失</div>
        <div>异常</div>
      </el-collapse-item>
      <el-collapse-item title="检测区域" name="2">
        <div>底板</div>
        <div>车体外墙及车门</div>
      </el-collapse-item>
      <el-collapse-item title="检测部件" name="3">
        <div>轴箱前盖</div>
        <div>橡胶弹性定位</div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style lang="scss" scoped>
.js-filter {
  width: 200px;
  height: 100%;
  padding: 10px;
  flex-shrink: 0;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  @include scrollBar;
  :deep(.el-collapse) {
    --el-collapse-header-bg-color: rgba(255, 255, 255, 0.2);
    --el-collapse-content-bg-color: transparent;
    --el-collapse-border-color: transparent;
    --el-collapse-content-text-color: #fff;
    --el-collapse-header-text-color: #fff;
    --el-collapse-header-height: 36px;
    border-bottom: none;
    border-top: none;
    .el-collapse-item {
      margin-bottom: 10px;
      .el-collapse-item__header {
        padding: 0 10px;
        border-radius: 4px;
      }
      .el-collapse-item__content {
        padding-bottom: 0;
        > div {
          line-height: 20px;
          padding: 8px 10px;
          margin: 5px 0;
          white-space: normal;
          cursor: pointer;
          border-radius: 4px;
          &:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        }
      }
      &.is-active {
        .el-collapse-item__header {
          background: var(--el-color-primary);
          color: #fff;
        }
      }
    }
  }
}
</style>
