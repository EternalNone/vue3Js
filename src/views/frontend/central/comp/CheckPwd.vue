<script setup name="CheckPwd">
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { workValid } from '@/api/central.js'
import { useSpeech } from '@/hooks/index'
const formRules = {
  pass: [
    {
      required: true,
      message: '请输入密码'
    }
  ]
}
const formRef = ref(null)
let operation = null
const state = reactive({
  visible: false,
  formData: {
    pass: ''
  },
  gd: '',
  lw: '',
  loading: false
})
const { visible, formData, gd, lw, loading } = toRefs(state)
const { play } = useSpeech()
const show = (obj) => {
  gd.value = obj.gd || ''
  lw.value = obj.lw || ''
  operation = typeof obj.cb === 'function' ? obj.cb : null
  formData.value.pass = ''
  play(`请输入操作密码！`)
  visible.value = true
}

// 校验密码
const checkPwd = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      loading.value = true
      const res = await workValid({
        pass: formData.value.pass,
        track: gd.value.track,
        parking: lw.value
      })
      loading.value = false
      if (res.code === 200) {
        visible.value = false
        operation && operation('work', formData.value.pass)
      } else {
        ElMessage.error(res.describe)
        play(res.describe)
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}
defineExpose({
  show
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="操作密码"
    width="300px"
    append-to-body
    lock-scroll
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form class="start-work-form" ref="formRef" :model="formData" :rules="formRules">
      <el-form-item prop="pass">
        <el-input
          v-model="formData.pass"
          type="password"
          placeholder="请输入密码"
          show-password
          clearable
          :prefix-icon="Lock"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" Round auto-insert-space :loading="loading" @click="visible = false">
          取消
        </el-button>
        <el-button type="primary" Round auto-insert-space :loading="loading" @click="checkPwd">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
