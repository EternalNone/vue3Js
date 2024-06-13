<script setup name="CheckData">
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import {
  getCheckDataPicList,
  getPassageway,
  faultReviewExport,
  getCheckDataStatics
} from '@/api/checkData'
import { useGlobalStore } from '@/store/modules/global'
import { download } from '@/utils/file.js'
import PassTrainFilter from '@/components/PassTrainFilter.vue'
import TrainCarriage from '@/components/TrainCarriage.vue'
import PassagewaySelect from '@/components/PassagewaySelect.vue'
import JsFilter from '@/components/JsFilter.vue'
import FaultsList from '@/components/FaultsList.vue'
import KsRender from './KsRender.vue'
import JsRender from './JsRender.vue'

const globalStore = useGlobalStore()
const { moduleType } = storeToRefs(globalStore)

const faultListRef = ref(null)
const state = reactive({
  searchForm: {
    isFault: false, // 精扫列表是否只看异常图
    fullCarNo: '', // 完整车号
    code: '' // 通道号
  },
  trainInfo: {}, // 过车信息
  warningInfo: {}, // 报警信息
  passagewayList: [], // 通道列表
  trainCarList: [], // 车厢列表
  loading: false, // 加载状态
  showType: 'VERTICAL', // 布局方式，横向、纵向、网格
  list: [], // 图片及故障列表
  reverse: false
})
const {
  searchForm,
  trainInfo,
  warningInfo,
  passagewayList,
  loading,
  showType,
  list,
  trainCarList,
  reverse
} = toRefs(state)
const isVertical = computed(() => showType.value === 'VERTICAL')
const checkDuration = computed(() => {
  if (trainInfo.value?.checkStartDate && trainInfo.value?.checkEndDate) {
    const diffMin = dayjs(trainInfo.value?.checkEndDate).diff(
      dayjs(trainInfo.value?.checkStartDate),
      'minute'
    )
    return diffMin ? `${diffMin}min` : '--'
  }
  return '--'
})

watch(moduleType, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    getPassWayList()
  }
})
watch(showType, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    list.value = []
  }
})
onMounted(() => {
  getPassWayList()
})
// 获取编组类型
const getType = (columnPosition, carNo) => {
  if (!columnPosition) {
    return '--'
  } else {
    switch (columnPosition) {
      case '3':
        return '重连'
      case '0':
        if (carNo.includes('+')) {
          return '重连'
        } else {
          return '长编'
        }
      default:
        return '短编'
    }
  }
}
// 获取当前选中的过车信息
const getPassTrainData = (train) => {
  trainInfo.value = train
  if (train.trainNo) {
    getStatics()
  } else {
    list.value = []
  }
}
// 获取通道接口
const getPassWayList = () => {
  getPassageway({ moduleType: moduleType.value }).then((res) => {
    const data = res?.data || []
    passagewayList.value = data
    searchForm.value.code = data?.length ? data[0].code : ''
    showType.value = data?.length ? data[0].showType : ''
  })
}
// 选择通道，切换页面布局
const changePassageway = (val) => {
  const curOps = passagewayList.value?.find((item) => item.code === val)
  showType.value = curOps?.showType || 'VERTICAL'
  getData()
}
// 获取检测数据
const getData = () => {
  const { trainNo } = trainInfo.value
  const { code, fullCarNo, isFault } = searchForm.value
  loading.value = true
  getCheckDataPicList({
    trainNo,
    fullCarNo,
    code,
    isFault: showType.value === 'GRID' ? (isFault ? 1 : 0) : undefined
  })
    .then((res) => {
      list.value = res?.data || []
    })
    .finally(() => {
      loading.value = false
    })
}

// 获取故障统计数据及车厢信息
const getStatics = () => {
  const { trainNo } = trainInfo.value
  if (!trainNo) {
    return
  }
  getCheckDataStatics({ moduleType: moduleType.value, trainNo }).then((res) => {
    const data = res?.data?.faultStat
    const list = data?.faultPerCars || []
    // 检测数据页面没有全部选项，默认选中第一个车厢
    searchForm.value.fullCarNo = list[0]?.fullCarNo || ''
    warningInfo.value = data || {}
    trainCarList.value = list
    getData()
  })
}
// 选择车厢
const selectCarriage = (val) => {
  searchForm.value.fullCarNo = val
  getData()
}

