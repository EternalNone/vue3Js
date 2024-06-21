<script setup name="CheckInModal">
import { ElMessage } from 'element-plus'
import { TRAIN_TYPE_LIST, PARKING_LIST, DIRECTION_LIST } from '@/constants/index'
import { checkin } from '@/api/central.js'

const formRef = ref(null)
const emits = defineEmits(['refresh'])
const state = reactive({
  visible: false,
  loading: false,
  trackOps: [], // 股道下拉选项
  formData: {
    marshallingType: '',
    track: '',
    parking: '',
    direction: '',
    garage: '',
    type: '',
    trainNo: ''
  },
  formRules: {
    marshallingType: [{ required: true, message: '请选择编组', trigger: 'blur' }],
    track: [{ required: true, message: '请选择股道', trigger: 'blur' }],
    parking: [{ required: true, message: '请选择列位', trigger: 'blur' }],
    direction: [{ required: true, message: '请选择端位', trigger: 'blur' }],
    garage: [{ required: true, message: '请输入车库', trigger: 'blur' }],
    type: [{ required: true, message: '请输入车型', trigger: 'blur' }],
    trainNo: [{ required: true, message: '请输入车号', trigger: 'blur' }]
  }
})

const { visible, loading, trackOps, formData, formRules } = toRefs(state)

const show = (list) => {
  visible.value = true
  formRef.value?.resetFields()
  trackOps.value = list || []
}

const submitForm = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      // 提交表单
      loading.value = true
      checkin(formData.value)
        .then((res) => {
          if (res.code === 200) {
            visible.value = false
            ElMessage.success('接车成功')
            emits('refresh')
          } else {
            ElMessage.error(res.describe || '接车失败')
          }
        })
        .finally(() => {
          loading.value = false
        })
    } else {
      console.log('表单验证失败')
    }
  })
}
defineExpose({
  show
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="手动接车"
    width="400px"
    draggable
    append-to-body
    lock-scroll
    :close-on-click-modal="false"
  >
    <el-form class="start-work-form" ref="formRef" :model="formData" :rules="formRules">
      <el-form-item label="编组" prop="marshallingType">
        <el-radio-group v-model="formData.marshallingType">
          <el-radio-button
            v-for="item in TRAIN_TYPE_LIST"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="股道" prop="track">
        <el-radio-group v-model="formData.track">
          <el-radio-button v-for="item in trackOps" :key="item" :label="item" :value="item" />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="列位" prop="parking">
        <el-radio-group v-model="formData.parking">
          <el-radio-button
            v-for="item in PARKING_LIST"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="端位" prop="direction">
        <el-radio-group v-model="formData.direction">
          <el-radio-button
            v-for="item in DIRECTION_LIST"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="车库" prop="garage">
        <el-input v-model="formData.garage" placeholder="请输入车库" clearable />
      </el-form-item>
      <el-form-item label="车型" prop="type">
        <el-input v-model="formData.type" placeholder="请输入车型" clearable />
      </el-form-item>
      <el-form-item label="车号" prop="trainNo">
        <el-input v-model="formData.trainNo" placeholder="请输入车号" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" Round auto-insert-space @click="visible = false" :loading="loading">
          取消
        </el-button>
        <el-button type="primary" Round auto-insert-space @click="submitForm" :loading="loading">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
