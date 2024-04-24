<script setup name="Login">

const username = ref('')
const password = ref('')

const handleSubmit = () => {
  // Add your form submission logic here
}
</script>
<template>
  <div>
    <input v-model="username" placeholder="Username" />
    <input v-model="password" placeholder="Password" />
    <button @click="handleSubmit">Submit</button>
  </div>
</template>
<style lang="scss" scoped></style>