// 故障列表
const showFaultList = () => {
  faultListRef.value?.show(trainInfo.value?.trainNo)
}
// 导出故障复核单
const exportFault = () => {
  if (!trainInfo.value?.trainNo) {
    return
  }
  faultReviewExport(trainInfo.value.trainNo).then((res) => {
    const filename = window.decodeURI(res.headers['content-disposition'].split("''")[1])
    download(res.data, filename, 'application/msword')
    ElMessage({
      message: '导出成功',
      type: 'success'
    })
  })
}
provide('refresh', getStatics)
</script>

<template>
  <div class="checkData">
    <PassTrainFilter showCheckType @getPassTrainData="getPassTrainData" />
    <div class="check-data-main" v-loading="loading" element-loading-background="transparent">
      <div class="filter-wrap">
        <div class="info-warp">
          <div class="train-info">
            <div>
              <span>检测状态：</span>
              <span
                :style="{
                  color:
                    moduleType === 'OUTSIDE' || trainInfo.checkEndDate
                      ? 'var(--el-color-success)'
                      : 'var(--el-color-danger)'
                }"
              >
                {{ moduleType === 'OUTSIDE' || trainInfo.checkEndDate ? '已完成' : '未完成' }}
              </span>
            </div>
            <div v-if="trainInfo.columnPosition === '1' || trainInfo.columnPosition === '2'">
              <span>列位：</span>
              <span>{{ trainInfo.columnPosition || '--' }}</span>
            </div>
            <div v-show="moduleType === 'INSIDE'">
              <span>端位：</span>
              <span>{{ `0${trainInfo.endPosition ?? 0}` }}</span>
            </div>
            <div>
              <span>编组类型：</span>
              <span>
                {{ getType(trainInfo.columnPosition, trainInfo.carNo) }}
              </span>
            </div>
            <div v-show="moduleType === 'INSIDE'">
              <span>检测时长：</span>
              <span>{{ checkDuration }}</span>
            </div>
            <div>
              <span>故障数：</span>
              <span style="color: var(--el-color-danger)">
                {{ warningInfo.totalFaultCount ?? '--' }}
              </span>
            </div>
          </div>
          <div class="actions">
            <div v-show="showType === 'GRID'">
              <span style="padding: 0 10px; font-size: 14px">只看异常图</span>
              <el-switch v-model="searchForm.isFault" @change="getData" />
            </div>
            <PassagewaySelect
              v-model="searchForm.code"
              :list="passagewayList"
              style="width: 100px"
              @change="changePassageway"
            />
            <el-button type="primary" @click="exportFault">故障复核单</el-button>
            <el-button type="primary" @click="showFaultList">故障列表</el-button>
          </div>
        </div>
        <div class="train-carriage-wrap">
          <TrainCarriage
            :list="trainCarList"
            v-model="searchForm.fullCarNo"
            :showAll="false"
            showSatus
            @change="selectCarriage"
          />
        </div>
      </div>
      <div class="check-data-render">
        <template v-if="list.length > 0">
          <div class="js-content" v-if="showType === 'GRID'">
            <JsFilter />
            <JsRender :list="list" hasEditRight />
          </div>
          <KsRender v-else :list="list" :isVertical="isVertical" :reverse="reverse" hasEditRight />
        </template>
        <el-empty v-else description="暂无数据" style="height: 100%" />
      </div>
    </div>
    <FaultsList ref="faultListRef" hasEditRight />
  </div>
</template>

<style lang="scss" scoped>
.checkData {
  width: 100%;
  height: 100%;
  overflow: hidden;
  @include flex;
  .check-data-main {
    flex: 1;
    height: 100%;
    overflow: hidden;
    @include flex($dir: column, $al: stretch);
    .filter-wrap {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 4px;
      padding: 10px 0;
      color: #fff;
      .info-warp {
        padding: 0 20px;
        @include flex($jc: flex-start);
        .train-info {
          @include flex($jc: flex-start) {
            flex-wrap: nowrap;
            gap: 8px;
          }
          > div {
            white-space: nowrap;
            overflow: hidden;
            line-height: 30px;
            font-size: 14px;
          }
        }
        .actions {
          margin-left: auto;
          @include flex($jc: flex-end) {
            gap: 8px;
          }
          .el-button + .el-button {
            margin-left: 0;
          }
        }
        .status {
          @include flex($jc: flex-end);
          font-size: 14px;
          .point {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
          }
        }
      }
      .train-carriage-wrap {
        padding: 10px 20px;
      }
    }

    .check-data-render {
      width: 100%;
      flex: 1;
      overflow: hidden;
      .js-content {
        width: 100%;
        height: 100%;
        padding-top: 10px;
        @include flex($jc: flex-start, $al: flex-start);
        :deep(.js-filter) {
          margin-right: 20px;
        }
      }
    }
  }
}
</style>
