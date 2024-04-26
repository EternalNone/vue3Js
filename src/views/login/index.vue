<script setup name="Login">
import { fetchRequest } from '@/utils/fetch'

const username = ref('')
const password = ref('')

const { execute, error, isFetching, data } = fetchRequest({
  url: 'http://192.168.21.125:8500/api/user/login',
  method: 'POST',
  data: {
    username: 'developer',
    password: '111111'
  }
})
const handleSubmit = () => {
  execute()
}
</script>
<template>
  <div>
    <input v-model="username" placeholder="Username" />
    <input v-model="password" placeholder="Password" />
    <button @click="handleSubmit">Submit</button>
    {{ isFetching }}
    <div>data: {{ data?.menu }}</div>
    <div>error:{{ error }}</div>
  </div>
</template>
<style lang="scss" scoped></style>
