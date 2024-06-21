<script setup name="UserDetail">
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
  userName: [{ required: true, message: '请输入', trigger: 'blur' }],
  account: [{ required: true, message: '请输入', trigger: 'blur' }]
}
const state = reactive({
  formData: {
    userName: '1',
    account: '',
    roles: [],
    email: '',
    mobile: '',
    component: '',
    status: 1,
    hidden: 0,
    icon: ''
  },
  roleList: [
    {
      roleName: '超级管理员',
      status: 1
    },
    {
      roleName: '开发人员',
      status: 1
    },
    {
      roleName: '标图人员',
      status: 0
    }
  ]
})

const { formData, roleList } = toRefs(state)

watchImmediate(
  () => props.info,
  (newVal) => {
    formData.value = {
      userName: newVal?.userName || '',
      account: newVal?.account || '',
      roles: newVal?.roles || [],
      email: newVal?.email || '',
      mobile: newVal?.mobile || '',
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
  <div v-if="act === 'view'" class="user-detail">
    <DescriptionItem label="用户名">
      {{ info?.userName || '' }}
    </DescriptionItem>
    <DescriptionItem label="账号">
      {{ info?.account || '' }}
    </DescriptionItem>
    <DescriptionItem label="角色">
      <el-tag v-for="item in info?.roles" :key="item">
        {{ item }}
      </el-tag>
    </DescriptionItem>
    <DescriptionItem label="邮箱">
      {{ info?.email || '' }}
    </DescriptionItem>
    <DescriptionItem label="手机号">
      {{ info?.mobile || '' }}
    </DescriptionItem>
    <DescriptionItem label="状态">
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
    <el-form-item label="用户名" prop="userName">
      <el-input v-model="formData.userName" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="账号" prop="account">
      <el-input v-model="formData.account" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="角色" prop="roles">
      <el-select
        v-model="formData.roles"
        multiple
        clearable
        tag-type="primary"
        placeholder="请选择"
      >
        <el-option
          v-for="item in roleList"
          :key="item.roleName"
          :label="item.roleName"
          :value="item.roleName"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="formData.email" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="手机号" prop="mobile">
      <el-input v-model="formData.mobile" placeholder="请输入" clearable />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="formData.status">
        <el-radio-button label="启用" :value="1" />
        <el-radio-button label="禁用" :value="0" />
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
.user-detail {
  .el-tag {
    & + .el-tag {
      margin-left: 5px;
    }
  }
}
</style>
