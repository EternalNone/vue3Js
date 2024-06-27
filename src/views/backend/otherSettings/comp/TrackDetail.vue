<script setup name="TrackDetail">
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
  gdmc: [{ required: true, message: '请输入', trigger: 'blur' }],
  gdbh: [{ required: true, message: '请输入', trigger: 'blur' }]
}
const state = reactive({
  formData: {
    gdmc: '',
    gdbh: ''
  }
})
const { formData } = toRefs(state)
watchImmediate(
  () => props.info,
  (newVal) => {
    formData.value = {
      gdmc: newVal?.gdmc || '',
      gdbh: newVal?.gdbh || ''
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
    <DescriptionItem label="股道名称">
      {{ info?.gdmc || '' }}
    </DescriptionItem>
    <DescriptionItem label="股道编号">
      {{ info?.gdbh || '' }}
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
    <el-form-item label="股道名称" prop="gdmc">
      <el-input v-model="formData.gdmc" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="股道编号" prop="gdbh">
      <el-input v-model="formData.gdbh" placeholder="请输入" clearable />
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped></style>
