<script setup name="FaultsList">
import { ElMessage } from 'element-plus'
import { download } from '@/utils/file.js'
import { useGlobalStore } from '@/store/modules/global'
import { getFaultsList, deleteFault, exportFaultSingle } from '@/api/checkData'
import FaultViewer from '@/components/FaultViewer.vue'

const worker = new Worker(new URL('@/worker/handleFaultList.js', import.meta.url)) // 创建Web Worker
const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL // 对应环境的图片域名及端口

const props = defineProps({
  hasEditRight: {
    type: Boolean,
    default: false
  }
})
const refresh = inject('refresh')

const columns = [
  {
    label: '过车序号',
    prop: 'lcxxBh',
    minWidth: 120,
    align: 'center'
  },
  {
    label: '车组号',
    prop: 'groupName',
    minWidth: 120,
    align: 'center'
  },
  {
    label: '车厢号',
    prop: 'lw',
    slotName: 'lw',
    minWidth: 100,
    align: 'center'
  },
  {
    label: '处理状态',
    prop: 'doFault',
    slotName: 'doFault',
    minWidth: 100,
    align: 'center'
  },
  {
    label: '故障状态',
    prop: 'faultAffirm',
    slotName: 'faultAffirm',
    minWidth: 100,
    align: 'center'
  },
  {
    label: '故障部位',
    prop: 'checkItem',
    minWidth: 250,
    align: 'center'
  },
  {
    label: '故障描述',
    prop: 'faultDescribe',
    minWidth: 150,
    align: 'center'
  },
  {
    label: '操作人',
    prop: 'doUser',
    minWidth: 100,
    align: 'center'
  },
  {
    label: '操作时间',
    prop: 'doStartTime',
    minWidth: 160,
    align: 'center'
  },
  {
    label: '复核结果',
    prop: 'doResult',
    ellipsis: true,
    minWidth: 150,
    align: 'center'
  },
  {
    label: '操作',
    prop: 'action',
    fixed: 'right',
    slotName: 'action',
    minWidth: 180,
    align: 'center'
  }
]
const state = reactive({
  visible: false,
  loading: false,
  trainNo: '',
  pagination: {
    pageNum: 1,
    pageSize: 10,
    total: 0
  },
  handledList: [] // 处理完成的列表数据
})
const { visible, trainNo, pagination, loading, handledList } = toRefs(state)
const globalStore = useGlobalStore()
const { moduleType } = storeToRefs(globalStore)
const faultViewerRef = ref(null)
const isVertical = computed(() => moduleType.value === 'INSIDE') // 拼图方式，接口里未返回，暂时先按库内竖向、库外横向处理

// 监听Web Worker消息
worker.onmessage = function (event) {
  const { processedList } = event.data
  handledList.value = processedList
}
onUnmounted(() => {
  worker.terminate()
})
// 打开弹框
const show = (trainNoStr) => {
  trainNo.value = trainNoStr
  visible.value = true
  pagination.value = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  getData()
}
// 关闭弹框
const close = () => {
  // workers?.terminate()
}
// 获取列表数据
const getData = () => {
  handledList.value = []
  if (!trainNo.value) {
    pagination.value.total = 0
    return
  }
  loading.value = true
  const { pageNum, pageSize } = pagination.value
  const param = {
    checkType: moduleType.value === 'INSIDE' ? 1 : 0, //检测类型 0:机器人检测 1:360检测
    lcxxBh: trainNo.value,
    pageNum,
    pageSize
  }

  getFaultsList(param)
    .then(async (res) => {
      pagination.value.total = res.total || 0
      if (res?.records?.length) {
        worker?.postMessage({
          list: res.records,
          imgBaseUrl,
          isVertical: isVertical.value
        })
      }
    })
    .finally(() => {
      loading.value = false
    })
}
// 查看故障
const handleView = (idx) => {
  faultViewerRef.value.show({
    idx,
    isKs: false,
    hasEditRight: props.hasEditRight
  })
}
// 删除故障
const handleDeleteFault = (row) => {
  if (!row?.id) {
    return
  }
  deleteFault(row.id).then((res) => {
    if (res.result) {
      ElMessage.success('删除成功')
      refresh()
      getData()
    } else {
      ElMessage.error(res.message)
    }
  })
}
// 导出故障复核单
const handleExport = (obj) => {
  const {
    insertTime,
    groupName,
    lw,
    checkItem,
    faultDescribe,
    affirmTime,
    faultAffirm,
    doResult,
    affirmUser,
    id,
    faultImgNum,
    lcxxBh
  } = obj
  exportFaultSingle({
    insertTime,
    groupName,
    lw,
    checkItem,
    faultDescribe,
    affirmTime,
    faultAffirm,
    doResult,
    affirmUser,
    id,
    faultImgNum
  }).then((res) => {
    const fileName = '故障复核单' + groupName + '-' + lcxxBh + '.doc'
    download(res.data, fileName, 'application/msword')
    ElMessage.success('导出成功')
  })
}
defineExpose({
  show
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="故障列表"
    width="80%"
    lock-scroll
    append-to-body
    :close-on-click-modal="false"
    style="min-width: 650px"
    @close="close"
  >
    <div class="fault-list-wrap">
      <el-table :data="handledList" stripe :border="true" v-loading="loading">
        <el-table-column
          v-for="item in columns"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :min-width="item.minWidth"
          :fixed="item.fixed"
          :align="item.align"
          :show-overflow-tooltip="item.ellipsis"
        >
          <template #default="{ row, $index }">
            <template v-if="item.slotName">
              <span v-if="item.slotName === 'lw'">
                {{ row[item.prop] < 10 ? `0${row[item.prop]}车` : `${row[item.prop]}车` }}
              </span>
              <span v-if="item.slotName === 'doFault'">
                {{ row[item.prop] === '0' ? '未处理' : '已处理' }}
              </span>
              <span v-if="item.slotName === 'faultAffirm'">
                {{ row[item.prop] === '0' ? '待复核' : row[item.prop] === '1' ? '正报' : '误报' }}
              </span>
              <template v-if="item.slotName === 'action'">
                <el-button type="primary" link size="small" @click="handleView($index)">
                  查看
                </el-button>
                <el-popconfirm
                  v-if="hasEditRight"
                  title="是否确定删除该故障?"
                  confirm-button-text="确定"
                  cancel-button-text="取消"
                  :width="200"
                  @confirm="handleDeleteFault(row)"
                >
                  <template #reference>
                    <el-button type="danger" link size="small"> 删除 </el-button>
                  </template>
                </el-popconfirm>

                <el-button type="primary" link size="small" @click="handleExport(row)">
                  导出复核单
                </el-button>
              </template>
            </template>
            <template v-else>
              {{ row[item.prop] }}
            </template>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        small
        layout="total, prev, pager, next"
        :total="pagination.total"
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        @current-change="getData"
      />
    </div>
  </el-dialog>
  <FaultViewer ref="faultViewerRef" :list="handledList" />
</template>

<style lang="scss" scoped>
.fault-list-wrap {
  width: 100%;
  height: 68vh;
  .el-table {
    width: 100%;
    height: calc(68vh - 34px);
  }
  .el-button + .el-button {
    margin-left: 8px;
  }
  .el-pagination {
    @include flex($jc: flex-end);
    margin-top: 10px;
  }
}
</style>
