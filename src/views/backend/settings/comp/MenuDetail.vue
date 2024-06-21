<script setup name="MenuDetail">
import { watchImmediate } from '@vueuse/core'
import SvgSelector from '@/components/SvgSelector.vue'

const formRef = ref(null)
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
  },
  menuList: {
    type: Array,
    default: () => []
  }
})

const state = reactive({
  formData: {
    type: '1',
    parent: '',
    title: '',
    name: '',
    path: '',
    component: '',
    status: 1,
    hidden: 0,
    icon: ''
  },
  formRules: {
    type: [{ required: true, message: '请选择', trigger: 'blur' }],
    title: [{ required: true, message: '请输入', trigger: 'blur' }],
    name: [{ required: true, message: '请输入', trigger: 'blur' }],
    path: [{ required: true, message: '请输入', trigger: 'blur' }],
    component: [{ required: true, message: '请输入', trigger: 'blur' }]
  }
})

const { formData, formRules } = toRefs(state)

const defaultProps = {
  children: 'children',
  label: (data) => data?.meta?.title
}
const findMenuItemById = (menu, curVal) => {
  for (const item of menu) {
    if (item.path === curVal) {
      return item?.meta?.title
    }
    if (item.children) {
      const found = findMenuItemById(item.children, curVal)
      if (found) {
        return found
      }
    }
  }
  return ''
}
const parentMenuName = computed(() => {
  const parent = props.info?.meta?.parent
  if (!parent) return ''
  return findMenuItemById(props.menuList, parent)
})
watchImmediate(
  () => props.info,
  (newVal) => {
    formData.value = {
      type: newVal?.children?.length ? '2' : '1',
      parent: newVal?.meta?.parent || '',
      title: newVal?.meta?.title || '',
      name: newVal?.name || '',
      path: newVal?.path || '',
      component: newVal?.component || '',
      status: newVal?.status ?? 1,
      hidden: newVal?.hidden ?? 0,
      icon: newVal?.meta?.icon || ''
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
  <div v-if="act === 'view'">
    <DescriptionItem label="菜单类型">
      <el-tag :type="info?.children?.length ? 'success' : 'danger'">
        {{ info?.children?.length ? '目录' : '菜单' }}
      </el-tag>
    </DescriptionItem>
    <DescriptionItem label="父级菜单">
      {{ parentMenuName }}
    </DescriptionItem>
    <DescriptionItem label="菜单名称">
      {{ info?.meta?.title || '' }}
    </DescriptionItem>
    <DescriptionItem label="菜单标识">
      {{ info?.name || '' }}
    </DescriptionItem>
    <DescriptionItem label="菜单路径">
      {{ info?.path || '' }}
    </DescriptionItem>
    <DescriptionItem label="组件路径">
      <div class="text-wrap">
        {{ info?.component || '' }}
      </div>
    </DescriptionItem>
    <DescriptionItem label="菜单图标">
      <SvgIcon
        v-if="info?.meta?.icon"
        :name="info.meta.icon"
        :size="24"
        color="var(--el-text-color-regular)"
      />
    </DescriptionItem>
    <DescriptionItem label="菜单状态">
      <el-tag :type="info?.meta?.status ? 'success' : 'danger'">
        {{ info?.meta?.status ? '启用' : '禁用' }}
      </el-tag>
    </DescriptionItem>
    <DescriptionItem label="是否隐藏">
      <el-tag :type="info?.meta?.hidden ? 'danger' : 'success'">
        {{ info?.meta?.hidden ? '隐藏' : '显示' }}
      </el-tag>
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
    <el-form-item label="菜单类型" prop="type">
      <el-radio-group v-model="formData.type">
        <el-radio-button label="菜单" value="1" />
        <el-radio-button label="目录" value="2" />
      </el-radio-group>
    </el-form-item>
    <el-form-item label="父级菜单" prop="parent">
      <el-tree-select
        v-model="formData.parent"
        :data="menuList"
        check-strictly
        accordion
        clearable
        node-key="path"
        :props="defaultProps"
        :render-after-expand="false"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item label="菜单名称" prop="title">
      <el-input v-model="formData.title" placeholder="例如：演示页面" clearable />
    </el-form-item>
    <el-form-item label="菜单标识" prop="name">
      <el-input
        v-model="formData.name"
        placeholder="例如：demo"
        clearable
        :disabled="formData.type === '2'"
      />
    </el-form-item>
    <el-form-item label="菜单路径" prop="path">
      <el-input v-model="formData.path" placeholder="例如：demo" clearable />
    </el-form-item>
    <el-form-item label="组件路径" prop="component">
      <el-input
        v-model="formData.component"
        placeholder="例如：views/**/demo.vue"
        clearable
        :disabled="formData.type === '2'"
      />
    </el-form-item>
    <el-form-item label="菜单图标" prop="icon">
      <SvgSelector v-model="formData.icon" />
    </el-form-item>
    <el-form-item label="菜单状态" prop="status">
      <el-radio-group v-model="formData.status">
        <el-radio-button label="启用" :value="1" />
        <el-radio-button label="禁用" :value="0" />
      </el-radio-group>
    </el-form-item>
    <el-form-item label="是否隐藏" prop="hidden">
      <el-radio-group v-model="formData.hidden">
        <el-radio-button label="显示" :value="0" />
        <el-radio-button label="隐藏" :value="1" />
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped></style>
