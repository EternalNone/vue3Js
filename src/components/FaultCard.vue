<script setup name="FaultCard">
defineProps({
  fault: {
    type: Object,
    default: () => ({})
  },
  index: {
    type: Number,
    default: 0
  },
  selected: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <el-card :class="selected ? 'fault-card selected' : 'fault-card'">
    <div class="card-left">
      <div class="index">{{ index }}</div>
      <el-tag
        class="status"
        :type="fault?.affirm === '0' ? 'primary' : fault?.affirm === '1' ? 'danger' : 'warning'"
        effect="dark"
        round
      >
        {{ fault?.affirm === '0' ? '待复核' : fault?.affirm === '1' ? '正报' : '误报' }}
      </el-tag>
    </div>
    <div class="card-right">
      <el-descriptions title="" :column="1">
        <el-descriptions-item>
          <template #label>
            <el-tag type="primary">故障类型</el-tag>
          </template>
          {{ fault?.type || '' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <el-tag type="primary">故障部位</el-tag>
          </template>
          {{ fault?.checkItem || '' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <el-tag type="primary">故障描述</el-tag>
          </template>
          {{ fault?.faultDesc || '' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div v-if="$slots.actions" class="actions">
      <slot name="actions"></slot>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.fault-card {
  width: 100%;
  :deep(.el-card__body) {
    padding: 10px;
    @include flex($jc: flex-start);
    .card-left {
      width: 80px;
      @include flex($dir: column);
      border-right: var(--el-border);
      .index {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 10px;
        color: var(--el-color-primary);
      }
    }
    .card-right {
      flex: 1;
      padding: 0 10px;
      .el-descriptions {
        .el-descriptions__table {
          tr {
            td {
              padding-bottom: 5px;
              .el-descriptions__label {
                margin-right: 5px;
              }
            }
            &:last-child td {
              padding-bottom: 0;
            }
          }
        }
      }
    }
    .actions {
      width: 100px;
      height: 100%;
      padding: 0 10px;
      flex-shrink: 0;
    }
  }
  &.selected {
    border-color: var(--el-color-primary);
  }
}
</style>
