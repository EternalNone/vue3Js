<script setup name="ComTable">
import { useElementSize } from '@vueuse/core'
import { useMultiSelection, useSingleSelection, usePagination } from './hooks'
import '@/components/types'
import ComTableFilter from './ComTableFilter.vue'

const comTableRef = ref(null)
const filterActRef = ref(null)
const props = defineProps({
  /**
   * @type {Column[]}
   */
  columns: {
    type: Array,
    required: true
  },
  /**
   * @type {Options}
   */
  options: {
    type: Object,
    default: () => ({})
  }
})
const { columns, options } = toRefs(props)
const state = reactive({
  loading: false,
  queryData: { ...options.value.initQuery },
  tableData: []
})
const { loading, tableData, queryData } = toRefs(state)
const _ops = computed(() => {
  return Object.assign(
    {
      rowKey: 'id',
      size: 'default',
      stripe: true,
      border: true,
      showHeader: true,
      showPagination: true,
      tableLayout: 'fixed'
    },
    options.value
  )
})
const { height } = useElementSize(filterActRef)
const { rowSelections, selectionChange } = useMultiSelection(comTableRef)
const { singleSelectionKey, singleSelect } = useSingleSelection(_ops.value.rowKey)
const { page, pageSize, total, pagiChange, totalChange } = usePagination()

// 表格高度
const tableH = computed(() => {
  const h = _ops.value.showPagination ? height.value + 60 : height.value + 10
  return `calc(100% - ${h}px)`
})
// 展示的列
const showColumns = computed(() => {
  return columns.value.filter((col) => !col.hideInTable)
})
// 搜索的列
const searchColumns = computed(() => {
  return columns.value.filter((col) => col.showInSearch)
})
// 自定义索引
const indexMethod = (index) => {
  const tabIndex = index + (page.value - 1) * pageSize.value + 1
  return tabIndex
}
// 单选、多选框是否禁用
const selectableFunc = (row, index) => {
  if (_ops.value?.selectableFunc) {
    return _ops.value?.selectableFunc(row, index)
  } else {
    return true
  }
}
// 获取列表数据
const getData = async () => {
  if (!_ops.value.qFunc || typeof _ops.value.qFunc !== 'function') {
    throw new Error('请传入列表查询的方法！')
  }
  const postData = {
    ...queryData.value
  }
  if (_ops.value.showPagination) {
    postData.page = page.value
    postData.pageSize = pageSize.value
  }
  loading.value = true
  const res = await _ops.value.qFunc(postData).finally(() => {
    loading.value = false
  })
  tableData.value = res?.data?.records || []
  totalChange(res?.data?.total || 0)
}
// 分页切换
const paginationChange = (curPage, curSzie) => {
  pagiChange(curPage, curSzie)
  getData()
}
// 刷新列表数据
const refresh = () => {
  pagiChange(1, pageSize.value)
  getData()
}
// 重置列表数据
const reset = () => {
  queryData.value = { ..._ops.value.initQuery }
  refresh()
}
onMounted(() => {
  getData()
})
defineExpose({
  rowSelections: readonly(rowSelections),
  singleSelectionKey: readonly(singleSelectionKey),
  refresh,
  tableData: readonly(tableData)
})
</script>

