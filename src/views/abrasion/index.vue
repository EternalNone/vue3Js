<script setup name="Abrasion">
const count = ref(1)
</script>
<template>
  <div class="about">
    <h1>This is an about page</h1>
    <SvgIcon name="earth" class="earth-icon" :size="18" color="blue" />
    <div>{{ count }}</div>
    <div>
      <!-- <el-empty :image-size="200" /> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.about {
  h1 {
    color: $color;
  }
}
</style>
