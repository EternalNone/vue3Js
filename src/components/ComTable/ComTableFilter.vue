<script setup name="ComTableFilter">
import { useVModel } from '@vueuse/core'
import ComSelect from '@/components/ComSelect/index.vue'

const formRef = ref(null)
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  searchColumns: {
    type: Array,
    default: () => []
  },
  labelPosition: {
    type: String,
    default: ''
  },
  labelWidth: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(['update:modelValue', 'refresh', 'reset'])
const formData = useVModel(props, 'modelValue', emits)
</script>

<template>
  <div class="com-table-filter">
    <ElForm
      :model="modelValue"
      ref="formRef"
      class="filter-form"
      :label-position="labelPosition || 'right'"
      :label-width="labelWidth || 80"
    >
      <el-row :gutter="10">
        <el-col
          :lg="6"
          :md="8"
          :sm="12"
          :xs="24"
          v-for="{ label, searchType, searchKey, prop, searchConfig, depKey } in searchColumns"
          :key="prop"
        >
          <ElFormItem :label="label" :prop="searchKey || prop">
            <ComSelect
              v-if="searchType === 'select'"
              v-model="formData[searchKey || prop]"
              :config="searchConfig"
              :dependence="
                depKey
                  ? {
                      dKey: depKey,
                      dVal: formData[depKey]
                    }
                  : null
              "
            />
            <ElDatePicker
              v-else-if="searchType === 'date'"
              v-model="formData[searchKey || prop]"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              type="date"
              clearable
              placeholder="请选择"
              v-bind="searchConfig"
              style="width: 100%"
            />
            <ElDatePicker
              v-else-if="searchType === 'daterange'"
              v-model="formData[searchKey || prop]"
              type="daterange"
              range-separator="-"
              clearable
              start-placeholder="请选择"
              end-placeholder="请选择"
              v-bind="searchConfig"
              style="width: 100%"
            />
            <ElInput
              v-else
              v-model="formData[searchKey || prop]"
              placeholder="请输入"
              clearable
              v-bind="searchConfig"
              autocomplete="off"
              style="width: 100%"
            />
          </ElFormItem>
        </el-col>
      </el-row>
    </ElForm>
    <div v-if="searchColumns.length" class="action">
      <el-button type="info" Round @click="$emit('reset')">重置</el-button>
      <el-button type="primary" Round @click="$emit('refresh')">查询</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.com-table-filter {
  width: 100%;
  @include flex($jc: space-between, $al: flex-start);
  .filter-form {
    flex: 1;
    &.el-form {
      :deep(.el-form-item) {
        margin-bottom: 10px;
        .el-form-item__label {
          @include textEllipsis;
          background: var(--el-fill-color);
          border-radius: 30px 0 0 var(--el-input-border-radius, var(--el-border-radius-base));
          margin-right: -2px;
        }
        .el-form-item__content {
          flex: 1;
        }
      }
    }
  }
  .action {
    margin-left: 10px;
    flex-shrink: 0;
    .el-button + .el-button {
      margin-left: 10px;
    }
  }
}
</style>
