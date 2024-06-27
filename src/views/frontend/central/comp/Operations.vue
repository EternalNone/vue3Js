<script setup name="Operations">
import { ElMessage, ElMessageBox } from 'element-plus'
import { ROBOT_STATUS_CN, ROBOT_ORDER, ACTIONS_VOICE_NOTICE } from '@/constants/index'
import { useSpeech } from '@/hooks/index'
import { robotOperate } from '@/api/central.js'
import CheckPwd from './CheckPwd.vue'

const props = defineProps({
  status: {
    type: String,
    default: ''
  },
  train: {
    type: [Object, null]
  },
  gd: {
    type: Object,
    required: true
  },
  lw: {
    type: Number,
    required: true
  }
})
const { lw, gd, train } = toRefs(props)

const refresh = inject('refresh')
const { proxy } = getCurrentInstance()
// 未知状态
const unknown = computed(() => props.status === '')
// 关机状态
const closed = computed(() => props.status === ROBOT_STATUS_CN.CLOSE)
// 充电状态
const charging = computed(() => props.status === ROBOT_STATUS_CN.CHARGING)
// 运行状态
const running = computed(() => props.status === ROBOT_STATUS_CN.IN_OPERATION)
// 待机状态
const standby = computed(() => props.status === ROBOT_STATUS_CN.STANDBY)
// 作业是否已经开始，checkNo存在，则表示已经开始，不存在，则表示未开始
const workStarted = computed(() => Boolean(train.value?.checkNo))
// 当前列位是否有车辆
const hasTrain = computed(() => Boolean(train.value))
const { play } = useSpeech()

// 各种操作
const operation = async (cmd, password = '') => {
  const { garage, track } = gd.value
  const params = {
    garage,
    track,
    trainId: train.value?.trainId,
    parking: lw.value,
    direction: train.value?.direction,
    type: train.value?.type,
    trainNo: train.value?.trainNo,
    marshallingType: train.value?.marshallingType,
    checkNo: train.value?.checkNo
  }
  if (lw.value === 1 && password) {
    params.validCodeOne = password
  } else if (lw.value === 2 && password) {
    params.validCodeTwo = password
  }
  play(`您确认要对${track}股道${lw.value}列位机器人执行${ROBOT_ORDER[cmd]}操作吗?`)
  try {
    await ElMessageBox.confirm(
      `您确认要对<span style="color:var(--el-color-warning)">${track}股道${lw.value}列位机器人</span>执行${ROBOT_ORDER[cmd]}操作吗?`,
      `${ROBOT_ORDER[cmd]}`,
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        cancelButtonClass: 'el-button--info',
        type: '',
        dangerouslyUseHTMLString: true,
        customStyle: { width: '500px' }
      }
    )
    const msg = ACTIONS_VOICE_NOTICE[cmd] || ''
    play(msg, 3)
    // 操作
    robotOperate(cmd, params)
      .then((res) => {
        ElMessage.success(res.describe)
        play(`${res.describe || '操作成功！'}`, true)
        refresh()
      })
      .catch((err) => {
        play(err || '操作失败！')
      })
  } catch {
    play(`取消执行${ROBOT_ORDER[cmd]}操作！`)
    console.log(`取消执行${ROBOT_ORDER[cmd]}操作！`)
  }
}
// 开始作业
const startWork = () => {
  play('请输入操作密码')
  proxy.$dialog.show(
    CheckPwd,
    {
      width: 400,
      title: '操作密码',
      showConfirm: true
    },
    { gd: gd.value, lw: lw.value },
    operation
  )
}
</script>

<template>
  <div class="operations">
    <!-- 有车、待机状态且作业未开始时显示-->
    <el-button
      v-show="hasTrain && standby && !workStarted"
      type="primary"
      plain
      size="small"
      @click="startWork"
    >
      开始作业
    </el-button>
    <!-- 关闭状态显示开机按钮 -->
    <el-button v-show="closed" type="success" plain size="small" @click="operation('startup')">
      开机
    </el-button>
    <!-- 非关闭状态显示关机，充电中禁用 -->
    <el-button
      v-show="!closed && !unknown"
      type="danger"
      plain
      size="small"
      :disabled="charging"
      @click="operation('close')"
    >
      关机
    </el-button>
    <!-- 未知、关闭、充电中状态禁用 -->
    <el-button
      type="primary"
      plain
      size="small"
      :disabled="unknown || closed || charging"
      @click="operation('origin')"
    >
      回到原点
    </el-button>
    <!-- 非充电中显示， 未知、关闭状态禁用-->
    <el-button
      v-show="!charging"
      type="primary"
      plain
      size="small"
      :disabled="unknown || closed"
      @click="operation('chargeStart')"
    >
      充电
    </el-button>
    <!-- 充电中显示， 未知、关闭状态禁用-->
    <el-button
      v-show="charging"
      type="primary"
      plain
      size="small"
      @click="operation('chargeCancel')"
    >
      停止充电
    </el-button>
    <!-- 未知、关闭、充电中状态禁用-->
    <el-button
      type="primary"
      plain
      size="small"
      :disabled="unknown || closed || charging"
      @click="operation('wash')"
    >
      洗车模式
    </el-button>
    <!-- 未知、关闭、充电中状态禁用-->
    <el-button
      type="danger"
      plain
      size="small"
      :disabled="unknown || closed || charging"
      @click="operation('stop')"
    >
      紧急停止
    </el-button>
    <!-- 有车时才显示、未知、关闭、充电中状态禁用-->
    <el-button
      v-show="hasTrain"
      type="primary"
      plain
      size="small"
      :disabled="unknown || closed || charging"
      @click="operation('inspection')"
    >
      故障续检
    </el-button>
    <!-- 运行状态显示-->
    <el-button v-show="running" type="danger" plain size="small" @click="operation('pause')">
      暂停
    </el-button>
    <!-- 待机状态、且作业已经开始时显示-->
    <el-button
      v-show="standby && workStarted"
      type="primary"
      plain
      size="small"
      @click="operation('continue')"
    >
      继续
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.operations {
  .el-button {
    & + .el-button {
      margin-left: 0;
    }
    &.el-button--primary {
      &.is-plain {
        --el-button-bg-color: transparent;
        --el-button-text-color: rgba(255, 255, 255, 0.7);
        --el-button-border-color: rgba(255, 255, 255, 0.7);
      }
      &.is-disabled {
        background-color: #82848a;
        border-color: #82848a;
        color: rgba(255, 255, 255, 0.7);
        cursor: not-allowed;
      }
    }
    &.el-button--success {
      &.is-plain {
        --el-button-bg-color: transparent;
        --el-button-text-color: var(--el-color-success);
        --el-button-border-color: var(--el-color-success);
      }
      &.is-disabled {
        background-color: #82848a;
        border-color: #82848a;
        color: rgba(255, 255, 255, 0.7);
        cursor: not-allowed;
      }
    }
    &.el-button--danger {
      &.is-plain {
        --el-button-bg-color: transparent;
        --el-button-text-color: var(--el-color-danger);
        --el-button-border-color: var(--el-color-danger);
      }
      &.is-disabled {
        background-color: #82848a;
        border-color: #82848a;
        color: rgba(255, 255, 255, 0.7);
        cursor: not-allowed;
      }
    }
  }
}
</style>
