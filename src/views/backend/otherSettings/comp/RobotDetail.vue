<script setup name="RobotDetail">
import { watchImmediate } from '@vueuse/core'
const props = defineProps({
  /**
   * @type 'new' | 'edit' | 'view'
   *
   */
  act: {
    type: String,
    default: 'new'
  },
  info: {
    type: Object,
    default: () => ({})
  }
})

const formRef = ref(null)
const formRules = {
  jqrmc: [{ required: true, message: '请输入', trigger: 'blur' }],
  jqrbh: [{ required: true, message: '请输入', trigger: 'blur' }]
}
const state = reactive({
  formData: {
    jqrmc: '',
    jqrbh: '',
    ssgd: '',
    sslw: '',
    ip: '',
    operator: '',
    operateTime: ''
  }
})
const { formData } = toRefs(state)
watchImmediate(
  () => props.info,
  (newVal) => {
    formData.value = {
      jqrmc: newVal?.jqrmc || '',
      jqrbh: newVal?.jqrbh || '',
      ssgd: newVal?.ssgd || '',
      sslw: newVal?.sslw || '',
      ip: newVal?.ip || '',
      operator: newVal?.operator || '',
      operateTime: newVal?.operateTime || ''
    }
  }
)
// 重置表单
const reset = () => {
  formRef.value?.resetFields()
}
// 提交表单
const confirm = () => {
  console.log(formRef.value)
  return new Promise((resolve, reject) => {
    if (!formRef.value) {
      reject('formRef is not available')
    } else {
      formRef.value.validate((valid, fields) => {
        if (valid) {
          console.log('submit!')
          resolve('success')
        } else {
          console.log('error submit!', fields)
          reject('error submit!')
        }
      })
    }
  })
}

defineExpose({ confirm, reset })
</script>

<template>
  <div v-if="act === 'view'">
    <DescriptionItem label="机器人名称">
      {{ info?.jqrmc || '' }}
    </DescriptionItem>
    <DescriptionItem label="机器人编号">
      {{ info?.jqrbh || '' }}
    </DescriptionItem>
    <DescriptionItem label="所属股道">
      {{ info?.ssgd || '' }}
    </DescriptionItem>
    <DescriptionItem label="所属列位">
      {{ info?.sslw || '' }}
    </DescriptionItem>
    <DescriptionItem label="IP">
      {{ info?.ip || '' }}
    </DescriptionItem>
    <DescriptionItem label="操作人">
      {{ info?.operator || '' }}
    </DescriptionItem>
    <DescriptionItem label="操作时间">
      {{ info?.operateTime || '' }}
    </DescriptionItem>
  </div>
  <el-form
    v-else
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="auto"
    label-position="right"
    status-icon
  >
    <el-form-item label="机器人名称" prop="jqrmc">
      <el-input v-model="formData.jqrmc" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="机器人编号" prop="jqrbh">
      <el-input v-model="formData.jqrbh" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="所属股道" prop="ssgd">
      <el-input v-model="formData.ssgd" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="所属列位" prop="sslw">
      <el-input v-model="formData.sslw" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="IP" prop="ip">
      <el-input v-model="formData.ip" placeholder="请输入" clearable />
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped></style>
