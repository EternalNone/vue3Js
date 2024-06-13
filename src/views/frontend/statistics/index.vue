<script setup name="Statistics">
import dayjs from 'dayjs'
import PassTrainFilter from '@/components/PassTrainFilter.vue'
import TrainCarriage from '@/components/TrainCarriage.vue'
import PassagewaySelect from '@/components/PassagewaySelect.vue'
import { useGlobalStore } from '@/store/modules/global'
import { getWarnStatics, getTableList } from '@/api/statistics'
import StatisticsTable from './comp/StatisticsTable.vue'

const checkTypeOps = [
  {
    name: '闸片',
    code: 'BRAKE_PAD'
  },
  {
    name: '撒砂管',
    code: 'SAND_PIPE'
  },
  {
    name: '排障器',
    code: 'COWCATCHER'
  },
  {
    name: '碳滑板',
    code: 'CARBON_CONTACT_STRIP'
  }
]
const state = reactive({
  trainInfo: {},
  searchForm: {
    type: 'BRAKE_PAD',
    carriageNo: ''
  },
  trainCarList: [], // 车厢列表
  totalFaultCount: '',
  warningInfo: {},
  loading: false,
  tableData: []
})
const { trainInfo, searchForm, trainCarList, totalFaultCount, warningInfo, tableData, loading } =
  toRefs(state)
const globalStore = useGlobalStore()
const { moduleType } = storeToRefs(globalStore)
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
// 获取顶部统计数据
const getStatics = async () => {
  const { trainNo } = trainInfo.value
  const { type } = searchForm.value
  if (!trainNo) {
    return
  }
  const res = await getWarnStatics({ type, trainNo })
  warningInfo.value = res?.data?.warningStat || {}
  totalFaultCount.value = res?.data?.faultStat?.totalFaultCount ?? '--'
  trainCarList.value = res?.data?.faultStat?.faultPerCars || []
}
// 获取表格数据
const getData = () => {
  const { carNo, trainNo } = trainInfo.value
  if (!trainNo) {
    return
  }

  const params = {
    ...searchForm.value,
    carNo,
    trainNo,
    page: 1,
    pageSize: 500
  }
  loading.value = true
  getTableList(params)
    .then((res) => {
      tableData.value = res?.data?.records || []
    })
    .finally(() => {
      loading.value = false
    })
}
// 获取当前选中的过车信息
const getPassTrainData = (train) => {
  trainInfo.value = train
  getStatics()
  getData()
}
// 选择通道，切换页面布局
const changePassageway = () => {
  getStatics()
  getData()
}
// 选择车厢
const selectCarriage = (val) => {
  searchForm.value.fullCarNo = val
  getData()
}
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
</script>
<template>
  <div class="statistics">
    <PassTrainFilter @getPassTrainData="getPassTrainData" />
    <div class="statistics-content">
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
                {{ totalFaultCount ?? '--' }}
              </span>
            </div>
          </div>

          <div class="actions">
            <PassagewaySelect
              v-model="searchForm.type"
              :list="checkTypeOps"
              @change="changePassageway"
            />
            <div class="status">
              <div class="tip">
                <i class="point" style="background: var(--el-color-danger)" />
                <span> 报警（{{ warningInfo.warningCount ?? 0 }}） </span>
              </div>
              <div class="tip">
                <i class="point" style="background: var(--el-color-warning)" />
                <span> 预警（{{ warningInfo.earlyWarningCount ?? 0 }}） </span>
              </div>
              <div class="tip">
                <i class="point" style="background: var(--el-color-success)" />
                <span> 正常（{{ warningInfo.normalCount ?? 0 }}） </span>
              </div>
            </div>
            <el-button type="primary">走行公里导入</el-button>
          </div>
        </div>
        <div class="train-carriage-wrap">
          <TrainCarriage
            :list="trainCarList"
            v-model="searchForm.fullCarNo"
            showAll
            showSatus
            @change="selectCarriage"
          />
        </div>
      </div>
      <StatisticsTable :tableData="tableData" :loading="loading" :type="searchForm.type" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.statistics {
  width: 100%;
  height: 100%;
  overflow: hidden;
  @include flex;
  .statistics-content {
    flex: 1;
    height: 100%;
    overflow: hidden;
    .filter-wrap {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 4px;
      padding: 10px 0;
      color: #fff;
      .info-warp {
        padding: 0 20px;
        @include flex($jc: space-between);
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
          .passageway-select {
            :deep(.el-select) {
              width: 90px;
            }
          }
          .status {
            @include flex($jc: flex-end);
            font-size: 14px;
            > div {
              white-space: nowrap;
              .point {
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
              }
            }
          }
          .el-button + .el-button {
            margin-left: 0;
          }
        }
      }
      .train-carriage-wrap {
        padding: 10px 20px;
      }
    }
  }
}
</style>
