<script setup name="Backend">
import Test from './Test.vue'

const str = ref('12345')
const list = ref(['111', '222', '333'])
const obj = reactive({
  name: '张三',
  age: 18,
  hobby: ['唱', '跳', 'rap']
})

const changeData = () => {
  str.value = '12345'
  list.value.push('444')
  list.value.pop()
  obj.hobby = ['吃']
}
</script>
<template>
  <div class="about">
    <h1>This is an about page1</h1>
    <Test :str="str" :list="list" :obj="obj" />
    <el-button type="primary" @click="changeData">改变数据</el-button>
  </div>
</template>

<style lang="scss" scoped>
.about {
  h1 {
    color: $color;
  }
}
</style>
