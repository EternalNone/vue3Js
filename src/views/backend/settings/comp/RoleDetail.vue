<script setup name="RoleDetail">
import { watchImmediate } from '@vueuse/core'
import DescriptionItem from '@/components/DescriptionItem.vue'

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
const { act, info } = toRefs(props)
const formRef = ref(null)
const formRules = {
  roleName: [{ required: true, message: '请输入', trigger: 'blur' }]
}
const state = reactive({
  formData: {
    roleName: '',
    status: 1
  }
})
const { formData } = toRefs(state)
watchImmediate(
  () => props.info,
  (newVal) => {
    formData.value = {
      roleName: newVal?.roleName || '',
      status: newVal?.status ?? 1
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
  <div v-if="act === 'view'" class="role-detail">
    <DescriptionItem label="角色名称">
      {{ info?.roleName || '' }}
    </DescriptionItem>
    <DescriptionItem label="角色状态">
      <el-tag :type="info?.status ? 'success' : 'danger'">
        {{ info?.status ? '启用' : '禁用' }}
      </el-tag>
    </DescriptionItem>
    <DescriptionItem label="创建时间">
      {{ info?.createTime || '' }}
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
    <el-form-item label="角色名称" prop="roleName">
      <el-input v-model="formData.roleName" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="角色状态" prop="status">
      <el-radio-group v-model="formData.status">
        <el-radio-button label="启用" :value="1" />
        <el-radio-button label="禁用" :value="0" />
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped></style>
