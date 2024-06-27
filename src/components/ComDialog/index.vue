<!-- 轻量级的功能共用一个弹框 -->
<script setup name="ComDialog">
import zhCn from 'element-plus/es/locale/lang/zh-cn.mjs'
const childRef = ref(null)
const state = reactive({
  visible: false,
  loading: false,
  component: null,
  options: {},
  comData: {},
  confirmCb: null
})
const { visible, loading, component, options, comData, confirmCb } = toRefs(state)

const _ops = computed(() => {
  return {
    title: '',
    width: '80%',
    draggable: true,
    'lock-scroll': true,
    'append-to-body': true,
    'close-on-click-modal': false,
    'show-close': true,
    fullscreen: false,
    'destroy-on-close': false,
    showConfirm: true,
    ...options.value
  }
})
const show = (comp, diaProps, comProps, cb) => {
  component.value = comp
  options.value = diaProps
  comData.value = comProps
  confirmCb.value = cb
  visible.value = true
}

const close = () => {
  const reset = childRef.value?.reset
  if (reset && typeof reset === 'function') {
    reset()
  }
  loading.value = false
  visible.value = false
}
const confirm = () => {
  const func = childRef.value?.confirm
  const conCb = confirmCb.value
  if (func && typeof func === 'function') {
    loading.value = true
    func()
      .then((res) => {
        console.log('then', res)
        if (conCb && typeof conCb === 'function') {
          conCb()
        }
        close()
      })
      .finally(() => {
        console.log('finally')
        loading.value = false
      })
  }
}
defineExpose({
  show
})
</script>

<template>
  <el-dialog v-model="visible" v-bind="_ops" @close="close">
    <el-config-provider :locale="zhCn">
      <component ref="childRef" :is="component" v-bind="comData" />
    </el-config-provider>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" Round auto-insert-space :loading="loading" @click="close">
          {{ _ops.showConfirm ? '取消' : '关闭' }}
        </el-button>
        <el-button
          v-show="_ops.showConfirm"
          type="primary"
          Round
          auto-insert-space
          :loading="loading"
          @click="confirm"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
