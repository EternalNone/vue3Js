<script setup name="StatisticsTable">
const columns = [
  {
    label: '车号',
    prop: 'carNo',
    align: 'center',
    width: 100
  },
  {
    label: '架位',
    prop: 'frame',
    align: 'center',
    width: 80
  },
  {
    label: '轴位',
    prop: 'axle',
    align: 'center',
    width: 80
  },
  {
    label: '测量部位',
    prop: 'position',
    align: 'center',
    width: 150,
    ellipsis: true
  },
  {
    label: '测量值（mm）',
    prop: 'checkValue',
    align: 'center',
    width: 150,
    slot: 'checkValue'
  },
  {
    label: '图片',
    prop: 'picView',
    align: 'center',
    width: 100,
    slot: 'picView'
  }
]
const props = defineProps({
  type: {
    type: String,
    required: true
  },
  tableData: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})
const showColumns = computed(() => {
  // 碳滑板场景不显示架位和轴位
  if (props.type === 'CARBON_CONTACT_STRIP') {
    return columns.filter((item) => item.prop !== 'frame' && item.prop !== 'axle')
  } else {
    return columns
  }
})
</script>

<template>
  <div class="table-wrap">
    <el-table :data="tableData" stripe :border="true" v-loading="loading" height="100%">
      <el-table-column
        v-for="item in showColumns"
        :key="item.prop"
        :prop="item.prop"
        :type="item.type || 'default'"
        :label="item.label"
        :min-width="item.width"
        :fixed="item.fixed"
        :align="item.align"
        :show-overflow-tooltip="item.ellipsis"
      >
        <template #default="{ row }">
          <template v-if="item.slot">
            <span
              v-if="item.slot === 'checkValue'"
              :class="{
                'check-val': true,
                error: Number(row.checkValue) <= Number(row.warnValue),
                warn:
                  Number(row.checkValue) > Number(row.warnValue) &&
                  Number(row.checkValue) <= Number(row.warnValue) + 2
              }"
            >
              {{ row[item.prop] }}
            </span>
            <el-button v-else-if="item.slot === 'picView'" type="primary" link> 查看 </el-button>
          </template>
          <template v-else>
            {{ row[item.prop] }}
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
.table-wrap {
  width: 100%;
  height: calc(100% - 122px);
  .el-table {
    width: 100%;
    .check-val {
      color: var(--el-color-success);
      &.warn {
        color: var(--el-color-warning);
      }
      &.error {
        color: var(--el-color-danger);
      }
    }
  }
}
</style>
