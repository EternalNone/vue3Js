<script setup name="Central">
import { useWebSocket } from '@vueuse/core'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTrainTrackApi, checkout } from '@/api/central.js'
import { ROBOT_STATUS_LIST } from '@/constants/index'
import TrackItem from './comp/TrackItem.vue'
import CheckInModal from './comp/CheckInModal.vue'
import Monitor from './comp/Monitor.vue'
import CheckPwd from './comp/CheckPwd.vue'

const wsBaseUrl = import.meta.env.VITE_WEBSOCKET_BASE_URL // 对应环境的websocket地址
const monitorRef = ref(null)
const checkPwdRef = ref(null)

const state = reactive({
  trackList: [
    {
      track: 'D50',
      trainType: 'LONG',
      trainInfo: {
        checkNo: null,
        direction: 'ONE',
        faults: [],
        garage: 'B',
        marshallingType: 'LONG',
        parking: 0,
        track: 'D50',
        trainId: '1776792784028409857',
        trainNo: '1070',
        type: 'CRH1E',
        validCodeOne: '',
        validCodeTwo: ''
      },
      trainInfoOne: null,
      trainInfoTwo: null,
      hasTrain: true
    },
    {
      track: 'D51',
      trainType: 'SHORT',
      trainInfo: null,
      trainInfoOne: {
        checkNo: null,
        direction: 'ONE',
        faults: [],
        garage: 'B',
        marshallingType: 'SHORT',
        parking: 1,
        track: 'D51',
        trainId: '1776792784028409857',
        trainNo: '1070',
        type: 'CRH1E',
        validCodeOne: '',
        validCodeTwo: ''
      },
      trainInfoTwo: {
        checkNo: null,
        direction: 'ONE',
        faults: [],
        garage: 'B',
        marshallingType: 'SHORT',
        parking: 2,
        track: 'D51',
        trainId: '1776792784028409857',
        trainNo: '1071',
        type: 'CRH1E',
        validCodeOne: '',
        validCodeTwo: ''
      },
      hasTrain: false
    },
    {
      track: 'D52',
      trainType: 'RECONNECT',
      trainInfo: {
        checkNo: null,
        direction: 'TWO',
        faults: [],
        garage: 'B',
        marshallingType: 'RECONNECT',
        parking: 0,
        track: 'D52',
        trainId: '1776792784028409857',
        trainNo: '1813+1234',
        type: 'CRH380D',
        validCodeOne: '',
        validCodeTwo: ''
      },
      trainInfoOne: null,
      trainInfoTwo: null,
      hasTrain: true
    },
    {
      track: 'D53',
      trainType: 'SHORT',
      trainInfo: null,
      trainInfoOne: null,
      trainInfoTwo: {
        checkNo: null,
        direction: 'ONE',
        faults: [
          {
            carNo: '1',
            count: {
              top: 1,
              bottom: 1
            }
          },
          {
            carNo: '2',
            count: {
              top: 2,
              bottom: 0
            }
          },
          {
            carNo: '3',
            count: {
              top: 0,
              bottom: 3
            }
          },
          {
            carNo: '4',
            count: {
              top: 0,
              bottom: 0
            }
          },
          {
            carNo: '5',
            count: {
              top: 0,
              bottom: 0
            }
          },
          {
            carNo: '6',
            count: {
              top: 0,
              bottom: 0
            }
          },
          {
            carNo: '7',
            count: {
              top: 0,
              bottom: 0
            }
          },
          {
            carNo: '8',
            count: {
              top: 0,
              bottom: 0
            }
          }
        ],
        garage: 'B',
        marshallingType: 'SHORT',
        parking: 2,
        track: 'D53',
        trainId: '1776792784028409857',
        trainNo: '1070',
        type: 'CRH1E',
        validCodeOne: '',
        validCodeTwo: ''
      },
      hasTrain: false
    }
  ], // 股道列表
  trackOps: [],
  currentTrain: {}, // 当前选中的列车
  robotStatus: {} // 机器人状态
})
const { trackList, trackOps, currentTrain, robotStatus } = toRefs(state)
const { proxy } = getCurrentInstance()
const { data } = useWebSocket(`${wsBaseUrl}/ws/centralize`, {
  autoReconnect: {
    retries: 3, // 最大重连次数
    delay: 2000 // 重连间隔
  }
})
watch(data, (newVal) => {
  if (newVal) {
    const param = JSON.parse(newVal)
    if (!param.msg) return
    if (param.type === 'CENTRALIZE_TRACK_INFO') {
      const gdData = param.msg || []
      gdData.map((item) => {
        const gdh = item.track
        const status1 = item.robotStatus[item.track + '-1']
        const status2 = item.robotStatus[item.track + '-2']
        if (status1) {
          robotStatus.value[`${gdh}-1-status`] = status1
        }
        if (status2) {
          robotStatus.value[`${gdh}-2-status`] = status2
        }
      })
      initData(gdData)
    } else if (param.type === 'CENTRALIZE_ROBOT_INFO') {
      // 机器人信息
      const { track, packing, status, distance, batteryCapacity } = param.msg
      const gdh = `${track}-${packing}`
      // 状态
      robotStatus.value[`${gdh}-status`] = status
      // 距离
      robotStatus.value[`${gdh}-distance`] = distance
      // 电量
      robotStatus.value[`${gdh}-battery`] = batteryCapacity
    } else if (param.type === 'CENTRALIZE_ROBOT_STATUS') {
      // 机器人状态
      const { track, packing, status } = param.msg
      const gdh = `${track}-${packing}`
      robotStatus.value[`${gdh}-status`] = status
    }
  }
})
onMounted(() => {
  // 获取股道列表
  getTrainTrack()
})

