<script setup name="Avatar">
import { STORAGE_KEY } from '@/constants/index'
import { useStorage } from '@vueuse/core'

const state = useStorage(STORAGE_KEY.USER_INFO, {})
</script>

<template>
  <div class="text-avartar">
    <SvgIcon name="avatar" :size="30" color="#fff" />
    <span>{{ state?.nickName || '' }}</span>
  </div>
</template>

<style lang="scss" scoped>
.text-avartar {
  @include flex;
  > span {
    font-size: 12px;
    color: #fff;
    margin-left: 5px;
  }
}
</style>
