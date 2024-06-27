<script setup name="ThresholdDetail">
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
  yzlx: [{ required: true, message: '请输入', trigger: 'blur' }],
  cx: [{ required: true, message: '请输入', trigger: 'blur' }]
}
const state = reactive({
  formData: {
    cx: '',
    yzlx: '',
    minVal: '',
    maxVal: ''
  }
})
const { formData } = toRefs(state)
watchImmediate(
  () => props.info,
  (newVal) => {
    formData.value = {
      cx: newVal?.cx || '',
      yzlx: newVal?.yzlx || '',
      minVal: newVal?.minVal || '',
      maxVal: newVal?.maxVal || ''
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
    <DescriptionItem label="阈值名称">
      {{ info?.yzlx || '' }}
    </DescriptionItem>
    <DescriptionItem label="最小值(mm)">
      {{ info?.minVal || '' }}
    </DescriptionItem>
    <DescriptionItem label="最大值(mm)">
      {{ info?.maxVal || '' }}
    </DescriptionItem>
    <DescriptionItem label="车型">
      {{ info?.cx?.join(',') || '' }}
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
    <el-form-item label="阈值名称" prop="yzlx">
      <el-input v-model="formData.yzlx" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="最小值(mm)" prop="minVal">
      <el-input v-model="formData.minVal" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="最大值(mm)" prop="maxVal">
      <el-input v-model="formData.maxVal" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="车型" prop="cx">
      <el-input v-model="formData.cx" placeholder="请输入" clearable />
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped></style>