<template>
  <div class="com-table" v-loading="loading" element-loading-background="transparent">
    <div ref="filterActRef">
      <!-- 筛选功能 -->
      <ComTableFilter
        v-model="queryData"
        :search-columns="searchColumns"
        @refresh="refresh"
        @reset="reset"
      />
      <!-- 工具栏 -->
      <div class="tools-bar">
        <slot name="tools"></slot>
      </div>
    </div>
    <div class="com-table-inner">
      <!-- 表格 -->
      <ElTable
        ref="comTableRef"
        v-bind="_ops"
        :data="tableData"
        height="100%"
        @selection-change="selectionChange"
        @row-click="singleSelect"
      >
        <!---复选框(START)-->
        <ElTableColumn
          v-if="_ops.selectionType === 'multiple'"
          type="selection"
          align="center"
          fixed="left"
          :selectable="selectableFunc"
          :width="45"
        />
        <!---复选框(END)-->
        <!---单选框(START)-->
        <ElTableColumn
          v-if="_ops.selectionType === 'single'"
          align="center"
          fixed="left"
          :width="45"
        >
          <template #default="scope">
            <el-radio
              class="el-table-single-select"
              v-model="singleSelectionKey"
              :disabled="selectableFunc"
              :label="scope.row[_ops.rowKey]"
            />
          </template>
        </ElTableColumn>
        <!---单选框(END)-->
        <!---展开行(START)-->
        <ElTableColumn v-if="_ops.showExpand" align="center" type="expand" fixed="left" :width="50">
          <template #default="scope">
            <slot name="expand" :row="scope.row" :index="scope.$index" />
          </template>
        </ElTableColumn>
        <!---展开行(END)-->
        <!---索引(START)-->
        <ElTableColumn
          v-if="_ops.showIndex"
          align="center"
          label="序号"
          type="index"
          :index="indexMethod"
          :width="80"
          fixed="left"
        />
        <!---索引(END)-->
        <template v-for="col in showColumns" :key="col.prop">
          <!-- 多级表头 (START) -->
          <ElTableColumn
            v-if="col?.childColumn?.length"
            v-bind="col"
            :headerAlign="col.headerAlign || 'center'"
            :align="col.align || 'center'"
            :show-overflow-tooltip="col.ellipsis ?? true"
          >
            <ElTableColumn
              v-for="chid in col.childColumn"
              :key="chid.prop"
              v-bind="chid"
              :headerAlign="col.headerAlign || 'center'"
              :align="col.align || 'center'"
              :show-overflow-tooltip="col.ellipsis ?? true"
            >
              <template #default="scope">
                <!-- 自定义slot (START) -->
                <template v-if="chid.slot">
                  <slot
                    :name="chid.slot"
                    :row="scope.row"
                    :column="scope.column"
                    :index="scope.$index"
                  />
                </template>

                <!-- 自定义slot (END) -->
                <!-- 默认渲染列 (START) -->
                <template v-else>
                  {{ scope.row[chid.prop] }}
                </template>
                <!-- 默认渲染列 (END) -->
              </template>
            </ElTableColumn>
          </ElTableColumn>
          <!-- 多级表头 (END) -->
          <ElTableColumn
            v-else
            v-bind="col"
            :headerAlign="col.headerAlign || 'center'"
            :align="col.align || 'center'"
            :show-overflow-tooltip="col.ellipsis ?? true"
          >
            <template #header="scope">
              <template v-if="col.headerSlot">
                <slot :name="col.headerSlot" :column="scope.column" :index="scope.$index" />
              </template>
              <template v-else>
                {{ col.label }}
              </template>
            </template>
            <template #default="scope">
              <!-- 自定义slot (START) -->
              <template v-if="col.slot">
                <slot
                  :name="col.slot"
                  :scope="scope"
                  :row="scope.row"
                  :column="scope.column"
                  :index="scope.$index"
                />
              </template>

              <!-- 自定义slot (END) -->
              <!-- 默认渲染列 (START) -->
              <template v-else>
                {{ scope.row[col.prop] }}
              </template>
              <!-- 默认渲染列 (END) -->
            </template>
          </ElTableColumn>
        </template>
      </ElTable>
    </div>

    <!-- 分页 -->
    <el-pagination
      v-if="_ops.showPagination"
      background
      layout="total, prev, pager, next, sizes"
      :total="total"
      :current-page="page"
      :page-size="pageSize"
      @size-change="(val) => paginationChange(page, val)"
      @current-change="(val) => paginationChange(val, pageSize)"
    />
  </div>
</template>

<style lang="scss" scoped>
.com-table {
  width: 100%;
  height: 100%;
  .tools-bar {
    margin-bottom: 10px;
    @include flex($jc: flex-start) {
      gap: 10px;
    }
    :deep(.el-button) {
      & + .el-button {
        margin-left: 0;
      }
    }
  }
  .com-table-inner {
    width: 100%;
    height: v-bind(tableH);
    :deep(.el-table) {
      width: 100%;
    }
  }
  :deep(.el-pagination) {
    @include flex($jc: flex-end);
    margin-top: 10px;
    .el-select {
      width: 100px;
    }
  }
}
</style>
../types
