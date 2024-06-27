<script setup name="CheckPwd">
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { workValid } from '@/api/central.js'

const formRules = {
  pass: [
    {
      required: true,
      message: '请输入密码'
    }
  ]
}
const formRef = ref(null)
const props = defineProps({
  gd: {
    type: Object,
    default: () => ({})
  },
  lw: {
    type: [Number, String],
    default: ''
  }
})
const state = reactive({
  formData: {
    pass: ''
  }
})
const { formData } = toRefs(state)
// 重置表单
const reset = () => {
  formRef.value?.resetFields()
}
// 校验密码
const confirm = async () => {
  return new Promise((resolve, reject) => {
    if (!formRef.value) {
      reject('formRef is not available')
    } else {
      formRef.value.validate((valid, fields) => {
        if (valid) {
          // 提交表单
          workValid({
            pass: formData.value.pass,
            track: props.gd?.track,
            parking: props.lw
          })
            .then(() => {
              ElMessage.success('接车成功')
              resolve()
            })
            .catch(() => {
              reject('error')
            })
        } else {
          console.log('表单验证失败', fields)
          reject('表单验证失败')
        }
      })
    }
  })
}
defineExpose({
  reset,
  confirm
})
</script>

<template>
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
</template>

<style lang="scss" scoped></style>
