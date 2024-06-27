<script setup name="PointsDetail">
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
  dwmc: [{ required: true, message: '请输入', trigger: 'blur' }],
  dwbh: [{ required: true, message: '请输入', trigger: 'blur' }]
}
const state = reactive({
  formData: {
    parent: '',
    dwmc: '',
    dwbh: '',
    vehicleModel: '',
    xspx: ''
  }
})
const { formData } = toRefs(state)
watchImmediate(
  () => props.info,
  (newVal) => {
    formData.value = {
      parent: newVal?.parent || '',
      dwmc: newVal?.dwmc || '',
      dwbh: newVal?.dwbh || '',
      vehicleModel: newVal?.vehicleModel || '',
      xspx: newVal?.xspx || ''
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
    <DescriptionItem label="上级点位">
      {{ info?.parent || '' }}
    </DescriptionItem>
    <DescriptionItem label="点位名称">
      {{ info?.dwmc || '' }}
    </DescriptionItem>
    <DescriptionItem label="点位编号">
      {{ info?.dwbh || '' }}
    </DescriptionItem>
    <DescriptionItem label="车型">
      {{ info?.vehicleModel || '' }}
    </DescriptionItem>
    <DescriptionItem label="显示排序">
      {{ info?.xspx || '' }}
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
    <el-form-item label="上级点位" prop="parent">
      <el-input v-model="formData.parent" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="点位名称" prop="dwmc">
      <el-input v-model="formData.dwmc" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="点位编号" prop="dwbh">
      <el-input v-model="formData.dwbh" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="车型" prop="vehicleModel">
      <el-input v-model="formData.vehicleModel" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="显示排序" prop="xspx">
      <el-input v-model="formData.xspx" placeholder="请输入" clearable />
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped></style>
