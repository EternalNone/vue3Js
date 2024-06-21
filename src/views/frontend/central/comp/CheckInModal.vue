<script setup name="CheckInModal">
import { ElMessage } from 'element-plus'
import { TRAIN_TYPE_LIST, PARKING_LIST, DIRECTION_LIST } from '@/constants/index'
import { checkin } from '@/api/central.js'

defineProps({
  trackOps: {
    type: Array,
    default: () => []
  }
})

const formRef = ref(null)
const formRules = {
  marshallingType: [{ required: true, message: '请选择编组', trigger: 'blur' }],
  track: [{ required: true, message: '请选择股道', trigger: 'blur' }],
  parking: [{ required: true, message: '请选择列位', trigger: 'blur' }],
  direction: [{ required: true, message: '请选择端位', trigger: 'blur' }],
  garage: [{ required: true, message: '请输入车库', trigger: 'blur' }],
  type: [{ required: true, message: '请输入车型', trigger: 'blur' }],
  trainNo: [{ required: true, message: '请输入车号', trigger: 'blur' }]
}
const state = reactive({
  formData: {
    marshallingType: '',
    track: '',
    parking: '',
    direction: '',
    garage: '',
    type: '',
    trainNo: ''
  }
})
const { formData } = toRefs(state)

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
          // 提交表单
          checkin(formData.value)
            .then(() => {
              ElMessage.success('接车成功')
              resolve()
            })
            .catch(() => {
              reject()
            })
        } else {
          console.log('表单验证失败', fields)
          reject('表单验证失败')
        }
      })
    }
  })
}
defineExpose({
  reset,
  confirm
})
</script>

<template>
  <el-form ref="formRef" :model="formData" :rules="formRules">
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
</template>

<style lang="scss" scoped></style>