// 获取股道列表
const getTrainTrack = async () => {
  const res = await getTrainTrackApi()
  console.log(res)
  const data = res?.data || []
  initData(data)
}
// 初始化股道列表
const initData = (gdData) => {
  gdData.forEach((item) => {
    if (item?.trains?.length) {
      const firstItem = item.trains[0]
      item.trainType = firstItem?.marshallingType || ''
      item.hasTrain = true
      if (firstItem?.marshallingType === 'SHORT') {
        // 短编车场景，区分列车在哪个列位
        item.trainInfoOne = item.trains.find((item) => item.parking === 1)
        item.trainInfoTwo = item.trains.find((item) => item.parking === 2)
      } else {
        // 长编及重连车场景
        item.trainInfo = firstItem
      }
    } else {
      item.trainInfo = null
      item.trainInfoOne = null
      item.trainInfoTwo = null
      item.hasTrain = false
    }
  })
  trackList.value = gdData
  trackOps.value = gdData.map((item) => item.track)
  currentTrain.value = {}
}
// 选择列车，选中状态再次点击清空选择
const selectTrain = (obj) => {
  if (currentTrain.value?.track === obj.track && currentTrain.value?.trainNo === obj.trainNo) {
    currentTrain.value = {}
  } else {
    currentTrain.value = obj
  }
}
// 手动接车
const checkinTrain = () => {
  proxy.$dialog.show(
    CheckInModal,
    {
      width: 400,
      title: '手动接车',
      showConfirm: true
    },
    { trackOps: trackOps.value },
    getTrainTrack
  )
}
// 手动出车
const removeTrain = async () => {
  if (!currentTrain.value?.track) {
    ElMessage.error('请先点击选择车辆！')
    return
  }
  const { trainId, type, trainNo, garage, track, parking, marshallingType } = currentTrain.value
  try {
    await ElMessageBox.confirm(
      '确定执行手动出车操作吗？',
      (type || '') + (trainNo || '') + '  [' + garage + '_' + track + '_' + parking + ']',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        customStyle: { width: '350px' }
      }
    )
    checkout({
      trainId,
      garage,
      track,
      parking,
      marshallingType
    }).then((res) => {
      if (res.code === 200) {
        ElMessage.success('出车成功！')
        getTrainTrack()
      } else {
        ElMessage.error(res.describe || '出车失败！')
      }
    })
  } catch {
    console.log('取消手动出车操作！')
  }
}
provide('refresh', getTrainTrack)
provide('checkPwdRef', checkPwdRef)
</script>
<template>
  <div class="central">
    <div class="track-list">
      <TrackItem
        v-for="{
          track,
          garage,
          trainInfo,
          trainInfoOne,
          trainInfoTwo,
          hasTrain,
          trainType
        } in trackList"
        :key="track"
        v-bind="{
          track,
          garage,
          trainInfo,
          trainInfoOne,
          trainInfoTwo,
          hasTrain,
          trainType,
          robotStatus,
          currentTrain
        }"
        @selectTrain="selectTrain"
      />
    </div>
    <div class="bot-bar">
      <div class="robot-lengend">
        <div class="fault-legend">
          <div class="has-fault">N</div>
          <span class="legend-name">有故障</span>
        </div>
        <div class="fault-legend">
          <div class="no-fault"></div>
          <span class="legend-name">无故障</span>
        </div>
        <div v-for="item in ROBOT_STATUS_LIST" :key="item.status" class="robot-status-wrap">
          <SvgIcon name="robotCar" :class="item.status" :size="30" />
          <span class="legend-name">{{ item.name }}</span>
        </div>
      </div>
      <div class="actions">
        <el-button type="primary" size="small" @click="checkinTrain"> 手动接车 </el-button>
        <el-button type="primary" size="small" @click="removeTrain"> 手动出车 </el-button>
        <el-button type="primary" size="small" @click="monitorRef.show()"> 视频监控 </el-button>
      </div>
    </div>
    <Monitor ref="monitorRef" :trackOps="trackOps" />
    <CheckPwd ref="checkPwdRef" />
  </div>
</template>

<style lang="scss" scoped>
.central {
  width: 100%;
  height: 100%;
  .track-list {
    width: 100%;
    height: calc(100% - 30px);
    overflow-y: auto;
    @include scrollBar($color: rgba(17, 209, 251, 0.5), $activeColor: rgba(17, 209, 251, 1));
  }
  .bot-bar {
    width: 100%;
    height: 30px;
    @include flex;
    .robot-lengend {
      flex: 1;
      @include flex;
      .robot-status-wrap,
      .fault-legend {
        @include flex {
          gap: 10px;
        }
        font-size: 14px;
        margin: 0 5px;
        .legend-name {
          color: #fff;
        }
      }
      .svg-icon {
        @each $status, $value in $robotStatus {
          &.#{$status} {
            color: $value;
          }
        }
      }
      .has-fault,
      .no-fault {
        width: 20px;
        height: 20px;
        text-align: center;
        line-height: 20px;
        font-size: 14px;
        color: #fff;
        border-radius: 50%;
        background: var(--el-color-danger);
      }
      .no-fault {
        background: var(--el-color-success);
      }
    }
    .actions {
      flex-shrink: 0;
    }
  }
}
</style>
