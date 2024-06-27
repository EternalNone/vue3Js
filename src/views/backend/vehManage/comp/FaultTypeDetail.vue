<script setup name="FaultTypeDetail">
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
  gzlx: [{ required: true, message: '请输入', trigger: 'blur' }],
  gzdm: [{ required: true, message: '请输入', trigger: 'blur' }]
}
const state = reactive({
  formData: {
    gzlx: '',
    gzdm: ''
  }
})
const { formData } = toRefs(state)
watchImmediate(
  () => props.info,
  (newVal) => {
    formData.value = {
      gzlx: newVal?.gzlx || '',
      gzdm: newVal?.gzdm || ''
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
    <DescriptionItem label="故障类型">
      {{ info?.gzlx || '' }}
    </DescriptionItem>
    <DescriptionItem label="故障代码">
      {{ info?.gzdm || '' }}
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
    <el-form-item label="故障类型" prop="gzlx">
      <el-input v-model="formData.gzlx" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="故障代码" prop="gzdm">
      <el-input v-model="formData.gzdm" placeholder="请输入" clearable />
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped></style>
