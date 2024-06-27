<script setup name="ChannelDetail">
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
  tdmc: [{ required: true, message: '请输入', trigger: 'blur' }],
  tddm: [{ required: true, message: '请输入', trigger: 'blur' }]
}
const state = reactive({
  formData: {
    tdmc: '',
    tddm: '',
    mklx: '',
    smlx: '',
    tdlx: '',
    zsfx: '',
    isShow: ''
  }
})
const { formData } = toRefs(state)
watchImmediate(
  () => props.info,
  (newVal) => {
    formData.value = {
      tdmc: newVal?.tdmc || '',
      tddm: newVal?.tddm || '',
      mklx: newVal?.mklx || '',
      smlx: newVal?.smlx || '',
      tdlx: newVal?.tdlx || '',
      zsfx: newVal?.zsfx || '',
      isShow: newVal?.isShow || ''
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
    <DescriptionItem label="通道名称">
      {{ info?.tdmc || '' }}
    </DescriptionItem>
    <DescriptionItem label="通道代码">
      {{ info?.tddm || '' }}
    </DescriptionItem>
    <DescriptionItem label="模块类型">
      {{ info?.mklx || '' }}
    </DescriptionItem>
    <DescriptionItem label="扫描类型">
      {{ info?.smlx || '' }}
    </DescriptionItem>
    <DescriptionItem label="通道类型">
      {{ info?.tdlx || '' }}
    </DescriptionItem>
    <DescriptionItem label="展示方向">
      {{ info?.zsfx || '' }}
    </DescriptionItem>
    <DescriptionItem label="是否展示">
      {{ info?.isShow || '' }}
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
    <el-form-item label="通道名称" prop="tdmc">
      <el-input v-model="formData.tdmc" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="通道代码" prop="tddm">
      <el-input v-model="formData.tddm" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="模块类型" prop="mklx">
      <el-input v-model="formData.mklx" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="扫描类型" prop="smlx">
      <el-input v-model="formData.smlx" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="通道类型" prop="tdlx">
      <el-input v-model="formData.tdlx" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="展示方向" prop="zsfx">
      <el-input v-model="formData.zsfx" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="是否展示" prop="isShow">
      <el-input v-model="formData.isShow" placeholder="请输入" clearable />
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped></style>
