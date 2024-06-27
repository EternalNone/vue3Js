<script setup name="VehModelDetail">
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
  vehicleModel: [{ required: true, message: '请输入', trigger: 'blur' }],
  bzType: [{ required: true, message: '请输入', trigger: 'blur' }]
}
const state = reactive({
  formData: {
    vehicleModel: '',
    bzType: '',
    cxs: '',
    zs: '',
    unit: ''
  }
})
const { formData } = toRefs(state)
watchImmediate(
  () => props.info,
  (newVal) => {
    formData.value = {
      vehicleModel: newVal?.vehicleModel || '',
      bzType: newVal?.bzType || '',
      cxs: newVal?.cxs || '',
      zs: newVal?.zs || '',
      unit: newVal?.unit || ''
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
    <DescriptionItem label="车型">
      {{ info?.vehicleModel || '' }}
    </DescriptionItem>
    <DescriptionItem label="编组类型">
      {{ info?.bzType || '' }}
    </DescriptionItem>
    <DescriptionItem label="车厢数">
      {{ info?.cxs || '' }}
    </DescriptionItem>
    <DescriptionItem label="轴数">
      {{ info?.zs || '' }}
    </DescriptionItem>
    <DescriptionItem label="配属单位">
      {{ info?.unit || '' }}
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
    <el-form-item label="车型" prop="vehicleModel">
      <el-input v-model="formData.vehicleModel" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="编组类型" prop="bzType">
      <el-input v-model="formData.bzType" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="车厢数" prop="cxs">
      <el-input v-model="formData.cxs" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="轴数" prop="zs">
      <el-input v-model="formData.zs" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="配属单位" prop="unit">
      <el-input v-model="formData.unit" placeholder="请输入" clearable />
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped></style>
