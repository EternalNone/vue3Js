<script setup name="FaultMarkDialog">
const emits = defineEmits(['close'])
const state = reactive({
  visible: false, // 弹框是否显示
  formData: {
    part: '',
    desc: '',
    faultType: ''
  },
  formRules: {
    part: [
      {
        required: true,
        message: '请选择故障部位'
      }
    ],
    faultType: [
      {
        required: true,
        message: '请选择故障类型'
      }
    ]
  }
})
const formRef = ref(null)
const { visible, formData, formRules } = toRefs(state)
// 打开弹框
const show = (obj) => {
  console.log('eeeeeeeeeee', obj)
  formData.value = {
    part: obj?.part || '',
    desc: obj?.faultDesc || '',
    faultType: obj?.faultType || ''
  }
  // 打开弹框
  visible.value = true
}
// 关闭弹框
const close = () => {
  emits('close')
  resetForm()
  visible.value = false
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}
// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
}
// 删除
const deleteFunc = () => {}
defineExpose({
  show
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title=""
    width="300"
    draggable
    :modal="false"
    :show-close="false"
    lock-scroll
    :close-on-click-modal="false"
    @close="close"
  >
    <div class="fault-mark">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="auto"
        label-position="right"
        status-icon
      >
        <el-form-item label="图片通道" prop="part">
          <el-select v-model="formData.part" placeholder="请选择">
            <el-option label="部位1" value="1" />
            <el-option label="部位1" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="故障类型" prop="faultType">
          <el-select v-model="formData.faultType" placeholder="请选择">
            <el-option label="异常" value="1" />
            <el-option label="松动" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="故障描述" prop="desc">
          <el-input v-model="formData.desc" type="textarea" />
        </el-form-item>
        <el-form-item class="btns-wrap">
          <el-button type="info" Round auto-insert-space @click="close"> 取消 </el-button>
          <el-button type="primary" Round auto-insert-space @click="submitForm"> 保存 </el-button>
          <el-button type="danger" Round auto-insert-space @click="deleteFunc"> 删除 </el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.fault-mark {
  .btns-wrap {
    :deep(.el-form-item__content) {
      width: 100%;
      @include flex {
        flex-wrap: nowrap;
      }
    }
  }
}
</style>
