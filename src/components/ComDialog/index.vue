<!-- 轻量级的功能共用一个弹框 -->
<script setup name="ComDialog">
const childRef = ref(null)
const state = reactive({
  visible: false,
  loading: false,
  component: null,
  options: {},
  comData: {}
})
const { visible, loading, component, options, comData } = toRefs(state)

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
const show = (comp, diaProps, comProps) => {
  component.value = comp
  options.value = diaProps
  comData.value = comProps
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
  if (func && typeof func === 'function') {
    loading.value = true
    func()
      .then((res) => {
        console.log('then', res)
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
    <component ref="childRef" :is="component" v-bind="comData" />
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
