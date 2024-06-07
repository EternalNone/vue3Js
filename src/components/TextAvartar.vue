<script setup name="TextAvartar">
import { STORAGE_KEY } from '@/utils/storage'
import { useStorage } from '@vueuse/core'
const state = useStorage(STORAGE_KEY.USER_INFO, { hello: 'hi', greeting: 'Hello' })
const tetx = computed(() => {
  return state.value.account?.slice(0, 3)
})
</script>

<template>
  <div class="text-avartar">{{ tetx }}</div>
</template>

<style lang="scss" scoped>
.text-avartar {
  width: 40px;
  height: 40px;
  @include flex;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 14px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
}
</style>
