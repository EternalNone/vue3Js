<script setup name="TrackItem">
import { ROBOT_STATUS_ZH, TRAIN_TYPE } from '@/constants/index'
import ElectricQuantity from '@/components/ElectricQuantity.vue'
import Train from './Train.vue'
import Operations from './Operations.vue'

const props = defineProps({
  track: {
    type: String,
    default: ''
  },
  garage: {
    type: String,
    default: ''
  },
  hasTrain: {
    type: Boolean,
    default: false
  },
  trainType: {
    type: String,
    default: ''
  },
  trainInfo: {
    type: [Object, null],
    default: null
  },
  trainInfoOne: {
    type: [Object, null],
    default: null
  },
  trainInfoTwo: {
    type: [Object, null],
    default: null
  },
  robotStatus: {
    type: Object,
    default: () => ({})
  },
  currentTrain: {
    type: Object,
    default: () => ({})
  }
})
defineEmits(['selectTrain'])
// 获取机器人位置
const getPos = (robotKey) => {
  const distance = props.robotStatus[robotKey]
  if (distance) {
    const dis = Number(distance)
    const realPercent = (dis * (49 / 228)).toFixed(2)
    return dis === 0 ? '1%' : realPercent + '%'
  }
  return '1%'
}
</script>

<template>
  <div class="track-item">
    <div class="info-wrap">
      <div class="lw">
        <span>{{ `${track}-1` }}</span>
        <span :class="`robot-status ${robotStatus[`${track}-1-status`]}`">
          {{ ROBOT_STATUS_ZH[robotStatus[`${track}-1-status`]] || '未知' }}
        </span>
        <ElectricQuantity :quantity="robotStatus[`${track}-1-battery`]" />
      </div>
      <div v-if="hasTrain" class="train-info">
        <template v-if="trainType === TRAIN_TYPE.LONG || trainType === TRAIN_TYPE.RECONNECT">
          <span>
            车型车号：
            <i>{{ `${trainInfo.type}-${trainInfo.trainNo}` }}</i>
          </span>
          <span>
            进车方向：
            <i>{{ trainInfo.direction === 'ONE' ? '01' : '00' }}</i>
          </span>
        </template>
        <template v-if="trainType === 'SHORT'">
          <div v-if="trainInfoOne">
            <span>
              车型车号：
              <i>{{ `${trainInfoOne.type}-${trainInfoOne.trainNo}` }}</i>
            </span>
            <span>
              进车方向：
              <i>{{ trainInfoOne.direction === 'ONE' ? '01' : '00' }}</i>
            </span>
          </div>
          <div v-if="trainInfoTwo">
            <span>
              车型车号：
              <i>{{ `${trainInfoTwo.type}-${trainInfoTwo.trainNo}` }}</i>
            </span>
            <span>
              <span>进车方向：</span>
              <i>{{ trainInfoTwo.direction === 'ONE' ? '01' : '00' }}</i>
            </span>
          </div>
        </template>
      </div>
      <div class="lw">
        <ElectricQuantity :quantity="robotStatus[`${track}-2-battery`]" />
        <span :class="`robot-status ${robotStatus[`${track}-2-status`]}`">
          {{ ROBOT_STATUS_ZH[robotStatus[`${track}-2-status`]] || '未知' }}
        </span>
        <span>{{ `${track}-2` }}</span>
      </div>
    </div>
    <div class="content">
      <div class="control-wrap">
        <Operations
          :status="robotStatus[`${track}-1-status`]"
          :train="trainType === TRAIN_TYPE.SHORT ? trainInfoOne : trainInfo"
          :gd="{ track, garage }"
          :lw="1"
        />
        <Operations
          :status="robotStatus[`${track}-2-status`]"
          :train="trainType === TRAIN_TYPE.SHORT ? trainInfoTwo : trainInfo"
          :gd="{ track, garage }"
          :lw="2"
        />
      </div>
      <div class="train-wrap">
        <div
          v-if="trainType === TRAIN_TYPE.LONG || trainType === TRAIN_TYPE.RECONNECT"
          class="train-carriage"
        >
          <Train
            :list="trainInfo.faults"
            :active="track === currentTrain.track"
            :trainType="trainType"
            @click="$emit('selectTrain', trainInfo)"
          />
        </div>
        <div v-if="trainType === TRAIN_TYPE.SHORT" class="train-carriage train-carriage-short">
          <div class="train-carriage-item">
            <Train
              v-if="trainInfoOne"
              :list="trainInfoOne.faults"
              :active="
                track === currentTrain.track && currentTrain.parking === trainInfoOne.parking
              "
              :trainType="trainType"
              @click.stop="$emit('selectTrain', trainInfoOne)"
            />
          </div>
          <div class="train-carriage-item">
            <Train
              v-if="trainInfoTwo"
              :list="trainInfoTwo.faults"
              :active="
                track === currentTrain.track && currentTrain.parking === trainInfoTwo.parking
              "
              :trainType="trainType"
              @click.stop="$emit('selectTrain', trainInfoTwo)"
            />
          </div>
        </div>
      </div>
      <div class="robot-wrap">
        <SvgIcon
          name="robotCar"
          :class="`robot ${robotStatus[`${track}-1-status`]}`"
          :size="30"
          :style="{ left: getPos(`${track}-1-distance`) }"
        />
        <SvgIcon
          name="robotCar"
          :class="`robot ${robotStatus[`${track}-2-status`]}`"
          :size="30"
          :style="{ right: getPos(`${track}-2-distance`) }"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.track-item {
  width: 100%;
  margin-bottom: 20px;
  border: 1px solid;
  border-image: linear-gradient(
      45deg,
      rgba(17, 209, 251, 1),
      rgba(17, 209, 251, 0.1),
      rgba(17, 209, 251, 1)
    )
    1 1;
  .info-wrap {
    width: 100%;
    height: 40px;
    padding: 0 1%;
    font-weight: 600;
    border-bottom: 1px solid #11d1fb;
    background: linear-gradient(180deg, rgba(16, 137, 205, 0.8) 0%, rgba(16, 137, 205, 0) 100%);
    @include flex($jc: space-between);
    font-size: 14px;
    .lw {
      @include flex {
        gap: 8px;
      }
      flex-shrink: 0;
      color: #11d1fb;
      .robot-status {
        color: #fff;
        @each $status, $value in $robotStatus {
          &.#{$status} {
            color: $value;
          }
        }
      }
    }
    .train-info {
      flex: 1;
      @include flex;
      span {
        color: #fff;
        padding: 0 10px;
        i {
          color: #11d1fb;
        }
      }
    }
  }
  .content {
    .control-wrap {
      padding: 0 1%;
      @include flex($jc: space-between, $al: flex-start);
      :deep(.operations) {
        width: 49%;
        margin-top: 5px;
        @include flex($jc: flex-start) {
          flex-wrap: wrap;
          gap: 8px;
        }
        &:nth-child(2) {
          @include flex($jc: flex-end) {
            flex-wrap: wrap;
            gap: 8px;
          }
        }
      }
    }
    .train-wrap {
      width: 100%;
      height: 60px;
      padding: 0 1%;
      margin-top: 10px;
      .train-carriage {
        width: 100%;
        .train-carriage-item {
          width: 100%;
        }
        &.train-carriage-short {
          @include flex($jc: space-between);
          .train-carriage-item {
            width: calc(50% - 5px);
          }
        }
      }
    }
    .robot-wrap {
      width: 100%;
      height: 30px;
      margin: 5px 0;
      position: relative;
      .robot {
        position: absolute;
        bottom: 0;
        @each $status, $value in $robotStatus {
          &.#{$status} {
            color: $value;
          }
        }
      }
    }
  }
}
</style>
